import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/speech_service.dart';
import '../widgets/accessible_audio_button.dart';

class SafetyScreen extends StatefulWidget {
  final String currentLang;
  final VoidCallback onOpenScanner;

  const SafetyScreen({
    super.key,
    required this.currentLang,
    required this.onOpenScanner,
  });

  @override
  State<SafetyScreen> createState() => _SafetyScreenState();
}

class _SafetyScreenState extends State<SafetyScreen> {
  @override
  void dispose() {
    SpeechService().stop();
    super.dispose();
  }

  String get _fullSafetyNarration {
    final isHindi = widget.currentLang == 'hi';
    final isMarathi = widget.currentLang == 'mr';

    if (isHindi) {
      return 'फील्ड सुरक्षा दिशा-निर्देश: ई-कचरे को कभी न जलाएं! तार जलाने से जहरीला धुआं और लेड निकलता है जो फेफड़ों को नुकसान पहुंचाता है। एसिड का उपयोग न करें। लिथियम बैटरी को पंचर न करें या न खोलें। सीआरटी स्क्रीन को न तोड़ें और हमेशा सुरक्षा उपकरणों का उपयोग करें।';
    } else if (isMarathi) {
      return 'सुरक्षा आणि आरोग्य मार्गदर्शक: ई-कचरा कधीही जाळू नका! वायर जाळल्याने विषारी वायू निघतो. ॲसिड वापरू नका. बॅटरी फोडू नका. सीआरटी स्क्रीन तोडू नका आणि प्रमाणित रिसायकलर्सना थेट माल द्या.';
    } else {
      return 'Field Safety & Health Guidance: Never burn wires in open flames. Burning releases toxic dioxins and lead. Do not use acid leaching. Do not puncture lithium batteries. Do not break CRT screens. Always wear protective gear and hand over intact scrap safely.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Field Safety & Environmental Health',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    Text(
                      'Hazard guidelines to protect waste collectors and families from toxic exposure',
                      style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              AccessibleAudioButton(
                textToSpeak: _fullSafetyNarration,
                currentLang: widget.currentLang,
                compact: true,
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Slogan Box
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFEF3C7), Color(0xFFFFFBEB)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFDE047), width: 1.5),
            ),
            child: Row(
              children: [
                const Text('⚠️', style: TextStyle(fontSize: 32)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.currentLang == 'hi'
                            ? 'कचरा मत जलाओ! सेहत बचाओ!'
                            : (widget.currentLang == 'mr'
                                ? 'कचरा जाळू नका! आरोग्य वाचवा!'
                                : 'Do Not Burn Waste! Save Lives!'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.currentLang == 'hi'
                            ? 'खुली आग में तार न जलाएं। धुएं में लेड और जहरीला डाइऑक्सिन होता है।'
                            : (widget.currentLang == 'mr'
                                ? 'उघड्यावर वायर जाळू नका. धुरामध्ये विषारी लेड आणि वायू असतात.'
                                : 'Do not burn wires in open fire. Fumes contain toxic dioxins and lead.'),
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF78350F)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Pictographic Hazard Cards with inline speech narration
          _hazardCard(
            icon: '🔥',
            title: widget.currentLang == 'hi'
                ? 'तार और केबल कभी न जलाएं'
                : (widget.currentLang == 'mr' ? 'वायर आणि केबल्स कधीही जाळू नका' : 'Never Burn Wires & Cables'),
            subtitle: widget.currentLang == 'hi'
                ? 'आग में जलाने से फेफड़ों का कैंसर हो सकता है। प्रमाणित रीसाइक्लर मशीन से प्लास्टिक अलग करते हैं।'
                : (widget.currentLang == 'mr'
                    ? 'जाळल्याने फुफ्फुसांचा कर्करोग होऊ शकतो. प्रमाणित रिसायकलर्स मशीनद्वारे इन्सुलेशन वेगळे करतात.'
                    : 'Open flame burning releases carcinogenic dioxins. Certified recyclers strip insulation mechanically.'),
            spokenText: widget.currentLang == 'hi'
                ? 'ई-कचरे और तारों को कभी न जलाएं। तार जलाने से जहरीला धुआं और लेड निकलता है जो फेफड़ों को गंभीर नुकसान पहुंचाता है।'
                : (widget.currentLang == 'mr'
                    ? 'वायर कधीही जाळू नका. वायर जाळल्याने अत्यंत विषारी वायू बाहेर पडतो.'
                    : 'Never burn wires and cables in open fire. Fumes contain carcinogenic dioxins and lead.'),
            severity: 'CRITICAL HAZARD',
          ),
          _hazardCard(
            icon: '🧪',
            title: widget.currentLang == 'hi'
                ? 'एसिड से धातु न निकालें'
                : (widget.currentLang == 'mr' ? 'ॲसिडचा वापर करू नका' : 'No Acid Leaching in Slums'),
            subtitle: widget.currentLang == 'hi'
                ? 'तेजाब से सोना या तांबा निकालने से सांस की नली जल जाती है और पीने का पानी दूषित होता है।'
                : (widget.currentLang == 'mr'
                    ? 'सोनं किंवा तांबे काढण्यासाठी नायट्रिक ॲसिड वापरल्याने फुफ्फुसांचे कायमचे नुकसान होते.'
                    : 'Extracting gold/copper using nitric or sulfuric acid permanently destroys lung tissue and poisons drinking water.'),
            spokenText: widget.currentLang == 'hi'
                ? 'एसिड या तेजाब का उपयोग कभी न करें। इससे फेफड़े जल जाते हैं और पीने का पानी जहरीला हो जाता है।'
                : (widget.currentLang == 'mr'
                    ? 'ॲसिडचा वापर कधीही करू नका. यामुळे फुफ्फुसे जळतात आणि पिण्याचे पाणी विषारी होते.'
                    : 'Do not use nitric or sulfuric acid leaching. It permanently destroys lung tissue and poisons water.'),
            severity: 'SEVERE TOXIC RISK',
          ),
          _hazardCard(
            icon: '🔋',
            title: widget.currentLang == 'hi'
                ? 'लिथियम बैटरी को न फोड़ें'
                : (widget.currentLang == 'mr' ? 'लिथियम बॅटरी फोडू नका' : 'Do Not Puncture Lithium Batteries'),
            subtitle: widget.currentLang == 'hi'
                ? 'फोन या लैपटॉप की बैटरी में छेद करने से जोरदार आग लगती है और रासायनिक धमाका होता है।'
                : (widget.currentLang == 'mr'
                    ? 'लॅपटॉप किंवा फोनची बॅटरी फोडल्यास अचानक आग लागून स्फोट होऊ शकतो.'
                    : 'Puncturing laptop or smartphone batteries causes explosive thermal runaway and chemical burns.'),
            spokenText: widget.currentLang == 'hi'
                ? 'बैटरी को खोलें या उसमें छेद न करें। लिथियम बैटरी फटने से भयानक आग और विस्फोट हो सकता है।'
                : (widget.currentLang == 'mr'
                    ? 'बॅटरी फोडू नका किंवा उघडू नका. यामुळे आग लागून मोठा स्फोट होऊ शकतो.'
                    : 'Do not puncture or open lithium batteries. They can cause explosive fires and chemical burns.'),
            severity: 'FIRE & EXPLOSION',
          ),
          _hazardCard(
            icon: '📺',
            title: widget.currentLang == 'hi'
                ? 'CRT टीवी स्क्रीन न तोड़ें'
                : (widget.currentLang == 'mr' ? 'सीआरटी स्क्रीन तोडू नका' : 'Do Not Break CRT / Mercury Tubes'),
            subtitle: widget.currentLang == 'hi'
                ? 'पुराने टीवी और मॉनिटर में जहरीला लेड और पारा होता है। इसे बिना तोड़े रीसाइक्लर को सौंपें।'
                : (widget.currentLang == 'mr'
                    ? 'जुन्या मॉनिटर्समध्ये पारा आणि फॉस्फर असतो. संपूर्ण युनिट सुरक्षितपणे रिसायकलरला द्या.'
                    : 'Old monitors contain phosphor and mercury vapor. Hand over whole units intact for safe recovery.'),
            spokenText: widget.currentLang == 'hi'
                ? 'CRT स्क्रीन और ट्यूबलाइट को न तोड़ें। इसमें पारा और लेड होता है जो अंधापन और बीमारी का कारण बन सकता है।'
                : (widget.currentLang == 'mr'
                    ? 'सीआरटी स्क्रीन तोडू नका. यामध्ये विषारी पारा असतो. सुरक्षितपणे रिसायकलरला द्या.'
                    : 'Do not break CRT monitors or mercury tubes. Hand over whole units intact for safe recovery.'),
            severity: 'MERCURY POISONING',
          ),

          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: widget.onOpenScanner,
              icon: const Icon(Icons.camera_alt_rounded),
              label: Text(
                widget.currentLang == 'hi'
                    ? 'कैमरा स्कैन करें व सुरक्षित बेचें'
                    : (widget.currentLang == 'mr' ? 'कॅमेरा स्कॅन करा व सुरक्षित विका' : 'Scan & Handover Safely'),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _hazardCard({
    required String icon,
    required String title,
    required String subtitle,
    required String spokenText,
    required String severity,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFEE2E2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(icon, style: const TextStyle(fontSize: 20))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        severity,
                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w800, color: Color(0xFFB91C1C)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.35),
                ),
                const SizedBox(height: 6),
                Align(
                  alignment: Alignment.centerRight,
                  child: AccessibleAudioButton(
                    textToSpeak: spokenText,
                    currentLang: widget.currentLang,
                    compact: true,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
