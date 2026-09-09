import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../models/price_benchmark.dart';
import '../theme/app_colors.dart';
import '../widgets/stat_card.dart';
import '../localization/app_strings.dart';

class HomeScreen extends StatelessWidget {
  final String currentLang;
  final List<ScrapLot> lots;
  final List<PriceBenchmark> benchmarks;
  final VoidCallback onOpenScanner;
  final VoidCallback onNavigatePrices;
  final VoidCallback onNavigateLots;
  final VoidCallback onNavigateRecyclers;
  final VoidCallback onNavigateSafety;
  final Function(ScrapLot) onOpenPassport;

  const HomeScreen({
    super.key,
    required this.currentLang,
    required this.lots,
    required this.benchmarks,
    required this.onOpenScanner,
    required this.onNavigatePrices,
    required this.onNavigateLots,
    required this.onNavigateRecyclers,
    required this.onNavigateSafety,
    required this.onOpenPassport,
  });

  @override
  Widget build(BuildContext context) {
    final double totalPayout = lots
        .where((l) => l.status == 'paid')
        .fold(0.0, (sum, l) => sum + l.estimatedValue);
    final double totalKg = lots.fold(0.0, (sum, l) => sum + l.quantityKg);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. HERO CAMERA SCANNER CARD (matching web portal hero camera card)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF065F46), Color(0xFF047857)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x30059669),
                  blurRadius: 18,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(35),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.bolt_rounded, color: Color(0xFFFBBF24), size: 14),
                          SizedBox(width: 4),
                          Text(
                            'AI-Assisted Vision MSP',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    const Text('📸 Live Camera', style: TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  AppStrings.get('scanHeroTitle', currentLang),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  AppStrings.get('scanHeroSub', currentLang),
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Color(0xFFD1FAE5),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primaryDark,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 3,
                    ),
                    onPressed: onOpenScanner,
                    icon: const Icon(Icons.camera_alt_rounded, color: AppColors.primary),
                    label: Text(
                      AppStrings.get('btnScanNow', currentLang),
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // 2. QUICK ACTION CHIPS
          Row(
            children: [
              Expanded(
                child: _quickActionButton(
                  icon: '📈',
                  title: 'Price Board',
                  subtitle: 'Live MSP Rates',
                  onTap: onNavigatePrices,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _quickActionButton(
                  icon: '🏭',
                  title: 'Recyclers',
                  subtitle: 'Nearby CPCB Units',
                  onTap: onNavigateRecyclers,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _quickActionButton(
                  icon: '🛡️',
                  title: 'Safety',
                  subtitle: 'Safe Handling',
                  onTap: onNavigateSafety,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // 3. KEY STATS GRID (Matching Web Portal)
          Row(
            children: [
              Expanded(
                child: StatCard(
                  symbol: '₹',
                  value: '₹ ${totalPayout.toStringAsFixed(0)}',
                  title: 'Lifetime Earnings',
                  subtitle: 'Direct Bank / UPI',
                  accentColor: AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatCard(
                  symbol: '⚖',
                  value: '${totalKg.toStringAsFixed(1)} kg',
                  title: 'E-Waste Collected',
                  subtitle: 'Formal Recycling Chain',
                  accentColor: AppColors.accentBlue,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // 4. LIVE RATE TICKER PREVIEW
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  AppStrings.get('rateTickerTitle', currentLang),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onNavigatePrices,
                child: const Text('View All →', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Horizontal scrolling rate cards
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: benchmarks.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, idx) {
                final b = benchmarks[idx];
                return Container(
                  width: 155,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        b.category,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              '₹ ${b.medianRate.toStringAsFixed(0)}/kg',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            b.trend,
                            style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 20),

          // 5. RECENT LOTS LIST
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  AppStrings.get('recentLotsTitle', currentLang),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onNavigateLots,
                child: const Text('All Lots →', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          ...lots.take(3).map((lot) => _lotRowCard(lot)),
        ],
      ),
    );
  }

  Widget _quickActionButton({
    required String icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
          boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            Text(subtitle, style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _lotRowCard(ScrapLot lot) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(child: Text('📦', style: TextStyle(fontSize: 20))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lot #${lot.id} · ${lot.category}',
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                Text(
                  '${lot.quantityKg} kg · ${lot.displayStatus}',
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              if (lot.status == 'paid')
                GestureDetector(
                  onTap: () => onOpenPassport(lot),
                  child: const Text('Passport 📜', style: TextStyle(fontSize: 11, color: AppColors.accentBlue, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
