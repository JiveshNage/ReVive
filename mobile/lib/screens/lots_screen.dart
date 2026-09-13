import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../models/recycler.dart';
import '../theme/app_colors.dart';
import '../widgets/handover_payment_dialog.dart';
import 'lot_tracking_screen.dart';

class LotsScreen extends StatefulWidget {
  final String currentLang;
  final List<ScrapLot> lots;
  final List<AuthorizedRecycler> recyclers;
  final VoidCallback onOpenScanner;
  final Function(ScrapLot) onOpenPassport;
  final Function(ScrapLot, double) onConfirmHandover;
  final Function(ScrapLot, AuthorizedRecycler)? onSendLotToRecycler;

  const LotsScreen({
    super.key,
    required this.currentLang,
    required this.lots,
    this.recyclers = const [],
    required this.onOpenScanner,
    required this.onOpenPassport,
    required this.onConfirmHandover,
    this.onSendLotToRecycler,
  });

  @override
  State<LotsScreen> createState() => _LotsScreenState();
}

class _LotsScreenState extends State<LotsScreen> {
  String statusFilter = 'all';

  void _openLiveTracking(ScrapLot lot) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => LotTrackingScreen(
          lot: lot,
          currentLang: widget.currentLang,
          onConfirmHandover: (completedLot, weight) {
            _openHandoverPayment(completedLot);
          },
        ),
      ),
    );
  }

  void _openHandoverPayment(ScrapLot lot) {
    HandoverPaymentDialog.show(
      context,
      lot: lot,
      onComplete: (completedLot, verifiedWeight, paymentMethod, txnId) {
        widget.onConfirmHandover(completedLot, verifiedWeight);
      },
    );
  }

  void _openSelectRecyclerSheet(ScrapLot lot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.send_rounded, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Send Lot #${lot.id} to Recycler',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Text(
                        '${lot.material} (${lot.quantityKg} kg)',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Select an authorized CPCB recycler to accept this lot and schedule pickup:',
              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),

            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.45,
              ),
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: widget.recyclers.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, idx) {
                  final r = widget.recyclers[idx];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.business_rounded, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text('📍 ${r.location}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                              Text('CPCB: ${r.licenseNo}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.of(ctx).pop();
                            widget.onSendLotToRecycler?.call(lot, r);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('✓ Lot #${lot.id} assigned & sent to ${r.name}! Pickup scheduled.'),
                                backgroundColor: const Color(0xFF059669),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          child: const Text('Send Lot'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

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
                      'Catalogued e-waste, assigned recyclers & scale handover',
                      style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: widget.onOpenScanner,
                icon: const Icon(Icons.add_a_photo_rounded, size: 16),
                label: const Text('New Scrap Lot'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
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
                _filterChip('With Offers / In-Transit', 'offers'),
                _filterChip('Completed Passports', 'paid'),
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
                    SizedBox(height: 4),
                    Text('Click "New Scrap Lot" above to scan scrap with camera.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
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
    final bool hasOffer = lot.status == 'offers' || lot.status == 'pickup';
    final bool isUnassigned = lot.recyclerName == null || lot.status == 'created';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Lot ID + Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text('LOT #${lot.id}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      lot.category,
                      style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8)),
                    ),
                  ),
                ],
              ),
              _statusBadge(lot.status),
            ],
          ),

          const SizedBox(height: 10),

          // Main Info with optional Photo Thumbnail
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo Thumbnail (or category icon)
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 54,
                  height: 54,
                  color: AppColors.primaryContainer,
                  child: lot.imagePath != null
                      ? (!kIsWeb
                          ? Image.file(
                              File(lot.imagePath!),
                              fit: BoxFit.cover,
                            )
                          : Image.network(
                              lot.imagePath!,
                              fit: BoxFit.cover,
                            ))
                      : const Center(
                          child: Text('♻️', style: TextStyle(fontSize: 24)),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lot.material,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${lot.quantityKg} kg · Verified Mandi MSP',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // 1. CLEARLY DISPLAY WHICH RECYCLER AN EXISTING LOT HAS BEEN SOLD / SENT TO (Requested feature)
          if (lot.recyclerName != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.business_rounded, size: 14, color: Color(0xFF059669)),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      'Sent / Sold to: ${lot.recyclerName}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('CPCB ASSIGNED', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF166534))),
                  ),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.hourglass_top_rounded, size: 13, color: Color(0xFFB45309)),
                  SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      'Unassigned · Ready to Send to Recycler',
                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 6),

          // Geocoded Location Address Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    lot.pickupAddress,
                    style: const TextStyle(fontSize: 10.5, color: Color(0xFF475569)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Price & Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Guaranteed Valuation', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  Text(
                    '₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),

              Flexible(
                child: Wrap(
                  alignment: WrapAlignment.end,
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    // Send Lot Button for Unassigned Lots
                    if (isUnassigned && !isPaid)
                      ElevatedButton.icon(
                        onPressed: () => _openSelectRecyclerSheet(lot),
                        icon: const Icon(Icons.send_rounded, size: 13),
                        label: const Text('Send to Recycler', style: TextStyle(fontSize: 11)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        ),
                      ),

                    // Live Tracking Button (for lots in progress)
                    if (!isPaid && !isUnassigned)
                      OutlinedButton.icon(
                        onPressed: () => _openLiveTracking(lot),
                        icon: const Icon(Icons.near_me_rounded, size: 14, color: Color(0xFF0284C7)),
                        label: const Text('Live Track', style: TextStyle(fontSize: 11, color: Color(0xFF0284C7))),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          side: const BorderSide(color: Color(0xFFBAE6FD)),
                          backgroundColor: const Color(0xFFF0F9FF),
                        ),
                      ),

                    // Scale Handover & Integrated Payment Gateway
                    if (hasOffer && !isPaid)
                      ElevatedButton.icon(
                        onPressed: () => _openHandoverPayment(lot),
                        icon: const Icon(Icons.payments_outlined, size: 15),
                        label: const Text('Handover & Pay'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ),

                    if (isPaid)
                      ElevatedButton.icon(
                        onPressed: () => widget.onOpenPassport(lot),
                        icon: const Icon(Icons.qr_code_2_rounded, size: 15),
                        label: const Text('CPCB Passport'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryDark,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
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

    switch (status) {
      case 'offers':
        bg = AppColors.statusOffersBg;
        fg = AppColors.statusOffersText;
        label = 'Recycler Dispatched';
        break;
      case 'pickup':
        bg = const Color(0xFFE0F2FE);
        fg = const Color(0xFF0369A1);
        label = 'En Route';
        break;
      case 'paid':
        bg = AppColors.statusPaidBg;
        fg = AppColors.statusPaidText;
        label = 'CPCB Certified';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: fg),
      ),
    );
  }
}
