import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StartupAudioService {
  static final StartupAudioService _instance = StartupAudioService._internal();
  factory StartupAudioService() => _instance;
  StartupAudioService._internal();

  static const String prefKey = 'startup_sound_enabled';
  static const String assetPath = 'audio/revive_startup.mp3';

  AudioPlayer? _player;
  bool _hasPlayed = false;

  /// Whether the startup sound has already run in this process session.
  bool get hasPlayed => _hasPlayed;

  /// Check whether startup sound is enabled by user preference (default true).
  Future<bool> isEnabled() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(prefKey) ?? true;
    } catch (_) {
      return true;
    }
  }

  /// Toggle or set user preference.
  Future<void> setEnabled(bool enabled) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(prefKey, enabled);
    } catch (_) {}
  }

  /// Plays the startup sound once on genuine app startup.
  /// Non-blocking, completely safe from crashing.
  Future<void> playStartupSound() async {
    if (_hasPlayed) return;
    _hasPlayed = true;

    try {
      final enabled = await isEnabled();
      if (!enabled) return;

      _player = AudioPlayer();
      await _player!.setVolume(0.85);
      await _player!.play(AssetSource(assetPath));

      // Listen for completion to safely dispose player resources
      _player!.onPlayerComplete.listen((_) {
        _disposePlayer();
      });
    } catch (e) {
      debugPrint('StartupAudioService notice: $e');
      _disposePlayer();
    }
  }

  /// Safely stop and release player resources (e.g. when app navigates away)
  void stop() {
    try {
      _player?.stop();
    } catch (_) {}
    _disposePlayer();
  }

  void _disposePlayer() {
    try {
      _player?.dispose();
    } catch (_) {}
    _player = null;
  }
}
