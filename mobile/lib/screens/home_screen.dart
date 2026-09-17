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
  final Function(ScrapLot)? onOpenTracking;

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
    this.onOpenTracking,
  });

  @override
  Widget build(BuildContext context) {
    final double totalPayout = lots
        .where((l) => l.status == 'paid')
        .fold(0.0, (sum, l) => sum + l.estimatedValue);
    final double totalKg = lots.fold(0.0, (sum, l) => sum + l.quantityKg);

    // Find if there is an active lot in transit or with offers
    final activeLot = lots.cast<ScrapLot?>().firstWhere(
          (l) => l != null && (l.status == 'offers' || l.status == 'pickup'),
          orElse: () => null,
        );

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. HERO CAMERA SCANNER CARD
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF065F46), Color(0xFF059669), Color(0xFF10B981)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
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
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.auto_awesome, color: Color(0xFFFDE68A), size: 14),
                          SizedBox(width: 6),
                          Text(
                            'AI-POWERED VISION',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.qr_code_scanner_rounded, color: Colors.white70, size: 20),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  AppStrings.get('scanHeroTitle', currentLang),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  AppStrings.get('scanHeroSub', currentLang),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.8),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primaryDark,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: onOpenScanner,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.camera_alt_rounded, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        AppStrings.get('btnScanNow', currentLang),
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 2. LIVE ACTIVE LOT PICKUP TRACKING CARD (IF ANY LOT IS IN TRANSIT)
          if (activeLot != null) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'PICKUP EN ROUTE',
                            style: TextStyle(
                              color: Color(0xFF22D3EE),
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'ID: #${activeLot.id}',
                        style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF22D3EE).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.electric_moped_rounded, color: Color(0xFF22D3EE), size: 32),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activeLot.material,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Driver: ${activeLot.driverName}',
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'ETA: ~${activeLot.estimatedArrivalMinutes} mins',
                          style: const TextStyle(color: Color(0xFF22D3EE), fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${activeLot.remainingDistanceKm} km away',
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => onOpenTracking?.call(activeLot),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0EA5E9),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('TRACK LIVE LOCATION'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // 3. QUICK ACTION CHIPS
          Row(
            children: [
              Expanded(
                child: _quickActionButton(
                  icon: '📈',
                  title: 'Price Board',
                  subtitle: 'Live Mandi MSP',
                  onTap: onNavigatePrices,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _quickActionButton(
                  icon: '🏭',
                  title: 'Recyclers',
                  subtitle: 'CPCB Units',
                  onTap: onNavigateRecyclers,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _quickActionButton(
                  icon: '🛡️',
                  title: 'Safety',
                  subtitle: 'Field Guide',
                  onTap: onNavigateSafety,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // 4. KEY STATS GRID
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

          // 5. LIVE RATE TICKER PREVIEW
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
            height: 100,
            child: ListView.separated(
              physics: const BouncingScrollPhysics(),
              scrollDirection: Axis.horizontal,
              itemCount: benchmarks.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, idx) {
                final b = benchmarks[idx];
                return Container(
                  width: 170,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        b.category,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Flexible(
                            child: Text(
                              '₹${b.medianRate.toStringAsFixed(0)}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              b.trend,
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary),
                            ),
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

          // 6. RECENT LOTS LIST
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
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: [
            BoxShadow(
              color: AppColors.textPrimary.withOpacity(0.02),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _lotRowCard(ScrapLot lot) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Center(child: Text('📦', style: TextStyle(fontSize: 24))),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lot #${lot.id} · ${lot.category}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  '${lot.quantityKg} kg · ${lot.displayStatus}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary),
              ),
              const SizedBox(height: 4),
              if (lot.status == 'paid')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'PASSPORT 📜',
                    style: TextStyle(fontSize: 9, color: AppColors.primaryDark, fontWeight: FontWeight.w900),
                  ),
                )
              else if (lot.status == 'offers' || lot.status == 'pickup')
                GestureDetector(
                  onTap: () => onOpenTracking?.call(lot),
                  child: const Text(
                    'LIVE TRACK 🚛',
                    style: TextStyle(fontSize: 10, color: Color(0xFF0EA5E9), fontWeight: FontWeight.w900),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
