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
    final isHindi = currentLang == 'hi';
    final isMarathi = currentLang == 'mr';

    final paidLots = lots.where((l) => l.status == 'paid').toList();
    final pendingLots = lots.where((l) => l.status != 'paid').toList();

    final double totalPayout = paidLots.fold(0.0, (sum, l) => sum + l.estimatedValue);
    final double pendingPayout = pendingLots.fold(0.0, (sum, l) => sum + l.estimatedValue);
    final double cashPayout = totalPayout * 0.45; // Cash-first scale settlements
    final double upiPayout = totalPayout * 0.55;

    // Estimate today's earnings from recent lots
    final double todayPayout = paidLots.isNotEmpty ? paidLots.first.estimatedValue : 0.0;
    final double weeklyPayout = totalPayout * 0.75;
    final double monthlyPayout = totalPayout;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Earnings & Financial Ledger',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          Text(
            isHindi ? 'कमाई और वित्तीय खाता — नकद और यूपीआई' : (isMarathi ? 'कमाई आणि खातेवही — रोख आणि यूपीआय' : 'Transparent digital receipts for UPI and cash scale payouts'),
            style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // High-Impact Numbers Grid: Today's Earnings & Pending Dues
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [BoxShadow(color: Color(0x20064E3B), blurRadius: 10, offset: Offset(0, 4))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isHindi ? 'आज की कमाई (TODAY)' : (isMarathi ? 'आजची कमाई (TODAY)' : 'TODAY EARNED'),
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFFA7F3D0)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '₹ ${todayPayout.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isHindi ? 'नकद भुगतान ✓' : (isMarathi ? 'रोख जमा ✓' : 'Cash Cleared ✓'),
                        style: const TextStyle(fontSize: 10, color: Color(0xFF6EE7B7)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [BoxShadow(color: Color(0x201E293B), blurRadius: 10, offset: Offset(0, 4))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isHindi ? 'बकाया राशि (PENDING)' : (isMarathi ? 'शिल्लक येणे (PENDING)' : 'PENDING DUES'),
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFFFDE047)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '₹ ${pendingPayout.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isHindi ? '${pendingLots.length} लॉट प्रक्रिया में' : (isMarathi ? '${pendingLots.length} लॉट प्रक्रियेत' : '${pendingLots.length} Lots in transit'),
                        style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Aggregated Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'कुल संचित भुगतान' : (isMarathi ? 'एकूण जमा रक्कम' : 'Total Lifetime Payout'), style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text('₹ ${totalPayout.toStringAsFixed(0)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primaryDark)),
                  ],
                ),
                const Divider(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(isHindi ? '○ नकद प्राप्त' : (isMarathi ? '○ रोख प्राप्त' : '○ CASH PAID'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                          const SizedBox(height: 2),
                          Text('₹ ${cashPayout.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(isHindi ? '○ डिजिटल / UPI' : (isMarathi ? '○ डिजिटल / UPI' : '○ UPI / BANK'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                          const SizedBox(height: 2),
                          Text('₹ ${upiPayout.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Payout History Section
          Text(
            isHindi ? 'लेन-देन इतिहास (Transaction History)' : (isMarathi ? 'व्यवहार इतिहास (Transaction History)' : 'Transaction History'),
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 10),

          if (lots.isEmpty)
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
            ...lots.map((lot) {
              final isPaid = lot.status == 'paid';
              return Container(
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
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(lot.category, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isPaid ? const Color(0xFFDCFCE7) : const Color(0xFFFEF9C3),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  isPaid ? 'PAID ✓' : 'PENDING',
                                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: isPaid ? const Color(0xFF15803D) : const Color(0xFFA16207)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text('${lot.quantityKg} kg · ${isPaid ? "Cash received directly ✓" : "Awaiting scale handover"}', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Text(
                      '₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: isPaid ? AppColors.primaryDark : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

