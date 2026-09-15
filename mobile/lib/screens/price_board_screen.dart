import 'package:flutter/material.dart';
import '../models/price_benchmark.dart';
import '../theme/app_colors.dart';

class PriceBoardScreen extends StatefulWidget {
  final String currentLang;
  final List<PriceBenchmark> benchmarks;
  final VoidCallback onOpenScanner;

  const PriceBoardScreen({
    super.key,
    required this.currentLang,
    required this.benchmarks,
    required this.onOpenScanner,
  });

  @override
  State<PriceBoardScreen> createState() => _PriceBoardScreenState();
}

class _PriceBoardScreenState extends State<PriceBoardScreen> {
  String selectedCity = 'Bhopal, MP';

  final List<String> cities = [
    'Bhopal, MP',
    'Pune, Maharashtra',
    'Indore, MP',
    'Delhi NCR',
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title & City Dropdown Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Live Scrap MSP Board',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    Text(
                      'CPCB statutory benchmark rates',
                      style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // City Selector
              DropdownButtonHideUnderline(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: DropdownButton<String>(
                    value: selectedCity,
                    icon: const Icon(Icons.arrow_drop_down, color: AppColors.primary),
                    items: cities.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedCity = val);
                    },
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Price Trajectory Visual Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'HIGH-GRADE PCB TREND',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    Text('+4.8% Today', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  '₹ 403.00 / kg',
                  style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 12),

                // Simulated Trajectory Bars
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _trendBar(40, 'Mon'),
                    _trendBar(55, 'Tue'),
                    _trendBar(50, 'Wed'),
                    _trendBar(70, 'Thu'),
                    _trendBar(65, 'Fri'),
                    _trendBar(85, 'Sat'),
                    _trendBar(100, 'Today', isHighlight: true),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Category Benchmarks List
          const Text(
            'Verified Material Categories',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 10),

          ...widget.benchmarks.map((b) => _benchmarkCard(b)),
        ],
      ),
    );
  }

  Widget _trendBar(double height, String label, {bool isHighlight = false}) {
    return Column(
      children: [
        Container(
          width: 28,
          height: height * 0.6,
          decoration: BoxDecoration(
            color: isHighlight ? AppColors.primary : const Color(0xFF334155),
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(fontSize: 9.5, color: isHighlight ? Colors.white : const Color(0xFF64748B), fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal),
        ),
      ],
    );
  }

  void _showWhyThisPriceDialog(PriceBenchmark b) {
    final isHindi = widget.currentLang == 'hi';
    final isMarathi = widget.currentLang == 'mr';
    final title = isHindi ? 'भाव का स्पष्टीकरण (Why this price?)' : (isMarathi ? 'दराचे स्पष्टीकरण (Why this price?)' : 'Price Explanation');
    final demandBonus = (b.medianRate * 0.02).round();
    final volBonus = (b.medianRate * 0.015).round();
    final suggested = (b.medianRate + demandBonus + volBonus).round();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.analytics_outlined, color: AppColors.primary, size: 24),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(b.category, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('अनुशंसित भाव (Recommended): ₹ $suggested / kg', style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 16)),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _explanationRow('क्षेत्रीय औसत (Regional Median)', '₹ ${b.medianRate.toStringAsFixed(0)}'),
            _explanationRow('रीसाइक्लर मांग (Demand Adjustment)', '+₹ $demandBonus'),
            _explanationRow('थोक मात्रा प्रोत्साहन (Volume Bonus)', '+₹ $volBonus'),
            const Divider(height: 20),
            _explanationRow('अंतिम देय भाव (Final Target)', '₹ $suggested / kg', isBold: true),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isHindi ? 'समझ गया' : (isMarathi ? 'समजले' : 'Got it'), style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _explanationRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label, style: TextStyle(fontSize: 12, fontWeight: isBold ? FontWeight.bold : FontWeight.normal, color: const Color(0xFF334155)))),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: isBold ? FontWeight.w900 : FontWeight.bold, color: isBold ? AppColors.primaryDark : AppColors.textPrimary)),
        ],
      ),
    );
  }

  void _speakPrice(PriceBenchmark b) {
    final isHindi = widget.currentLang == 'hi';
    final isMarathi = widget.currentLang == 'mr';
    final spokenText = isHindi
        ? 'आज ${b.category} का भाव ₹ ${b.minRate.toStringAsFixed(0)} से ₹ ${b.maxRate.toStringAsFixed(0)} प्रति किलो है। अनुशंसित औसत भाव ₹ ${b.medianRate.toStringAsFixed(0)} प्रति किलो है।'
        : (isMarathi
            ? 'आज ${b.category} चा भाव ₹ ${b.minRate.toStringAsFixed(0)} ते ₹ ${b.maxRate.toStringAsFixed(0)} प्रति किलो आहे. सरासरी भाव ₹ ${b.medianRate.toStringAsFixed(0)} आहे.'
            : 'Today\'s price for ${b.category} is ₹ ${b.minRate.toStringAsFixed(0)} to ₹ ${b.maxRate.toStringAsFixed(0)} per kg. Median price is ₹ ${b.medianRate.toStringAsFixed(0)}.');

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF0F172A),
        content: Row(
          children: [
            const Icon(Icons.volume_up, color: AppColors.primary, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(spokenText, style: const TextStyle(color: Colors.white, fontSize: 12))),
          ],
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  Widget _benchmarkCard(PriceBenchmark b) {
    final isHindi = widget.currentLang == 'hi';
    final isMarathi = widget.currentLang == 'mr';
    final listenLabel = isHindi ? '🔊 सुनें' : (isMarathi ? '🔊 ऐका' : '🔊 Listen');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      b.category,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Range: ₹ ${b.minRate.toStringAsFixed(0)} - ₹ ${b.maxRate.toStringAsFixed(0)}/kg',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹ ${b.medianRate.toStringAsFixed(0)}/kg',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                  ),
                  Text(
                    b.trend,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () => _speakPrice(b),
                icon: const Icon(Icons.volume_up, size: 16, color: AppColors.primary),
                label: Text(listenLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
              ),
              TextButton.icon(
                onPressed: () => _showWhyThisPriceDialog(b),
                icon: const Icon(Icons.help_outline, size: 16, color: Color(0xFF64748B)),
                label: Text(
                  isHindi ? 'भाव का कारण?' : (isMarathi ? 'दराचे कारण?' : 'Why this price?'),
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
              ),
              IconButton(
                onPressed: widget.onOpenScanner,
                icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary, size: 22),
                tooltip: 'Scan this item',
              ),
            ],
          ),
        ],
      ),
    );
  }
}
