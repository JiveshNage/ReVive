import React, { useState } from 'react';

export type Lang = 'en' | 'hi' | 'mr';

export interface LandingPageProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  onOpenAuth: (
    role: 'collector' | 'recycler' | 'admin',
    tab: 'login' | 'signup',
    step?: 'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup'
  ) => void;
  onSpeak: (text: string) => void;
  isAudioPlaying?: boolean;
}

// Translations for Landing Page
const TXT = {
  en: {
    brandTag: 'Giving E-Waste a Second Life',
    sihBadge: '',
    navWho: 'Who We Are',
    navProcess: 'How It Works',
    navSolutions: 'Solutions',
    navRates: 'Live Price Trends',
    navEsg: 'ESG Calculator',
    loginBtn: '🔑 Login',
    signupBtn: '✍️ Register',
    heroPill: '🌱 Formalizing India’s Informal E-Waste Economy · CPCB Statutory Partner',
    heroTitle1: 'Transforming Informal E-Waste Into ',
    heroTitleHighlight: 'Verified Circular Wealth',
    heroSub:
      'ReVive connects 1,200+ grassroots kabadiwalas directly with CPCB-authorized recyclers. Empowering collectors with AI scrap vision, fair daily MSP guarantees, zero-discrepancy digital weighing, and tamper-proof SHA-256 digital recycling passports.',
    btnCollector: '🧺 Enter Collector Portal (कबाड़ीवाला)',
    btnRecycler: '🏭 Recycler Facility Portal (CPCB)',
    btnAdmin: '🏛️ CPCB Directorate Portal',
    btnPickup: '📅 Schedule Scrap Pickup',
    statDiverted: '14,280+ kg',
    statDivertedLbl: 'E-Waste Diverted',
    statCo2: '20.5 T',
    statCo2Lbl: 'CO₂ Emissions Abated',
    statMsp: '₹18.4L+',
    statMspLbl: 'Direct Fair MSP Disbursed',
    statFormalized: '1,240+',
    statFormalizedLbl: 'Informal Collectors Formalized',
    statVerification: '94.2%',
    statVerificationLbl: 'Recycler Verification Ratio',

    // TheKabadiwala-inspired 3-Step Pickup Workflow
    workflowEyebrow: 'EFFORTLESS & VERIFIED RECYCLING',
    workflowTitle: 'Sell Scrap In 3 Simple Transparent Steps',
    workflowDesc:
      'Inspired by best-in-class circular logistics, we guarantee 100% digital scale accuracy, on-the-spot UPI settlements, and instant CPCB traceability.',
    step1Title: '1. Book Pickup / AI Scan',
    step1Desc:
      'Snap a photo with our mobile web AI to instantly identify motherboard grades, hazardous materials, and get an upfront guaranteed Minimum Support Price (MSP).',
    step2Title: '2. Doorstep Digital Scale Weighing',
    step2Desc:
      'Certified green logistics partner arrives at your doorstep with an ISO-calibrated electronic scale. Real-time dual-party verification ensures zero weight manipulation.',
    step3Title: '3. Instant UPI Payout & Passport',
    step3Desc:
      'Receive instant payment directly into your bank or UPI account, accompanied by an immutable SHA-256 Digital Recycling Passport for compliance.',

    // TheKabadiwala-inspired 3-Audience Solution Matrix
    audienceEyebrow: 'TAILORED RECYCLING ECOSYSTEM',
    audienceTitle: 'Sustainable Waste Solutions for Everyone',
    audienceDesc:
      'Whether you are an individual household, a corporate enterprise with confidential IT assets, or a smart city municipality, ReVive provides turnkey circular infrastructure.',
    cardIndividualTag: 'For Households & Individuals',
    cardIndividualTitle: '🏠 Residential Scrap Pickup',
    cardIndividualDesc:
      'Convenient doorstep pickup for scrap electronics, appliances, metal, and plastic. Free pickup service with certified electronic weighing and instant UPI cash payment.',
    cardIndividualPerks: [
      'Transparent daily MSP rates with no haggling',
      'Certified electronic weighing scale at doorstep',
      'Instant UPI payment directly to bank account',
      'Responsible recycling with zero landfill footprint',
    ],
    cardBusinessTag: 'For Enterprises & Bulk Generators',
    cardBusinessTitle: '🏢 Corporate ITAD & EPR Services',
    cardBusinessDesc:
      'Comprehensive E-Waste Management, Certified IT Asset Disposition (ITAD), secure data degaussing & shredding, and statutory Form-6 CPCB EPR credits.',
    cardBusinessPerks: [
      'Certified physical hard-drive degaussing & data destruction',
      'Statutory Form-6 & Green Certificate for ESG filings',
      'Automated CPCB Extended Producer Responsibility (EPR) credits',
      'Corporate bulk pickup logistics with customs manifest',
    ],
    cardGovTag: 'For Municipalities & Smart Cities',
    cardGovTitle: '🏛️ Material Recovery Facility (MRF) Automation',
    cardGovDesc:
      'Digital public infrastructure powering automated sorting, Deposit Return Schemes (DRS), municipal MRF facility integration, and sovereign circular economy audits.',
    cardGovPerks: [
      'Real-time municipal landfill diversion telemetry',
      'Informal kabadiwala formalization & social security registry',
      'Deposit Return Scheme (DRS) smart contract integration',
      'Centralized sovereign ESG audit trail',
    ],

    // Dark Price Trends Section (Mockup Match)
    trendEyebrow: 'REAL-TIME SCRAP COMMODITY BENCHMARKS',
    trendTitle: 'Live Price Trends',
    trendSubtitle:
      'Analyze historical daily market price movements for popular scrap categories in India.',
    marketTag: '● NEW DELHI MARKET',
    spotSuffix: 'Spot',
    metricLatest: 'LATEST RATE',
    metricChange: '24H CHANGE',
    metricHigh: 'PERIOD HIGH',
    metricLow: 'PERIOD LOW',
    timeframe7d: '7D',
    timeframe15d: '15D',
    timeframe30d: '30D',
    sellAtMsp: 'Sell at MSP →',

    // Interactive ESG Calculator
    esgEyebrow: 'YOUR ENVIRONMENTAL DIVIDEND',
    esgTitle: 'Interactive ESG Impact Calculator',
    esgDesc:
      'Estimate how much environmental damage you prevent by channeling your scrap into ReVive’s formal recycling network instead of unscientific dumping.',
    esgWeightLabel: 'Scrap Weight to Recycle:',
    esgTrees: 'Trees Saved',
    esgCo2: 'CO₂ Abated (kg)',
    esgWater: 'Water Conserved (L)',
    esgLandfill: 'Toxic Landfill Diverted (kg)',
    esgCta: 'Recycle Your Scrap & Claim ESG Certificate →',

    // Comprehensive Scrap Commodity Table
    tableEyebrow: 'CERTIFIED CPCB SMELTER RATES',
    tableTitle: 'Scrap Commodity Daily MSP Index',
    tableDesc:
      'Real-time procurement rates calibrated across Delhi NCR, Mumbai, Pune, Bengaluru, Bhopal, Indore, and Chennai.',
    thMaterial: 'Scrap Material & Grade',
    thCategory: 'Category',
    thTodayRate: 'Today MSP (₹/kg)',
    th24hChange: '24h Change',
    thRange: '30-Day Range',
    thDemand: 'Market Demand',
    thAction: 'Trade Action',

    // 4 Technology Pillars
    pillarsEyebrow: 'CORE ARCHITECTURE',
    pillarsTitle: 'Four Pillars of ReVive DPI',
    pillar1Title: 'AI Scrap Vision & Grade Estimator',
    pillar1Desc:
      'Computer vision analyzes multi-layer PCBs and lithium cells, estimating gold/copper yield and hazard profiles within seconds.',
    pillar2Title: 'Live Regional MSP Benchmarks',
    pillar2Desc:
      'Statutory Minimum Support Price algorithm shields grassroots kabadiwalas from arbitrary 40% informal cartel discounts.',
    pillar3Title: 'Dual-Party QR Handover Protocol',
    pillar3Desc:
      'Simultaneous dual-party smartphone handshake registers exact scale weights and auto-computes discrepancy ledgers.',
    pillar4Title: 'SHA-256 Digital Recycling Passports',
    pillar4Desc:
      'End-to-end cryptographic tokens trace batches from urban street corners to smelting furnaces, minting auditable EPR credits.',

    // Footer
    footerHelpline: 'National E-Waste Grievance Helpline:',
    footerCompliant: '© 2026 ReVive. MoEFCC / CPCB E-Waste (Management) Rules Compliant.',
  },
  hi: {
    brandTag: 'ई-कचरे को नया जीवन दें',
    sihBadge: '🇮🇳 SIH 2024 · MoEFCC CPCB वैधानिक भागीदार',
    navWho: 'हम कौन हैं',
    navProcess: 'प्रक्रिया',
    navSolutions: 'समाधान',
    navRates: 'लाइव मूल्य रुझान',
    navEsg: 'पर्यावरण कैलकुलेटर',
    loginBtn: '🔑 लॉगिन',
    signupBtn: '✍️ रजिस्टर',
    heroPill: '🌱 भारत के अनौपचारिक ई-कचरा क्षेत्र का औपचारिकीकरण · CPCB वैधानिक भागीदार',
    heroTitle1: 'अनौपचारिक ई-कचरे को बदलें ',
    heroTitleHighlight: 'प्रमाणित चक्रीय संपदा में',
    heroSub:
      'ReVive भारत के 1,200+ कबाड़ीवालों को सीधे CPCB-प्रमाणित रीसाइक्लर्स से जोड़ता है। AI विज़न, न्यूनतम समर्थन मूल्य (MSP) गारंटी, पारदर्शी इलेक्ट्रॉनिक तौल और डिजिटल रीसाइक्लिंग पासपोर्ट के साथ सशक्तिकरण।',
    btnCollector: '🧺 कबाड़ीवाला पोर्टल में प्रवेश करें',
    btnRecycler: '🏭 रीसाइक्लिंग प्लांट पोर्टल (CPCB)',
    btnAdmin: '🏛️ CPCB नियामक निदेशालय',
    btnPickup: '📅 कबाड़ पिकअप शेड्यूल करें',
    statDiverted: '14,280+ किग्रा',
    statDivertedLbl: 'ई-कचरा पुनर्चक्रित',
    statCo2: '20.5 टन',
    statCo2Lbl: 'CO₂ उत्सर्जन रोकथाम',
    statMsp: '₹18.4 लाख+',
    statMspLbl: 'सीधा उचित MSP भुगतान',
    statFormalized: '1,240+',
    statFormalizedLbl: 'कबाड़ीवालों का औपचारिकीकरण',
    statVerification: '94.2%',
    statVerificationLbl: 'रीसाइक्लर सत्यापन दर',

    workflowEyebrow: 'सरल व प्रमाणित पुनर्चक्रण',
    workflowTitle: 'कबाड़ बेचें केवल 3 सरल पारदर्शी चरणों में',
    workflowDesc:
      'डिजिटल तौल की 100% सटीकता, तत्काल UPI भुगतान और सुरक्षित CPCB ट्रेसेबिलिटी की गारंटी।',
    step1Title: '1. पिकअप बुक करें / AI स्कैन',
    step1Desc:
      'अपने मोबाइल कैमरे से फोटो लें, AI तुरंत मदरबोर्ड ग्रेड और हानिकारक धातुओं की पहचान कर न्यूनतम समर्थन मूल्य (MSP) बताएगा।',
    step2Title: '2. घर पर डिजिटल कांटे से सटीक तौल',
    step2Desc:
      'हमारे प्रमाणित साथी ISO-कैलिब्रेटेड इलेक्ट्रॉनिक कांटे से आपके सामने तौल करते हैं। वजन में किसी भी प्रकार की धोखाधड़ी संभव नहीं।',
    step3Title: '3. तत्काल UPI भुगतान व पासपोर्ट',
    step3Desc:
      'सीधे आपके बैंक खाते या UPI में तुरंत भुगतान और CPCB अनुपालन हेतु छेड़छाड़-मुक्त SHA-256 डिजिटल रीसाइक्लिंग पासपोर्ट प्राप्त करें।',

    audienceEyebrow: 'सभी के लिए उपयुक्त समाधान',
    audienceTitle: 'प्रत्येक वर्ग के लिए सतत कचरा प्रबंधन समाधान',
    audienceDesc:
      'चाहे आपका व्यक्तिगत घर हो, कॉर्पोरेट आईटी कंपनी या स्मार्ट सिटी नगर निगम — ReVive संपूर्ण चक्रीय रीसाइक्लिंग सुविधा प्रदान करता है।',
    cardIndividualTag: 'घरों और नागरिकों के लिए',
    cardIndividualTitle: '🏠 घरेलू कबाड़ पिकअप सेवा',
    cardIndividualDesc:
      'इलेक्ट्रॉनिक्स, पुराने उपकरण, धातु और प्लास्टिक कबाड़ के लिए निःशुल्क डोरस्टेप पिकअप। प्रमाणित इलेक्ट्रॉनिक तौल और तुरंत UPI नकद।',
    cardIndividualPerks: [
      'बिना किसी मोलभाव के पारदर्शी दैनिक MSP भाव',
      'घर पर प्रमाणित इलेक्ट्रॉनिक कांटे से निष्पक्ष तौल',
      'सीधे बैंक या UPI में तत्काल भुगतान',
      'शून्य लैंडफिल प्रदूषण के साथ जिम्मेदार पुनर्चक्रण',
    ],
    cardBusinessTag: 'कंपनियों और आईटी पार्कों के लिए',
    cardBusinessTitle: '🏢 कॉर्पोरेट ITAD व EPR सेवाएं',
    cardBusinessDesc:
      'व्यावसायिक ई-कचरा निपटान, प्रमाणित डेटा नष्टीकरण (Data Destruction), और वैधानिक Form-6 CPCB EPR क्रेडिट प्रमाण पत्र।',
    cardBusinessPerks: [
      'प्रमाणित हार्ड ड्राइव विचुंबकन (Degaussing) व डेटा नष्टीकरण',
      'ESG फाइलिंग के लिए वैधानिक Form-6 ग्रीन सर्टिफिकेट',
      'स्वचालित CPCB विस्तारित उत्पादक उत्तरदायित्व (EPR) क्रेडिट्स',
      'सीमा शुल्क मैनिफेस्ट के साथ सुरक्षित कॉर्पोरेट लॉजिस्टिक्स',
    ],
    cardGovTag: 'नगर निगमों व स्मार्ट सिटीज के लिए',
    cardGovTitle: '🏛️ सामग्री पुनरुद्धार सुविधा (MRF) स्वचालन',
    cardGovDesc:
      'स्मार्ट सॉर्टिंग, डिपॉजिट रिटर्न सिस्टम (DRS), नगरीय MRF सुविधा डिजिटलीकरण और वास्तविक समय चक्रीय अर्थव्यवस्था ऑडिट।',
    cardGovPerks: [
      'वास्तविक समय लैंडफिल डायवर्जन टेलीमेट्री',
      'अनौपचारिक कबाड़ीवालों का औपचारिकीकरण व सामाजिक सुरक्षा',
      'डिपॉजिट रिटर्न स्कीम (DRS) स्मार्ट कॉन्ट्रैक्ट इंटीग्रेशन',
      'केंद्रीकृत संप्रभु ESG ऑडिट ट्रेल',
    ],

    trendEyebrow: 'रीयल-टाइम कबाड़ कमोडिटी सूचकांक',
    trendTitle: 'लाइव मूल्य रुझान',
    trendSubtitle: 'भारत में प्रमुख कबाड़ श्रेणियों के ऐतिहासिक दैनिक बाज़ार भाव का विश्लेषण करें।',
    marketTag: '● नई दिल्ली मंडी',
    spotSuffix: 'हाज़िर (Spot)',
    metricLatest: 'ताज़ा भाव (LATEST)',
    metricChange: '24 घंटे का बदलाव',
    metricHigh: 'अवधि का उच्चतम',
    metricLow: 'अवधि का न्यूनतम',
    timeframe7d: '7 दिन',
    timeframe15d: '15 दिन',
    timeframe30d: '30 दिन',
    sellAtMsp: 'इस भाव पर बेचें →',

    esgEyebrow: 'आपका पर्यावरणीय योगदान',
    esgTitle: 'इंटरैक्टिव पर्यावरण प्रभाव कैलकुलेटर',
    esgDesc:
      'देखें कि अपने कबाड़ को ReVive के माध्यम से पुनर्चक्रित करके आप कितनी प्रकृति और संसाधनों की रक्षा कर रहे हैं।',
    esgWeightLabel: 'पुनर्चक्रण हेतु कबाड़ का वज़न:',
    esgTrees: 'पेड़ों की रक्षा',
    esgCo2: 'CO₂ उत्सर्जन रोकथाम (किग्रा)',
    esgWater: 'जल संरक्षण (लीटर)',
    esgLandfill: 'विषाक्त कचरे से भूमि की रक्षा (किग्रा)',
    esgCta: 'कबाड़ रिसायकल करें व ESG प्रमाणपत्र प्राप्त करें →',

    tableEyebrow: 'प्रमाणित CPCB स्मेल्टर भाव',
    tableTitle: 'दैनिक कबाड़ कमोडिटी MSP सूचकांक',
    tableDesc: 'दिल्ली NCR, मुंबई, पुणे, बेंगलुरु, भोपाल, इंदौर और चेन्नई के प्रमाणित मंडी खरीद दर।',
    thMaterial: 'कबाड़ सामग्री व ग्रेड',
    thCategory: 'श्रेणी',
    thTodayRate: 'आज का भाव (₹/किग्रा)',
    th24hChange: '24 घंटे का बदलाव',
    thRange: '30 दिनों का दायरा',
    thDemand: 'बाज़ार मांग',
    thAction: 'कार्रवाई',

    pillarsEyebrow: 'मूल तकनीकी आधार',
    pillarsTitle: 'ReVive डिजिटल बुनियादी ढांचे के 4 स्तंभ',
    pillar1Title: 'AI कबाड़ विज़न व ग्रेड विश्लेषक',
    pillar1Desc: 'मल्टी-लेयर PCB और लिथियम बैटरी का सेकंडों में स्कैन कर सटीक मूल्य और विषाक्तता का आकलन।',
    pillar2Title: 'दैनिक क्षेत्रीय MSP बेंचमार्क',
    pillar2Desc: 'न्यूनतम समर्थन मूल्य कबाड़ीवालों को बिचौलियों के 40% अनुचित कमीशन से सुरक्षा देता है।',
    pillar3Title: 'द्वि-पक्षीय QR हैंडओवर प्रोटोकॉल',
    pillar3Desc: 'कबाड़ीवाला और रीसाइक्लर दोनों के स्मार्टफोन स्कैन से वजन की पुष्टि और तुरंत UPI हस्तांतरण।',
    pillar4Title: 'SHA-256 डिजिटल रीसाइक्लिंग पासपोर्ट',
    pillar4Desc: 'गली-मोहल्ले के संग्रह से लेकर फर्नेस स्मेल्टिंग तक सामग्री की पूरी डिजिटल निगरानी।',

    footerHelpline: 'राष्ट्रीय ई-कचरा शिकायत हेल्पलाइन:',
    footerCompliant: '© 2026 ReVive. MoEFCC / CPCB ई-अपशिष्ट (प्रबंधन) नियम अनुपालक।',
  },
  mr: {
    brandTag: 'ई-कचऱ्याला द्या नवे जीवन',
    sihBadge: '🇮🇳 SIH 2024 · MoEFCC CPCB वैधानिक भागीदार',
    navWho: 'आमच्याबद्दल',
    navProcess: 'कार्यपद्धती',
    navSolutions: 'उपाययोजना',
    navRates: 'थेट भाव कल',
    navEsg: 'पर्यावरण कॅल्क्युलेटर',
    loginBtn: '🔑 लॉगिन',
    signupBtn: '✍️ नोंदणी करा',
    heroPill: '🌱 भारतातील असंघटित ई-कचरा क्षेत्राचे औपचारिकीकरण · CPCB भागीदार',
    heroTitle1: 'असंघटित ई-कचऱ्याचे रूपांतर ',
    heroTitleHighlight: 'प्रमाणित चक्रीय संपत्तीत',
    heroSub:
      'ReVive महाराष्ट्रातील व देशातील १,२००+ कबाडीवाल्यांना थेट CPCB-अधिकृत रिसायकलर्सशी जोडते. AI व्हिजन, हमीभाव (MSP) सुरक्षा, डिजिटल पारदर्शक वजन आणि छेडछाडमुक्त रीसायकलिंग पासपोर्ट.',
    btnCollector: '🧺 कबाडीवाला पोर्टल उघडा',
    btnRecycler: '🏭 रिसायकलिंग प्रकल्प पोर्टल (CPCB)',
    btnAdmin: '🏛️ CPCB नियामक संचालनालय',
    btnPickup: '📅 स्क्रॅप पिकअप बुक करा',
    statDiverted: '१४,२८०+ किलो',
    statDivertedLbl: 'ई-कचरा संकलित',
    statCo2: '२०.५ टन',
    statCo2Lbl: 'CO₂ उत्सर्जन घट',
    statMsp: '₹१८.४ लाख+',
    statMspLbl: 'थेट हमीभाव वितरण',
    statFormalized: '१,२४०+',
    statFormalizedLbl: 'कबाडीवाले औपचारिकीकृत',
    statVerification: '९४.२%',
    statVerificationLbl: 'प्रमाणित रिसायकलर प्रमाण',

    workflowEyebrow: 'सुलभ व विश्वासार्ह पुनर्चक्रीकरण',
    workflowTitle: 'फक्त ३ सोप्या पारदर्शक टप्प्यांत भंगार विका',
    workflowDesc:
      'इलेक्ट्रॉनिक काट्याद्वारे १००% अचूक वजन, त्वरित UPI पैसे आणि CPCB ट्रॅकिंगची खात्री.',
    step1Title: '१. पिकअप नोंदणी / AI स्कॅन',
    step1Desc:
      'मोबाईल कॅमेऱ्याने फोटो काढा, AI त्वरित मदरबोर्ड दर्जा आणि मौल्यवान धातूंचे मूल्यमापन करून खात्रीशीर हमीभाव देईल.',
    step2Title: '२. दारात डिजिटल काट्याने पारदर्शक वजन',
    step2Desc:
      'आमचे अधिकृत प्रतिनिधी ISO-प्रमाणित डिजिटल काट्याद्वारे थेट तुमच्यासमोर वजन करतात. वजनात कोणतीही फसवणूक नाही.',
    step3Title: '३. तात्काळ UPI रक्कम व डिजिटल पासपोर्ट',
    step3Desc:
      'थेट तुमच्या बँक खात्यात किंवा UPI द्वारे त्वरित पैसे मिळवा आणि CPCB मान्यतेसाठी SHA-256 डिजिटल पासपोर्ट मिळवा.',

    audienceEyebrow: 'सर्वांसाठी शाश्वत उपाय',
    audienceTitle: 'प्रत्येकासाठी शाश्वत कचरा व्यवस्थापन',
    audienceDesc:
      'वैयक्तिक घर, मोठी कॉर्पोरेट कंपनी अथवा महानगरपालिका — ReVive सर्वांसाठी दर्जेदार चक्रीय पुनर्चक्रीकरण सुविधा देते.',
    cardIndividualTag: 'नागरिक व घरांसाठी',
    cardIndividualTitle: '🏠 घरपोच भंगार संकलन सेवा',
    cardIndividualDesc:
      'जुने इलेक्ट्रॉनिक सामान, उपकरणे, धातू आणि प्लास्टिक भंगार थेट घरातून उचलण्याची मोफत सेवा. पारदर्शक वजन व तत्काळ मोबदला.',
    cardIndividualPerks: [
      'कोणत्याही घासाघिशिवाय रोजचा हमीभाव (MSP)',
      'घरासमोर प्रमाणित इलेक्ट्रॉनिक काट्याने अचूक वजन',
      'थेट बँक अथवा UPI मध्ये तत्काळ पैसे',
      'कचराकुंडीत न टाकता जबाबदार पुनर्चक्रीकरण',
    ],
    cardBusinessTag: 'कंपन्या व आयटी पार्कांसाठी',
    cardBusinessTitle: '🏢 कॉर्पोरेट ITAD व EPR सेवा',
    cardBusinessDesc:
      'अधिकृत ई-कचरा विल्हेवाट, हार्ड डिस्क डेटा नष्टीकरण (Data Destruction) आणि कायदेशीर Form-6 CPCB EPR क्रेडिट्स.',
    cardBusinessPerks: [
      'प्रमाणित हार्ड डिस्क डिगॉसिंग व डेटा संपूर्ण नष्टीकरण',
      'ESG अहवालासाठी वैधानिक Form-6 ग्रीन प्रमाणपत्र',
      'स्वयंचलित CPCB विस्तारित उत्पादक जबाबदारी (EPR) क्रेडिट्स',
      'कंपनीसाठी सुरक्षित वाहतूक व कागदपत्रांची पूर्तता',
    ],
    cardGovTag: 'महानगरपालिका व स्मार्ट सिटीसाठी',
    cardGovTitle: '🏛️ मटेरियल रिकव्हरी फॅसिलिटी (MRF) ऑटोमेशन',
    cardGovDesc:
      'स्मार्ट सॉर्टिंग, डिपॉझिट रिटर्न सिस्टीम (DRS), मनपा कचरा डेपो डिजिटायझेशन आणि रिअल-टाईम चक्रीय अर्थव्यवस्था ऑडिट.',
    cardGovPerks: [
      'थेट लँडफिल कचरा घट टेलिमेट्री',
      'स्थानिक कबाडीवाल्यांचे औपचारिकीकरण व सुरक्षा नोंदणी',
      'डिपॉझिट रिटर्न सिस्टीम (DRS) स्मार्ट करार',
      'केंद्रीकृत पारदर्शक ESG ऑडिट ट्रेल',
    ],

    trendEyebrow: 'थेट कमोडिटी हमीभाव निर्देशांक',
    trendTitle: 'थेट दर कल व बाजार विश्लेषण',
    trendSubtitle: 'भारतातील प्रमुख भंगार बाजारपेठांमधील दररोजचे ऐतिहासिक भाव तपासा.',
    marketTag: '● नवी दिल्ली बाजारपेठ',
    spotSuffix: 'हाजीर (Spot)',
    metricLatest: 'सध्याचा दर (LATEST)',
    metricChange: '२४ तासांतील बदल',
    metricHigh: 'कालावधीतील उच्चांक',
    metricLow: 'कालावधीतील नीचांक',
    timeframe7d: '७ दिवस',
    timeframe15d: '१५ दिवस',
    timeframe30d: '३० दिवस',
    sellAtMsp: 'या दराने विका →',

    esgEyebrow: 'तुमचे पर्यावरणीय योगदान',
    esgTitle: 'परस्परसंवादी पर्यावरण कॅल्क्युलेटर',
    esgDesc: 'तुमचा जुना कचरा ReVive द्वारे रिसायकल करून तुम्ही किती पर्यावरणाचे रक्षण करत आहात ते जाणून घ्या.',
    esgWeightLabel: 'रिसायकल करावयाच्या भंगाराचे वजन:',
    esgTrees: 'वाचवलेली झाडे',
    esgCo2: 'CO₂ प्रदूषण घट (किलो)',
    esgWater: 'पाणी बचत (लिटर)',
    esgLandfill: 'जमिनीचे रक्षण (किलो)',
    esgCta: 'भंगार रिसायकल करा व ESG प्रमाणपत्र मिळवा →',

    tableEyebrow: 'प्रमाणित CPCB स्मेल्टर खरेदी दर',
    tableTitle: 'दैनंदिन भंगार कमोडिटी MSP निर्देशांक',
    tableDesc: 'दिल्ली, मुंबई, पुणे, बंगळुरू, भोपाळ, इंदूर आणि चेन्नईचे प्रमाणित थेट हमीभाव दर.',
    thMaterial: 'कचरा प्रकार व दर्जा',
    thCategory: 'प्रवर्ग',
    thTodayRate: 'आजचा हमीभाव (₹/किलो)',
    th24hChange: '२४ तासांतील बदल',
    thRange: '३० दिवसांची मर्यादा',
    thDemand: 'मागणी स्थिती',
    thAction: 'कृती',

    pillarsEyebrow: 'मूलभूत तांत्रिक स्तंभ',
    pillarsTitle: 'ReVive डिजिटल पायाभूत रचनेचे ४ मुख्य स्तंभ',
    pillar1Title: 'AI कचरा व्हिजन व ग्रेड विश्लेषक',
    pillar1Desc: 'मल्टी-लेयर PCB आणि लिथियम बॅटरीचे सेकंदात स्कॅन करून अचूक मूल्य आणि धोकादायक घटकांचे विश्लेषण.',
    pillar2Title: 'दैनंदिन प्रादेशिक MSP हमीभाव',
    pillar2Desc: 'किमान आधारभूत हमीभाव कबाडीवाल्यांना अनधिकृत दलालांच्या ४०% नफेखोरीपासून संरक्षण देतो.',
    pillar3Title: 'द्वि-पक्षीय QR हस्तांतरण पद्धत',
    pillar3Desc: 'कबाडीवाला आणि रिसायकलर दोघांच्या मोबाईलद्वारे काट्यावरील वजनाची खात्री व तात्काळ पैसे जमा.',
    pillar4Title: 'SHA-256 डिजिटल रीसायकलिंग पासपोर्ट',
    pillar4Desc: 'गल्लीबोळातील संकलनापासून ते स्मेल्टर भट्टीत वितळवेपर्यंत संपूर्ण डिजिटल पारदर्शक ट्रॅकिंग.',

    footerHelpline: 'राष्ट्रीय ई-कचरा तक्रार निवारण हेल्पलाईन:',
    footerCompliant: '© 2026 ReVive. MoEFCC / CPCB ई-कचरा (व्यवस्थापन) नियम सुसंगत.',
  },
};

