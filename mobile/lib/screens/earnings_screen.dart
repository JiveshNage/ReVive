import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../theme/app_colors.dart';

class EarningsScreen extends StatelessWidget {
  final String currentLang;
  final List<ScrapLot> lots;
  final VoidCallback onOpenScanner;

  const EarningsScreen({
    super.key,
    required this.currentLang,
    required this.lots,
    required this.onOpenScanner,
  });

  @override
  Widget build(BuildContext context) {
    final paidLots = lots.where((l) => l.status == 'paid').toList();
    final double totalPayout = paidLots.fold(0.0, (sum, l) => sum + l.estimatedValue);
    final double upiPayout = totalPayout * 0.72;
    final double cashPayout = totalPayout * 0.28;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Earnings & Financial Ledger',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const Text(
            'Transparent digital receipts for UPI and cash scale payouts',
            style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // Total Earnings Gradient Card
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF047857)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x30064E3B),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'TOTAL LIFETIME PAYOUT',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFA7F3D0)),
                      ),
                    ),
                    SizedBox(width: 8),
                    Text('Direct Bank / Handover', style: TextStyle(fontSize: 11, color: Colors.white70)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '₹ ${totalPayout.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(25),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Direct Bank / UPI', style: TextStyle(fontSize: 10.5, color: Color(0xFFD1FAE5))),
                            Text('₹ ${upiPayout.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(25),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Instant Yard Cash', style: TextStyle(fontSize: 10.5, color: Color(0xFFD1FAE5))),
                            Text('₹ ${cashPayout.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Payout History Section
          const Text(
            'Verified Scale Payout Receipts',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 10),

          if (paidLots.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Center(
                child: Column(
                  children: [
                    Text('💸', style: TextStyle(fontSize: 32)),
                    SizedBox(height: 6),
                    Text('No Completed Payouts Yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Text('Once you hand over lots on scale, settlements appear here.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  ],
                ),
              ),
            )
          else
            ...paidLots.map((lot) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Lot #${lot.id} · ${lot.category}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text('${lot.quantityKg} kg · Paid via UPI / Bank', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                        ],
                      ),
                      Text(
                        '+ ₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}
