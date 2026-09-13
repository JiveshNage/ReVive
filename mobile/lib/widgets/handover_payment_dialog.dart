import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/lot.dart';
import '../theme/app_colors.dart';

class HandoverPaymentDialog extends StatefulWidget {
  final ScrapLot lot;
  final Function(ScrapLot lot, double verifiedWeight, String paymentMethod, String txnId) onComplete;

  const HandoverPaymentDialog({
    super.key,
    required this.lot,
    required this.onComplete,
  });

  static void show(
    BuildContext context, {
    required ScrapLot lot,
    required Function(ScrapLot lot, double verifiedWeight, String paymentMethod, String txnId) onComplete,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => HandoverPaymentDialog(
        lot: lot,
        onComplete: onComplete,
      ),
    );
  }

  @override
  State<HandoverPaymentDialog> createState() => _HandoverPaymentDialogState();
}

class _HandoverPaymentDialogState extends State<HandoverPaymentDialog> {
  late TextEditingController weightController;
  late TextEditingController upiIdController;
  late double ratePerKg;
  String selectedPaymentMethod = 'UPI'; // 'UPI' | 'IMPS' | 'ESCROW' | 'CASH'
  bool isProcessing = false;
  bool isSuccess = false;
  String generatedTxnId = '';

  @override
  void initState() {
    super.initState();
    weightController = TextEditingController(text: widget.lot.quantityKg.toStringAsFixed(1));
    upiIdController = TextEditingController(text: '9876543210@paytm');
    ratePerKg = widget.lot.quantityKg > 0
        ? (widget.lot.estimatedValue / widget.lot.quantityKg)
        : 403.0;
  }

  @override
  void dispose() {
    weightController.dispose();
    upiIdController.dispose();
    super.dispose();
  }

  double get currentWeight => double.tryParse(weightController.text) ?? widget.lot.quantityKg;
  double get totalPayout => currentWeight * ratePerKg;

  void _processPayment() async {
    setState(() => isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1800));

    final txn = 'REV-TXN-2026-${(10000 + (DateTime.now().millisecondsSinceEpoch % 90000))}';

    if (!mounted) return;
    setState(() {
      isProcessing = false;
      isSuccess = true;
      generatedTxnId = txn;
    });
  }

  void _finalizeAndClose() {
    Navigator.of(context).pop();
    widget.onComplete(widget.lot, currentWeight, selectedPaymentMethod, generatedTxnId);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: isSuccess ? _buildSuccessView() : _buildFormView(),
    );
  }

  Widget _buildFormView() {
    final recyclerName = widget.lot.recyclerName ?? 'EcoCycle India Pvt Ltd';

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag Handle
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

          // Dialog Title
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.verified_outlined, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Scale Handover & Secure Payment',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    Text(
                      'Lot #${widget.lot.id} · ${widget.lot.category}',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 1. CLEARLY DISPLAY ASSIGNED RECYCLER DETAILS (Requested feature)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.business_rounded, color: Color(0xFF059669), size: 16),
                        SizedBox(width: 6),
                        Text(
                          'ASSIGNED RECYCLER',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF065F46),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'CPCB CERTIFIED',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF166534)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  recyclerName,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  '📍 ${widget.lot.recyclerAddress}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Scale Agent: ${widget.lot.driverName}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF047857), fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '• Locked MSP: ₹${ratePerKg.toStringAsFixed(0)}/kg',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF047857)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2. SCALE WEIGHING
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Verified Scale Weight',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 4),
                      TextField(
                        controller: weightController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 4),
                          suffixText: 'kg',
                          border: InputBorder.none,
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Total Final Payout', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      Text(
                        '₹ ${totalPayout.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 3. PAYMENT METHOD SELECTION
          const Text(
            'Select Secure Payout Method',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              _paymentOptionChip('Instant UPI', 'UPI', Icons.qr_code_scanner_rounded),
              const SizedBox(width: 8),
              _paymentOptionChip('Bank IMPS', 'IMPS', Icons.account_balance_rounded),
              const SizedBox(width: 8),
              _paymentOptionChip('CPCB Escrow', 'ESCROW', Icons.shield_outlined),
              const SizedBox(width: 8),
              _paymentOptionChip('Cash Voucher', 'CASH', Icons.payments_outlined),
            ],
          ),

          const SizedBox(height: 12),

          if (selectedPaymentMethod == 'UPI')
            TextField(
              controller: upiIdController,
              decoration: InputDecoration(
                labelText: 'Collector UPI ID / VPA',
                prefixIcon: const Icon(Icons.alternate_email_rounded, size: 18),
                suffixText: 'VERIFIED',
                suffixStyle: const TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.bold),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            )
          else if (selectedPaymentMethod == 'IMPS')
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Beneficiary: Ram Yadav', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  Text('A/C: ••••••••• 4821 (State Bank of India)', style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                  Text('IFSC: SBIN0001248 · Direct Bank Deposit', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
            )
          else if (selectedPaymentMethod == 'ESCROW')
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.gavel_rounded, color: Color(0xFF1D4ED8), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'CPCB Escrow Guarantee: Payment released directly from authorized recycler EPR deposit fund.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFF1E40AF)),
                    ),
                  ),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.handshake_outlined, color: Color(0xFFB45309), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Cash Handover: Recycler driver will hand over physical cash with a verified digital e-receipt.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFF92400E)),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 20),

          // Payout Button
          ElevatedButton.icon(
            onPressed: isProcessing ? null : _processPayment,
            icon: isProcessing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Icon(Icons.lock_rounded, size: 18),
            label: Text(
              isProcessing
                  ? 'Connecting to Payment Gateway...'
                  : 'Pay ₹${totalPayout.toStringAsFixed(0)} & Certify Handover',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 10),
        Center(
          child: Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: Color(0xFFDCFCE7),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 40),
          ),
        ),
        const SizedBox(height: 12),
        const Center(
          child: Text(
            'Payment Settled & Certified!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
          ),
        ),
        const SizedBox(height: 4),
        Center(
          child: Text(
            '₹ ${totalPayout.toStringAsFixed(0)} credited via $selectedPaymentMethod',
            style: const TextStyle(fontSize: 14, color: Color(0xFF059669), fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 16),

        // Receipt Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              _receiptRow('Transaction ID', generatedTxnId),
              const Divider(height: 14),
              _receiptRow('Assigned Recycler', widget.lot.recyclerName ?? 'EcoCycle India Pvt Ltd'),
              const Divider(height: 14),
              _receiptRow('Verified Weight', '${currentWeight.toStringAsFixed(1)} kg'),
              const Divider(height: 14),
              _receiptRow('Settlement Date', DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.now())),
              const Divider(height: 14),
              _receiptRow('Green EPR Bonus', '+50 Loyalty Credits 🌿'),
            ],
          ),
        ),

        const SizedBox(height: 20),

        ElevatedButton.icon(
          onPressed: _finalizeAndClose,
          icon: const Icon(Icons.qr_code_2_rounded),
          label: const Text('View CPCB Waste Passport'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryDark,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _receiptRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _paymentOptionChip(String label, String key, IconData icon) {
    final isSelected = selectedPaymentMethod == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedPaymentMethod = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF059669) : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? const Color(0xFF059669) : AppColors.border),
          ),
          child: Column(
            children: [
              Icon(icon, size: 16, color: isSelected ? Colors.white : AppColors.textSecondary),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
