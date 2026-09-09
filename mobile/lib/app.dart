import 'package:flutter/material.dart';

import 'theme/app_theme.dart';
import 'models/lot.dart';
import 'models/price_benchmark.dart';
import 'models/recycler.dart';
import 'widgets/app_header.dart';
import 'widgets/bottom_nav_bar.dart';
import 'widgets/qr_passport_dialog.dart';
import 'screens/home_screen.dart';
import 'screens/price_board_screen.dart';
import 'screens/recyclers_screen.dart';
import 'screens/earnings_screen.dart';
import 'screens/lots_screen.dart';
import 'screens/safety_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/scan_screen.dart';
import 'screens/auth_screen.dart';

class ReViveApp extends StatelessWidget {
  const ReViveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReVive Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const ReViveMainScreen(),
    );
  }
}

class ReViveMainScreen extends StatefulWidget {
  const ReViveMainScreen({super.key});

  @override
  State<ReViveMainScreen> createState() => _ReViveMainScreenState();
}

class _ReViveMainScreenState extends State<ReViveMainScreen> {
  // Navigation & Role State
  int currentTabIndex = 0;
  String currentLang = 'hi'; // Default Hindi for grassroots collectors
  bool isAuthenticated = true;
  String activeRole = 'collector';
  String userName = 'राम यादव (Ram Yadav)';
  String userPhone = '9876543210';
  String userId = 'REV-COL-2026-1024';
  String userLocation = 'Bhopal, MP';
  bool isOnline = true;

  // Domain Data State
  final List<ScrapLot> lots = [
    ScrapLot(
      id: 101,
      material: 'Printed Circuit Board (Motherboard & Server)',
      category: 'PCB',
      quantityKg: 14.5,
      estimatedValue: 5843.5,
      status: 'paid',
      syncStatus: 'SYNCED',
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      recyclerName: 'EcoCycle Pune Solutions',
      finalWeightKg: 14.2,
      passportId: 'REV-2026-LOT-0101',
      certificateHash: 'e48a6cf712bc90a8813ef046522c19318b76dfb2',
    ),
    ScrapLot(
      id: 102,
      material: 'Copper Wire Harness & Cables',
      category: 'Copper Wire',
      quantityKg: 8.0,
      estimatedValue: 1160.0,
      status: 'offers',
      syncStatus: 'SYNCED',
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      recyclerName: 'CleanEarth Metal Recyclers',
    ),
    ScrapLot(
      id: 103,
      material: 'Lithium-Ion Laptop & Phone Batteries',
      category: 'Battery',
      quantityKg: 5.0,
      estimatedValue: 505.0,
      status: 'created',
      syncStatus: 'SYNCED',
      createdAt: DateTime.now().subtract(const Duration(hours: 8)),
    ),
  ];

  final List<PriceBenchmark> benchmarks = [
    PriceBenchmark(category: 'PCB (Server / High-Grade)', medianRate: 403.0, minRate: 380.0, maxRate: 450.0, trend: '+4.8%'),
    PriceBenchmark(category: 'Copper Wire & Cables', medianRate: 145.0, minRate: 135.0, maxRate: 160.0, trend: '+2.1%'),
    PriceBenchmark(category: 'Lithium-Ion Batteries', medianRate: 101.0, minRate: 90.0, maxRate: 115.0, trend: '+1.5%'),
    PriceBenchmark(category: 'Smartphones & Feature Phones', medianRate: 210.0, minRate: 190.0, maxRate: 240.0, trend: '+3.4%'),
    PriceBenchmark(category: 'Mixed E-Waste Plastic', medianRate: 28.0, minRate: 22.0, maxRate: 35.0, trend: '0.0%'),
  ];

  final List<AuthorizedRecycler> recyclers = [
    AuthorizedRecycler(
      id: 1,
      name: 'EcoCycle India Pvt Ltd',
      licenseNo: 'CPCB/EW/2024/0981',
      location: 'Pune MIDC, Maharashtra (12 km)',
      rating: 4.9,
      verified: true,
      acceptedMaterials: 'PCB, Batteries, Mobile Phones',
      offerRate: 405.0,
      phone: '+91 91234 56780',
    ),
    AuthorizedRecycler(
      id: 2,
      name: 'CleanEarth Green Recyclers',
      licenseNo: 'CPCB/MP/2025/0312',
      location: 'Bhopal Industrial Area (8 km)',
      rating: 4.8,
      verified: true,
      acceptedMaterials: 'Copper, Metal Scrap, CRT/LCD',
      offerRate: 148.0,
      phone: '+91 98765 40004',
    ),
    AuthorizedRecycler(
      id: 3,
      name: 'MahaGreen Recycling Hub',
      licenseNo: 'CPCB/MH/2024/1102',
      location: 'Bhosari PCMC (18 km)',
      rating: 4.7,
      verified: true,
      acceptedMaterials: 'All E-Waste Fractions',
      offerRate: 395.0,
      phone: '+91 98765 40001',
    ),
  ];

