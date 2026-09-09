import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../theme/app_colors.dart';

class ScanScreen extends StatefulWidget {
  final String currentLang;
  final Function(ScrapLot) onLotCreated;

  const ScanScreen({
    super.key,
    required this.currentLang,
    required this.onLotCreated,
  });

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  late AnimationController _laserController;
  bool isScanning = false;
  bool hasResult = false;

  // AI Detected result state
  String detectedCategory = 'Printed Circuit Board (Motherboard)';
  String shortCategory = 'PCB';
  double confidence = 0.94;
  double benchmarkRatePerKg = 403.0;
  double selectedWeightKg = 5.0;

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _laserController.dispose();
    super.dispose();
  }

  void _triggerScan() async {
    setState(() {
      isScanning = true;
      hasResult = false;
    });

    await Future.delayed(const Duration(milliseconds: 1400));

    if (mounted) {
      setState(() {
        isScanning = false;
        hasResult = true;
      });
    }
  }

  void _selectPreset(String cat, String shortCat, double rate, double weight) {
    setState(() {
      detectedCategory = cat;
      shortCategory = shortCat;
      benchmarkRatePerKg = rate;
      selectedWeightKg = weight;
      hasResult = true;
    });
  }

  double get estimatedCashPayout => benchmarkRatePerKg * selectedWeightKg;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Live AI Vision Scanner', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded, color: Colors.amber),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. CAMERA VIEWFINDER WITH ANIMATED LASER SCANNER
          Expanded(
            flex: 5,
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Simulated camera background
                    Container(
                      decoration: const BoxDecoration(
                        gradient: RadialGradient(
                          center: Alignment.center,
                          radius: 0.8,
                          colors: [Color(0xFF1E293B), Color(0xFF020617)],
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              shortCategory == 'PCB'
                                  ? Icons.memory_rounded
                                  : shortCategory == 'Battery'
                                      ? Icons.battery_charging_full_rounded
                                      : Icons.cable_rounded,
                              size: 80,
                              color: Colors.white24,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Target E-Waste in Center Box',
                              style: TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Laser line animation
                    AnimatedBuilder(
                      animation: _laserController,
                      builder: (context, child) {
                        return Positioned(
                          top: _laserController.value * 280,
                          left: 20,
                          right: 20,
                          child: Container(
                            height: 2.5,
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withAlpha(200),
                                  blurRadius: 12,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                    // Corner frame markers
                    Positioned(
                      top: 16,
                      left: 16,
                      child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.primary, width: 3), left: BorderSide(color: AppColors.primary, width: 3)))),
                    ),
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.primary, width: 3), right: BorderSide(color: AppColors.primary, width: 3)))),
                    ),
                    Positioned(
                      bottom: 16,
                      left: 16,
                      child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.primary, width: 3), left: BorderSide(color: AppColors.primary, width: 3)))),
                    ),
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.primary, width: 3), right: BorderSide(color: AppColors.primary, width: 3)))),
                    ),

                    // AI Processing indicator
                    if (isScanning)
                      Container(
                        color: Colors.black54,
                        child: const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(color: AppColors.primary),
                              SizedBox(height: 12),
                              Text('Analyzing Vision Model...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // 2. QUICK TEST CHIPS (For Evaluators without physical scrap)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _quickTestChip('PCB Board', () => _selectPreset('Printed Circuit Board (Motherboard)', 'PCB', 403.0, 5.0)),
                _quickTestChip('Li-Ion Battery', () => _selectPreset('Lithium-Ion Laptop Battery', 'Battery', 101.0, 3.0)),
                _quickTestChip('Copper Wire', () => _selectPreset('Copper Wire Harness & Cables', 'Copper Wire', 145.0, 8.0)),
                _quickTestChip('Phone Screen', () => _selectPreset('Smartphone Broken Display', 'Display', 85.0, 2.0)),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // 3. RESULTS & VALUATION BOTTOM SHEET
          Expanded(
            flex: 6,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Detection Pill & Confidence
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primaryBorder),
                          ),
                          child: Text(
                            shortCategory.toUpperCase(),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primaryDark),
                          ),
                        ),
                        Text(
                          '${(confidence * 100).toStringAsFixed(0)}% AI Confidence',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.primary),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // Material Name
                    Text(
                      detectedCategory,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),

                    const SizedBox(height: 14),

                    // Weight Stepper Selector
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Estimated Weight:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textSecondary)),
                        Row(
                          children: [
                            _weightChip(1.0),
                            _weightChip(5.0),
                            _weightChip(10.0),
                            _weightChip(20.0),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Estimated Cash Payout Box
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.primaryContainer,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primaryBorder),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Guaranteed Instant Payout', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                              Text(
                                '₹ ${estimatedCashPayout.toStringAsFixed(0)}',
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text('Fair MSP Benchmark', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                              Text('₹ ${benchmarkRatePerKg.toStringAsFixed(0)} / kg', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Primary Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _triggerScan,
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Rescan'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              final newLot = ScrapLot(
                                id: DateTime.now().millisecondsSinceEpoch % 10000,
                                material: detectedCategory,
                                category: shortCategory,
                                quantityKg: selectedWeightKg,
                                estimatedValue: estimatedCashPayout,
                                status: 'offers',
                                createdAt: DateTime.now(),
                                recyclerName: 'EcoCycle Pune Solutions',
                              );
                              widget.onLotCreated(newLot);
                              Navigator.of(context).pop();
                            },
                            icon: const Icon(Icons.bolt_rounded),
                            label: const Text('Sell Now / Book Pickup'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickTestChip(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white12,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _weightChip(double kg) {
    final bool isSelected = selectedWeightKg == kg;
    return GestureDetector(
      onTap: () => setState(() => selectedWeightKg = kg),
      child: Container(
        margin: const EdgeInsets.only(left: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceMuted,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          '${kg.toInt()}kg',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