// Historical Price Data for the Dark Theme Chart Mockup Match
interface HistoricalDataPoint {
  date: string;
  price: number;
}

const HISTORICAL_DATA: Record<
  string,
  {
    latest: number;
    changeVal: number;
    changePct: number;
    high: number;
    low: number;
    series30d: HistoricalDataPoint[];
  }
> = {
  Copper: {
    latest: 1375.0,
    changeVal: -9.0,
    changePct: -0.65,
    high: 1390.0,
    low: 1293.0,
    series30d: [
      { date: '16 Jul', price: 1311 },
      { date: '17 Jul', price: 1314 },
      { date: '18 Jul', price: 1293 },
      { date: '19 Jul', price: 1303 },
      { date: '20 Jul', price: 1303 },
      { date: '21 Jul', price: 1312 },
      { date: '22 Jul', price: 1327 },
      { date: '23 Jul', price: 1344 },
      { date: '24 Jul', price: 1333 },
      { date: '25 Jul', price: 1320 },
      { date: '26 Jul', price: 1320 },
      { date: '27 Jul', price: 1320 },
      { date: '28 Jul', price: 1327 },
      { date: '29 Jul', price: 1312 },
      { date: '30 Jul', price: 1308 },
      { date: '31 Jul', price: 1327 },
      { date: '1 Aug', price: 1336 },
      { date: '2 Aug', price: 1334 },
      { date: '3 Aug', price: 1352 },
      { date: '4 Aug', price: 1343 },
      { date: '5 Aug', price: 1368 },
      { date: '6 Aug', price: 1367 },
      { date: '7 Aug', price: 1390 },
      { date: '8 Aug', price: 1371 },
      { date: '9 Aug', price: 1366 },
      { date: '10 Aug', price: 1364 },
      { date: '11 Aug', price: 1376 },
      { date: '12 Aug', price: 1381 },
      { date: '13 Aug', price: 1384 },
      { date: '14 Aug', price: 1375 },
    ],
  },
  Aluminium: {
    latest: 148.5,
    changeVal: 2.5,
    changePct: 1.71,
    high: 152.0,
    low: 136.0,
    series30d: [
      { date: '16 Jul', price: 138 },
      { date: '17 Jul', price: 137 },
      { date: '18 Jul', price: 136 },
      { date: '19 Jul', price: 139 },
      { date: '20 Jul', price: 140 },
      { date: '21 Jul', price: 141 },
      { date: '22 Jul', price: 143 },
      { date: '23 Jul', price: 142 },
      { date: '24 Jul', price: 144 },
      { date: '25 Jul', price: 143 },
      { date: '26 Jul', price: 145 },
      { date: '27 Jul', price: 144 },
      { date: '28 Jul', price: 146 },
      { date: '29 Jul', price: 145 },
      { date: '30 Jul', price: 147 },
      { date: '31 Jul', price: 148 },
      { date: '1 Aug', price: 146 },
      { date: '2 Aug', price: 149 },
      { date: '3 Aug', price: 150 },
      { date: '4 Aug', price: 148 },
      { date: '5 Aug', price: 149 },
      { date: '6 Aug', price: 151 },
      { date: '7 Aug', price: 152 },
      { date: '8 Aug', price: 150 },
      { date: '9 Aug', price: 149 },
      { date: '10 Aug', price: 148 },
      { date: '11 Aug', price: 147 },
      { date: '12 Aug', price: 149 },
      { date: '13 Aug', price: 150 },
      { date: '14 Aug', price: 148.5 },
    ],
  },
  Iron: {
    latest: 36.8,
    changeVal: 0.4,
    changePct: 1.1,
    high: 39.0,
    low: 32.5,
    series30d: [
      { date: '16 Jul', price: 33 },
      { date: '17 Jul', price: 33.5 },
      { date: '18 Jul', price: 32.5 },
      { date: '19 Jul', price: 33.2 },
      { date: '20 Jul', price: 34.0 },
      { date: '21 Jul', price: 34.5 },
      { date: '22 Jul', price: 34.8 },
      { date: '23 Jul', price: 35.2 },
      { date: '24 Jul', price: 35.0 },
      { date: '25 Jul', price: 35.4 },
      { date: '26 Jul', price: 35.6 },
      { date: '27 Jul', price: 36.0 },
      { date: '28 Jul', price: 36.2 },
      { date: '29 Jul', price: 35.8 },
      { date: '30 Jul', price: 36.4 },
      { date: '31 Jul', price: 36.7 },
      { date: '1 Aug', price: 37.0 },
      { date: '2 Aug', price: 37.4 },
      { date: '3 Aug', price: 37.8 },
      { date: '4 Aug', price: 38.2 },
      { date: '5 Aug', price: 38.5 },
      { date: '6 Aug', price: 39.0 },
      { date: '7 Aug', price: 38.8 },
      { date: '8 Aug', price: 38.2 },
      { date: '9 Aug', price: 37.9 },
      { date: '10 Aug', price: 37.5 },
      { date: '11 Aug', price: 37.2 },
      { date: '12 Aug', price: 37.0 },
      { date: '13 Aug', price: 36.9 },
      { date: '14 Aug', price: 36.8 },
    ],
  },
  Brass: {
    latest: 392.0,
    changeVal: 4.0,
    changePct: 1.03,
    high: 405.0,
    low: 365.0,
    series30d: [
      { date: '16 Jul', price: 368 },
      { date: '17 Jul', price: 370 },
      { date: '18 Jul', price: 365 },
      { date: '19 Jul', price: 369 },
      { date: '20 Jul', price: 372 },
      { date: '21 Jul', price: 374 },
      { date: '22 Jul', price: 378 },
      { date: '23 Jul', price: 382 },
      { date: '24 Jul', price: 380 },
      { date: '25 Jul', price: 383 },
      { date: '26 Jul', price: 385 },
      { date: '27 Jul', price: 384 },
      { date: '28 Jul', price: 386 },
      { date: '29 Jul', price: 388 },
      { date: '30 Jul', price: 387 },
      { date: '31 Jul', price: 390 },
      { date: '1 Aug', price: 394 },
      { date: '2 Aug', price: 396 },
      { date: '3 Aug', price: 401 },
      { date: '4 Aug', price: 398 },
      { date: '5 Aug', price: 402 },
      { date: '6 Aug', price: 405 },
      { date: '7 Aug', price: 403 },
      { date: '8 Aug', price: 399 },
      { date: '9 Aug', price: 396 },
      { date: '10 Aug', price: 394 },
      { date: '11 Aug', price: 392 },
      { date: '12 Aug', price: 395 },
      { date: '13 Aug', price: 394 },
      { date: '14 Aug', price: 392 },
    ],
  },
  PCB: {
    latest: 212.0,
    changeVal: 6.0,
    changePct: 2.91,
    high: 220.0,
    low: 182.0,
    series30d: [
      { date: '16 Jul', price: 184 },
      { date: '17 Jul', price: 186 },
      { date: '18 Jul', price: 182 },
      { date: '19 Jul', price: 185 },
      { date: '20 Jul', price: 188 },
      { date: '21 Jul', price: 191 },
      { date: '22 Jul', price: 194 },
      { date: '23 Jul', price: 197 },
      { date: '24 Jul', price: 196 },
      { date: '25 Jul', price: 198 },
      { date: '26 Jul', price: 201 },
      { date: '27 Jul', price: 200 },
      { date: '28 Jul', price: 203 },
      { date: '29 Jul', price: 202 },
      { date: '30 Jul', price: 205 },
      { date: '31 Jul', price: 208 },
      { date: '1 Aug', price: 211 },
      { date: '2 Aug', price: 214 },
      { date: '3 Aug', price: 218 },
      { date: '4 Aug', price: 216 },
      { date: '5 Aug', price: 220 },
      { date: '6 Aug', price: 219 },
      { date: '7 Aug', price: 217 },
      { date: '8 Aug', price: 215 },
      { date: '9 Aug', price: 213 },
      { date: '10 Aug', price: 212 },
      { date: '11 Aug', price: 210 },
      { date: '12 Aug', price: 211 },
      { date: '13 Aug', price: 213 },
      { date: '14 Aug', price: 212 },
    ],
  },
  Battery: {
    latest: 74.5,
    changeVal: -1.2,
    changePct: -1.59,
    high: 78.0,
    low: 64.0,
    series30d: [
      { date: '16 Jul', price: 65 },
      { date: '17 Jul', price: 66 },
      { date: '18 Jul', price: 64 },
      { date: '19 Jul', price: 65.5 },
      { date: '20 Jul', price: 67 },
      { date: '21 Jul', price: 68 },
      { date: '22 Jul', price: 70 },
      { date: '23 Jul', price: 72 },
      { date: '24 Jul', price: 71 },
      { date: '25 Jul', price: 73 },
      { date: '26 Jul', price: 74 },
      { date: '27 Jul', price: 75 },
      { date: '28 Jul', price: 76 },
      { date: '29 Jul', price: 75.5 },
      { date: '30 Jul', price: 76.5 },
      { date: '31 Jul', price: 77.2 },
      { date: '1 Aug', price: 78.0 },
      { date: '2 Aug', price: 77.5 },
      { date: '3 Aug', price: 77.0 },
      { date: '4 Aug', price: 76.5 },
      { date: '5 Aug', price: 76.0 },
      { date: '6 Aug', price: 75.8 },
      { date: '7 Aug', price: 75.5 },
      { date: '8 Aug', price: 75.2 },
      { date: '9 Aug', price: 75.0 },
      { date: '10 Aug', price: 74.8 },
      { date: '11 Aug', price: 74.5 },
      { date: '12 Aug', price: 75.0 },
      { date: '13 Aug', price: 74.8 },
      { date: '14 Aug', price: 74.5 },
    ],
  },
};

