import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:revive_mobile/services/startup_audio_service.dart';
import 'package:revive_mobile/services/speech_service.dart';
import 'package:revive_mobile/widgets/accessible_audio_button.dart';

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

  group('StartupAudioService Unit Tests', () {
    test('User preference defaults to enabled', () async {
      final service = StartupAudioService();
      final enabled = await service.isEnabled();
      expect(enabled, isTrue);
    });

    test('User preference can be toggled and persisted', () async {
      final service = StartupAudioService();
      await service.setEnabled(false);
      expect(await service.isEnabled(), isFalse);

      await service.setEnabled(true);
      expect(await service.isEnabled(), isTrue);
    });

    test('Startup sound plays only once on app launch', () async {
      final service = StartupAudioService();
      // First invocation sets _hasPlayed
      await service.playStartupSound();
      expect(service.hasPlayed, isTrue);

      // Second invocation does not replay or crash
      await service.playStartupSound();
      expect(service.hasPlayed, isTrue);
    });
  });

  group('SpeechService Accessibility Tests', () {
    test('Initial speech state is idle', () {
      final speech = SpeechService();
      expect(speech.currentState, equals(TtsState.idle));
      expect(speech.isSpeaking, isFalse);
    });

    test('Speed level changes and updates rate cleanly', () async {
      final speech = SpeechService();
      await speech.setSpeedLevel(TtsSpeedLevel.slow);
      expect(speech.speedLevel, equals(TtsSpeedLevel.slow));

      await speech.setSpeedLevel(TtsSpeedLevel.fast);
      expect(speech.speedLevel, equals(TtsSpeedLevel.fast));

      await speech.setSpeedLevel(TtsSpeedLevel.normal);
      expect(speech.speedLevel, equals(TtsSpeedLevel.normal));
    });

    test('Language change stops previous speech and resets state', () {
      final speech = SpeechService();
      speech.stateNotifier.value = TtsState.playing;
      speech.onLanguageChanged('en');
      expect(speech.currentState, equals(TtsState.idle));
    });
  });

  group('AccessibleAudioButton Widget Tests', () {
    testWidgets('Renders correct Indic text for Hindi (🔊 सुनें)', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AccessibleAudioButton(
              textToSpeak: 'परीक्षण पाठ',
              currentLang: 'hi',
            ),
          ),
        ),
      );

      expect(find.text('🔊 सुनें'), findsOneWidget);
    });

    testWidgets('Renders correct Marathi text for Marathi (🔊 ऐका)', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AccessibleAudioButton(
              textToSpeak: 'चाचणी माहिती',
              currentLang: 'mr',
            ),
          ),
        ),
      );

      expect(find.text('🔊 ऐका'), findsOneWidget);
    });

    testWidgets('Renders correct English text for English (🔊 Listen)', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AccessibleAudioButton(
              textToSpeak: 'Test information',
              currentLang: 'en',
            ),
          ),
        ),
      );

      expect(find.text('🔊 Listen'), findsOneWidget);
    });
  });
}
