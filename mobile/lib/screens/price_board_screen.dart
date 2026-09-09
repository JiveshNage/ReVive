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

  Widget _benchmarkCard(PriceBenchmark b) {
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
          const SizedBox(width: 8),
          IconButton(
            onPressed: widget.onOpenScanner,
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary, size: 22),
            tooltip: 'Scan this item',
          ),
        ],
      ),
    );
  }
}