// Helper function to build a smooth bezier curve through points
function buildSmoothSpline(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i != points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLang,
  onSelectLang,
  onOpenAuth,
  onSpeak,
  isAudioPlaying,
}) => {
  const t = TXT[currentLang];

  // State for Dark Live Price Trends Chart
  const [trendCategory, setTrendCategory] = useState<string>('Copper');
  const [trendTimeframe, setTrendTimeframe] = useState<'7D' | '15D' | '30D'>('30D');
  const [chartHoverIdx, setChartHoverIdx] = useState<number | null>(null);

  // State for Interactive ESG Calculator (TheKabadiwala Feature)
  const [esgWeight, setEsgWeight] = useState<number>(150);

  // State for Regional Mandi Selector
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi Market');

  // Filter for scrap table
  const [tableCatFilter, setTableCatFilter] = useState<string>('all');

  // Active Category Trend Data
  const catData = HISTORICAL_DATA[trendCategory] || HISTORICAL_DATA['Copper'];

  // Slice historical data according to timeframe (7D, 15D, 30D)
  const rawPoints = catData.series30d;
  const activePoints =
    trendTimeframe === '7D'
      ? rawPoints.slice(-7)
      : trendTimeframe === '15D'
      ? rawPoints.slice(-15)
      : rawPoints;

  // Chart SVG Coordinates
  const svgWidth = 840;
  const svgHeight = 280;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const minPrice = Math.min(...activePoints.map((p) => p.price)) * 0.985;
  const maxPrice = Math.max(...activePoints.map((p) => p.price)) * 1.015;

  const chartCoords = activePoints.map((pt, idx) => {
    const x = padLeft + (idx / (activePoints.length - 1)) * plotW;
    const y = padTop + (1 - (pt.price - minPrice) / (maxPrice - minPrice)) * plotH;
    return { x, y, price: pt.price, date: pt.date };
  });

  const splineLinePath = buildSmoothSpline(chartCoords);
  const splineAreaPath = `${splineLinePath} L ${chartCoords[chartCoords.length - 1].x.toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${chartCoords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  // Calculated ESG Impact based on slider
  const treesSaved = (esgWeight * 0.04).toFixed(1);
  const co2Abated = (esgWeight * 1.44).toFixed(1);
  const waterSaved = Math.round(esgWeight * 26.5);
  const toxicDiverted = (esgWeight * 0.18).toFixed(1);

  // Scrap Table Data
  const scrapCommodities = [
    {
      icon: '🔌',
      name: 'Copper Heavy Wire & Armature',
      grade: '99.9% Millberry Bright',
      cat: 'Non-Ferrous',
      rate: 1375,
      change: '-0.65%',
      isNegative: true,
      range: '₹1293 – ₹1390',
      demand: 'very-high',
      demandLabel: 'Very High',
    },
    {
      icon: '💻',
      name: 'Printed Circuit Boards (PCBs)',
      grade: 'Grade-A Server & Phone Boards',
      cat: 'Electronic',
      rate: 212,
      change: '+2.91%',
      isNegative: false,
      range: '₹182 – ₹220',
      demand: 'very-high',
      demandLabel: 'Very High',
    },
    {
      icon: '⚙️',
      name: 'Aluminium Scrap & Extrusions',
      grade: 'Grade-6063 Clean',
      cat: 'Non-Ferrous',
      rate: 148.5,
      change: '+1.71%',
      isNegative: false,
      range: '₹136 – ₹152',
      demand: 'high',
      demandLabel: 'High',
    },
    {
      icon: '🪓',
      name: 'Clean Yellow Brass Scrap',
      grade: 'Honey / Utensil Scrap',
      cat: 'Non-Ferrous',
      rate: 392,
      change: '+1.03%',
      isNegative: false,
      range: '₹365 – ₹405',
      demand: 'high',
      demandLabel: 'High',
    },
    {
      icon: '🔋',
      name: 'Lithium-Ion Battery Scrap',
      grade: 'EV & Laptop Packs',
      cat: 'Battery',
      rate: 74.5,
      change: '-1.59%',
      isNegative: true,
      range: '₹64 – ₹78',
      demand: 'high',
      demandLabel: 'High',
    },
    {
      icon: '🏗️',
      name: 'Heavy Melting Steel / Iron',
      grade: 'Industrial Plate Scrap',
      cat: 'Metals',
      rate: 36.8,
      change: '+1.10%',
      isNegative: false,
      range: '₹32.5 – ₹39',
      demand: 'stable',
      demandLabel: 'Stable',
    },
    {
      icon: '📺',
      name: 'LCD / Monitor Display Units',
      grade: 'Intact Backlights',
      cat: 'Electronic',
      rate: 98,
      change: '+0.70%',
      isNegative: false,
      range: '₹82 – ₹104',
      demand: 'stable',
      demandLabel: 'Stable',
    },
    {
      icon: '🧴',
      name: 'Engineering Polymers (ABS/PC)',
      grade: 'De-contaminated Flakes',
      cat: 'Plastics',
      rate: 44,
      change: '+1.20%',
      isNegative: false,
      range: '₹34 – ₹48',
      demand: 'stable',
      demandLabel: 'Stable',
    },
  ];

  const filteredCommodities =
    tableCatFilter === 'all'
      ? scrapCommodities
      : scrapCommodities.filter((c) => c.cat.toLowerCase() === tableCatFilter.toLowerCase());

  return (
    <div className="landing-shell">
      {/* --------------------------------------------------------------------------
          0. TOP ANNOUNCEMENT BAR (MoEFCC CPCB Statutory Partner & Language Picker)
          -------------------------------------------------------------------------- */}
      <div className="landing-top-bar">
        <div className="landing-top-bar-inner">
          <div className="landing-top-bar-text">
            <span className="live-pulse-dot" />
            <span>
              {currentLang === 'hi'
                ? 'SIH 2024 · MoEFCC CPCB वैधानिक भागीदार'
                : currentLang === 'mr'
                ? 'SIH 2024 · MoEFCC CPCB वैधानिक भागीदार'
                : 'SIH 2024 · MoEFCC CPCB Statutory Partner'}
            </span>
          </div>
          <div className="landing-top-bar-lang">
            <button
              type="button"
              className={currentLang === 'hi' ? 'active' : ''}
              onClick={() => onSelectLang('hi')}
            >
              हिं
            </button>
            <button
              type="button"
              className={currentLang === 'en' ? 'active' : ''}
              onClick={() => onSelectLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={currentLang === 'mr' ? 'active' : ''}
              onClick={() => onSelectLang('mr')}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          1. PUBLIC LANDING NAVBAR
          -------------------------------------------------------------------------- */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-badge">R</div>
            <div>
              <span className="landing-brand-title">ReVive</span>
              <span className="landing-brand-sub">{t.brandTag}</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#process" className="landing-nav-link">
              {t.navProcess}
            </a>
            <a href="#solutions" className="landing-nav-link">
              {t.navSolutions}
            </a>
            <a href="#rates" className="landing-nav-link">
              {t.navRates}
            </a>
            <a href="#esg" className="landing-nav-link">
              {t.navEsg}
            </a>
            <a href="#about" className="landing-nav-link">
              {t.navWho}
            </a>
          </nav>

          <div className="landing-nav-actions">
            {/* Audio Vernacular TTS Reader */}
            <button
              type="button"
              className={`speaker-btn ${isAudioPlaying ? 'playing' : ''}`}
              title="Listen in your language (Text to Speech)"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                background: isAudioPlaying ? '#fef3c7' : '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() =>
                onSpeak(
                  currentLang === 'hi'
                    ? 'री-वाइव में आपका स्वागत है। अनौपचारिक कबाड़ को प्रमाणित चक्रीय संपदा में बदलें। लाइव भाव देखें या कबाड़ पिकअप शेड्यूल करें।'
                    : currentLang === 'mr'
                    ? 'री-व्हाइव्ह मध्ये आपले स्वागत आहे. जुन्या भंगाराचे रूपांतर चक्रीय संपत्तीत करा. थेट बाजार भाव तपासा किंवा घरपोच पिकअप नोंदवा.'
                    : 'Welcome to ReVive. Transforming informal electronic waste into verified circular wealth. Track live MSP rates or schedule a verified doorstep pickup.'
                )
              }
            >
              {isAudioPlaying ? '⏹️ Stop Audio' : '🔊 Audio (ध्वनी)'}
            </button>

            {/* Language Switcher */}
            <div className="lang-picker" aria-label="Language switcher">
              <button
                type="button"
                className={currentLang === 'en' ? 'lang-btn active' : 'lang-btn'}
                onClick={() => onSelectLang('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={currentLang === 'hi' ? 'lang-btn active' : 'lang-btn'}
                onClick={() => onSelectLang('hi')}
              >
                हिन्दी
              </button>
              <button
                type="button"
                className={currentLang === 'mr' ? 'lang-btn active' : 'lang-btn'}
                onClick={() => onSelectLang('mr')}
              >
                मराठी
              </button>
            </div>

            <button
              type="button"
              className="landing-cta-btn-outline"
              onClick={() => onOpenAuth('collector', 'login', 'phone_input')}
            >
              {t.loginBtn}
            </button>
            <button
              type="button"
              className="landing-cta-btn"
              onClick={() => onOpenAuth('collector', 'signup', 'language_choice')}
            >
              {t.signupBtn}
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------------
          2. HERO SECTION (2-COLUMN RESPONSIVE LAYOUT)
          -------------------------------------------------------------------------- */}
      <main className="landing-container">
        <section className="landing-hero">
          <div className="landing-hero-left">
            <div className="hero-pill-badge">
              <span className="badge-dot">•</span>
              <span>{t.heroPill}</span>
            </div>

            <h1 className="landing-hero-title">
              {t.heroTitle1}
              <span className="hero-title-gradient">{t.heroTitleHighlight}</span>
            </h1>

            <p className="landing-hero-sub">{t.heroSub}</p>

            <div className="landing-hero-ctas">
              <button
                type="button"
                className="hero-btn-primary"
                onClick={() => onOpenAuth('collector', 'signup', 'language_choice')}
              >
                {t.btnCollector} →
              </button>
              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => onOpenAuth('recycler', 'signup', 'profile_setup')}
              >
                {t.btnRecycler}
              </button>
              <button
                type="button"
                className="hero-btn-text"
                onClick={() => onOpenAuth('admin', 'login', 'phone_input')}
              >
                {t.btnAdmin}
              </button>
            </div>

            {/* Dynamic Impact Counters */}
            <div className="impact-counter-grid">
              <div className="impact-counter-card">
                <div className="impact-counter-val">{t.statDiverted}</div>
                <div className="impact-counter-lbl">{t.statDivertedLbl}</div>
              </div>
              <div className="impact-counter-card">
                <div className="impact-counter-val">{t.statCo2}</div>
                <div className="impact-counter-lbl">{t.statCo2Lbl}</div>
              </div>
              <div className="impact-counter-card">
                <div className="impact-counter-val">{t.statMsp}</div>
                <div className="impact-counter-lbl">{t.statMspLbl}</div>
              </div>
              <div className="impact-counter-card">
                <div className="impact-counter-val">{t.statFormalized}</div>
                <div className="impact-counter-lbl">{t.statFormalizedLbl}</div>
              </div>
              <div className="impact-counter-card">
                <div className="impact-counter-val">{t.statVerification}</div>
                <div className="impact-counter-lbl">{t.statVerificationLbl}</div>
              </div>
            </div>
          </div>

          <div className="landing-hero-right">
            <div className="hero-image-card">
              <img
                src="/hero-ewaste-collector.jpg"
                alt="E-Waste Inspection"
                className="hero-image-main"
              />
              <div className="hero-floating-passport-badge">
                <div className="passport-check-icon">✓</div>
                <div>
                  <strong>
                    {currentLang === 'hi'
                      ? 'हर सामग्री का डिजिटल पासपोर्ट'
                      : currentLang === 'mr'
                      ? 'प्रत्येक साहित्याचा डिजिटल पासपोर्ट'
                      : 'Digital Passport for Every Lot'}
                  </strong>
                  <small>
                    {currentLang === 'hi'
                      ? 'संग्रह से प्रमाणित स्मेल्टर तक पूरी ट्रेसेबिलिटी'
                      : currentLang === 'mr'
                      ? 'संकलनापासून प्रमाणित स्मेल्टरपर्यंत संपूर्ण पारदर्शकता'
                      : 'End-to-end traceability from pickup to certified smelter'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            3. THEKABADIWALA-INSPIRED 3-STEP PICKUP WORKFLOW
            -------------------------------------------------------------------------- */}
        <section id="process" style={{ margin: '60px 0 20px' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.workflowEyebrow}</span>
            <h2 className="landing-section-title">{t.workflowTitle}</h2>
            <p className="landing-section-desc">{t.workflowDesc}</p>
          </div>

          <div className="how-it-works-grid">
            <div className="how-step-card">
              <div className="step-badge">1</div>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Desc}</p>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#086c4b', fontWeight: 700 }}>
                ✓ AI Mobile Image Classification
              </div>
            </div>

            <div className="how-step-card">
              <div className="step-badge">2</div>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Desc}</p>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#086c4b', fontWeight: 700 }}>
                ✓ ISO Calibrated Transparent Scales
              </div>
            </div>

            <div className="how-step-card">
              <div className="step-badge">3</div>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Desc}</p>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#086c4b', fontWeight: 700 }}>
                ✓ Instant UPI + Immutable SHA-256 Hash
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            4. THEKABADIWALA-INSPIRED 3-AUDIENCE SOLUTION MATRIX
            -------------------------------------------------------------------------- */}
        <section id="solutions" style={{ margin: '60px 0 40px' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.audienceEyebrow}</span>
            <h2 className="landing-section-title">{t.audienceTitle}</h2>
            <p className="landing-section-desc">{t.audienceDesc}</p>
          </div>

          <div className="role-gateway-grid">
            {/* 1. Households */}
            <div className="role-gateway-card collector">
              <span className="role-gateway-badge">{t.cardIndividualTag}</span>
              <h2>{t.cardIndividualTitle}</h2>
              <p>{t.cardIndividualDesc}</p>
              <ul className="role-perks-list">
                {t.cardIndividualPerks.map((perk, i) => (
                  <li key={i}>✓ {perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className="role-gateway-btn"
                onClick={() => onOpenAuth('collector', 'signup', 'language_choice')}
              >
                {currentLang === 'hi' ? 'घरेलू पिकअप बुक करें →' : currentLang === 'mr' ? 'घरपोच पिकअप नोंदवा →' : 'Book Household Pickup →'}
              </button>
            </div>

            {/* 2. Corporates & Bulk */}
            <div className="role-gateway-card recycler">
              <span className="role-gateway-badge">{t.cardBusinessTag}</span>
              <h2>{t.cardBusinessTitle}</h2>
              <p>{t.cardBusinessDesc}</p>
              <ul className="role-perks-list">
                {t.cardBusinessPerks.map((perk, i) => (
                  <li key={i}>✓ {perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className="role-gateway-btn"
                onClick={() => onOpenAuth('recycler', 'signup', 'profile_setup')}
              >
                {currentLang === 'hi' ? 'कॉर्पोरेट ITAD कंसल्टेशन →' : currentLang === 'mr' ? 'कॉर्पोरेट ITAD संपर्क →' : 'Corporate ITAD & EPR Portal →'}
              </button>
            </div>

            {/* 3. Municipalities & Regulators */}
            <div className="role-gateway-card admin">
              <span className="role-gateway-badge">{t.cardGovTag}</span>
              <h2>{t.cardGovTitle}</h2>
              <p>{t.cardGovDesc}</p>
              <ul className="role-perks-list">
                {t.cardGovPerks.map((perk, i) => (
                  <li key={i}>✓ {perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className="role-gateway-btn"
                onClick={() => onOpenAuth('admin', 'login', 'phone_input')}
              >
                {currentLang === 'hi' ? 'CPCB / MRF टर्मिनल →' : currentLang === 'mr' ? 'CPCB / MRF टर्मिनल →' : 'Access CPCB / MRF Terminal →'}
              </button>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            5. DARK THEME LIVE PRICE TRENDS (EXACT MOCKUP MATCH)
            -------------------------------------------------------------------------- */}
        <section id="rates" style={{ margin: '70px 0 40px' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.trendEyebrow}</span>
            <h2 className="landing-section-title">{t.trendTitle}</h2>
            <p className="landing-section-desc">{t.trendSubtitle}</p>
          </div>

          {/* Regional Mandi Hub Selector Strip */}
          <div className="mandi-picker-strip" style={{ marginBottom: '20px' }}>
            <span className="mandi-picker-label">
              📍 {currentLang === 'hi' ? 'क्षेत्रीय मंडी / हब:' : currentLang === 'mr' ? 'प्रादेशिक बाजार:' : 'Regional Market Hub:'}
            </span>
            {[
              'New Delhi Market',
              'Mumbai Bandra Hub',
              'Pune Hadapsar Cluster',
              'Bengaluru Peenya',
              'Bhopal Govindpura',
              'Indore Sanwer Road',
            ].map((city) => (
              <button
                key={city}
                type="button"
                className={`mandi-chip ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Dark Financial Card matching user mockup image */}
          <div className="dark-price-trend-card">
            {/* Top Header Row with Spot Title & 4 Financial Parameters */}
            <div className="dark-card-header">
              <div>
                <h3 className="spot-title">
                  {trendCategory} {t.spotSuffix}
                </h3>
                <div className="market-indicator">
                  <span className="market-dot" />
                  <span>
                    ● {selectedCity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 4 Key Financial Metrics */}
              <div className="dark-metrics-strip">
                <div className="dark-metric-block">
                  <div className="dark-metric-label">{t.metricLatest}</div>
                  <div className="dark-metric-val">
                    ₹{catData.latest.toFixed(2)}
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>/kg</span>
                  </div>
                </div>

                <div className="dark-metric-block">
                  <div className="dark-metric-label">{t.metricChange}</div>
                  <div
                    className={`dark-metric-val ${
                      catData.changeVal < 0 ? 'change-negative' : 'change-positive'
                    }`}
                  >
                    {catData.changeVal < 0 ? '-' : '+'}₹{Math.abs(catData.changeVal).toFixed(2)} (
                    {catData.changePct < 0 ? '' : '+'}
                    {catData.changePct.toFixed(2)}%)
                  </div>
                </div>

                <div className="dark-metric-block">
                  <div className="dark-metric-label">{t.metricHigh}</div>
                  <div className="dark-metric-val">
                    ₹{catData.high.toFixed(2)}
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>/kg</span>
                  </div>
                </div>

                <div className="dark-metric-block">
                  <div className="dark-metric-label">{t.metricLow}</div>
                  <div className="dark-metric-val">
                    ₹{catData.low.toFixed(2)}
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>/kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row: Category Filter Chips & Timeframe Tabs */}
            <div className="dark-controls-row">
              <div className="dark-cat-chips">
                {['Copper', 'Aluminium', 'Iron', 'Brass', 'PCB', 'Battery'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`dark-cat-chip ${trendCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setTrendCategory(cat);
                      setChartHoverIdx(null);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="dark-timeframe-tabs">
                {(['7D', '15D', '30D'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={`dark-timeframe-btn ${trendTimeframe === tf ? 'active' : ''}`}
                    onClick={() => {
                      setTrendTimeframe(tf);
                      setChartHoverIdx(null);
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Spline Area Chart */}
            <div className="dark-chart-wrapper">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="dark-chart-svg"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/* Neon Cyan Gradient Area Fill */}
                  <linearGradient id="darkCyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d09c" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#00d09c" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Glow filter for active points */}
                  <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00d09c" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Y-Axis Horizontal Gridlines & Price Ticks */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                  const y = padTop + frac * plotH;
                  const priceLabel = Math.round(maxPrice - frac * (maxPrice - minPrice));
                  return (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="#1a273e"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padLeft - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#546b8d"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        ₹{priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Spline Area Fill */}
                <path d={splineAreaPath} fill="url(#darkCyanAreaGrad)" />

                {/* Spline Curve Stroke */}
                <path
                  d={splineLinePath}
                  fill="none"
                  stroke="#00d09c"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points, Nodes & Tooltips */}
                {chartCoords.map((c, i) => {
                  const isHovered = chartHoverIdx === i;
                  const isLast = i === chartCoords.length - 1;
                  const showDateLabel =
                    trendTimeframe === '7D'
                      ? true
                      : trendTimeframe === '15D'
                      ? i % 2 === 0
                      : i % 3 === 0 || isLast;

                  return (
                    <g
                      key={i}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setChartHoverIdx(i)}
                      onMouseLeave={() => setChartHoverIdx(null)}
                    >
                      {/* Vertical Crosshair on Hover */}
                      {isHovered && (
                        <line
                          x1={c.x}
                          y1={padTop}
                          x2={c.x}
                          y2={padTop + plotH}
                          stroke="#00d09c"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />
                      )}

                      {/* X-Axis Date Tick */}
                      {showDateLabel && (
                        <text
                          x={c.x}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          fontSize="11"
                          fill={isLast ? '#00d09c' : '#546b8d'}
                          fontWeight={isLast || isHovered ? 800 : 500}
                        >
                          {c.date}
                        </text>
                      )}

                      {/* Glowing Circular Node */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isHovered ? 6.5 : 4}
                        fill="#090f1d"
                        stroke="#00d09c"
                        strokeWidth={isHovered ? 3.5 : 2}
                        filter={isHovered || isLast ? 'url(#cyanGlow)' : undefined}
                      />
                      <circle cx={c.x} cy={c.y} r={isHovered ? 2.5 : 1.5} fill="#ffffff" />

                      {/* Hover Popover Box */}
                      {isHovered && (
                        <g>
                          <rect
                            x={Math.max(padLeft, Math.min(c.x - 55, svgWidth - padRight - 110))}
                            y={Math.max(10, c.y - 48)}
                            width="110"
                            height="34"
                            rx="8"
                            fill="#0d192d"
                            stroke="#00d09c"
                            strokeWidth="1.5"
                            filter="url(#cyanGlow)"
                          />
                          <text
                            x={Math.max(padLeft, Math.min(c.x - 55, svgWidth - padRight - 110)) + 55}
                            y={Math.max(10, c.y - 48) + 16}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="12.5"
                            fontWeight="800"
                          >
                            ₹{c.price.toFixed(2)} / kg
                          </text>
                          <text
                            x={Math.max(padLeft, Math.min(c.x - 55, svgWidth - padRight - 110)) + 55}
                            y={Math.max(10, c.y - 48) + 28}
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="9.5"
                            fontWeight="600"
                          >
                            {c.date} · {selectedCity.split(' ')[0]}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            6. THEKABADIWALA-INSPIRED INTERACTIVE ESG CALCULATOR
            -------------------------------------------------------------------------- */}
        <section id="esg" style={{ margin: '50px 0' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.esgEyebrow}</span>
            <h2 className="landing-section-title">{t.esgTitle}</h2>
            <p className="landing-section-desc">{t.esgDesc}</p>
          </div>

          <div className="esg-calculator-card">
            <div className="calculator-slider-wrap">
              <label>
                <span>{t.esgWeightLabel}</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#086c4b' }}>
                  {esgWeight} kg
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={1000}
                step={5}
                value={esgWeight}
                onChange={(e) => setEsgWeight(Number(e.target.value))}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '6px',
                }}
              >
                <span>10 kg (Household)</span>
                <span>250 kg (Housing Society)</span>
                <span>500 kg (Commercial Office)</span>
                <span>1000 kg (Industrial Plant)</span>
              </div>
            </div>

            <div className="esg-metric-tiles">
              <div className="esg-metric-tile">
                <span className="esg-metric-tile-icon">🌳</span>
                <div className="esg-metric-tile-val">{treesSaved}</div>
                <div className="esg-metric-tile-lbl">{t.esgTrees}</div>
              </div>

              <div className="esg-metric-tile">
                <span className="esg-metric-tile-icon">💨</span>
                <div className="esg-metric-tile-val">{co2Abated}</div>
                <div className="esg-metric-tile-lbl">{t.esgCo2}</div>
              </div>

              <div className="esg-metric-tile">
                <span className="esg-metric-tile-icon">💧</span>
                <div className="esg-metric-tile-val">{waterSaved.toLocaleString('en-IN')}</div>
                <div className="esg-metric-tile-lbl">{t.esgWater}</div>
              </div>

              <div className="esg-metric-tile">
                <span className="esg-metric-tile-icon">🛡️</span>
                <div className="esg-metric-tile-val">{toxicDiverted}</div>
                <div className="esg-metric-tile-lbl">{t.esgLandfill}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                type="button"
                className="hero-btn-primary"
                style={{ background: '#086c4b', color: '#ffffff', padding: '12px 28px' }}
                onClick={() => onOpenAuth('collector', 'signup', 'language_choice')}
              >
                {t.esgCta}
              </button>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            7. COMPREHENSIVE SCRAP COMMODITY RATES BOARD
            -------------------------------------------------------------------------- */}
        <section style={{ margin: '60px 0 40px' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.tableEyebrow}</span>
            <h2 className="landing-section-title">{t.tableTitle}</h2>
            <p className="landing-section-desc">{t.tableDesc}</p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {['all', 'Electronic', 'Non-Ferrous', 'Battery', 'Metals', 'Plastics'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chart-cat-pill ${tableCatFilter === cat ? 'active' : ''}`}
                onClick={() => setTableCatFilter(cat)}
              >
                {cat === 'all' ? 'All Commodities' : cat}
              </button>
            ))}
          </div>

          <div className="scrap-table-container">
            <table className="scrap-market-table">
              <thead>
                <tr>
                  <th>{t.thMaterial}</th>
                  <th>{t.thCategory}</th>
                  <th>{t.thTodayRate}</th>
                  <th>{t.th24hChange}</th>
                  <th>{t.thRange}</th>
                  <th>{t.thDemand}</th>
                  <th>{t.thAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommodities.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{row.icon}</span>
                        <div>
                          <strong style={{ display: 'block', color: '#0c3b2d' }}>{row.name}</strong>
                          <small style={{ color: '#64748b' }}>{row.grade}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#2c4a3e',
                          background: '#f0f5ee',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {row.cat}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '16px', color: '#086c4b' }}>
                        ₹ {row.rate.toFixed(1)}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}> / kg</span>
                    </td>
                    <td>
                      <span className={row.isNegative ? 'trend-negative' : 'trend-positive'}>
                        {row.isNegative ? '▼' : '▲'} {row.change}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#475569' }}>{row.range}</span>
                    </td>
                    <td>
                      <span className={`demand-pill ${row.demand}`}>● {row.demandLabel}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="mini-action"
                        style={{ padding: '7px 14px', fontSize: '12.5px' }}
                        onClick={() => onOpenAuth('collector', 'signup', 'language_choice')}
                      >
                        {t.sellAtMsp}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            8. TECHNOLOGY PILLARS & STATUTORY MANDATE
            -------------------------------------------------------------------------- */}
        <section id="about" style={{ margin: '60px 0 40px' }}>
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t.pillarsEyebrow}</span>
            <h2 className="landing-section-title">{t.pillarsTitle}</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">👁️</div>
              <h3>{t.pillar1Title}</h3>
              <p>{t.pillar1Desc}</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon-box">📈</div>
              <h3>{t.pillar2Title}</h3>
              <p>{t.pillar2Desc}</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon-box">⚡</div>
              <h3>{t.pillar3Title}</h3>
              <p>{t.pillar3Desc}</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon-box">🛡️</div>
              <h3>{t.pillar4Title}</h3>
              <p>{t.pillar4Desc}</p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------------
            9. STATUTORY FOOTER
            -------------------------------------------------------------------------- */}
        <footer
          style={{
            borderTop: '1px solid #dce9df',
            paddingTop: '32px',
            paddingBottom: '32px',
            color: '#57786b',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/revive-logo.jpeg"
                alt="ReVive"
                style={{ width: '28px', height: '28px', borderRadius: '6px' }}
              />
              <strong style={{ color: '#0c3b2d' }}>ReVive Circular Economy Exchange</strong>
            </div>
            <div>
              {t.footerHelpline} <b style={{ color: '#086c4b' }}>1800-11-2026 (Toll Free)</b>
            </div>
            <div>{t.footerCompliant}</div>
          </div>
        </footer>
      </main>
    </div>
  );
};
