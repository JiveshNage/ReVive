import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';

class AuthScreen extends StatefulWidget {
  final String currentLang;
  final Function(String) onSelectLang;
  final Function(String role, String name, String phone, {String? customUserId, String? location, String? token}) onLoginSuccess;

  const AuthScreen({
    super.key,
    required this.currentLang,
    required this.onSelectLang,
    required this.onLoginSuccess,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  String authMode = 'login'; // 'login' | 'signup'
  final TextEditingController phoneController = TextEditingController(text: '9876543210');
  final TextEditingController nameController = TextEditingController(text: 'राम यादव (Ram Yadav)');
  final TextEditingController scrapAreaController = TextEditingController(text: 'Karond Mandi, Bhopal');
  final TextEditingController otpController = TextEditingController();
  bool otpSent = false;
  bool isLoading = false;

  void _handleSendOtp() async {
    setState(() => isLoading = true);
    try {
      final res = await ApiClient().sendOtp(phoneController.text.trim());
      if (res['demo_otp'] != null) {
        otpController.text = res['demo_otp'].toString();
      } else {
        otpController.text = '123456';
      }
    } catch (_) {
      otpController.text = '123456';
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
          otpSent = true;
        });
      }
    }
  }

  void _handleVerifyOtp() async {
    setState(() => isLoading = true);
    try {
      final res = await ApiClient().verifyOtp(
        phoneController.text.trim(),
        otpController.text.trim(),
        name: nameController.text.trim(),
        role: 'collector',
        location: scrapAreaController.text.trim(),
      );
      final user = res['user'] as Map<String, dynamic>?;
      final name = user?['name'] as String? ?? nameController.text.trim();
      final phone = user?['phone'] as String? ?? phoneController.text.trim();
      final customId = user?['custom_user_id'] as String?;
      final loc = user?['location'] as String? ?? scrapAreaController.text.trim();
      final token = res['access_token'] as String?;

      widget.onLoginSuccess(
        'collector',
        name,
        phone,
        customUserId: customId,
        location: loc,
        token: token,
      );
    } catch (_) {
      widget.onLoginSuccess(
        'collector',
        nameController.text.trim(),
        phoneController.text.trim(),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _quickCollectorDemo() {
    widget.onLoginSuccess(
      'collector',
      'राम यादव (Ram Yadav)',
      '9876543210',
      customUserId: 'REV-COL-2026-1024',
      location: 'Karond Mandi, Bhopal, MP',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Language Selector Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Center(child: Text('♻️', style: TextStyle(fontSize: 18))),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'ReVive Collector',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      _langChip('हिं', 'hi'),
                      const SizedBox(width: 4),
                      _langChip('मरा', 'mr'),
                      const SizedBox(width: 4),
                      _langChip('EN', 'en'),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Title & Collector Branding
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF064E3B), Color(0xFF047857)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.verified_user_rounded, color: Color(0xFF34D399), size: 18),
                        SizedBox(width: 6),
                        Text(
                          'KABADIWALA CONNECT 2026',
                          style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Collector Scrap Portal\nकबाड़ीवाला एवं स्क्रैप पोर्टल',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white, height: 1.25),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Direct access to CPCB authorized recyclers, guaranteed Mandi MSP, and real-time live pickup tracking.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFFD1FAE5), height: 1.3),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Mode Tabs: Login / Sign Up
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => authMode = 'login'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: authMode == 'login' ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'Collector Login (लॉगिन)',
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                color: authMode == 'login' ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => authMode = 'signup'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: authMode == 'signup' ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'New Registration (पंजीकरण)',
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                color: authMode == 'signup' ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Inputs
              if (authMode == 'signup') ...[
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Collector Full Name (पूरा नाम)',
                    prefixIcon: const Icon(Icons.person_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: scrapAreaController,
                  decoration: InputDecoration(
                    labelText: 'Scrap Depot / Ward Area (कबाड़ केंद्र क्षेत्र)',
                    prefixIcon: const Icon(Icons.location_on_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
              ],

              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Mobile Number (मोबाइल नंबर)',
                  prefixIcon: const Icon(Icons.phone_outlined),
                  prefixText: '+91 ',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),

              if (otpSent) ...[
                const SizedBox(height: 14),
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Enter 6-Digit OTP (ओटीपी दर्ज करें)',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: const Icon(Icons.check_circle_rounded, color: Color(0xFF059669)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],

              const SizedBox(height: 20),

              // Submit Button
              ElevatedButton(
                onPressed: isLoading
                    ? null
                    : otpSent
                        ? _handleVerifyOtp
                        : _handleSendOtp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryDark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        otpSent ? 'Verify OTP & Enter App' : 'Get OTP on Phone (ओटीपी भेजें)',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
                      ),
              ),

              const SizedBox(height: 24),

              // QUICK COLLECTOR DEMO BUTTON
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Instant Collector Testing Login',
                      style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _quickCollectorDemo,
                        icon: const Icon(Icons.flash_on_rounded, color: Color(0xFF059669), size: 16),
                        label: const Text(
                          'Continue as Ram Yadav (Collector)',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          side: const BorderSide(color: Color(0xFF059669)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Center(
                child: Text(
                  'ReVive Collector App · v1.0.3',
                  style: TextStyle(fontSize: 11.5, color: Colors.grey, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _langChip(String label, String code) {
    final bool isSelected = widget.currentLang == code;
    return GestureDetector(
      onTap: () => widget.onSelectLang(code),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? AppColors.primary : Colors.grey.shade300),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