  void _openLiveScanner() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => ScanScreen(
          currentLang: currentLang,
          onLotCreated: (newLot) {
            setState(() {
              lots.insert(0, newLot);
              currentTabIndex = 2; // Switch to lots tab
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('✓ Lot #${newLot.id} created and sent to regional recyclers!'),
                backgroundColor: const Color(0xFF059669),
              ),
            );
          },
        ),
      ),
    );
  }

  void _openPassportDialog(ScrapLot lot) {
    showDialog(
      context: context,
      builder: (ctx) => QrPassportDialog(lot: lot),
    );
  }

  void _confirmHandover(ScrapLot lot, double verifiedWeight) {
    setState(() {
      lot.status = 'paid';
      lot.finalWeightKg = verifiedWeight;
      lot.passportId = 'REV-2026-LOT-0${lot.id}';
      lot.certificateHash = 'e48a6cf712bc90a8813ef046522c19318b76dfb2';
    });
    _openPassportDialog(lot);
  }

  void _handleLoginSuccess(String role, String name, String phone) {
    setState(() {
      activeRole = role;
      userName = name;
      userPhone = phone;
      userId = role == 'collector'
          ? 'REV-COL-2026-1024'
          : role == 'recycler'
              ? 'REV-REC-2026-0812'
              : 'CPCB-GOV-2026-0001';
      userLocation = role == 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP';
      isAuthenticated = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!isAuthenticated) {
      return AuthScreen(
        currentLang: currentLang,
        onSelectLang: (code) => setState(() => currentLang = code),
        onLoginSuccess: _handleLoginSuccess,
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // 1. REUSABLE TOP APP HEADER
            AppHeader(
              currentLang: currentLang,
              onSelectLang: (code) => setState(() => currentLang = code),
              location: userLocation,
              isOnline: isOnline,
              userId: userId,
              onProfileTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => Scaffold(
                      appBar: AppBar(title: const Text('Digital Identity Card')),
                      body: ProfileScreen(
                        currentLang: currentLang,
                        onSelectLang: (code) => setState(() => currentLang = code),
                        userName: userName,
                        userId: userId,
                        location: userLocation,
                        phone: userPhone,
                        onLogout: () => setState(() => isAuthenticated = false),
                      ),
                    ),
                  ),
                );
              },
              onSpeak: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      currentLang == 'hi'
                          ? 'ऑडियो सहायक: कबाड़ की फोटो खींचें और सही नकद भाव पाएं।'
                          : currentLang == 'mr'
                              ? 'ऑडिओ सहाय्यक: ई-कचऱ्याचा फोटो काढा आणि अचूक रोख भाव मिळवा.'
                              : 'Audio Assistant: Scan scrap e-waste to receive verified fair price.',
                    ),
                    duration: const Duration(seconds: 3),
                  ),
                );
              },
            ),

            // 2. ACTIVE SCREEN CONTENT
            Expanded(
              child: IndexedStack(
                index: currentTabIndex,
                children: [
                  // Tab 0: Home Dashboard
                  HomeScreen(
                    currentLang: currentLang,
                    lots: lots,
                    benchmarks: benchmarks,
                    onOpenScanner: _openLiveScanner,
                    onNavigatePrices: () => setState(() => currentTabIndex = 1),
                    onNavigateLots: () => setState(() => currentTabIndex = 2),
                    onNavigateRecyclers: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => Scaffold(
                            appBar: AppBar(title: const Text('Recyclers Directory')),
                            body: RecyclersScreen(
                              currentLang: currentLang,
                              recyclers: recyclers,
                              onOpenScanner: _openLiveScanner,
                            ),
                          ),
                        ),
                      );
                    },
                    onNavigateSafety: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => Scaffold(
                            appBar: AppBar(title: const Text('Field Safety Guidance')),
                            body: SafetyScreen(
                              currentLang: currentLang,
                              onOpenScanner: _openLiveScanner,
                            ),
                          ),
                        ),
                      );
                    },
                    onOpenPassport: _openPassportDialog,
                  ),

                  // Tab 1: Price Board
                  PriceBoardScreen(
                    currentLang: currentLang,
                    benchmarks: benchmarks,
                    onOpenScanner: _openLiveScanner,
                  ),

                  // Tab 2: Scrap Lots
                  LotsScreen(
                    currentLang: currentLang,
                    lots: lots,
                    onOpenScanner: _openLiveScanner,
                    onOpenPassport: _openPassportDialog,
                    onConfirmHandover: _confirmHandover,
                  ),

                  // Tab 3: Earnings & Financial Ledger
                  EarningsScreen(
                    currentLang: currentLang,
                    lots: lots,
                    onOpenScanner: _openLiveScanner,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),

      // 3. REUSABLE STICKY BOTTOM NAVIGATION BAR
      bottomNavigationBar: BottomNavBar(
        currentIndex: currentTabIndex,
        onTap: (index) => setState(() => currentTabIndex = index),
        onOpenScanner: _openLiveScanner,
      ),
    );
  }
}
