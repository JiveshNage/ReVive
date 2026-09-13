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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. HERO CAMERA SCANNER CARD
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
                    const Text('📸 Working Camera', style: TextStyle(color: Colors.white70, fontSize: 11)),
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

          const SizedBox(height: 16),

          // 2. LIVE ACTIVE LOT PICKUP TRACKING CARD (IF ANY LOT IS IN TRANSIT)
          if (activeLot != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.cyanAccent.withAlpha(100)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(38),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
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
                          const SizedBox(width: 6),
                          const Text(
                            'LIVE PICKUP EN ROUTE',
                            style: TextStyle(
                              color: Colors.cyanAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'LOT #${activeLot.id}',
                          style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.cyanAccent.withAlpha(38),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.electric_rickshaw_rounded, color: Colors.cyanAccent, size: 28),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activeLot.material,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Driver ${activeLot.driverName} • ${activeLot.vehicleNumber}',
                              style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'ETA: ~${activeLot.estimatedArrivalMinutes} mins • ${activeLot.remainingDistanceKm} km away',
                              style: const TextStyle(color: Color(0xFF67E8F9), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => onOpenTracking?.call(activeLot),
                      icon: const Icon(Icons.location_searching_rounded, size: 16),
                      label: const Text('Open Live Route Tracking Map'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
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
                )
              else if (lot.status == 'offers' || lot.status == 'pickup')
                GestureDetector(
                  onTap: () => onOpenTracking?.call(lot),
                  child: const Text('Live Track 🚛', style: TextStyle(fontSize: 11, color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
