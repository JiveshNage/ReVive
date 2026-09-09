import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SafetyScreen extends StatelessWidget {
  final String currentLang;
  final VoidCallback onOpenScanner;

  const SafetyScreen({
    super.key,
    required this.currentLang,
    required this.onOpenScanner,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Field Safety & Environmental Health',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const Text(
            'Hazard guidelines to protect waste collectors and families from toxic exposure',
            style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // Slogan Box
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFEF3C7), Color(0xFFFFFBEB)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFDE047), width: 1.5),
            ),
            child: const Row(
              children: [
                Text('⚠️', style: TextStyle(fontSize: 32)),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'कचरा मत जलाओ! सेहत बचाओ!',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Do not burn wires in open fire. Fumes contain toxic dioxins and lead.',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF78350F)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Pictographic Hazard Cards
          _hazardCard(
            icon: '🔥',
            title: 'Never Burn Wires & Cables',
            subtitle: 'Open flame burning releases carcinogenic dioxins. Certified recyclers strip insulation mechanically.',
            severity: 'CRITICAL HAZARD',
          ),
          _hazardCard(
            icon: '🧪',
            title: 'No Acid Leaching in Slums',
            subtitle: 'Extracting gold/copper using nitric or sulfuric acid permanently destroys lung tissue and poisons drinking water.',
            severity: 'SEVERE TOXIC RISK',
          ),
          _hazardCard(
            icon: '🔋',
            title: 'Do Not Puncture Lithium Batteries',
            subtitle: 'Puncturing laptop or smartphone batteries causes explosive thermal runaway and chemical burns.',
            severity: 'FIRE & EXPLOSION',
          ),
          _hazardCard(
            icon: '📺',
            title: 'Do Not Break CRT / Mercury Tubes',
            subtitle: 'Old monitors contain phosphor and mercury vapor. Hand over whole units intact for safe recovery.',
            severity: 'MERCURY POISONING',
          ),

          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onOpenScanner,
              icon: const Icon(Icons.camera_alt_rounded),
              label: const Text('Scan & Handover Safely'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _hazardCard({
    required String icon,
    required String title,
    required String subtitle,
    required String severity,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFEE2E2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(icon, style: const TextStyle(fontSize: 20))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        severity,
                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w800, color: Color(0xFFB91C1C)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
