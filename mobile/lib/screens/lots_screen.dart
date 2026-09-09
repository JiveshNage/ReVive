import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../theme/app_colors.dart';

class LotsScreen extends StatefulWidget {
  final String currentLang;
  final List<ScrapLot> lots;
  final VoidCallback onOpenScanner;
  final Function(ScrapLot) onOpenPassport;
  final Function(ScrapLot, double) onConfirmHandover;

  const LotsScreen({
    super.key,
    required this.currentLang,
    required this.lots,
    required this.onOpenScanner,
    required this.onOpenPassport,
    required this.onConfirmHandover,
  });

  @override
  State<LotsScreen> createState() => _LotsScreenState();
}

class _LotsScreenState extends State<LotsScreen> {
  String statusFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final filtered = statusFilter == 'all'
        ? widget.lots
        : widget.lots.where((l) => l.status == statusFilter).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'My Scrap Lots',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    Text(
                      'Catalogued e-waste and active recycler bids',
                      style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: widget.onOpenScanner,
                icon: const Icon(Icons.add_a_photo_rounded, size: 16),
                label: const Text('Add Lot'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Filter tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip('All Lots (${widget.lots.length})', 'all'),
                _filterChip('Catalogued', 'created'),
                _filterChip('With Offers', 'offers'),
                _filterChip('Completed / Passports', 'paid'),
              ],
            ),
          ),

          const SizedBox(height: 16),

          if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Center(
                child: Column(
                  children: [
                    Text('📦', style: TextStyle(fontSize: 36)),
                    SizedBox(height: 8),
                    Text('No Lots in this Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            )
          else
            ...filtered.map((lot) => _lotCard(lot)),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String status) {
    final bool isSelected = statusFilter == status;
    return GestureDetector(
      onTap: () => setState(() => statusFilter = status),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _lotCard(ScrapLot lot) {
    final bool isPaid = lot.status == 'paid';
    final bool hasOffer = lot.status == 'offers';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('LOT #${lot.id}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
              ),
              _statusBadge(lot.status),
            ],
          ),
          const SizedBox(height: 8),

          Text(lot.material, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text('${lot.quantityKg} kg · Guaranteed MSP Valuation', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),

          const SizedBox(height: 12),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Estimated Payout', style: TextStyle(fontSize: 10.5, color: AppColors.textMuted)),
                  Text(
                    '₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),

              if (isPaid)
                ElevatedButton.icon(
                  onPressed: () => widget.onOpenPassport(lot),
                  icon: const Icon(Icons.qr_code_2_rounded, size: 16),
                  label: const Text('CPCB Passport'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDark,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                )
              else if (hasOffer)
                ElevatedButton.icon(
                  onPressed: () => _showWeighInModal(lot),
                  icon: const Icon(Icons.scale_rounded, size: 16),
                  label: const Text('Weigh & Handover'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color bg = AppColors.statusCreatedBg;
    Color fg = AppColors.statusCreatedText;
    String label = 'Catalogued';

    if (status == 'offers') {
      bg = AppColors.statusOffersBg;
      fg = AppColors.statusOffersText;
      label = 'Bid Received';
    } else if (status == 'pickup') {
      bg = AppColors.statusPickupBg;
      fg = AppColors.statusPickupText;
      label = 'Pickup Set';
    } else if (status == 'paid') {
      bg = AppColors.statusPaidBg;
      fg = AppColors.statusPaidText;
      label = 'CPCB Certified ✓';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: fg)),
    );
  }

  void _showWeighInModal(ScrapLot lot) {
    double scaleWeight = lot.quantityKg;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Digital Scale Handover · Lot #${lot.id}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Verify scrap on CPCB certified platform scale', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Verified Calibrated Weight:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primaryDark)),
                  Text('${scaleWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark)),
                ],
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                widget.onConfirmHandover(lot, scaleWeight);
              },
              child: const Text('Confirm Handover & Generate Passport'),
            ),
          ],
        ),
      ),
    );
  }
}
