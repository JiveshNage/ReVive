import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AuthScreen extends StatefulWidget {
  final String currentLang;
  final Function(String) onSelectLang;
  final Function(String role, String name, String phone) onLoginSuccess;

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
  String selectedRole = 'collector'; // 'collector' | 'recycler' | 'admin'
  final TextEditingController phoneController = TextEditingController(text: '9876543210');
  final TextEditingController nameController = TextEditingController(text: 'Ram Yadav');
  final TextEditingController otpController = TextEditingController();
  bool otpSent = false;
  bool isLoading = false;

  void _handleSendOtp() async {
    setState(() => isLoading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      isLoading = false;
      otpSent = true;
      otpController.text = '123456';
    });
  }

  void _handleVerifyOtp() {
    widget.onLoginSuccess(selectedRole, nameController.text, phoneController.text);
  }

  void _quickDemo(String role, String name, String phone) {
    widget.onLoginSuccess(role, name, phone);
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
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Center(child: Text('♻️', style: TextStyle(fontSize: 16))),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'ReVive Mobile',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      _langButton('EN', 'en'),
                      _langButton('हिन्दी', 'hi'),
                      _langButton('मराठी', 'mr'),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Title
              const Text(
                'Formalize Your E-Waste Income',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.textPrimary, height: 1.2),
              ),
              const SizedBox(height: 6),
              const Text(
                'Connect directly with certified CPCB recyclers and get daily MSP rates.',
                style: TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
              ),

              const SizedBox(height: 24),

              // Role Selector Chips
              Row(
                children: [
                  _roleChip('👷 Collector', 'collector'),
                  const SizedBox(width: 8),
                  _roleChip('🏭 Recycler', 'recycler'),
                  const SizedBox(width: 8),
                  _roleChip('🏛️ Admin', 'admin'),
                ],
              ),

              const SizedBox(height: 20),

              if (authMode == 'signup') ...[
                const Text('Full Name', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    hintText: 'Enter your name',
                    filled: true,
                    fillColor: AppColors.surfaceMuted,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Phone Field
              const Text('Mobile Number', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
              const SizedBox(height: 6),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                decoration: InputDecoration(
                  prefixText: '+91 ',
                  prefixStyle: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  counterText: '',
                  filled: true,
                  fillColor: AppColors.surfaceMuted,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),

              if (otpSent) ...[
                const SizedBox(height: 14),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('6-Digit OTP', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                    Text('(Demo OTP: 123456)', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, letterSpacing: 8, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    counterText: '',
                    filled: true,
                    fillColor: AppColors.surfaceMuted,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ],

              const SizedBox(height: 18),

              ElevatedButton(
                onPressed: isLoading
                    ? null
                    : otpSent
                        ? _handleVerifyOtp
                        : _handleSendOtp,
                child: Text(
                  isLoading
                      ? 'Please wait...'
                      : otpSent
                          ? 'Verify OTP & Continue'
                          : 'Send One-Time Password',
                ),
              ),

              const SizedBox(height: 24),

              // Quick Demo Section
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    child: Text('OR 1-CLICK INSTANT DEMO', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: _demoButton('👷 Collector', 'Ram Yadav', () => _quickDemo('collector', 'Ram Yadav', '9876543210')),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _demoButton('🏭 Recycler', 'EcoCycle', () => _quickDemo('recycler', 'EcoCycle India', '9123456780')),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _demoButton('🏛️ Admin', 'CPCB Officer', () => _quickDemo('admin', 'CPCB Officer', '9998887770')),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _langButton(String label, String code) {
    final bool isSelected = widget.currentLang == code;
    return GestureDetector(
      onTap: () => widget.onSelectLang(code),
      child: Container(
        margin: const EdgeInsets.only(left: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryContainer : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primaryDark : AppColors.textSecondary),
        ),
      ),
    );
  }

  Widget _roleChip(String label, String role) {
    final bool isSelected = selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedRole = role),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryContainer : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primaryDark : AppColors.textSecondary),
            ),
          ),
        ),
      ),
    );
  }

  Widget _demoButton(String role, String sub, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Text(role, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(sub, style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}
