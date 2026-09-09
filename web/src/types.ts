// ============================================================================
// ReVive Types & Domain Models
// ============================================================================

export type Material = {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  is_hazardous?: boolean;
};

export type Lot = {
  id: number;
  collector_id: number;
  material_id: number;
  quantity_kg: number;
  estimated_value: number;
  status: string;
};

export type Recycler = {
  id: number;
  name: string;
  verified: boolean;
  location: string;
  contact_phone?: string | null;
};

export type Offer = {
  id: number;
  lot_id: number;
  recycler_id: number;
  offer_price: number;
  pickup_available: boolean;
  status: string;
};

export type SyncQueueItem = {
  id: number;
  kind: 'lot' | 'offer' | 'handover';
  payload: Record<string, unknown>;
  createdAt: string;
};

export type TimelineEvent = {
  step: number;
  title: string;
  description: string;
  timestamp?: string | null;
  completed: boolean;
};

export type HandoverRecord = {
  id: number;
  lot_id: number;
  collector_id: number;
  recycler_id: number;
  final_weight_kg: number;
  handover_location: string;
  collector_confirmed: boolean;
  recycler_confirmed: boolean;
  signature?: string | null;
  status: string;
};

export type TraceabilityData = {
  lot_id: number;
  lot_status: string;
  quantity_kg: number;
  final_weight_kg?: number | null;
  weight_discrepancy_kg?: number | null;
  estimated_value: number;
  final_price?: number | null;
  material?: Material | null;
  collector_id: number;
  recycler?: Recycler | null;
  handover?: HandoverRecord | null;
  certificate_hash: string;
  timeline: TimelineEvent[];
};

export type RecyclingPassport = {
  passport_id: string;
  lot_id: number;
  material_name: string;
  material_category: string;
  is_hazardous: boolean;
  initial_weight_kg: number;
  verified_weight_kg?: number | null;
  collector_alias: string;
  recycler_name?: string | null;
  recycler_authorization?: string | null;
  status: string;
  certificate_hash: string;
  co2_saved_kg: number;
  toxic_diverted_kg: number;
  qr_data: string;
  created_at?: string | null;
  timeline: TimelineEvent[];
};

export type SafetyGuidance = {
  material_key: string;
  category_name: string;
  hazard_level: string;
  vernacular_slogan: { en: string; hi: string; mr: string };
  explanation: { en: string; hi: string; mr: string };
  dos: Array<{ en: string; hi: string; mr: string }>;
  donts: Array<{ en: string; hi: string; mr: string }>;
};

export type AdminMetrics = {
  total_lots: number;
  active_lots: number;
  completed_lots: number;
  total_weight_kg: number;
  total_turnover_inr: number;
  co2_saved_kg: number;
  toxic_metals_diverted_kg: number;
  total_recyclers: number;
  verified_recyclers: number;
  recycler_verification_ratio: number;
  flagged_anomalies_count: number;
};

export type AdminAnomaly = {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  lot_id: number;
  title: string;
  description: string;
  expected_value: string;
  actual_value: string;
  detected_at: string;
  status: 'open' | 'resolved';
};

export type DemoWorkflowResult = {
  success: boolean;
  lot_id: number;
  passport_id: string;
  steps_completed: string[];
  certificate_hash: string;
  qr_data: string;
};

export type Lang = 'en' | 'hi' | 'mr';

export type ActiveRole = 'collector' | 'recycler' | 'admin';

export type ActivePage =
  | 'home'
  | 'create_lot'
  | 'price_board'
  | 'find_recycler'
  | 'earnings'
  | 'transactions'
  | 'safety'
  | 'profile';

export type UserProfile = {
  id: number;
  custom_user_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  role: 'collector' | 'recycler' | 'admin';
  language: Lang;
  location: string;
  company_name?: string | null;
  license_no?: string | null;
  service_area?: string | null;
};

export const API_BASE_URL = 'http://127.0.0.1:8001';

export const fallbackMaterials: Material[] = [
  { id: 1, name: 'PCB', category: 'Electronic', is_hazardous: true },
  { id: 2, name: 'Copper Wire', category: 'Metal', is_hazardous: false },
  { id: 3, name: 'Battery', category: 'Battery', is_hazardous: true },
  { id: 4, name: 'Mobile', category: 'Electronic', is_hazardous: false },
];

export const fallbackLots: Lot[] = [
  { id: 101, collector_id: 1, material_id: 2, quantity_kg: 8.5, estimated_value: 1240, status: 'created' },
  { id: 102, collector_id: 1, material_id: 1, quantity_kg: 5.4, estimated_value: 860, status: 'offers' },
  { id: 103, collector_id: 1, material_id: 4, quantity_kg: 12.1, estimated_value: 1750, status: 'pickup' },
];

export const fallbackRecyclers: Recycler[] = [
  { id: 1, name: 'EcoCycle Pune', verified: true, location: 'Pune, Maharashtra', contact_phone: '9876540001' },
  { id: 2, name: 'GreenLoop Nashik', verified: true, location: 'Nashik, Maharashtra', contact_phone: '9876540002' },
];

export const fallbackOffers: Offer[] = [
  { id: 1, lot_id: 102, recycler_id: 1, offer_price: 1450, pickup_available: true, status: 'pending' },
];

