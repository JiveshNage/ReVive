import 'package:flutter/material.dart';
import '../services/speech_service.dart';

class AccessibleAudioButton extends StatelessWidget {
  final String textToSpeak;
  final String currentLang;
  final bool compact;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final VoidCallback? onBeforeSpeak;

  const AccessibleAudioButton({
    super.key,
    required this.textToSpeak,
    required this.currentLang,
    this.compact = false,
    this.backgroundColor,
    this.foregroundColor,
    this.onBeforeSpeak,
  });

  String _getLabel(TtsState state, String lang) {
    switch (state) {
      case TtsState.playing:
        if (lang == 'hi') return '⏸ रोकें';
        if (lang == 'mr') return '⏸ थांबवा';
        return '⏸ Pause';
      case TtsState.paused:
        if (lang == 'hi') return '▶ जारी रखें';
        if (lang == 'mr') return '▶ पुढे बोला';
        return '▶ Resume';
      case TtsState.finished:
        if (lang == 'hi') return '🔊 फिर से सुनें';
        if (lang == 'mr') return '🔊 पुन्हा ऐका';
        return '🔊 Replay';
      case TtsState.idle:
      default:
        if (lang == 'hi') return '🔊 सुनें';
        if (lang == 'mr') return '🔊 ऐका';
        return '🔊 Listen';
    }
  }

  @override
  Widget build(BuildContext context) {
    final speech = SpeechService();

    return ValueListenableBuilder<TtsState>(
      valueListenable: speech.stateNotifier,
      builder: (context, state, _) {
        final label = _getLabel(state, currentLang);
        final isPlaying = state == TtsState.playing;
        final isPaused = state == TtsState.paused;

        final btnBg = backgroundColor ??
            (isPlaying
                ? const Color(0xFFDC2626)
                : (isPaused
                    ? const Color(0xFFD97706)
                    : const Color(0xFF047857)));

        final btnFg = foregroundColor ?? Colors.white;

        if (compact) {
          return InkWell(
            onTap: () {
              onBeforeSpeak?.call();
              speech.speak(textToSpeak, lang: currentLang);
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: btnBg.withAlpha(isPlaying ? 230 : 25),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isPlaying ? Colors.redAccent : const Color(0xFF059669),
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isPlaying
                        ? Icons.pause_circle_filled_rounded
                        : (isPaused
                            ? Icons.play_circle_filled_rounded
                            : Icons.volume_up_rounded),
                    color: isPlaying ? Colors.white : const Color(0xFF047857),
                    size: 20,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      color: isPlaying ? Colors.white : const Color(0xFF047857),
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return SizedBox(
          height: 48,
          child: ElevatedButton.icon(
            onPressed: () {
              onBeforeSpeak?.call();
              speech.speak(textToSpeak, lang: currentLang);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: btnBg,
              foregroundColor: btnFg,
              elevation: isPlaying ? 3 : 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            icon: Icon(
              isPlaying
                  ? Icons.pause_circle_filled_rounded
                  : (isPaused
                      ? Icons.play_circle_filled_rounded
                      : (state == TtsState.finished
                          ? Icons.replay_rounded
                          : Icons.volume_up_rounded)),
              size: 22,
            ),
            label: Text(
              label,
              style: const TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.2,
              ),
            ),
          ),
        );
      },
    );
  }
}
