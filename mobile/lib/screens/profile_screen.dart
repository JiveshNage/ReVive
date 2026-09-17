import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/startup_audio_service.dart';
import '../services/speech_service.dart';

class ProfileScreen extends StatefulWidget {
  final String currentLang;
  final Function(String) onSelectLang;
  final String userName;
  final String userId;
  final String location;
  final String phone;
  final VoidCallback? onOpenSafety;
  final VoidCallback onLogout;

  const ProfileScreen({
    super.key,
    required this.currentLang,
    required this.onSelectLang,
    required this.userName,
    required this.userId,
    required this.location,
    required this.phone,
    this.onOpenSafety,
    required this.onLogout,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _startupSoundEnabled = true;
  TtsSpeedLevel _ttsSpeedLevel = TtsSpeedLevel.normal;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final soundEnabled = await StartupAudioService().isEnabled();
    if (mounted) {
      setState(() {
        _startupSoundEnabled = soundEnabled;
        _ttsSpeedLevel = SpeechService().speedLevel;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isHindi = widget.currentLang == 'hi';
    final isMarathi = widget.currentLang == 'mr';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isHindi ? 'वैधानिक डिजिटल पहचान पत्र' : (isMarathi ? 'वैधानिक डिजिटल ओळखपत्र' : 'Statutory Digital Identity'),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          Text(
            isHindi
                ? 'सीपीसीबी अधिकृत अनौपचारिक हरित साथी कार्ड'
                : (isMarathi ? 'सीपीसीबी मान्यताप्राप्त अनौपचारिक हरित भागीदार कार्ड' : 'CPCB recognized informal sector green partner card'),
            style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // Identity Smart Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF022C22)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x30064E3B),
                  blurRadius: 18,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text('🇮🇳', style: TextStyle(fontSize: 22)),
                        SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('ReVive Smart Card', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                            Text('CPCB / MoEFCC Partner', style: TextStyle(fontSize: 9.5, color: Color(0xFFA7F3D0))),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('ACTIVE PARTNER', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Row(
                  children: [
                    Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white38, width: 2),
                      ),
                      child: const Center(
                        child: Text('👷', style: TextStyle(fontSize: 28)),
                      ),
                    ),
                    const SizedBox(width: 14),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.userName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                          const SizedBox(height: 2),
                          Text('ID: ${widget.userId}', style: const TextStyle(fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFFD1FAE5))),
                          Text('📍 ${widget.location}', style: const TextStyle(fontSize: 11.5, color: Colors.white70)),
                        ],
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.qr_code_rounded, size: 48, color: AppColors.primaryDark),
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('EPR CREDIT ACCOUNT', style: TextStyle(fontSize: 10, color: Colors.white60)),
                      Text('100% AUDIT TRACEABLE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // User Settings Section
          Text(
            isHindi ? 'ऐप और ऑडियो प्राथमिकताएं' : (isMarathi ? 'ॲप आणि ऑडिओ सेटिंग्ज' : 'App & Audio Preferences'),
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                // 1. Startup Sound Toggle
                SwitchListTile(
                  secondary: const Icon(Icons.music_note_rounded, color: AppColors.primary),
                  title: Text(
                    isHindi ? 'ऐप स्टार्टअप साउंड' : (isMarathi ? 'ॲप स्टार्टअप आवाज' : 'Startup Sound'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    isHindi
                        ? 'ऐप शुरू होते समय रीवाइव टोन बजाएं'
                        : (isMarathi ? 'ॲप सुरू होताना रीव्हाइव्ह ट्यून वाजवा' : 'Play branded eco chime during app launch'),
                    style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                  ),
                  value: _startupSoundEnabled,
                  activeColor: AppColors.primary,
                  onChanged: (bool value) async {
                    setState(() => _startupSoundEnabled = value);
                    await StartupAudioService().setEnabled(value);
                  },
                ),

                const Divider(height: 1),

                // 2. TTS Speed Selector
                ListTile(
                  leading: const Icon(Icons.speed_rounded, color: AppColors.accentBlue),
                  title: Text(
                    isHindi ? 'ऑडियो बोलने की गति (TTS)' : (isMarathi ? 'बोलण्याचा वेग (TTS)' : 'Voice Reading Speed (TTS)'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    isHindi ? 'सहायक आवाज की गति चुनें' : (isMarathi ? 'आवाजाचा वेग निवडा' : 'Speech rate for accessibility voice'),
                    style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                  ),
                  trailing: SegmentedButton<TtsSpeedLevel>(
                    segments: const [
                      ButtonSegment(value: TtsSpeedLevel.slow, label: Text('🐢')),
                      ButtonSegment(value: TtsSpeedLevel.normal, label: Text('▶')),
                      ButtonSegment(value: TtsSpeedLevel.fast, label: Text('🐇')),
                    ],
                    selected: {_ttsSpeedLevel},
                    onSelectionChanged: (Set<TtsSpeedLevel> newSelection) {
                      final selected = newSelection.first;
                      setState(() => _ttsSpeedLevel = selected);
                      SpeechService().setSpeedLevel(selected);
                    },
                    style: const ButtonStyle(
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                ),

                const Divider(height: 1),

                ListTile(
                  leading: const Icon(Icons.phone_rounded, color: AppColors.primary),
                  title: Text(
                    isHindi ? 'पंजीकृत मोबाइल नंबर' : (isMarathi ? 'नोंदणीकृत फोन नंबर' : 'Registered Phone Number'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(widget.phone, style: const TextStyle(fontSize: 12)),
                ),

                const Divider(height: 1),

                ListTile(
                  leading: const Icon(Icons.translate_rounded, color: AppColors.accentBlue),
                  title: Text(
                    isHindi ? 'ऐप की भाषा' : (isMarathi ? 'ॲप भाषा' : 'App Language'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    widget.currentLang == 'hi' ? 'हिन्दी (Hindi)' : (widget.currentLang == 'mr' ? 'मराठी (Marathi)' : 'English'),
                    style: const TextStyle(fontSize: 12),
                  ),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {
                    final nextLang = widget.currentLang == 'en' ? 'hi' : (widget.currentLang == 'hi' ? 'mr' : 'en');
                    SpeechService().onLanguageChanged(nextLang);
                    widget.onSelectLang(nextLang);
                  },
                ),

                if (widget.onOpenSafety != null) ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.health_and_safety_rounded, color: Color(0xFF059669)),
                    title: Text(
                      isHindi ? 'सुरक्षा और स्वास्थ्य गाइड' : (isMarathi ? 'आरोग्य व सुरक्षा मार्गदर्शक' : 'Field Safety & Hazard Guide'),
                      style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      isHindi ? 'जहरीले धुएं और बैटरी से बचाव' : (isMarathi ? 'विषारी धूर व बॅटरी हाताळणी' : 'Toxicity prevention & safe battery handling'),
                      style: const TextStyle(fontSize: 12),
                    ),
                    trailing: const Icon(Icons.chevron_right, size: 20),
                    onTap: widget.onOpenSafety,
                  ),
                ],

                const Divider(height: 1),

                ListTile(
                  leading: const Icon(Icons.logout_rounded, color: AppColors.accentRed),
                  title: Text(
                    isHindi ? 'लॉगआउट / खाता बदलें' : (isMarathi ? 'लॉगआउट / खाते बदला' : 'Logout / Switch Account'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.accentRed),
                  ),
                  onTap: widget.onLogout,
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          const Center(
            child: Column(
              children: [
                Text(
                  'ReVive Collector App · v1.0.3+4',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
                SizedBox(height: 4),
                Text(
                  'CPCB Informal Partner Network · India',
                  style: TextStyle(fontSize: 10.5, color: Colors.grey),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
