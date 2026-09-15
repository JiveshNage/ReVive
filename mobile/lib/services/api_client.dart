import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  http.Client httpClient = http.Client();
  String baseUrl = 'http://127.0.0.1:8000/api';
  String? _authToken;

  static const String tokenKey = 'auth_token';
  static const String userKey = 'auth_user_data';

  void setBaseUrl(String url) {
    baseUrl = url;
  }

  void setHttpClient(http.Client client) {
    httpClient = client;
  }

  Future<String?> getToken() async {
    if (_authToken != null) return _authToken;
    try {
      final prefs = await SharedPreferences.getInstance();
      _authToken = prefs.getString(tokenKey);
    } catch (_) {}
    return _authToken;
  }

  Future<void> saveToken(String token) async {
    _authToken = token;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(tokenKey, token);
    } catch (_) {}
  }

  Future<void> clearAuth() async {
    _authToken = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(tokenKey);
      await prefs.remove(userKey);
      await prefs.remove('is_authenticated');
    } catch (_) {}
  }

  Map<String, String> _headers([String? token]) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final effectiveToken = token ?? _authToken;
    if (effectiveToken != null && effectiveToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $effectiveToken';
    }
    return headers;
  }

  /// Request OTP for mobile authentication
  Future<Map<String, dynamic>> sendOtp(String phone) async {
    final url = Uri.parse('$baseUrl/auth/send-otp');
    final response = await httpClient.post(
      url,
      headers: _headers(),
      body: jsonEncode({'phone': phone}),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Verify OTP and return user + token payload
  Future<Map<String, dynamic>> verifyOtp(
    String phone,
    String otp, {
    String? name,
    String? role,
    String? location,
  }) async {
    final url = Uri.parse('$baseUrl/auth/verify-otp');
    final payload = <String, dynamic>{
      'phone': phone,
      'otp': otp,
    };
    if (name != null) payload['name'] = name;
    if (role != null) payload['role'] = role;
    if (location != null) payload['location'] = location;

    final response = await httpClient.post(
      url,
      headers: _headers(),
      body: jsonEncode(payload),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final token = data['access_token'] as String?;
      if (token != null) {
        await saveToken(token);
      }
      return data;
    } else {
      throw Exception(
        'Authentication failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  /// Fetch currently authenticated user profile
  Future<Map<String, dynamic>?> getCurrentUser() async {
    final token = await getToken();
    if (token == null) return null;

    final url = Uri.parse('$baseUrl/auth/me');
    final response = await httpClient.get(url, headers: _headers(token));
    if (response.statusCode == 200) {
      final user = jsonDecode(response.body) as Map<String, dynamic>;
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(userKey, jsonEncode(user));
      } catch (_) {}
      return user;
    }
    return null;
  }

  /// Fetch lots scoped to the authenticated caller
  Future<List<dynamic>> getLots() async {
    final token = await getToken();
    final url = Uri.parse('$baseUrl/lots');
    final response = await httpClient.get(url, headers: _headers(token));
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    return [];
  }

  /// Create a new scrap lot
  Future<Map<String, dynamic>> createLot({
    required int materialId,
    required double quantityKg,
    int? collectorId,
    String? photoUrl,
    String? description,
  }) async {
    final token = await getToken();
    final url = Uri.parse('$baseUrl/lots');
    final payload = <String, dynamic>{
      'material_id': materialId,
      'quantity_kg': quantityKg,
    };
    if (collectorId != null) payload['collector_id'] = collectorId;
    if (photoUrl != null) payload['photo_url'] = photoUrl;
    if (description != null) payload['description'] = description;

    final response = await httpClient.post(
      url,
      headers: _headers(token),
      body: jsonEncode(payload),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create lot: ${response.body}');
  }

  /// Fetch price benchmarks
  Future<List<dynamic>> getPriceBenchmarks() async {
    final url = Uri.parse('$baseUrl/prices/benchmarks');
    final response = await httpClient.get(url, headers: _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    return [];
  }

  /// Fetch matching recyclers
  Future<List<dynamic>> matchRecyclers({
    String category = 'PCB',
    String location = 'Bhopal',
    int limit = 10,
  }) async {
    final url = Uri.parse(
      '$baseUrl/recyclers/match?category=${Uri.encodeComponent(category)}&location=${Uri.encodeComponent(location)}&limit=$limit',
    );
    final response = await httpClient.get(url, headers: _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    return [];
  }

  /// Execute physical handover
  Future<Map<String, dynamic>> createHandover({
    required int lotId,
    required int collectorId,
    required int recyclerId,
    required double finalWeightKg,
    required String handoverLocation,
    double? latitude,
    double? longitude,
    String? photoUrl,
  }) async {
    final token = await getToken();
    final url = Uri.parse('$baseUrl/handover');
    final payload = <String, dynamic>{
      'lot_id': lotId,
      'collector_id': collectorId,
      'recycler_id': recyclerId,
      'final_weight_kg': finalWeightKg,
      'handover_location': handoverLocation,
      'collector_confirmed': true,
      'recycler_confirmed': true,
    };
    if (latitude != null) payload['latitude'] = latitude;
    if (longitude != null) payload['longitude'] = longitude;
    if (photoUrl != null) payload['photo_url'] = photoUrl;

    final response = await httpClient.post(
      url,
      headers: _headers(token),
      body: jsonEncode(payload),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Handover failed: ${response.body}');
  }
}
