import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class ProfileScreen extends StatelessWidget {
  final String currentLang;
  final Function(String) onSelectLang;
  final String userName;
  final String userId;
  final String location;
  final String phone;
  final VoidCallback? onOpenSafety;
  final VoidCallback onLogout;

  const ProfileScreen({
    super.key,
    required this.currentLang,
    required this.onSelectLang,
    required this.userName,
    required this.userId,
    required this.location,
    required this.phone,
    this.onOpenSafety,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Statutory Digital Identity',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const Text(
            'CPCB recognized informal sector green partner card',
            style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // Identity Smart Card (Matching web portal ID card)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF022C22)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x30064E3B),
                  blurRadius: 18,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text('🇮🇳', style: TextStyle(fontSize: 22)),
                        SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('ReVive Smart Card', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                            Text('CPCB / MoEFCC Partner', style: TextStyle(fontSize: 9.5, color: Color(0xFFA7F3D0))),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('ACTIVE PARTNER', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Row(
                  children: [
                    // Avatar Placeholder
                    Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white38, width: 2),
                      ),
                      child: const Center(
                        child: Text('👷', style: TextStyle(fontSize: 28)),
                      ),
                    ),
                    const SizedBox(width: 14),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(userName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                          const SizedBox(height: 2),
                          Text('ID: $userId', style: const TextStyle(fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFFD1FAE5))),
                          Text('📍 $location', style: const TextStyle(fontSize: 11.5, color: Colors.white70)),
                        ],
                      ),
                    ),

                    // Scannable Simulated QR Token
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.qr_code_rounded, size: 48, color: AppColors.primaryDark),
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('EPR CREDIT ACCOUNT', style: TextStyle(fontSize: 10, color: Colors.white60)),
                      Text('100% AUDIT TRACEABLE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // User Settings Section
          const Text('App & Account Settings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 12),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.phone_rounded, color: AppColors.primary),
                  title: const Text('Registered Phone Number', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                  subtitle: Text(phone, style: const TextStyle(fontSize: 12)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.translate_rounded, color: AppColors.accentBlue),
                  title: const Text('App Language', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                  subtitle: Text(currentLang == 'hi' ? 'हिन्दी (Hindi)' : currentLang == 'mr' ? 'मराठी (Marathi)' : 'English', style: const TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {
                    final nextLang = currentLang == 'en' ? 'hi' : currentLang == 'hi' ? 'mr' : 'en';
                    onSelectLang(nextLang);
                  },
                ),
                if (onOpenSafety != null) ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.health_and_safety_rounded, color: Color(0xFF059669)),
                    title: const Text('Field Safety & Hazard Guide', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Toxicity prevention, battery handling & safe storage', style: TextStyle(fontSize: 12)),
                    trailing: const Icon(Icons.chevron_right, size: 20),
                    onTap: onOpenSafety,
                  ),
                ],
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.logout_rounded, color: AppColors.accentRed),
                  title: const Text('Logout / Switch Account', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.accentRed)),
                  onTap: onLogout,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Center(
            child: Column(
              children: [
                Text(
                  'ReVive Collector App · v1.0.3',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
                SizedBox(height: 4),
                Text(
                  'CPCB Informal Partner Network',
                  style: TextStyle(fontSize: 10.5, color: Colors.grey),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
