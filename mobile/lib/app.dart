import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'services/api_client.dart';
import 'theme/app_theme.dart';
import 'models/lot.dart';
import 'models/price_benchmark.dart';
import 'models/recycler.dart';
import 'widgets/app_header.dart';
import 'widgets/bottom_nav_bar.dart';
import 'widgets/qr_passport_dialog.dart';
import 'widgets/audio_guide_dialog.dart';
import 'screens/home_screen.dart';
import 'screens/price_board_screen.dart';
import 'screens/recyclers_screen.dart';
import 'screens/earnings_screen.dart';
import 'screens/lots_screen.dart';
import 'screens/safety_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/scan_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/lot_tracking_screen.dart';
import 'screens/launch_splash_screen.dart';

class ReViveApp extends StatelessWidget {
  final Duration splashDuration;

  const ReViveApp({
    super.key,
    this.splashDuration = const Duration(milliseconds: 1400),
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReVive Collector Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: LaunchSplashScreen(
        splashDuration: splashDuration,
        onInitialized: (authenticated) => ReViveMainScreen(initialAuth: authenticated),
      ),
    );
  }
}

class ReViveMainScreen extends StatefulWidget {
  final bool? initialAuth;
  const ReViveMainScreen({super.key, this.initialAuth});

  @override
  State<ReViveMainScreen> createState() => _ReViveMainScreenState();
}


class _ReViveMainScreenState extends State<ReViveMainScreen> {
  // Navigation & Role State (First-time launch defaults to unauthenticated)
  int currentTabIndex = 0;
  String currentLang = 'hi'; // Default Hindi for grassroots collectors
  bool isAuthenticated = false; // Fresh launch requires Welcome / Login / Registration
  String userName = 'राम यादव (Ram Yadav)';
  String userPhone = '9876543210';
  String userId = 'REV-COL-2026-1024';
  String userLocation = 'Karond Mandi, Bhopal, MP';
  bool isOnline = true;

  @override
  void initState() {
    super.initState();
    if (widget.initialAuth != null) {
      isAuthenticated = widget.initialAuth!;
    }
    _checkPersistedAuth();
  }


