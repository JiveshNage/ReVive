import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/speech_service.dart';

class AppHeader extends StatelessWidget {
  final String currentLang;
  final Function(String) onSelectLang;
  final String location;
  final bool isOnline;
  final String userId;
  final VoidCallback? onSpeak;
  final VoidCallback? onProfileTap;

  const AppHeader({
    super.key,
    required this.currentLang,
    required this.onSelectLang,
    required this.location,
    required this.isOnline,
    required this.userId,
    this.onSpeak,
    this.onProfileTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          // Top Row: Brand + Status + Language
          Row(
            children: [
              // Brand Icon
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.primaryBorder),
                ),
                child: const Center(
                  child: Text('♻️', style: TextStyle(fontSize: 18)),
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'ReVive',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    Text(
                      'E-Waste Bridge',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 9.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Indic Audio button with large accessible touch target
              if (onSpeak != null)
                InkWell(
                  onTap: onSpeak,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    height: 36,
                    constraints: const BoxConstraints(minWidth: 46),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF86EFAC)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.volume_up_rounded, size: 17, color: Color(0xFF15803D)),
                        const SizedBox(width: 3),
                        Text(
                          currentLang == 'hi' ? 'सुनें' : (currentLang == 'mr' ? 'ऐका' : 'Listen'),
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF15803D),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(width: 6),

              // Trilingual Language Selector Chips
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                padding: const EdgeInsets.all(2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _langChip('EN', 'en'),
                    _langChip('हिन्दी', 'hi'),
                    _langChip('मराठी', 'mr'),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Secondary Row: Location + Online Status + Digital ID chip
          Row(
            children: [
              // Location Chip
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.location_on_outlined, size: 13, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          location,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 6),

              // Online Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: isOnline ? AppColors.statusPaidBg : AppColors.statusCreatedBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isOnline ? AppColors.primary : AppColors.textMuted,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isOnline ? 'Online' : 'Offline',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: isOnline ? AppColors.primaryDark : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 6),

              // Digital ID chip
              GestureDetector(
                onTap: onProfileTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.primaryBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.badge_outlined, size: 12, color: AppColors.primaryDark),
                      const SizedBox(width: 4),
                      Text(
                        'ID: $userId',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _langChip(String label, String code) {
    final bool isSelected = currentLang == code;
    return GestureDetector(
      onTap: () {
        SpeechService().onLanguageChanged(code);
        onSelectLang(code);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isSelected
              ? [const BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1))]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? AppColors.primaryDark : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
