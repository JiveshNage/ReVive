import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum TtsState { idle, playing, paused, finished }

enum TtsSpeedLevel { slow, normal, fast }

class SpeechService {
  static final SpeechService _instance = SpeechService._internal();
  factory SpeechService() => _instance;
  SpeechService._internal() {
    _initTts();
  }

  static const String prefSpeedKey = 'tts_speed_level';

  final FlutterTts _flutterTts = FlutterTts();
  final ValueNotifier<TtsState> stateNotifier = ValueNotifier<TtsState>(TtsState.idle);

  TtsState get currentState => stateNotifier.value;
  bool get isSpeaking => currentState == TtsState.playing;

  String _currentLang = 'hi';
  double _currentRate = 0.48; // Recommended standard rate for clarity
  TtsSpeedLevel _currentSpeedLevel = TtsSpeedLevel.normal;

  String? _lastSpokenText;
  String? _lastSpokenLang;

  TtsSpeedLevel get speedLevel => _currentSpeedLevel;

  void Function(String message)? onErrorCallback;

  void _initTts() async {
    try {
      await _loadSavedSpeed();

      _flutterTts.setStartHandler(() {
        stateNotifier.value = TtsState.playing;
      });

      _flutterTts.setCompletionHandler(() {
        stateNotifier.value = TtsState.finished;
      });

      _flutterTts.setPauseHandler(() {
        stateNotifier.value = TtsState.paused;
      });

      _flutterTts.setContinueHandler(() {
        stateNotifier.value = TtsState.playing;
      });

      _flutterTts.setCancelHandler(() {
        stateNotifier.value = TtsState.idle;
      });

      _flutterTts.setErrorHandler((dynamic msg) {
        stateNotifier.value = TtsState.idle;
        debugPrint('SpeechService error: $msg');
        onErrorCallback?.call('Speech service encountered an issue.');
      });

      // Platform specific audio attributes
      if (kIsWeb) return;
      if (Platform.isAndroid) {
        await _flutterTts.setPitch(1.0);
        await _flutterTts.setSpeechRate(_currentRate);
        await _flutterTts.awaitSynthCompletion(true);
      }
    } catch (e) {
      debugPrint('SpeechService init error: $e');
    }
  }

  Future<void> _loadSavedSpeed() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final levelIndex = prefs.getInt(prefSpeedKey) ?? 1; // default normal
      if (levelIndex == 0) {
        _currentSpeedLevel = TtsSpeedLevel.slow;
        _currentRate = 0.38;
      } else if (levelIndex == 2) {
        _currentSpeedLevel = TtsSpeedLevel.fast;
        _currentRate = 0.62;
      } else {
        _currentSpeedLevel = TtsSpeedLevel.normal;
        _currentRate = 0.48;
      }
      await _flutterTts.setSpeechRate(_currentRate);
    } catch (_) {}
  }

  Future<void> setSpeedLevel(TtsSpeedLevel level) async {
    _currentSpeedLevel = level;
    if (level == TtsSpeedLevel.slow) {
      _currentRate = 0.38;
    } else if (level == TtsSpeedLevel.fast) {
      _currentRate = 0.62;
    } else {
      _currentRate = 0.48;
    }

    try {
      await _flutterTts.setSpeechRate(_currentRate);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(prefSpeedKey, level.index);
    } catch (_) {}
  }

  /// Maps app language code ('en', 'hi', 'mr') to BCP 47 locale codes.
  String _mapLocale(String langCode) {
    switch (langCode.toLowerCase()) {
      case 'hi':
        return 'hi-IN';
      case 'mr':
        return 'mr-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  /// Sets language code ('en', 'hi', 'mr').
  Future<bool> setLanguage(String langCode) async {
    _currentLang = langCode;
    final locale = _mapLocale(langCode);
    try {
      final isAvailable = await _flutterTts.isLanguageAvailable(locale);
      if (isAvailable == true || isAvailable == 1) {
        await _flutterTts.setLanguage(locale);
        return true;
      } else {
        // Try generic fallback if Indian variant is not yet downloaded
        if (langCode == 'en') {
          await _flutterTts.setLanguage('en-US');
          return true;
        }
        debugPrint('Voice for $locale is not installed on this device.');
        return false;
      }
    } catch (e) {
      debugPrint('Error setting language $locale: $e');
      return false;
    }
  }

  /// Speak narration text in the requested or currently selected language.
  Future<void> speak(String text, {String? lang}) async {
    final targetLang = lang ?? _currentLang;

    // If currently speaking the exact same text, toggle pause
    if (stateNotifier.value == TtsState.playing && _lastSpokenText == text) {
      await pause();
      return;
    }

    // If paused on the exact same text, resume
    if (stateNotifier.value == TtsState.paused && _lastSpokenText == text) {
      await resume();
      return;
    }

    // Otherwise, stop any previous narration completely
    await stop();

    _lastSpokenText = text;
    _lastSpokenLang = targetLang;

    final available = await setLanguage(targetLang);
    if (!available) {
      final langName = targetLang == 'hi'
          ? 'हिन्दी (Hindi)'
          : (targetLang == 'mr' ? 'मराठी (Marathi)' : 'English');
      onErrorCallback?.call(
        'The $langName voice is not installed on this phone. Please install speech recognition data in Android Settings.',
      );
    }

    try {
      await _flutterTts.speak(text);
    } catch (e) {
      debugPrint('Speech error: $e');
      stateNotifier.value = TtsState.idle;
    }
  }

  /// Pause current speech
  Future<void> pause() async {
    try {
      final result = await _flutterTts.pause();
      if (result == 1) {
        stateNotifier.value = TtsState.paused;
      }
    } catch (_) {}
  }

  /// Resume paused speech
  Future<void> resume() async {
    try {
      if (Platform.isAndroid && _lastSpokenText != null) {
        // On Android, speak from beginning if resume is not natively supported by engine
        await _flutterTts.speak(_lastSpokenText!);
      } else {
        await _flutterTts.speak(_lastSpokenText ?? '');
      }
    } catch (_) {}
  }

  /// Stop speech immediately and reset state
  Future<void> stop() async {
    stateNotifier.value = TtsState.idle;
    try {
      await _flutterTts.stop();
    } catch (_) {}
  }

  /// Replay the last narration
  Future<void> replay() async {
    if (_lastSpokenText != null && _lastSpokenText!.isNotEmpty) {
      await speak(_lastSpokenText!, lang: _lastSpokenLang);
    }
  }

  /// Cleanly handle language switch: immediately stops old narration.
  void onLanguageChanged(String newLang) {
    stateNotifier.value = TtsState.idle;
    stop();
    _currentLang = newLang;
    _lastSpokenText = null;
  }


  /// Cleanly handle leaving screen.
  void onScreenDisposed() {
    stop();
  }
}
