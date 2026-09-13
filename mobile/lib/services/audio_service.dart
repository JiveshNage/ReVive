class AudioGuideContent {
  final String title;
  final String speechText;
  final String category;

  const AudioGuideContent({
    required this.title,
    required this.speechText,
    required this.category,
  });
}

class AudioService {
  static const Map<String, Map<String, AudioGuideContent>> guides = {
    'hi': {
      'home': AudioGuideContent(
        title: 'कबाड़ कलेक्शन और भुगतान सहायक',
        speechText: 'नमस्ते! रीवाइव कबाड़ीवाला कनेक्ट में आपका स्वागत है। आप अपने कबाड़ की फोटो खींचकर सही मंडी भाव जान सकते हैं, किसी भी रजिस्टर्ड रिसाइकलर को अपना लॉट भेज सकते हैं, और हैंडओवर के समय तुरंत यूपीआई या बैंक खाते में सुरक्षित भुगतान पा सकते हैं।',
        category: 'Home Dashboard',
      ),
      'scanner': AudioGuideContent(
        title: 'कैमरा स्कैनर और मटेरियल पहचान सहायक',
        speechText: 'कैमरे को ई-कचरे जैसे मदरबोर्ड, तांबे के तार, या बैटरी के सामने रखें। फोटो खींचने पर एआई खुद मटेरियल की पहचान करेगा। नीचे दिए गए बटन से सही वजन सेट करें और "लॉट बनाएं" पर टैप करें।',
        category: 'Camera Vision',
      ),
      'recyclers': AudioGuideContent(
        title: 'रजिस्टर्ड रिसाइकलर खोजें और लॉट भेजें',
        speechText: 'यहाँ आप सीपीसीबी प्रमाणित रिसाइकलरों को उनके नाम, शहर या मटेरियल के अनुसार सर्च कर सकते हैं। "Send Lot" बटन दबाकर अपना बना हुआ लॉट चुने हुए रिसाइकलर को तुरंत भेजें।',
        category: 'Recyclers',
      ),
      'handover': AudioGuideContent(
        title: 'डिजिटल तराजू हैंडओवर और पेमेंट गेटवे',
        speechText: 'रिसाइकलर के वाहन चालक के आने पर डिजिटल तराजू से वजन सत्यापित करें। इसके बाद यूपीआई या बैंक ट्रांसफर चुनकर तुरंत अपना सुरक्षित भुगतान प्राप्त करें।',
        category: 'Handover & Payment',
      ),
      'safety': AudioGuideContent(
        title: 'फील्ड सुरक्षा और स्वास्थ्य दिशा-निर्देश',
        speechText: 'कचरा कभी न जलाएं! तार जलाने से जहरीला धुआं और लेड निकलता है जो फेफड़ों को नुकसान पहुंचाता है। एसिड का उपयोग न करें और लिथियम बैटरी को पंचर न करें। हमेशा रीवाइव ऐप से प्रमाणित रिसाइकलरों को सुरक्षित रूप से माल सौंपें।',
        category: 'Safety Guide',
      ),
    },
    'mr': {
      'home': AudioGuideContent(
        title: 'ई-कचरा संकलन आणि पेमेंट मार्गदर्शक',
        speechText: 'नमस्कार! रीवाइव्ह मध्ये आपले स्वागत आहे. आपण ई-कचऱ्याचा फोटो काढून अचूक हमीभाव मिळवू शकता, अधिकृत रिसायकलरला लॉट पाठवू शकता आणि हँडओव्हर वेळी सुरक्षित यूपीआय किंवा बँक पेमेंट मिळवू शकता.',
        category: 'Home Dashboard',
      ),
      'scanner': AudioGuideContent(
        title: 'कॅमेरा स्कॅनर आणि मटेरियल ओळख',
        speechText: 'कॅमेरा मदरबोर्ड किंवा वायरवर रोखा. फोटो काढल्यानंतर एआय मटेरियल ओळखेल. वजन निवडा आणि लॉट तयार करा.',
        category: 'Camera Vision',
      ),
      'recyclers': AudioGuideContent(
        title: 'अधिकृत रिसायकलर्स शोधा आणि लॉट पाठवा',
        speechText: 'इथे आपण रिसायकलर्स नाव किंवा शहराने शोधू शकता आणि आपला लॉट थेट त्यांना पाठवू शकता.',
        category: 'Recyclers',
      ),
      'handover': AudioGuideContent(
        title: 'डिजिटल वजन आणि सुरक्षित पेमेंट',
        speechText: 'वजन तपासा आणि थेट यूपीआय द्वारे आपले पैसे त्वरित मिळवा.',
        category: 'Handover & Payment',
      ),
      'safety': AudioGuideContent(
        title: 'सुरक्षा आणि आरोग्य मार्गदर्शक',
        speechText: 'कचरा कधीही जाळू नका! वायर जाळल्याने विषारी वायू निघतो. बॅटरी फोडू नका. सुरक्षित हाताळणी करा आणि प्रमाणित रिसायकलर्सना थेट माल द्या.',
        category: 'Safety Guide',
      ),
    },
    'en': {
      'home': AudioGuideContent(
        title: 'Collector Workflow & Instant Payout Audio Guide',
        speechText: 'Welcome to ReVive! Photograph e-waste scrap to discover certified Mandi MSP rates, send catalogued lots to authorized CPCB recyclers, track pickup vehicles in real time, and receive instant secure payments during scale handover.',
        category: 'Home Dashboard',
      ),
      'scanner': AudioGuideContent(
        title: 'AI Scrap Recognition Audio Guide',
        speechText: 'Point the camera at electronic scrap like circuit boards, copper wires, or batteries. The AI will automatically identify the material grade and estimate your guaranteed cash payout based on weight.',
        category: 'Camera Vision',
      ),
      'recyclers': AudioGuideContent(
        title: 'Search & Assign Recyclers Audio Guide',
        speechText: 'Use the search bar to locate authorized recyclers by facility name, city, or accepted scrap materials. Tap "Send Lot" to assign an existing catalogued lot directly for collection.',
        category: 'Recyclers',
      ),
      'handover': AudioGuideContent(
        title: 'Scale Handover & Payment Gateway Guide',
        speechText: 'During physical collection, verify the digital scale weight with the recycler agent, select your payment method (Instant UPI or Bank IMPS), and receive verified payment with your CPCB Waste Passport.',
        category: 'Handover & Payment',
      ),
      'safety': AudioGuideContent(
        title: 'Field Safety & Health Guidance',
        speechText: 'Never burn wires in open flames, as burning releases toxic carcinogenic fumes. Do not puncture lithium batteries or use acid leaching. Always hand over intact e-waste safely to authorized CPCB recyclers through the ReVive app.',
        category: 'Safety Guide',
      ),
    },
  };

  static AudioGuideContent getGuide(String lang, [String section = 'home']) {
    final langGuides = guides[lang] ?? guides['hi']!;
    return langGuides[section] ?? langGuides['home']!;
  }
}
