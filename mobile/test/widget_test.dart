import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:revive_mobile/app.dart';

void main() {
  testWidgets('ReVive app smoke test - Header, Dashboard and Navigation tabs', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const ReViveApp());
    await tester.pumpAndSettle();

    // Verify Brand Header
    expect(find.text('ReVive'), findsOneWidget);
    expect(find.text('Online'), findsOneWidget);
    expect(find.text('ID: REV-COL-2026-1024'), findsOneWidget);

    // Verify Navigation Bar items
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Rates'), findsOneWidget);
    expect(find.text('Lots'), findsOneWidget);
    expect(find.text('Ledger'), findsOneWidget);

    // Verify Home Screen Content (Default Hindi for informal collectors)
    expect(find.text('लाइव एआई कैमरा विज़न स्कैनर'), findsOneWidget);
    expect(find.text('Lifetime Earnings'), findsOneWidget);
    expect(find.text('E-Waste Collected'), findsOneWidget);
  });

  testWidgets('Language toggle in AppHeader switches text between Hindi, Marathi and English', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const ReViveApp());
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

    await tester.pumpWidget(const ReViveApp());
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
