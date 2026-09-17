import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../services/audio_service.dart';
import '../services/speech_service.dart';

class AudioGuideDialog extends StatefulWidget {
  final String currentLang;
  final String initialSection;
  final Function(String)? onSelectLang;

  const AudioGuideDialog({
    super.key,
    required this.currentLang,
    this.initialSection = 'home',
    this.onSelectLang,
  });

  static void show(
    BuildContext context, {
    required String currentLang,
    String initialSection = 'home',
    Function(String)? onSelectLang,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AudioGuideDialog(
        currentLang: currentLang,
        initialSection: initialSection,
        onSelectLang: onSelectLang,
      ),
    );
  }

  @override
  State<AudioGuideDialog> createState() => _AudioGuideDialogState();
}

class _AudioGuideDialogState extends State<AudioGuideDialog>
    with SingleTickerProviderStateMixin {
  late String activeSection;
  late String activeLang;
  late AnimationController _waveController;
  final SpeechService _speech = SpeechService();

  @override
  void initState() {
    super.initState();
    activeSection = widget.initialSection;
    activeLang = widget.currentLang;

    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _speech.stateNotifier.addListener(_onSpeechStateChanged);

    // Speak initial section
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _speakCurrentSection();
    });
  }

  void _onSpeechStateChanged() {
    if (!mounted) return;
    if (_speech.isSpeaking) {
      if (!_waveController.isAnimating) _waveController.repeat();
    } else {
      if (_waveController.isAnimating) _waveController.stop();
    }
    setState(() {});
  }

  @override
  void dispose() {
    _speech.stateNotifier.removeListener(_onSpeechStateChanged);
    _speech.stop();
    _waveController.dispose();
    super.dispose();
  }

  void _speakCurrentSection() {
    final guide = AudioService.getGuide(activeLang, activeSection);
    _speech.speak(guide.speechText, lang: activeLang);
  }

  void _togglePlay() {
    final state = _speech.currentState;
    if (state == TtsState.playing) {
      _speech.pause();
    } else if (state == TtsState.paused) {
      _speech.resume();
    } else {
      _speakCurrentSection();
    }
  }

  @override
  Widget build(BuildContext context) {
    final guide = AudioService.getGuide(activeLang, activeSection);
    final isPlaying = _speech.currentState == TtsState.playing;
    final isPaused = _speech.currentState == TtsState.paused;

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withAlpha(40),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.volume_up_rounded, color: Color(0xFF34D399), size: 22),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ReVive Voice Assistant',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        activeLang == 'hi'
                            ? 'आवाज में गाइड सुनें · HINDI'
                            : (activeLang == 'mr'
                                ? 'आवाजात मार्गदर्शक ऐका · MARATHI'
                                : 'Spoken Audio Guide · ENGLISH'),
                        style: const TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white60),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Topic Chips Selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _topicChip('All Features', 'home'),
                const SizedBox(width: 8),
                _topicChip('AI Camera', 'scanner'),
                const SizedBox(width: 8),
                _topicChip('Send to Recycler', 'recyclers'),
                const SizedBox(width: 8),
                _topicChip('Handover & Payment', 'handover'),
                const SizedBox(width: 8),
                _topicChip('🛡️ Safety & Health', 'safety'),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Audio Waveform Visualizer Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        guide.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isPlaying ? const Color(0xFF059669).withAlpha(60) : Colors.white12,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: isPlaying
                                  ? const Color(0xFF34D399)
                                  : (isPaused ? Colors.amber : Colors.grey),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isPlaying ? 'SPEAKING' : (isPaused ? 'PAUSED' : 'IDLE'),
                            style: TextStyle(
                              color: isPlaying
                                  ? const Color(0xFF34D399)
                                  : (isPaused ? Colors.amber : Colors.grey),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Animated Sound Wave
                SizedBox(
                  height: 48,
                  child: AnimatedBuilder(
                    animation: _waveController,
                    builder: (context, child) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: List.generate(24, (index) {
                          final wave = math.sin((_waveController.value * 2 * math.pi) + (index * 0.4)).abs();
                          final height = isPlaying ? (10 + (wave * 34)) : 8.0;
                          return Container(
                            width: 3.5,
                            height: height,
                            decoration: BoxDecoration(
                              color: isPlaying
                                  ? Color.lerp(const Color(0xFF059669), Colors.cyanAccent, wave)
                                  : Colors.white24,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        }),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 14),

                // Spoken Text Captions
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    guide.speechText,
                    style: const TextStyle(
                      color: Color(0xFFE2E8F0),
                      fontSize: 12.5,
                      height: 1.45,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Audio Player Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Speed toggle
              TextButton.icon(
                onPressed: () {
                  final cur = _speech.speedLevel;
                  if (cur == TtsSpeedLevel.normal) {
                    _speech.setSpeedLevel(TtsSpeedLevel.fast);
                  } else if (cur == TtsSpeedLevel.fast) {
                    _speech.setSpeedLevel(TtsSpeedLevel.slow);
                  } else {
                    _speech.setSpeedLevel(TtsSpeedLevel.normal);
                  }
                  setState(() {});
                },
                icon: const Icon(Icons.speed_rounded, size: 18, color: Colors.white70),
                label: Text(
                  _speech.speedLevel == TtsSpeedLevel.slow
                      ? '🐢 Slow'
                      : (_speech.speedLevel == TtsSpeedLevel.fast
                          ? '🐇 Fast'
                          : '▶ Normal'),
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),

              // Play / Pause Button
              ElevatedButton.icon(
                onPressed: _togglePlay,
                icon: Icon(
                  isPlaying
                      ? Icons.pause_rounded
                      : (isPaused ? Icons.play_arrow_rounded : Icons.volume_up_rounded),
                  size: 20,
                ),
                label: Text(
                  isPlaying
                      ? (activeLang == 'hi'
                          ? 'रोकें'
                          : (activeLang == 'mr' ? 'थांबवा' : 'Pause'))
                      : (isPaused
                          ? (activeLang == 'hi'
                              ? 'जारी रखें'
                              : (activeLang == 'mr' ? 'सुरू ठेवा' : 'Resume'))
                          : (activeLang == 'hi'
                              ? 'सुनें'
                              : (activeLang == 'mr' ? 'ऐका' : 'Play Voice'))),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isPlaying ? const Color(0xFFDC2626) : const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),

              // Language Selector
              PopupMenuButton<String>(
                initialValue: activeLang,
                icon: const Icon(Icons.language_rounded, color: Colors.cyanAccent),
                tooltip: 'Change Voice Language',
                onSelected: (code) {
                  setState(() => activeLang = code);
                  widget.onSelectLang?.call(code);
                  _speakCurrentSection();
                },
                itemBuilder: (ctx) => [
                  const PopupMenuItem(value: 'hi', child: Text('हिन्दी (Hindi Voice)')),
                  const PopupMenuItem(value: 'mr', child: Text('मराठी (Marathi Voice)')),
                  const PopupMenuItem(value: 'en', child: Text('English (Audio Guide)')),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _topicChip(String label, String key) {
    final isSelected = activeSection == key;
    return GestureDetector(
      onTap: () {
        setState(() => activeSection = key);
        _speakCurrentSection();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF10B981) : Colors.white12),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
