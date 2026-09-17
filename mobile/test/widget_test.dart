import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:revive_mobile/app.dart';
import 'package:revive_mobile/screens/launch_splash_screen.dart';


import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('xyz.luan/audioplayers.global'),
      (MethodCall methodCall) async => 1,
    );
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('xyz.luan/audioplayers'),
      (MethodCall methodCall) async => 1,
    );
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('flutter_tts'),
      (MethodCall methodCall) async => 1,
    );
  });

  Future<void> launchAndSettleApp(WidgetTester tester) async {
    await tester.pumpWidget(const ReViveApp(splashDuration: Duration.zero));
    await tester.pumpAndSettle();
  }

  testWidgets('First-time app launch shows Welcome/Auth screen with Login and Register', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await launchAndSettleApp(tester);

    // Verify Welcome / Authentication Screen on first launch

    expect(find.text('ReVive Collector'), findsOneWidget);
    expect(find.text('Collector Login (लॉगिन)'), findsOneWidget);
    expect(find.text('New Registration (पंजीकरण)'), findsOneWidget);
    expect(find.text('Continue as Ram Yadav (Collector)'), findsOneWidget);

    // Authenticate via collector demo
    await tester.tap(find.text('Continue as Ram Yadav (Collector)'));
    await tester.pumpAndSettle();

    // Verify Main Dashboard is reached
    expect(find.text('ReVive'), findsOneWidget);
    expect(find.text('ID: REV-COL-2026-1024'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Rates'), findsOneWidget);
    expect(find.text('Lots'), findsOneWidget);
    expect(find.text('Ledger'), findsOneWidget);
  });

  testWidgets('Language toggle in AppHeader switches text between Hindi, Marathi and English', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await launchAndSettleApp(tester);

    // Authenticate
    await tester.tap(find.text('Continue as Ram Yadav (Collector)'));
    await tester.pumpAndSettle();

    // Default is Hindi
    expect(find.text('लाइव एआई कैमरा विज़न स्कैनर'), findsOneWidget);

    // Tap Marathi chip
    await tester.tap(find.text('मराठी'));
    await tester.pumpAndSettle();
    expect(find.text('थेट एआय कॅमेरा व्हिजन स्कॅनर'), findsOneWidget);

    // Tap English chip
    await tester.tap(find.text('EN'));
    await tester.pumpAndSettle();
    expect(find.text('Live AI Vision Camera Scanner'), findsOneWidget);

    // Switch back to Hindi
    await tester.tap(find.text('हिन्दी'));
    await tester.pumpAndSettle();
    expect(find.text('लाइव एआई कैमरा विज़न स्कैनर'), findsOneWidget);
  });

  testWidgets('Navigate through NavigationBar tabs to Rates, Lots and Ledger', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await launchAndSettleApp(tester);

    // Authenticate
    await tester.tap(find.text('Continue as Ram Yadav (Collector)'));
    await tester.pumpAndSettle();

    // Switch to Rates Tab
    await tester.tap(find.text('Rates'));
    await tester.pumpAndSettle();
    expect(find.text('Live Scrap MSP Board'), findsOneWidget);

    // Switch to Lots Tab
    await tester.tap(find.text('Lots'));
    await tester.pumpAndSettle();
    expect(find.text('My Scrap Lots'), findsOneWidget);

    // Switch to Ledger Tab
    await tester.tap(find.text('Ledger'));
    await tester.pumpAndSettle();
    expect(find.text('Earnings & Financial Ledger'), findsOneWidget);

    // Return to Home Tab
    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();
    expect(find.text('लाइव एआई कैमरा विज़न स्कैनर'), findsOneWidget);
  });
}