export const I18N = {
  en: {
    appName: 'ReVive',
    tagline: 'Giving E-Waste a Second Life',
    collectorRole: 'Collector (Kabadiwala)',
    recyclerRole: 'Verified Recycler',
    adminRole: 'Admin & Governance',
    createLot: 'Create Lot',
    scanScrap: 'Scan Scrap (AI)',
    handover: 'Handover',
    trace: 'Trace',
    passport: 'Passport & QR',
    verifyPassport: 'Verify Passport (e.g. REV-2026-LOT-0001)',
    verifyBtn: 'Verify',
    marketBenchmarks: 'Live Market Benchmarks',
    statusCreated: 'Created',
    statusOffers: 'Offers Received',
    statusPickup: 'Pickup Scheduled',
    statusHandedOver: 'Handed Over',
    statusPaid: 'Payment Settled',
    recentActivity: 'Recent Scrap Lots',
    safetyTitle: 'Material Safety Guidance',
    co2Saved: 'CO₂ Emissions Avoided',
    toxicDiverted: 'Toxic Metals Diverted',
    sha256Certificate: 'SHA-256 Tamper-Evident Certificate',
    offlineSyncBanner: 'Offline Queue: {count} pending operations',
    syncNow: 'Sync Now',
    runSihDemo: 'Run Live SIH Demo',
    runningDemo: 'Simulating 7-Step SIH Workflow...',
    adminDashboardTitle: 'Central Governance & Compliance Portal',
    adminDashboardSubtitle: 'Monitor ESG impact, verify CPCB recycler authorizations, and inspect operational anomalies.',
    adminTabOverview: 'Executive Overview',
    adminTabRecyclers: 'Recycler Registry',
    adminTabAnomalies: 'Anomaly Inspector',
    adminTabLots: 'Audit Ledger',
    navHome: 'Home',
    navCreateLot: 'Create Lot',
    navPriceBoard: 'Price Board',
    navFindRecycler: 'Find Recycler',
    navEarnings: 'My Earnings',
    navTransactions: 'Transactions',
    navSafety: 'Safety Guide',
    navProfile: 'Profile & Settings',
    onboardingWelcome: 'Welcome to ReVive',
    onboardingLangTitle: 'Choose Your Preferred Language',
    onboardingLangSubtitle: 'Select the language you are most comfortable with before continuing. You can change this anytime.',
    langEnTitle: 'English',
    langEnDesc: 'Clean & modern English interface for general operations.',
    langHiTitle: 'हिन्दी (Hindi)',
    langHiDesc: 'कबाड़ीवाला और स्क्रैप साथियों के लिए आसान व सुगम हिंदी।',
    langMrTitle: 'मराठी (Marathi)',
    langMrDesc: 'कबाडी आणि भंगार बांधवांसाठी सोपी व सुलभ मराठी.',
    continueBtn: 'Continue →',
    backBtn: '← Back',
    onboardingPhoneTitle: 'Collector Mobile Login',
    onboardingPhoneSubtitle: 'Enter your 10-digit mobile number to access your account.',
    phoneLabel: 'Mobile Number',
    phonePlaceholder: 'Enter 10-digit mobile number',
    quickDemoPhoneBtn: 'Use Demo: +91 98765 43210',
    sendOtpBtn: 'Send OTP Verification Code →',
    sendingOtp: 'Sending OTP...',
    onboardingOtpTitle: 'Enter Verification Code',
    onboardingOtpSubtitle: 'Enter the 6-digit OTP code sent to your mobile number.',
    otpPlaceholder: 'Enter 6-digit OTP',
    autoFillDemoOtp: 'Auto-fill Demo Code (123456)',
    verifyOtpBtn: 'Verify OTP & Continue →',
    verifyingOtp: 'Verifying...',
    onboardingProfileTitle: 'Create Collector Profile',
    onboardingProfileSubtitle: 'Set up your collector identity for transactions and CPCB digital passports.',
    nameLabel: 'Full Name / Business Name',
    namePlaceholder: 'e.g. Ram Yadav',
    locationLabel: 'Operating City & State',
    locationPlaceholder: 'e.g. Bhopal, MP or Pune, MH',
    completeRegBtn: 'Complete Setup & Enter Dashboard →',
    logoutBtn: 'Logout / Switch Account',
    studioTitle: 'Digital Lot Creation Studio',
    studioSubtitle: 'Photograph e-waste, classify with AI, and lock in fair regional scrap pricing.',
    uploadPhotoTitle: 'Photograph Scrap / Upload Image',
    scanAiBtn: 'Scan with Neural AI',
    scanningAi: 'Classifying Scrap...',
    approxWeightLabel: 'Approximate Weight (kg)',
    conditionLabel: 'Scrap Condition (Influences Fair Valuation)',
    condGood: 'Good / Intact',
    condMixed: 'Mixed Scrap',
    condDamaged: 'Damaged / Stripped',
    condUnknown: 'Unknown / Raw',
    estimatedValuationLabel: 'Estimated Market Value',
    submitLotBtn: 'Register Digital E-Waste Lot →',
    priceBoardTitle: 'Live E-Waste Market Benchmarks',
    priceBoardSubtitle: 'Real-time verified median buying rates aggregated across formal recyclers in major hubs.',
    filterCityLabel: 'Select Regional Market:',
    histTrendTitle: '6-Month Historical Price Trajectory (₹/kg)',
    sellThisMaterialBtn: 'Sell at this Rate →',
    dirTitle: 'Verified CPCB Recycler Directory',
    dirSubtitle: 'Connect directly with authorized recyclers. Compare distance, buying rates, and pickup options.',
    filterCategoryLabel: 'Filter by Material:',
    distanceLabel: 'Distance',
    pickupAvailable: 'Pickup Available',
    dropoffOnly: 'Drop-off Only',
    requestPickupBtn: 'Request Bid / Pickup →',
    earningsTitle: 'Collector Earnings & Payout Ledger',
    earningsSubtitle: 'Track your income from verified recycling, cash vs UPI breakdowns, and transparent receipts.',
    totalRevenue: 'Total Lifetime Earnings',
    cashReceived: 'Cash Handover Payouts',
    upiReceived: 'Instant UPI Payouts',
    completedCount: 'Settled Lots',
    downloadReceipt: 'Download Receipt',
    paymentModeLabel: 'Payment Mode',
    safetySubtitle: 'Protect your health, family, and environment from hazardous substances and toxic fumes.',
    listenAudioBtn: '🔊 Listen Vernacular Audio',
    speakingAudio: '🔊 Playing Audio Guidance...',
    hazardWarningTitle: 'High-Hazard Scrap Categories',
    dosTitle: '✓ Safe Handling Best Practices',
    dontsTitle: '❌ Unsafe Practices (Strictly Prohibited)',
    auditTrailTitle: 'Master E-Waste Lot Audit Trail',
    auditTrailSubtitle: 'Statutory digital lifecycle tracking: CREATED → OFFER_RECEIVED → OFFER_ACCEPTED → PICKUP → HANDOVER → PAID.',
    allTransactions: 'All Transactions',
    thLotRef: 'Lot Ref',
    thMaterial: 'Material',
    thWeight: 'Weight',
    thEstValue: 'Estimated Value',
    thStatus: 'Status',
    thActions: 'Handover & Traceability Actions',
    btnPassportQr: 'Passport & QR',
    btnTrace: 'Trace',
    btnHandover: 'Handover',
    btnMarkPaid: 'Mark Paid',
    searchPlaceholder: 'Search materials, recyclers, prices, lot IDs...',
    btnExit: '🚪 Exit',
    onlineStatus: 'Online',
    offlineStatus: 'Offline cache',
    roleCollectorVerified: '🧺 Collector (Verified)',
    roleRecyclerVerified: '🏭 Verified Recycler',
    roleAdminVerified: '🏛️ CPCB Admin',
    cleanToday: 'Clean Today.',
    greenerTomorrow: 'Greener Tomorrow.',
    collapseSidebarTooltip: 'Collapse Sidebar (बंद करें)',
    expandSidebarTooltip: 'Expand Sidebar (खोलें)',
    audioAssistantBtn: '🔊 Listen Page Audio',
    audioPlayingBtn: '🔊 Playing Audio...',
    audioStopBtn: '⏹️ Stop Audio',
    recOperationsTitle: 'Recycler Operations · Authorized CPCB Facility',
    tabBrowseLots: '🔍 Browse Scrap Lots',
    tabBidsOffers: '🏷️ Bids & Offers',
    tabPickups: '🚚 Pickups & QR Weigh-in',
    tabPassports: '📜 CPCB Digital Passports',
    tabOrgProfile: '🏢 Recycler Org Profile',
    statAvailableLots: 'Available Lots',
    statInServiceArea: 'In service area',
    statAcceptedBids: 'Accepted Bids',
    statAwaitingPickup: 'Awaiting pickup',
    statCurrentPipeline: 'Current Pipeline',
    statCommittedTurnover: 'Committed turnover',
    statCompletedLots: 'Completed Lots',
    statPassportsIssued: 'CPCB Passports Issued',
    browseScrapHeading: 'Browse Available E-Waste Lots (Steps 4 & 5)',
    browsePostedBy: 'posted by regional collectors',
    noScrapPosted: 'No scrap lots currently posted.',
    btnWeighReceive: '🚚 Weigh & Receive',
    receiptDeskTitle: 'Pickup & Material Receipt Desk (Steps 7 & 8)',
    receiptDeskSubtitle: 'Verify Collector QR Code & Enter Scale Weight',
    receiptDeskDesc: 'When collecting material from the informal collector, scan their digital QR token and weigh scrap on calibrated scales. The system calculates any weight delta and issues an immutable CPCB Digital Passport.',
    btnOpenScaleModal: '⚖️ Open Scale Weigh-In & QR Verification Modal',
    passportsDeskTitle: 'Closed Transactions & CPCB Passports (Step 9)',
    passportsDeskSubtitle: 'Traceability & Compliance Records',
    noSettledTx: 'No settled transactions yet. You can inspect demo passport REV-2026-LOT-0001.',
    btnInspectStatutoryPassport: 'Inspect Statutory Passport →',
    btnViewPassport: 'View Passport →',
    orgProfileTitle: 'Recycler Organization Profile & CPCB Registry (Step 3)',
    cpcbAuthorizedBadge: '✓ Authorized CPCB Recycler',
    lblCompanyName: 'Company Name',
    lblLicenseNo: 'CPCB Authorization License',
    lblFacilityLocation: 'Facility Location',
    lblServiceArea: 'Service Area & Radius',
    lblRegContact: 'Registered Contact',
  },
  hi: {
    appName: 'ReVive (रीवाइव)',
    tagline: 'ई-कचरे को नई ज़िंदगी',
    collectorRole: 'कबाड़ीवाला साथी',
    recyclerRole: 'प्रमाणित रीसाइक्लर',
    adminRole: 'प्रशासन व अनुपालन',
    createLot: 'नया लॉट बनाएं',
    scanScrap: 'कचरा स्कैन करें (AI)',
    handover: 'हैंडओवर पुष्टि',
    trace: 'ट्रेस करें',
    passport: 'पासपोर्ट और QR',
    verifyPassport: 'पासपोर्ट जांचें (उदा. REV-2026-LOT-0001)',
    verifyBtn: 'जांचें',
    marketBenchmarks: 'लाइव बाज़ार भाव',
    statusCreated: 'लॉट दर्ज',
    statusOffers: 'बोली प्राप्त',
    statusPickup: 'पिकअप तय',
    statusHandedOver: 'हैंडओवर पूरा',
    statusPaid: 'भुगतान संपन्न',
    recentActivity: 'हाल के ई-कचरा लॉट',
    safetyTitle: 'सामग्री सुरक्षा चेतावनी',
    co2Saved: 'CO₂ उत्सर्जन की बचत',
    toxicDiverted: 'जहरीली धातु सुरक्षित',
    sha256Certificate: 'SHA-256 डिजिटल प्रमाण पत्र',
    offlineSyncBanner: 'ऑफ़लाइन कतार: {count} कार्य बाकी',
    syncNow: 'सिंक करें',
    runSihDemo: 'लाइव SIH डेमो चलाएं',
    runningDemo: 'डेमो सिमुलेशन प्रगति पर है...',
    adminDashboardTitle: 'केंद्रीय प्रशासन व अनुपालन पोर्टल',
    adminDashboardSubtitle: 'ESG प्रभाव की निगरानी, CPCB रीसाइक्लर सत्यापन और विसंगतियों की समीक्षा करें।',
    adminTabOverview: 'मुख्य विवरण',
    adminTabRecyclers: 'रीसाइक्लर पंजीयन',
    adminTabAnomalies: 'त्रुटि व विसंगति जांच',
    adminTabLots: 'ऑडिट लेज़र',
    navHome: 'मुख्य पृष्ठ',
    navCreateLot: 'नया लॉट बनाएं',
    navPriceBoard: 'बाज़ार भाव',
    navFindRecycler: 'रीसाइक्लर खोजें',
    navEarnings: 'मेरी कमाई',
    navTransactions: 'लेनदेन लेज़र',
    navSafety: 'सुरक्षा मार्गदर्शिका',
    navProfile: 'प्रोफ़ाइल व सेटिंग्स',
    onboardingWelcome: 'ReVive (रीवाइव) में आपका स्वागत है',
    onboardingLangTitle: 'अपनी पसंदीदा भाषा चुनें',
    onboardingLangSubtitle: 'लॉगिन करने से पहले वह भाषा चुनें जिसमें आप सहज हैं। इसे आप कभी भी बदल सकते हैं।',
    langEnTitle: 'English (अंग्रेज़ी)',
    langEnDesc: 'साधारण व आधुनिक अंग्रेज़ी इंटरफ़ेस।',
    langHiTitle: 'हिन्दी (Hindi)',
    langHiDesc: 'कबाड़ीवाला और स्क्रैप साथियों के लिए आसान व सुगम हिंदी।',
    langMrTitle: 'मराठी (Marathi)',
    langMrDesc: 'कबाडी आणि भंगार बांधवांसाठी सोपी व सुलभ मराठी.',
    continueBtn: 'आगे बढ़ें →',
    backBtn: '← वापस',
    onboardingPhoneTitle: 'कलेक्टर मोबाइल लॉगिन',
    onboardingPhoneSubtitle: 'खाते में प्रवेश करने के लिए अपना 10 अंकों का मोबाइल नंबर दर्ज करें।',
    phoneLabel: 'मोबाइल नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर डालें',
    quickDemoPhoneBtn: 'डेमो नंबर: +91 98765 43210',
    sendOtpBtn: 'ओटीपी सत्यापन कोड भेजें →',
    sendingOtp: 'ओटीपी भेजा जा रहा है...',
    onboardingOtpTitle: 'ओटीपी सत्यापन कोड दर्ज करें',
    onboardingOtpSubtitle: 'आपके मोबाइल पर भेजा गया 6 अंकों का ओटीपी कोड दर्ज करें।',
    otpPlaceholder: '6 अंकों का ओटीपी (उदा. 123456)',
    autoFillDemoOtp: 'डेमो कोड भरें (123456)',
    verifyOtpBtn: 'सत्यापित करें व आगे बढ़ें →',
    verifyingOtp: 'सत्यापित हो रहा है...',
    onboardingProfileTitle: 'कलेक्टर प्रोफ़ाइल बनाएं',
    onboardingProfileSubtitle: 'भुगतान और कानूनी CPCB डिजिटल रिकॉर्ड के लिए अपनी जानकारी दर्ज करें।',
    nameLabel: 'पूरा नाम / दुकान का नाम',
    namePlaceholder: 'उदा. राम यादव',
    locationLabel: 'कार्यक्षेत्र / शहर व राज्य',
    locationPlaceholder: 'उदा. भोपाल, म.प्र. या पुणे, महाराष्ट्र',
    completeRegBtn: 'पंजीकरण पूरा करें और शुरू करें →',
    logoutBtn: 'लॉगआउट / खाता बदलें',
    studioTitle: 'डिजिटल स्क्रैप लॉट निर्माण',
    studioSubtitle: 'ई-कचरे की तस्वीर लें, AI से पहचानें और सही बाज़ार भाव पाएं।',
    uploadPhotoTitle: 'स्क्रैप की फोटो लें या अपलोड करें',
    scanAiBtn: 'AI से स्कैन करें',
    scanningAi: 'पहचान की जा रही है...',
    approxWeightLabel: 'अनुमानित वज़न (किलोग्राम)',
    conditionLabel: 'कबाड़ की स्थिति (उचित मूल्य निर्धारण हेतु)',
    condGood: 'अच्छी / साबुत हालत',
    condMixed: 'मिश्रित कबाड़',
    condDamaged: 'टूटा-फूटा / जला',
    condUnknown: 'अज्ञात स्थिति',
    estimatedValuationLabel: 'अनुमानित बाज़ार मूल्य',
    submitLotBtn: 'डिजिटल ई-कचरा लॉट दर्ज करें →',
    priceBoardTitle: 'लाइव ई-कचरा बाज़ार भाव',
    priceBoardSubtitle: 'प्रमुख शहरों के प्रमाणित रीसाइक्लर्स से एकत्रित किए गए औसत खरीद भाव।',
    filterCityLabel: 'क्षेत्रीय बाज़ार चुनें:',
    histTrendTitle: 'पिछले 6 महीनों के भाव का रुझान (₹/किग्रा)',
    sellThisMaterialBtn: 'इस भाव पर बेचें →',
    dirTitle: 'प्रमाणित CPCB रीसाइक्लर डायरेक्टरी',
    dirSubtitle: 'सीधे अधिकृत रीसाइक्लर्स से जुड़ें। दूरी, रेट और पिकअप सुविधा की तुलना करें।',
    filterCategoryLabel: 'सामग्री के अनुसार छांटें:',
    distanceLabel: 'दूरी',
    pickupAvailable: 'पिकअप उपलब्ध',
    dropoffOnly: 'स्वयं पहुंचाना होगा',
    requestPickupBtn: 'बोली या पिकअप का अनुरोध करें →',
    earningsTitle: 'कमाई व भुगतान लेज़र',
    earningsSubtitle: 'रीसाइक्लिंग से होने वाली अपनी आय, नकद बनाम UPI भुगतान का पूरा विवरण।',
    totalRevenue: 'कुल जीवनकाल कमाई',
    cashReceived: 'नकद में प्राप्त भुगतान',
    upiReceived: 'सीधे UPI द्वारा प्राप्त',
    completedCount: 'सफलतापूर्वक बेचे गए लॉट',
    downloadReceipt: 'रसीद डाउनलोड करें',
    paymentModeLabel: 'भुगतान का तरीका',
    safetySubtitle: 'खतरनाक रसायनों और जहरीले धुएं से अपनी सेहत, परिवार और पर्यावरण को सुरक्षित रखें।',
    listenAudioBtn: '🔊 बोलकर निर्देश सुनें',
    speakingAudio: '🔊 निर्देश सुनाए जा रहे हैं...',
    hazardWarningTitle: 'अति-खतरनाक ई-कचरा श्रेणियां',
    dosTitle: '✓ क्या करें (सुरक्षित तरीके)',
    dontsTitle: '❌ क्या न करें (सख्त मना)',
    auditTrailTitle: 'मास्टर ई-कचरा लॉट ऑडिट लेज़र',
    auditTrailSubtitle: 'कानूनी डिजिटल जीवनचक्र ट्रैकिंग: लॉट दर्ज → बोली प्राप्त → पिकअप तय → हैंडओवर पूरा → भुगतान संपन्न।',
    allTransactions: 'सभी लेनदेन',
    thLotRef: 'लॉट संदर्भ',
    thMaterial: 'कचरा श्रेणी',
    thWeight: 'वज़न (किग्रा)',
    thEstValue: 'अनुमानित मूल्य',
    thStatus: 'स्थिति',
    thActions: 'हैंडओवर व ट्रेसिंग विकल्प',
    btnPassportQr: 'पासपोर्ट व QR',
    btnTrace: 'ट्रेस करें',
    btnHandover: 'हैंडओवर',
    btnMarkPaid: 'भुगतान संपन्न',
    searchPlaceholder: 'सामग्री, रीसाइक्लर, भाव या लॉट आईडी खोजें...',
    btnExit: '🚪 बाहर निकलें',
    onlineStatus: 'ऑनलाइन',
    offlineStatus: 'ऑफ़लाइन मोड',
    roleCollectorVerified: '🧺 कबाड़ीवाला (प्रमाणित)',
    roleRecyclerVerified: '🏭 अधिकृत रीसाइक्लर',
    roleAdminVerified: '🏛️ केंद्रीय प्रशासन',
    cleanToday: 'आज स्वच्छ.',
    greenerTomorrow: 'कल हरित भारत!',
    collapseSidebarTooltip: 'मेनू छोटा करें',
    expandSidebarTooltip: 'मेनू पूरा खोलें',
    audioAssistantBtn: '🔊 बोलकर सुनें',
    audioPlayingBtn: '🔊 आवाज़ चालू है...',
    audioStopBtn: '⏹️ आवाज़ रोकें',
    recOperationsTitle: 'रीसाइक्लर संचालन डेस्क · अधिकृत CPCB केंद्र',
    tabBrowseLots: '🔍 कबाड़ लॉट देखें',
    tabBidsOffers: '🏷️ बोलियां व दरें',
    tabPickups: '🚚 पिकअप व वजन',
    tabPassports: '📜 CPCB डिजिटल पासपोर्ट',
    tabOrgProfile: '🏢 रीसाइक्लर प्रोफ़ाइल',
    statAvailableLots: 'उपलब्ध लॉट',
    statInServiceArea: 'कार्यक्षेत्र में',
    statAcceptedBids: 'स्वीकृत बोलियां',
    statAwaitingPickup: 'पिकअप बाकी',
    statCurrentPipeline: 'कुल खरीद राशि',
    statCommittedTurnover: 'तयशुदा भुगतान',
    statCompletedLots: 'निस्तारित लॉट',
    statPassportsIssued: 'जारी CPCB पासपोर्ट',
    browseScrapHeading: 'उपलब्ध ई-कचरा लॉट (चरण 4 व 5)',
    browsePostedBy: 'क्षेत्रीय कबाड़ीवालों द्वारा दर्ज',
    noScrapPosted: 'वर्तमान में कोई लॉट दर्ज नहीं है।',
    btnWeighReceive: '🚚 तौलें व स्वीकारें',
    receiptDeskTitle: 'पिकअप व सामग्री प्राप्ति डेस्क (चरण 7 व 8)',
    receiptDeskSubtitle: 'कलेक्टर QR कोड जांचें और कांटा वजन दर्ज करें',
    receiptDeskDesc: 'कबाड़ीवाले से सामग्री लेते समय उनका डिजिटल QR टोकन स्कैन करें और प्रमाणित कांटे पर वजन करें। सिस्टम वजन के अंतर की गणना कर डिजिटल पासपोर्ट जारी करता है।',
    btnOpenScaleModal: '⚖️ कांटा वजन व QR सत्यापन विंडो खोलें',
    passportsDeskTitle: 'संपन्न लेनदेन व CPCB पासपोर्ट (चरण 9)',
    passportsDeskSubtitle: 'डिजिटल ट्रेस व कानूनी रिकॉर्ड',
    noSettledTx: 'अभी कोई पूर्ण लेनदेन नहीं है। आप डेमो पासपोर्ट REV-2026-LOT-0001 देख सकते हैं।',
    btnInspectStatutoryPassport: 'कानूनी पासपोर्ट देखें →',
    btnViewPassport: 'पासपोर्ट देखें →',
    orgProfileTitle: 'रीसाइक्लर संस्थान प्रोफ़ाइल व CPCB पंजीयन (चरण 3)',
    cpcbAuthorizedBadge: '✓ CPCB अधिकृत रीसाइक्लर',
    lblCompanyName: 'कंपनी का नाम',
    lblLicenseNo: 'CPCB लाइसेंस नंबर',
    lblFacilityLocation: 'संयंत्र का पता',
    lblServiceArea: 'कार्यक्षेत्र व त्रिज्या',
    lblRegContact: 'पंजीकृत संपर्क',
  },
  mr: {
    appName: 'ReVive (रिव्हाइव्ह)',
    tagline: 'ई-कचऱ्याला नवे जीवन',
    collectorRole: 'कबाडीवाला बांधव',
    recyclerRole: 'प्रमाणित रिसायकलर',
    adminRole: 'प्रशासन आणि नियमन',
    createLot: 'नवीन लॉट नोंदवा',
    scanScrap: 'कचरा स्कॅन करा (AI)',
    handover: 'हँडओव्हर पुष्टी',
    trace: 'ट्रेस करा',
    passport: 'पासपोर्ट आणि QR',
    verifyPassport: 'पासपोर्ट तपासा (उदा. REV-2026-LOT-0001)',
    verifyBtn: 'तपासा',
    marketBenchmarks: 'थेट बाजार भाव',
    statusCreated: 'नोंदणीकृत',
    statusOffers: 'दर प्राप्त',
    statusPickup: 'पिकअप ठरले',
    statusHandedOver: 'हँडओव्हर पूर्ण',
    statusPaid: 'पैसे मिळाले',
    recentActivity: 'नुकतेच ई-कचरा लॉट्स',
    safetyTitle: 'साहित्य सुरक्षा सूचना',
    co2Saved: 'CO₂ प्रदूषण रोखले',
    toxicDiverted: 'विषारी धातू सुरक्षित',
    sha256Certificate: 'SHA-256 डिजिटल प्रमाणपत्र',
    offlineSyncBanner: 'ऑफलाइन रांग: {count} प्रलंबित',
    syncNow: 'सिंक करा',
    runSihDemo: 'थेट SIH डेमो चालवा',
    runningDemo: 'डेमो प्रक्रिया सुरू आहे...',
    adminDashboardTitle: 'केंद्रीय प्रशासन आणि नियमन पोर्टल',
    adminDashboardSubtitle: 'ESG प्रभाव तपासणी, CPCB रिसायकलर पडताळणी आणि त्रुटींचे पुनरावलोकन.',
    adminTabOverview: 'मुख्य आढावा',
    adminTabRecyclers: 'रिसायकलर नोंदणी',
    adminTabAnomalies: 'त्रुटी व विसंगती तपासणी',
    adminTabLots: 'ऑडिट लेजर',
    navHome: 'मुख्य पान',
    navCreateLot: 'नवीन लॉट नोंदवा',
    navPriceBoard: 'बाजार दर',
    navFindRecycler: 'रिसायकलर शोधा',
    navEarnings: 'माझी कमाई',
    navTransactions: 'व्यवहार लेजर',
    navSafety: 'सुरक्षा मार्गदर्शक',
    navProfile: 'प्रोफाइल व सेटिंग्ज',
    onboardingWelcome: 'ReVive (रिव्हाइव्ह) मध्ये आपले स्वागत आहे',
    onboardingLangTitle: 'तुमची पसंतीची भाषा निवडा',
    onboardingLangSubtitle: 'लॉगिन करण्यापूर्वी तुम्हाला सोपी वाटणारी भाषा निवडा. ही भाषा तुम्ही नंतरही बदलू शकता.',
    langEnTitle: 'English (इंग्रजी)',
    langEnDesc: 'स्वच्छ आणि आधुनिक इंग्रजी इंटरफेस.',
    langHiTitle: 'हिन्दी (Hindi)',
    langHiDesc: 'कबाड़ीवाला आणि स्क्रॅप बांधवांसाठी सुलभ हिंदी.',
    langMrTitle: 'मराठी (Marathi)',
    langMrDesc: 'कबाडी आणि भंगार बांधवांसाठी सोपी व सुलभ मराठी.',
    continueBtn: 'पुढे चला →',
    backBtn: '← मागे',
    onboardingPhoneTitle: 'कलेक्टर मोबाईल लॉगिन',
    onboardingPhoneSubtitle: 'खात्यामध्ये प्रवेश करण्यासाठी आपला 10 अंकी मोबाईल क्रमांक टाका.',
    phoneLabel: 'मोबाईल क्रमांक',
    phonePlaceholder: '10 अंकी मोबाईल नंबर टाका',
    quickDemoPhoneBtn: 'डेमो नंबर: +91 98765 43210',
    sendOtpBtn: 'ओटीपी पडताळणी कोड पाठवा →',
    sendingOtp: 'ओटीपी पाठवला जात आहे...',
    onboardingOtpTitle: 'ओटीपी पडताळणी कोड टाका',
    onboardingOtpSubtitle: 'आपल्या मोबाईलवर आलेला 6 अंकी ओटीपी कोड टाका.',
    otpPlaceholder: '6 अंकी ओटीपी (उदा. 123456)',
    autoFillDemoOtp: 'डेमो कोड भरा (123456)',
    verifyOtpBtn: 'पडताळणी करा आणि पुढे जा →',
    verifyingOtp: 'पडताळणी सुरू आहे...',
    onboardingProfileTitle: 'कलेक्टर प्रोफाइल तयार करा',
    onboardingProfileSubtitle: 'पैसे मिळवण्यासाठी आणि CPCB डिजिटल नोंदीसाठी आपली माहिती नोंदवा.',
    nameLabel: 'पूर्ण नाव / दुकानाचे नाव',
    namePlaceholder: 'उदा. राम यादव',
    locationLabel: 'कार्यक्षेत्र / शहर व राज्य',
    locationPlaceholder: 'उदा. पुणे, महाराष्ट्र किंवा भोपाळ',
    completeRegBtn: 'नोंदणी पूर्ण करा आणि सुरू करा →',
    logoutBtn: 'लॉगआउट / खाते बदला',
    studioTitle: 'डिजिटल स्क्रॅप लॉट निर्मिती',
    studioSubtitle: 'ई-कचऱ्याचा फोटो काढा, AI द्वारे ओळखा आणि योग्य बाजारभाव मिळवा.',
    uploadPhotoTitle: 'स्क्रॅपचा फोटो काढा किंवा अपलोड करा',
    scanAiBtn: 'AI ने स्कॅन करा',
    scanningAi: 'ओळख पटवली जात आहे...',
    approxWeightLabel: 'अंदाजे वजन (किलोग्रॅम)',
    conditionLabel: 'कचऱ्याची स्थिती (योग्य मूल्य मिळवण्यासाठी)',
    condGood: 'चांगले / अखंड',
    condMixed: 'मिश्रित कचरा',
    condDamaged: 'खराब / तुटलेले',
    condUnknown: 'माहित नाही',
    estimatedValuationLabel: 'अंदाजे बाजार मूल्य',
    submitLotBtn: 'डिजिटल ई-कचरा लॉट नोंदवा →',
    priceBoardTitle: 'थेट ई-कचरा बाजार दर',
    priceBoardSubtitle: 'प्रमुख शहरांमधील प्रमाणित रिसायकलर्सकडून मिळालेले सरासरी खरेदी दर.',
    filterCityLabel: 'प्रादेशिक बाजार निवडा:',
    histTrendTitle: 'गेल्या 6 महिन्यांतील दरांची वाटचाल (₹/किलो)',
    sellThisMaterialBtn: 'या दराने विका →',
    dirTitle: 'प्रमाणित CPCB रिसायकलर डिरेक्टरी',
    dirSubtitle: 'अधिकृत रिसायकलर्सशी थेट संपर्क साधा. अंतर, दर आणि पिकअप पर्यायांची तुलना करा.',
    filterCategoryLabel: 'साहित्यानुसार निवडा:',
    distanceLabel: 'अंतर',
    pickupAvailable: 'पिकअप उपलब्ध',
    dropoffOnly: 'स्वतः द्यावे लागेल',
    requestPickupBtn: 'दर किंवा पिकअप मागवा →',
    earningsTitle: 'कमाई आणि देयक लेजर',
    earningsSubtitle: 'रिसायकलिंगमधून मिळालेले उत्पन्न, रोख विरुद्ध UPI पेमेंटचा संपूर्ण हिशोब.',
    totalRevenue: 'एकूण एकूण कमाई',
    cashReceived: 'रोख स्वरूपात मिळालेले',
    upiReceived: 'थेट UPI द्वारे मिळालेले',
    completedCount: 'यशस्वीरित्या विकलेले लॉट्स',
    downloadReceipt: 'पावती डाउनलोड करा',
    paymentModeLabel: 'पेमेंटची पद्धत',
    safetySubtitle: 'विषारी वायू आणि घातक रसायनांपासून स्वतःचे, कुटुंबाचे आणि पर्यावरणाचे रक्षण करा.',
    listenAudioBtn: '🔊 सूचना आवाजात ऐका',
    speakingAudio: '🔊 सूचना ऐकवल्या जात आहेत...',
    hazardWarningTitle: 'अति-घातक ई-कचरा प्रकार',
    dosTitle: '✓ काय करावे (सुरक्षित पद्धती)',
    dontsTitle: '❌ काय करू नये (सक्त मनाई)',
    auditTrailTitle: 'मास्टर ई-कचरा लॉट ऑडिट लेजर',
    auditTrailSubtitle: 'कायदेशीर डिजिटल जीवनचक्र ट्रॅकिंग: नोंदणी → दर प्राप्त → स्वीकृती → पिकअप → हँडओव्हर → देयक पूर्ण.',
    allTransactions: 'सर्व व्यवहार',
    thLotRef: 'लॉट संदर्भ',
    thMaterial: 'कचरा प्रकार',
    thWeight: 'वजन (किग्रॅ)',
    thEstValue: 'अंदाजे मूल्य',
    thStatus: 'स्थिती',
    thActions: 'हँडओव्हर व ट्रेसिंग पर्याय',
    btnPassportQr: 'पासपोर्ट व QR',
    btnTrace: 'ट्रेस करा',
    btnHandover: 'हँडओव्हर',
    btnMarkPaid: 'पैसे मिळाले',
    searchPlaceholder: 'साहित्य, रिसायकलर, दर किंवा लॉट आयडी शोधा...',
    btnExit: '🚪 बाहेर पडा',
    onlineStatus: 'ऑनलाइन',
    offlineStatus: 'ऑफलाइन मोड',
    roleCollectorVerified: '🧺 कबाडीवाला (प्रमाणित)',
    roleRecyclerVerified: '🏭 प्रमाणित रिसायकलर',
    roleAdminVerified: '🏛️ केंद्रीय प्रशासन',
    cleanToday: 'आज स्वच्छ.',
    greenerTomorrow: 'उद्या हरित भारत!',
    collapseSidebarTooltip: 'मेनू लहान करा',
    expandSidebarTooltip: 'मेनू उघडा',
    audioAssistantBtn: '🔊 आवाजात ऐका',
    audioPlayingBtn: '🔊 आवाज सुरू आहे...',
    audioStopBtn: '⏹️ आवाज थांबवा',
    recOperationsTitle: 'रिसायकलर व्यवस्थापन डेस्क · अधिकृत CPCB केंद्र',
    tabBrowseLots: '🔍 कचरा लॉट्स पहा',
    tabBidsOffers: '🏷️ दर व मागण्या',
    tabPickups: '🚚 पिकअप व वजन',
    tabPassports: '📜 CPCB डिजिटल पासपोर्ट',
    tabOrgProfile: '🏢 रिसायकलर प्रोफाइल',
    statAvailableLots: 'उपलब्ध लॉट्स',
    statInServiceArea: 'कार्यक्षेत्रात',
    statAcceptedBids: 'स्वीकृत दर',
    statAwaitingPickup: 'पिकअप बाकी',
    statCurrentPipeline: 'एकूण खरेदी रक्कम',
    statCommittedTurnover: 'निश्चित देयक',
    statCompletedLots: 'निस्तारित लॉट्स',
    statPassportsIssued: 'जारी केलेले CPCB पासपोर्ट',
    browseScrapHeading: 'उपलब्ध ई-कचरा लॉट्स (पायरी 4 व 5)',
    browsePostedBy: 'स्थानिक कबाडी बांधवांनी नोंदवलेले',
    noScrapPosted: 'सध्या कोणतेही लॉट्स नोंदणीकृत नाहीत.',
    btnWeighReceive: '🚚 वजन करा व स्वीकारा',
    receiptDeskTitle: 'पिकअप व साहित्य पावती डेस्क (पायरी 7 व 8)',
    receiptDeskSubtitle: 'कलेक्टर QR कोड तपासा आणि वजन नोंदवा',
    receiptDeskDesc: 'कबाडी बांधवांकडून साहित्य घेताना त्यांचा डिजिटल QR कोड स्कॅन करा आणि वजन काट्यावर मोजा. वजन फरकाची गणना करून डिजिटल पासपोर्ट तयार होतो.',
    btnOpenScaleModal: '⚖️ वजन काटा व QR पडताळणी विंडो उघडा',
    passportsDeskTitle: 'पूर्ण झालेले व्यवहार व CPCB पासपोर्ट (पायरी 9)',
    passportsDeskSubtitle: 'डिजिटल ट्रेस आणि कायदेशीर नोंदी',
    noSettledTx: 'अद्याप कोणतेही पूर्ण व्यवहार नाहीत. आपण डेमो पासपोर्ट REV-2026-LOT-0001 पाहू शकता.',
    btnInspectStatutoryPassport: 'कायदेशीर पासपोर्ट पहा →',
    btnViewPassport: 'पासपोर्ट पहा →',
    orgProfileTitle: 'रिसायकलर संस्था प्रोफाइल आणि CPCB नोंदणी (पायरी 3)',
    cpcbAuthorizedBadge: '✓ CPCB अधिकृत रिसायकलर',
    lblCompanyName: 'कंपनीचे नाव',
    lblLicenseNo: 'CPCB परवाना क्रमांक',
    lblFacilityLocation: 'प्रकल्प पत्ता',
    lblServiceArea: 'कार्यक्षेत्र व परिसर',
    lblRegContact: 'नोंदणीकृत संपर्क',
  },
};
