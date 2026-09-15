import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:revive_mobile/services/api_client.dart';
import 'package:revive_mobile/models/lot.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('ApiClient sendOtp and verifyOtp real login flow persists JWT token', () async {
    final client = ApiClient();

    // Mock backend responses
    client.setHttpClient(
      MockClient((request) async {
        if (request.url.path.endsWith('/auth/send-otp')) {
          return http.Response(
            jsonEncode({'message': 'OTP sent', 'demo_otp': '123456'}),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.url.path.endsWith('/auth/verify-otp')) {
          return http.Response(
            jsonEncode({
              'access_token': 'mock-jwt-token-xyz',
              'token_type': 'bearer',
              'user': {
                'id': 1,
                'name': 'Ram Yadav',
                'phone': '9876543210',
                'role': 'collector',
                'custom_user_id': 'REV-COL-2026-1024',
                'location': 'Karond Mandi, Bhopal, MP',
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.url.path.endsWith('/auth/me')) {
          return http.Response(
            jsonEncode({
              'id': 1,
              'name': 'Ram Yadav',
              'phone': '9876543210',
              'role': 'collector',
              'custom_user_id': 'REV-COL-2026-1024',
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.url.path.endsWith('/lots')) {
          return http.Response(
            jsonEncode([
              {
                'id': 42,
                'collector_id': 1,
                'material_id': 1,
                'quantity_kg': 12.5,
                'estimated_value': 5000.0,
                'status': 'created',
                'lot_reference': 'LOT-00042',
                'material': {'id': 1, 'name': 'PCB', 'category': 'Electronic'},
              }
            ]),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response(jsonEncode({'detail': 'Not found'}), 404);
      }),
    );

    // 1. Send OTP
    final otpRes = await client.sendOtp('9876543210');
    expect(otpRes['demo_otp'], equals('123456'));

    // 2. Verify OTP
    final verifyRes = await client.verifyOtp(
      '9876543210',
      '123456',
      name: 'Ram Yadav',
      role: 'collector',
    );
    expect(verifyRes['access_token'], equals('mock-jwt-token-xyz'));
    expect(verifyRes['user']['custom_user_id'], equals('REV-COL-2026-1024'));

    // 3. Confirm token is persisted
    final token = await client.getToken();
    expect(token, equals('mock-jwt-token-xyz'));

    // 4. Fetch /auth/me with token
    final me = await client.getCurrentUser();
    expect(me, isNotNull);
    expect(me!['custom_user_id'], equals('REV-COL-2026-1024'));

    // 5. Fetch lots with token and verify ScrapLot.fromBackendJson
    final remoteLots = await client.getLots();
    expect(remoteLots.length, equals(1));
    final scrapLot = ScrapLot.fromBackendJson(remoteLots.first as Map<String, dynamic>);
    expect(scrapLot.id, equals(42));
    expect(scrapLot.material, equals('PCB'));
    expect(scrapLot.passportId, equals('LOT-00042'));

    // 6. Logout clears token
    await client.clearAuth();
    final clearedToken = await client.getToken();
    expect(clearedToken, isNull);
  });
}