  Future<void> _checkPersistedAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedAuth = prefs.getBool('is_authenticated') ?? false;
      if (savedAuth && mounted) {
        setState(() {
          isAuthenticated = true;
          userName = prefs.getString('user_name') ?? userName;
          userPhone = prefs.getString('user_phone') ?? userPhone;
          userId = prefs.getString('user_id') ?? userId;
          userLocation = prefs.getString('user_location') ?? userLocation;
          currentLang = prefs.getString('user_lang') ?? currentLang;
        });
        _loadRemoteData();
      }
    } catch (_) {}
  }

  // Domain Data State with Geocoded telemetry
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
      pickupAddress: 'Shop #4, Karond Mandi, Bhopal, MP 462038',
      pickupLatitude: 23.2599,
      pickupLongitude: 77.4126,
      recyclerAddress: 'EcoCycle Processing Unit 3, Mandideep Industrial Area, MP',
      recyclerLatitude: 23.0760,
      recyclerLongitude: 77.5250,
      currentTrackingStage: 'settled',
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
      recyclerName: 'CleanEarth Green Recyclers',
      pickupAddress: 'Shop #4, Karond Mandi, Bhopal, MP 462038',
      pickupLatitude: 23.2599,
      pickupLongitude: 77.4126,
      recyclerAddress: 'Bhopal Industrial Area Phase 2, MP',
      recyclerLatitude: 23.0760,
      recyclerLongitude: 77.5250,
      driverName: 'Sunil Kumar (सुनील कुमार)',
      driverPhone: '+91 98261 44521',
      vehicleNumber: 'MP 04 GA 8821',
      vehicleType: 'Tata Ace Electric (E-Cargo)',
      currentTrackingStage: 'in_transit',
      estimatedArrivalMinutes: 14,
      remainingDistanceKm: 3.4,
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
      pickupAddress: 'Shop #4, Karond Mandi, Bhopal, MP 462038',
      pickupLatitude: 23.2599,
      pickupLongitude: 77.4126,
      recyclerAddress: 'EcoCycle Mandideep Processing Depot, MP',
      recyclerLatitude: 23.0760,
      recyclerLongitude: 77.5250,
      currentTrackingStage: 'catalogued',
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
          onLotCreated: (newLot) async {
            setState(() {
              lots.insert(0, newLot);
              currentTabIndex = 2; // Switch to lots tab
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('✓ Lot #${newLot.id} catalogued! You can now send it to an authorized recycler.'),
                backgroundColor: const Color(0xFF059669),
              ),
            );
            try {
              final res = await ApiClient().createLot(
                materialId: 1,
                quantityKg: newLot.quantityKg,
                photoUrl: newLot.imagePath,
              );
              if (res['lot_reference'] != null && mounted) {
                setState(() {
                  newLot.passportId = res['lot_reference'];
                });
              }
            } catch (_) {}
          },
        ),
      ),
    );
  }

  void _sendLotToRecycler(ScrapLot lot, AuthorizedRecycler recycler) {
    setState(() {
      lot.recyclerName = recycler.name;
      lot.recyclerAddress = recycler.location;
      lot.status = 'offers';
      lot.currentTrackingStage = 'in_transit';
      lot.estimatedArrivalMinutes = 14;
      lot.remainingDistanceKm = 3.4;
      currentTabIndex = 2; // Navigate to Lots screen
    });
  }

  void _openLiveTracking(ScrapLot lot) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => LotTrackingScreen(
          lot: lot,
          currentLang: currentLang,
          onConfirmHandover: _confirmHandover,
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

  void _confirmHandover(ScrapLot lot, double verifiedWeight) async {
    setState(() {
      lot.status = 'paid';
      lot.finalWeightKg = verifiedWeight;
      lot.passportId = lot.passportId ?? 'REV-2026-LOT-0${lot.id}';
      lot.certificateHash = 'e48a6cf712bc90a8813ef046522c19318b76dfb2';
      lot.currentTrackingStage = 'settled';
    });
    try {
      final res = await ApiClient().createHandover(
        lotId: lot.id,
        collectorId: 1,
        recyclerId: 1,
        finalWeightKg: verifiedWeight,
        handoverLocation: lot.pickupAddress,
        latitude: lot.pickupLatitude,
        longitude: lot.pickupLongitude,
      );
      if (res['handover_reference'] != null && mounted) {
        setState(() {
          lot.certificateHash = res['handover_reference'];
        });
      }
    } catch (_) {}
    _openPassportDialog(lot);
  }

  Future<void> _loadRemoteData() async {
    try {
      final remoteLots = await ApiClient().getLots();
      if (remoteLots.isNotEmpty && mounted) {
        final parsed = remoteLots
            .map((j) => ScrapLot.fromBackendJson(j as Map<String, dynamic>))
            .toList();
        setState(() {
          lots.clear();
          lots.addAll(parsed);
        });
      }
    } catch (_) {}

    try {
      final remotePrices = await ApiClient().getPriceBenchmarks();
      if (remotePrices.isNotEmpty && mounted) {
        final parsed = remotePrices.map((j) {
          final m = j as Map<String, dynamic>;
          return PriceBenchmark(
            category: m['category'] as String? ?? 'General',
            medianRate: (m['median_rate'] as num?)?.toDouble() ?? 300.0,
            minRate: (m['min_rate'] as num?)?.toDouble() ?? 250.0,
            maxRate: (m['max_rate'] as num?)?.toDouble() ?? 350.0,
            trend: m['trend'] as String? ?? '+0.0%',
          );
        }).toList();
        setState(() {
          benchmarks.clear();
          benchmarks.addAll(parsed);
        });
      }
    } catch (_) {}

    try {
      final remoteRecyclers = await ApiClient().matchRecyclers(location: userLocation);
      if (remoteRecyclers.isNotEmpty && mounted) {
        final parsed = remoteRecyclers.map((j) {
          final m = j as Map<String, dynamic>;
          final id = m['recycler_id'] as int? ?? 1;
          return AuthorizedRecycler(
            id: id,
            name: m['recycler_name'] as String? ?? 'Recycler #$id',
            licenseNo: 'CPCB/EW/2026/$id',
            location: m['location'] as String? ?? 'India',
            rating: 4.8,
            verified: (m['authorization_status'] as String? ?? '').toLowerCase().contains('auth'),
            acceptedMaterials: m['accepted_materials'] as String? ?? 'All E-Waste',
            offerRate: 420.0,
            phone: m['contact'] as String? ?? '+91 9800000000',
          );
        }).toList();
        setState(() {
          recyclers.clear();
          recyclers.addAll(parsed);
        });
      }
    } catch (_) {}
  }

  void _handleLoginSuccess(
    String role,
    String name,
    String phone, {
    String? customUserId,
    String? location,
    String? token,
  }) async {
    final effectiveUserId = customUserId ?? 'REV-COL-2026-1024';
    final effectiveLocation = location ?? 'Karond Mandi, Bhopal, MP';

    setState(() {
      userName = name;
      userPhone = phone;
      userId = effectiveUserId;
      userLocation = effectiveLocation;
      isAuthenticated = true;
    });

    try {
      if (token != null) {
        await ApiClient().saveToken(token);
      }
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_authenticated', true);
      await prefs.setString('user_name', name);
      await prefs.setString('user_phone', phone);
      await prefs.setString('user_id', effectiveUserId);
      await prefs.setString('user_location', effectiveLocation);
      await prefs.setString('user_lang', currentLang);
    } catch (_) {}

    _loadRemoteData();
  }

  void _handleLogout() async {
    setState(() => isAuthenticated = false);
    try {
      await ApiClient().clearAuth();
    } catch (_) {}
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // 1. REUSABLE TOP APP HEADER WITH WORKING AUDIO GUIDE
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
                      appBar: AppBar(title: const Text('Identity Card')),
                      body: ProfileScreen(
                        currentLang: currentLang,
                        onSelectLang: (code) => setState(() => currentLang = code),
                        userName: userName,
                        userId: userId,
                        location: userLocation,
                        phone: userPhone,
                        onOpenSafety: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => Scaffold(
                                appBar: AppBar(title: const Text('Safety Guidance')),
                                body: SafetyScreen(
                                  currentLang: currentLang,
                                  onOpenScanner: _openLiveScanner,
                                ),
                              ),
                            ),
                          );
                        },
                        onLogout: _handleLogout,
                      ),
                    ),
                  ),
                );
              },
              onSpeak: () {
                AudioGuideDialog.show(
                  context,
                  currentLang: currentLang,
                  initialSection: currentTabIndex == 1
                      ? 'home'
                      : currentTabIndex == 2
                          ? 'recyclers'
                          : currentTabIndex == 3
                              ? 'handover'
                              : 'home',
                  onSelectLang: (code) => setState(() => currentLang = code),
                );
              },
            ),

            // 2. ACTIVE SCREEN CONTENT
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.02, 0),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<int>(currentTabIndex),
                  child: _buildCurrentTab(),
                ),
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

  Widget _buildCurrentTab() {
    switch (currentTabIndex) {
      case 0:
        return HomeScreen(
          currentLang: currentLang,
          lots: lots,
          benchmarks: benchmarks,
          onOpenScanner: _openLiveScanner,
          onNavigatePrices: () => setState(() => currentTabIndex = 1),
          onNavigateLots: () => setState(() => currentTabIndex = 2),
          onOpenTracking: _openLiveTracking,
          onNavigateRecyclers: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: const Text('Authorized Recyclers')),
                  body: RecyclersScreen(
                    currentLang: currentLang,
                    recyclers: recyclers,
                    lots: lots,
                    onOpenScanner: _openLiveScanner,
                    onSendLotToRecycler: _sendLotToRecycler,
                  ),
                ),
              ),
            );
          },
          onNavigateSafety: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: const Text('Safety Guidance')),
                  body: SafetyScreen(
                    currentLang: currentLang,
                    onOpenScanner: _openLiveScanner,
                  ),
                ),
              ),
            );
          },
          onOpenPassport: _openPassportDialog,
        );
      case 1:
        return PriceBoardScreen(
          currentLang: currentLang,
          benchmarks: benchmarks,
          onOpenScanner: _openLiveScanner,
        );
      case 2:
        return LotsScreen(
          currentLang: currentLang,
          lots: lots,
          recyclers: recyclers,
          onOpenScanner: _openLiveScanner,
          onOpenPassport: _openPassportDialog,
          onConfirmHandover: _confirmHandover,
          onSendLotToRecycler: _sendLotToRecycler,
        );
      case 3:
        return EarningsScreen(
          currentLang: currentLang,
          lots: lots,
          onOpenScanner: _openLiveScanner,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
