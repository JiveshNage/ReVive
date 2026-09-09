import React, { useEffect, useState } from 'react';
import {
  Material,
  Lot,
  Recycler,
  Offer,
  SyncQueueItem,
  HandoverRecord,
  TraceabilityData,
  RecyclingPassport,
  SafetyGuidance,
  AdminMetrics,
  AdminAnomaly,
  DemoWorkflowResult,
  Lang,
  ActivePage,
  UserProfile,
  API_BASE_URL,
  fallbackMaterials,
  fallbackLots,
  fallbackRecyclers,
  fallbackOffers,
  I18N,
} from './types';

import { LandingPage } from './pages/LandingPage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

import { OfferModal } from './components/modals/OfferModal';
import { HandoverModal } from './components/modals/HandoverModal';
import { TraceabilityModal } from './components/modals/TraceabilityModal';
import { PassportModal } from './components/modals/PassportModal';
import { CameraScannerModal } from './components/CameraScannerModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { CollectorHome } from './pages/collector/CollectorHome';
import { CreateLotPage } from './pages/collector/CreateLotPage';
import { PriceBoardPage } from './pages/collector/PriceBoardPage';
import { FindRecyclerPage } from './pages/collector/FindRecyclerPage';
import { EarningsPage } from './pages/collector/EarningsPage';
import { TransactionsPage } from './pages/collector/TransactionsPage';
import { SafetyPage } from './pages/collector/SafetyPage';
import { ProfilePage } from './pages/collector/ProfilePage';

import { MobileScanView } from './pages/mobile/MobileScanView';
import { MobileLotsView } from './pages/mobile/MobileLotsView';
import { MobilePriceBoard } from './pages/mobile/MobilePriceBoard';
import { MobileRecyclersView } from './pages/mobile/MobileRecyclersView';
import { MobileEarningsView } from './pages/mobile/MobileEarningsView';
import { MobileSafetyView } from './pages/mobile/MobileSafetyView';
import { MobileProfileView } from './pages/mobile/MobileProfileView';

import { RecyclerPortal } from './pages/recycler/RecyclerPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

export function App() {
  // Domain data state
  const [materials, setMaterials] = useState<Material[]>(fallbackMaterials);
  const [lots, setLots] = useState<Lot[]>(fallbackLots);
  const [recyclers, setRecyclers] = useState<Recycler[]>(fallbackRecyclers);
  const [offers, setOffers] = useState<Offer[]>(fallbackOffers);
  const [handoverRecords, setHandoverRecords] = useState<HandoverRecord[]>([]);
  const [benchmarks, setBenchmarks] = useState<
    Array<{
      category: string;
      median_rate_per_kg: number;
      min_rate_per_kg: number;
      max_rate_per_kg: number;
      sample_count: number;
    }>
  >([]);
  const [safetyGuidanceList, setSafetyGuidanceList] = useState<SafetyGuidance[]>([]);

  // Admin & Governance state
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [adminAnomalies, setAdminAnomalies] = useState<AdminAnomaly[]>([]);
  const [adminTab, setAdminTab] = useState<'kpis' | 'recyclers' | 'anomalies' | 'lots'>('kpis');
  const [verificationView, setVerificationView] = useState<'all' | 'pending'>('all');
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoWorkflowResult | null>(null);

  // App & Navigation state
  const [activeRole, setActiveRole] = useState<'collector' | 'recycler' | 'admin'>('collector');
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [recyclerSubView, setRecyclerSubView] = useState<'browse' | 'bids' | 'pickups' | 'passports' | 'profile'>('browse');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline');
  const [audioPlaying, setAudioPlaying] = useState(false);

  // User & Auth state
  const [currentLang, setCurrentLang] = useState<Lang>('hi');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('revive_user');
      if (raw) return JSON.parse(raw) as UserProfile;
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }
    return null;
  });

  const [landingView, setLandingView] = useState<'landing' | 'auth'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup'>('language_choice');
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [authRole, setAuthRole] = useState<'collector' | 'recycler' | 'admin'>('collector');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [profileName, setProfileName] = useState('राम यादव');
  const [profileLocation, setProfileLocation] = useState('Bhopal, MP');
  const [regCompanyName, setRegCompanyName] = useState('EcoCycle Pune Solutions Pvt Ltd');
  const [regLicenseNo, setRegLicenseNo] = useState('CPCB/EW/2024/0981');
  const [regServiceArea, setRegServiceArea] = useState('Pune, Maharashtra & Western Region');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState('');

  // Dialog & creation states
  const [newLotMaterialId, setNewLotMaterialId] = useState(fallbackMaterials[0].id);
  const [newLotQuantity, setNewLotQuantity] = useState('5');
  const [newLotPhotoUrl, setNewLotPhotoUrl] = useState('');
  const [selectedScrapCondition, setSelectedScrapCondition] = useState<'good' | 'mixed' | 'damaged' | 'unknown'>('good');
  const [lotSuccessMsg, setLotSuccessMsg] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Bhopal, MP');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');

  // AI scanner state
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: string;
    confidence: number;
    confidence_tier?: string;
    recommendation?: string;
    location: string;
    weight_kg: number;
    top_predictions: Array<{ category: string; confidence: number }>;
    pricing?: {
      category: string;
      pricing_category: string;
      location: string;
      weight_kg: number;
      price_per_kg_median: number;
      estimated_value: number;
      price_min: number;
      price_max: number;
      samples: number;
    } | null;
  } | null>(null);

  // Recycler offer dialog state
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerLotId, setOfferLotId] = useState(fallbackLots[0].id);
  const [offerRecyclerId, setOfferRecyclerId] = useState(fallbackRecyclers[0].id);
  const [offerPrice, setOfferPrice] = useState('850');

  // Handover dialog state
  const [handoverDialogOpen, setHandoverDialogOpen] = useState(false);
  const [handoverLotId, setHandoverLotId] = useState(fallbackLots[0].id);
  const [handoverFinalWeight, setHandoverFinalWeight] = useState('4.5');
  const [handoverLocation, setHandoverLocation] = useState('Bhopal');

  // Traceability dialog state
  const [traceabilityLotId, setTraceabilityLotId] = useState<number | null>(null);
  const [traceabilityData, setTraceabilityData] = useState<TraceabilityData | null>(null);
  const [traceabilityLoading, setTraceabilityLoading] = useState(false);

  // Passport modal state
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const [passportLoading, setPassportLoading] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<RecyclingPassport | null>(null);
  const [passportLookupRef, setPassportLookupRef] = useState('');

  // Mobile Live Camera Scanner State
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  // Responsive layout detection & user preference override
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });
  const [forcedMobileView, setForcedMobileView] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileLayout = forcedMobileView !== null ? forcedMobileView : isMobileScreen;

  const handleToggleAppMode = () => {
    setForcedMobileView((prev) => {
      if (prev === null) return !isMobileScreen;
      return !prev;
    });
  };


  // Sync queue for offline resilience (PRD FR-17)
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('revive-sync-queue');
      if (raw) return JSON.parse(raw) as SyncQueueItem[];
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    if (currentUser?.language) {
      setCurrentLang(currentUser.language);
    }
    if (currentUser?.role) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  // Audio Text-to-Speech Assistant (Indic-TTS standard)
  const speakIndicText = (text: string, customLang?: Lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(text);
      return;
    }
    if (audioPlaying) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    setAudioPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = customLang || currentLang;
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(targetLang) || (targetLang === 'mr' && v.lang.startsWith('hi'))
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakPageSummary = () => {
    let summaryText = '';
    if (activeRole === 'collector') {
      if (activePage === 'home') {
        summaryText =
          currentLang === 'hi'
            ? `रीवाइव कबाड़ीवाला साथी पोर्टल में आपका स्वागत है। आपके पास कुल ${lots.length} सक्रिय स्क्रैप लॉट हैं। कुल जीवनकाल कमाई अठारह हज़ार चार सौ पचास रुपये है।`
            : currentLang === 'mr'
            ? `रिव्हाइव्ह कबाडी बांधव पोर्टलवर आपले स्वागत आहे. आपल्याकडे एकूण ${lots.length} सक्रिय स्क्रॅप लॉट्स आहेत.`
            : `Welcome to ReVive Collector Portal. You have ${lots.length} active scrap lots. Total lifetime revenue is 18,450 rupees.`;
      } else if (activePage === 'transactions') {
        summaryText =
          currentLang === 'hi'
            ? `मास्टर ई-कचरा लॉट ऑडिट लेज़र। कुल ${lots.length} लॉट दर्ज हैं।`
            : currentLang === 'mr'
            ? `मास्टर ई-कचरा लॉट ऑडिट लेजर. एकूण ${lots.length} लॉट्स नोंदणीकृत आहेत.`
            : `Master E-Waste Lot Audit Trail. Total ${lots.length} lots registered.`;
      } else if (activePage === 'safety') {
        summaryText =
          currentLang === 'hi'
            ? `सामग्री सुरक्षा मार्गदर्शिका। तार मत जलाओ! जहरीले धुएं से बचें। बैटरी पंचर न करें।`
            : currentLang === 'mr'
            ? `साहित्य सुरक्षा मार्गदर्शक. वायर जाळू नका! विषारी धुरापासून स्वतःचा बचाव करा.`
            : `Material Safety Guidance. Do not burn cables. Avoid toxic fumes and acid leaching.`;
      } else if (activePage === 'price_board') {
        summaryText =
          currentLang === 'hi'
            ? `लाइव ई-कचरा बाज़ार भाव। पीसीबी एक सौ पचासी रुपये प्रति किलो, कॉपर वायर एक सौ दस रुपये प्रति किलो चल रहा है।`
            : currentLang === 'mr'
            ? `थेट ई-कचरा बाजार दर. पीसीबी एकशे पंच्यांशी रुपये प्रति किलो, तांबे वायर एकशे दहा रुपये प्रति किलो सुरू आहे.`
            : `Live market benchmarks. PCB is trading at 185 rupees per kg.`;
      } else {
        summaryText = I18N[currentLang].tagline;
      }
    } else if (activeRole === 'recycler') {
      summaryText =
        currentLang === 'hi'
          ? `रीसाइक्लर संचालन डेस्क। ${lots.length} उपलब्ध लॉट और ${offers.filter((o) => o.status === 'accepted').length} स्वीकृत बोलियां हैं।`
          : currentLang === 'mr'
          ? `रिसायकलर व्यवस्थापन डेस्क. ${lots.length} उपलब्ध लॉट्स आहेत.`
          : `Verified Recycler Operations Desk. ${lots.length} available lots.`;
    } else {
      summaryText =
        currentLang === 'hi'
          ? `केंद्रीय प्रशासन व अनुपालन पोर्टल। कुल ई-कचरा निस्तारण और सीपीसीबी डिजिटल पासपोर्ट की निगरानी करें।`
          : currentLang === 'mr'
          ? `केंद्रीय प्रशासन आणि नियमन पोर्टल. एकूण ई-कचरा आणि सीपीसीबी डिजिटल पासपोर्टचे नियमन करा.`
          : `Central Governance and Compliance Portal. Monitor ESG impact and CPCB verifications.`;
    }
    speakIndicText(summaryText);
  };

  const getStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    const t = I18N[currentLang];
    if (normalized === 'created') return t.statusCreated;
    if (normalized === 'offers') return t.statusOffers;
    if (normalized === 'pickup') return t.statusPickup;
    if (normalized === 'handed_over') return t.statusHandedOver;
    if (normalized === 'accepted') return currentLang === 'hi' ? 'स्वीकृत' : currentLang === 'mr' ? 'मान्य' : 'Accepted';
    if (normalized === 'pending') return currentLang === 'hi' ? 'प्रलंबित' : currentLang === 'mr' ? 'प्रलंबित' : 'Pending';
    if (normalized === 'rejected') return currentLang === 'hi' ? 'अस्वीकृत' : currentLang === 'mr' ? 'नाकारले' : 'Rejected';
    if (normalized === 'payment_completed' || normalized === 'paid') return t.statusPaid;
    return status;
  };

  // Authentication header helper
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('revive_token') : null;
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  };

  // Data fetching and sync
  const refreshData = async () => {
    try {
      const [materialsRes, lotsRes, recyclersRes, offersRes, handoverRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/materials`),
        fetch(`${API_BASE_URL}/api/lots`),
        fetch(`${API_BASE_URL}/api/recyclers`),
        fetch(`${API_BASE_URL}/api/offers`),
        fetch(`${API_BASE_URL}/api/handover`),
      ]);

      let connected = false;
      if (materialsRes.ok) {
        const d = await materialsRes.json();
        if (Array.isArray(d) && d.length > 0) {
          setMaterials(d);
          connected = true;
        }
      }
      if (lotsRes.ok) {
        const d = await lotsRes.json();
        if (Array.isArray(d) && d.length > 0) {
          setLots(d);
          connected = true;
        }
      }
      if (recyclersRes.ok) {
        const d = await recyclersRes.json();
        if (Array.isArray(d) && d.length > 0) {
          setRecyclers(d);
          connected = true;
        }
      }
      if (offersRes.ok) {
        const d = await offersRes.json();
        if (Array.isArray(d)) setOffers(d);
        connected = true;
      }
      if (handoverRes.ok) {
        const d = await handoverRes.json();
        if (Array.isArray(d)) setHandoverRecords(d);
        connected = true;
      }

      try {
        const bRes = await fetch(`${API_BASE_URL}/api/prices/benchmarks`);
        if (bRes.ok) {
          const bd = await bRes.json();
          if (Array.isArray(bd) && bd.length > 0) setBenchmarks(bd);
        }
      } catch {
        // Non-fatal
      }

      try {
        const sRes = await fetch(`${API_BASE_URL}/api/safety/guidance`);
        if (sRes.ok) {
          const sd = await sRes.json();
          if (Array.isArray(sd.items)) setSafetyGuidanceList(sd.items);
        }
      } catch {
        // Non-fatal
      }

      setApiStatus(connected ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  const refreshAdminData = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/metrics`),
        fetch(`${API_BASE_URL}/api/admin/anomalies`),
      ]);
      if (mRes.ok) setAdminMetrics(await mRes.json());
      if (aRes.ok) setAdminAnomalies(await aRes.json());
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    void refreshData();
    void refreshAdminData();
  }, []);

  const persistSyncQueue = (nextQueue: SyncQueueItem[]) => {
    setSyncQueue(nextQueue);
    if (typeof window !== 'undefined') {
      if (nextQueue.length === 0) window.localStorage.removeItem('revive-sync-queue');
      else window.localStorage.setItem('revive-sync-queue', JSON.stringify(nextQueue));
    }
  };

  const queueOfflineMutation = (kind: SyncQueueItem['kind'], payload: Record<string, unknown>) => {
    const queuedItem: SyncQueueItem = {
      id: Date.now() + Math.random(),
      kind,
      payload,
      createdAt: new Date().toISOString(),
    };
    persistSyncQueue([...syncQueue, queuedItem]);
  };

  const syncQueuedItems = async () => {
    if (apiStatus !== 'online' || syncQueue.length === 0) return;
    const remaining: SyncQueueItem[] = [];

    for (const item of syncQueue) {
      const endpoint =
        item.kind === 'lot'
          ? `${API_BASE_URL}/api/lots`
          : item.kind === 'offer'
          ? `${API_BASE_URL}/api/offers`
          : `${API_BASE_URL}/api/handover`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        if (!response.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    persistSyncQueue(remaining);
    if (remaining.length !== syncQueue.length) await refreshData();
  };

  useEffect(() => {
    if (apiStatus === 'online') void syncQueuedItems();
  }, [apiStatus]);

  // Actions
  const createLot = async () => {
    const quantity = Number(newLotQuantity);
    if (!newLotMaterialId || quantity <= 0) return;
    const colId = currentUser?.id || 1;

    try {
      const response = await fetch(`${API_BASE_URL}/api/lots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          collector_id: colId,
          material_id: newLotMaterialId,
          quantity_kg: quantity,
          photo_url: newLotPhotoUrl || undefined,
        }),
      });
      if (response.ok) {
        const createdLot = await response.json();
        setOfferLotId(createdLot.id);
        setLotSuccessMsg(
          `✓ Lot #REV-LOT-${createdLot.id} created successfully! (Estimated: ₹ ${createdLot.estimated_value})`
        );
        await refreshData();
        return;
      }
    } catch {
      // Fall through to offline queue
    }

    queueOfflineMutation('lot', {
      collector_id: colId,
      material_id: newLotMaterialId,
      quantity_kg: quantity,
      photo_url: newLotPhotoUrl || undefined,
    });
    setLotSuccessMsg(`✓ Lot saved to offline queue. Will synchronize when online.`);
  };

  const handleCameraSellNow = async (lotData: {
    materialId: number;
    quantityKg: number;
    estimatedValue: number;
    photoUrl?: string;
  }) => {
    const colId = currentUser?.id || 1;
    try {
      const response = await fetch(`${API_BASE_URL}/api/lots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          collector_id: colId,
          material_id: lotData.materialId,
          quantity_kg: lotData.quantityKg,
          photo_url: lotData.photoUrl,
        }),
      });
      if (response.ok) {
        const created = await response.json();
        setOfferLotId(created.id);
        await refreshData();
        return;
      }
    } catch {
      // Fallback
    }
    queueOfflineMutation('lot', {
      collector_id: colId,
      material_id: lotData.materialId,
      quantity_kg: lotData.quantityKg,
      photo_url: lotData.photoUrl,
    });
  };

  const submitOffer = async () => {
    const price = Number(offerPrice);
    if (!offerLotId || !offerRecyclerId || price <= 0) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          lot_id: offerLotId,
          recycler_id: offerRecyclerId,
          offer_price: price,
          pickup_available: true,
        }),
      });
      if (response.ok) {
        setOfferDialogOpen(false);
        setOfferPrice('');
        await refreshData();
        return;
      }
    } catch {
      // Fall through
    }

    queueOfflineMutation('offer', {
      lot_id: offerLotId,
      recycler_id: offerRecyclerId,
      offer_price: price,
      pickup_available: true,
    });
    setOfferDialogOpen(false);
    setOfferPrice('');
  };

  const acceptOffer = async (offerId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/accept`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (response.ok) await refreshData();
    } catch {
      // Fallback update
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)));
    }
  };

  const confirmHandover = async () => {
    const plannedWeight = Number(handoverFinalWeight);
    if (!handoverLotId || !handoverLocation || plannedWeight <= 0) return;

    const payload = {
      lot_id: handoverLotId,
      collector_id: 1,
      recycler_id: offerRecyclerId || fallbackRecyclers[0].id,
      final_weight_kg: plannedWeight,
      handover_location: handoverLocation,
      collector_confirmed: true,
      recycler_confirmed: true,
      signature: `SIG-REV-${handoverLotId}-${Date.now().toString(36).toUpperCase()}`,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/handover`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const handover = (await response.json()) as HandoverRecord;
        setHandoverRecords((current) => [handover, ...current]);
        setHandoverDialogOpen(false);
        setHandoverFinalWeight('4.5');
        setHandoverLocation('Bhopal');
        await refreshData();
        return;
      }
    } catch {
      // Fall through
    }

    queueOfflineMutation('handover', payload);
    setHandoverDialogOpen(false);
    setHandoverFinalWeight('4.5');
    setHandoverLocation('Bhopal');
  };

  const completePayment = async (lotId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lots/${lotId}/payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (response.ok) await refreshData();
    } catch {
      setLots((prev) => prev.map((l) => (l.id === lotId ? { ...l, status: 'payment_completed' } : l)));
    }
  };

  const openPassport = async (referenceOrId: string | number) => {
    setPassportLoading(true);
    setPassportModalOpen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/passport/${referenceOrId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPassport(data);
        setPassportLoading(false);
        return;
      }
    } catch {
      // Backend request error - fallback smoothly to client certified passport
    }

    // Graceful client fallback for demo and offline scenarios
    const numericId =
      typeof referenceOrId === 'number'
        ? referenceOrId
        : Number(String(referenceOrId).replace(/\D/g, '')) || 1;
    const targetLot = lots.find((l) => l.id === numericId) || lots[0] || fallbackLots[0];
    const targetMat = materials.find((m) => m.id === targetLot.material_id) || fallbackMaterials[0];
    const targetOffer = offers.find((o) => o.lot_id === targetLot.id && o.status === 'accepted') || offers[0];
    const targetRecycler = targetOffer
      ? recyclers.find((r) => r.id === targetOffer.recycler_id) || recyclers[0]
      : recyclers[0];
    const targetHandover = handoverRecords.find((h) => h.lot_id === targetLot.id);

    const certHash = `cert_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 10)}`;
    const mockPassport: RecyclingPassport = {
      passport_id: `REV-2026-LOT-${String(targetLot.id).padStart(4, '0')}`,
      lot_id: targetLot.id,
      material_name: targetMat.name,
      material_category: targetMat.category,
      is_hazardous: Boolean(targetMat.is_hazardous),
      initial_weight_kg: targetLot.quantity_kg,
      verified_weight_kg: targetHandover?.final_weight_kg || targetLot.quantity_kg * 0.95,
      collector_alias: `Collector #${targetLot.collector_id} (Verified Kabadiwala)`,
      recycler_name: targetRecycler?.name || 'EcoCycle Pune Solutions Pvt Ltd',
      recycler_authorization: 'CPCB/SPCB Authorized E-Waste Recycler',
      status: targetLot.status,
      certificate_hash: certHash,
      co2_saved_kg: Number((targetLot.quantity_kg * 1.44).toFixed(2)),
      toxic_diverted_kg: Number((targetLot.quantity_kg * 0.12).toFixed(2)),
      qr_data: `REVIVE-PASSPORT|ID:REV-2026-LOT-${String(targetLot.id).padStart(4, '0')}|LOT:${targetLot.id}|HASH:${certHash.substring(0, 16)}|STATUS:${targetLot.status}`,
      created_at: new Date().toISOString(),
      timeline: [
        { step: 1, title: 'Lot Catalogued', description: `${targetLot.quantity_kg} kg of ${targetMat.name} recorded in system.`, completed: true },
        { step: 2, title: 'Valuation & Matching', description: `Estimated lot valuation: ₹ ${targetLot.estimated_value}.`, completed: true },
        { step: 3, title: 'Offer Acceptance', description: targetOffer ? `Accepted offer of ₹ ${targetOffer.offer_price} from ${targetRecycler.name}.` : 'Recycler offer pending.', completed: Boolean(targetOffer) },
        { step: 4, title: 'Digital Handover', description: targetHandover ? `Verified ${targetHandover.final_weight_kg} kg at ${targetHandover.handover_location}.` : 'Pending physical collection.', completed: Boolean(targetHandover) },
        { step: 5, title: 'Settlement & Recycling', description: targetLot.status === 'payment_completed' ? 'Payment finalized & chain sealed.' : 'Pending payment settlement.', completed: targetLot.status === 'payment_completed' }
      ]
    };
    setSelectedPassport(mockPassport);
    setPassportLoading(false);
  };

  const predictMaterialWithAi = async () => {
    if (!aiImageFile) return;
    const formData = new FormData();
    formData.append('file', aiImageFile);
    formData.append('location', 'Bhopal');
    formData.append('weight_kg', String(Number(newLotQuantity) || 1));

    setAiLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/predict`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Prediction failed');
      const result = await response.json();
      setAiResult(result);
    } catch {
      const weight = Number(newLotQuantity) || 1;
      setAiResult({
        category: 'PCB',
        confidence: 0.88,
        confidence_tier: 'high',
        recommendation: 'strong_suggestion',
        location: 'Bhopal',
        weight_kg: weight,
        top_predictions: [
          { category: 'PCB', confidence: 0.88 },
          { category: 'Mobile', confidence: 0.08 },
          { category: 'Keyboard', confidence: 0.04 },
        ],
        pricing: {
          category: 'PCB',
          pricing_category: 'PCB',
          location: 'Bhopal',
          weight_kg: weight,
          price_per_kg_median: 403,
          estimated_value: 403 * weight,
          price_min: 350 * weight,
          price_max: 450 * weight,
          samples: 30,
        },
      });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiPredictionToLot = () => {
    if (!aiResult) return;
    const matchedMat =
      materials.find(
        (m) =>
          m.name.toLowerCase().includes(aiResult.category.toLowerCase()) ||
          aiResult.category.toLowerCase().includes(m.name.toLowerCase()) ||
          m.category.toLowerCase().includes(aiResult.category.toLowerCase())
      ) ?? materials[0];
    setNewLotMaterialId(matchedMat.id);
    setNewLotQuantity(String(aiResult.weight_kg || '5'));
    setActivePage('create_lot');
  };

  // Traceability loader
  useEffect(() => {
    if (traceabilityLotId === null) {
      setTraceabilityData(null);
      return;
    }
    let active = true;
    setTraceabilityLoading(true);

    fetch(`${API_BASE_URL}/api/lots/${traceabilityLotId}/traceability`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Traceability fetch failed');
        return (await res.json()) as TraceabilityData;
      })
      .then((data) => {
        if (active) setTraceabilityData(data);
      })
      .catch(() => {
        if (!active) return;
        const tLot = lots.find((l) => l.id === traceabilityLotId);
        const tOffer = [...offers].reverse().find((o) => o.lot_id === traceabilityLotId);
        const tRecycler = tOffer ? recyclers.find((r) => r.id === tOffer.recycler_id) : null;
        const tHandover = handoverRecords.find((h) => h.lot_id === traceabilityLotId);
        const tMaterial = tLot ? materials.find((m) => m.id === tLot.material_id) : null;
        const finalWeight = tHandover ? tHandover.final_weight_kg : null;
        const weightDiscrepancy =
          tLot && finalWeight !== null ? Number((tLot.quantity_kg - finalWeight).toFixed(2)) : null;

        setTraceabilityData({
          lot_id: traceabilityLotId,
          lot_status: tLot?.status ?? 'created',
          quantity_kg: tLot?.quantity_kg ?? 0,
          final_weight_kg: finalWeight,
          weight_discrepancy_kg: weightDiscrepancy,
          estimated_value: tLot?.estimated_value ?? 0,
          final_price: tOffer?.offer_price ?? null,
          material: tMaterial ?? null,
          collector_id: tLot?.collector_id ?? 1,
          recycler: tRecycler ?? null,
          handover: tHandover ?? null,
          certificate_hash: `SHA256-SIM-${traceabilityLotId}-${Date.now().toString(16)}`,
          timeline: [
            {
              step: 1,
              title: 'Lot Catalogued',
              description: `${tLot?.quantity_kg ?? 0} kg of ${tMaterial?.name ?? 'scrap'} entered`,
              completed: true,
            },
            {
              step: 2,
              title: 'Valuation & Matching',
              description: `Estimated value: ₹ ${tLot?.estimated_value ?? 0}`,
              completed: true,
            },
            {
              step: 3,
              title: 'Offer Accepted',
              description: tOffer ? `Offer of ₹ ${tOffer.offer_price} accepted` : 'Pending offers',
              completed:
                tOffer?.status === 'accepted' ||
                tLot?.status === 'pickup' ||
                tLot?.status === 'handed_over' ||
                tLot?.status === 'payment_completed',
            },
            {
              step: 4,
              title: 'Digital Handover',
              description: tHandover ? `Verified ${tHandover.final_weight_kg} kg` : 'Pending collection',
              completed:
                tHandover?.status === 'confirmed' ||
                tLot?.status === 'handed_over' ||
                tLot?.status === 'payment_completed',
            },
            {
              step: 5,
              title: 'Settlement & Recycling',
              description: tLot?.status === 'payment_completed' ? 'Payment complete' : 'Pending settlement',
              completed: tLot?.status === 'payment_completed',
            },
          ],
        });
      })
      .finally(() => {
        if (active) setTraceabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [traceabilityLotId, lots, offers, recyclers, handoverRecords, materials]);

  // Recycler verification & Anomaly resolvers
  const toggleRecyclerVerification = async (recyclerId: number) => {
    const target = recyclers.find((r) => r.id === recyclerId);
    const newStatus = target ? !target.verified : true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recyclers/${recyclerId}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ verified: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecyclers((prev) =>
          prev.map((r) => (r.id === recyclerId ? { ...r, verified: updated.verified } : r))
        );
        await refreshAdminData();
        return;
      }
    } catch {
      // Fallback
    }
    setRecyclers((prev) => prev.map((r) => (r.id === recyclerId ? { ...r, verified: newStatus } : r)));
  };

  const resolveAnomaly = async (anomalyId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/anomalies/${anomalyId}/resolve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Non-fatal
    }
    setAdminAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'resolved' } : a))
    );
    await refreshAdminData();
  };

  const triggerSihDemo = async () => {
    setDemoRunning(true);
    setDemoResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/demo/run-workflow`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as DemoWorkflowResult;
        setDemoResult(data);
        await refreshData();
        await refreshAdminData();
        await openPassport(data.passport_id);
      } else {
        alert('Could not execute demo workflow.');
      }
    } catch {
      alert('Network error while running SIH demo.');
    } finally {
      setDemoRunning(false);
    }
  };

  // Auth Handlers
  const handleQuickDemoLogin = async (role: 'collector' | 'recycler' | 'admin') => {
    setAuthLoading(true);
    setAuthRole(role);
    try {
      const phone = role === 'collector' ? '9876543210' : role === 'recycler' ? '9123456780' : '9998887770';
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: '123456', role }),
      });
      if (res.ok) {
        const data = await res.json();
        const userObj: UserProfile = {
          id: data.user.id,
          custom_user_id:
            data.user.custom_user_id ||
            (role === 'collector'
              ? 'REV-COL-2026-1024'
              : role === 'recycler'
              ? 'REV-REC-2026-0812'
              : 'CPCB-GOV-2026-0001'),
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          role: data.user.role || role,
          language: (data.user.language as Lang) || currentLang,
          location: data.user.location || (role === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP'),
          company_name: data.user.company_name,
          license_no: data.user.license_no,
          service_area: data.user.service_area,
        };
        setCurrentUser(userObj);
        setActiveRole(userObj.role);
        setCurrentLang(userObj.language);
        window.localStorage.setItem('revive_user', JSON.stringify(userObj));
        if (data.access_token || data.token) {
          window.localStorage.setItem('revive_token', data.access_token || data.token);
        }
        setOnboardingOpen(false);
      } else {
        throw new Error('Fallback demo user');
      }
    } catch {
      const demoUser: UserProfile = {
        id: role === 'collector' ? 101 : role === 'recycler' ? 201 : 301,
        custom_user_id:
          role === 'collector'
            ? 'REV-COL-2026-1024'
            : role === 'recycler'
            ? 'REV-REC-2026-0812'
            : 'CPCB-GOV-2026-0001',
        name:
          role === 'collector'
            ? 'Ram Yadav (Asha)'
            : role === 'recycler'
            ? 'EcoCycle Pune (Raj)'
            : 'CPCB National Regulator',
        phone: role === 'collector' ? '9876543210' : role === 'recycler' ? '9123456780' : '9998887770',
        email: `${role}@revive.gov.in`,
        role,
        language: currentLang,
        location: role === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP',
        company_name: role === 'recycler' ? 'EcoCycle Solutions Pvt Ltd' : undefined,
        license_no: role === 'recycler' ? 'CPCB/EW/2024/0981' : undefined,
      };
      setCurrentUser(demoUser);
      setActiveRole(role);
      window.localStorage.setItem('revive_user', JSON.stringify(demoUser));
      setOnboardingOpen(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (authMethod === 'mobile') {
      const raw = loginPhone.replace(/\D/g, '');
      if (raw.length < 10) {
        alert(I18N[currentLang].phonePlaceholder);
        return;
      }
    } else {
      if (!loginEmail.includes('@') || !loginEmail.includes('.')) {
        alert('Please enter a valid email address.');
        return;
      }
    }

    setAuthLoading(true);
    setAuthMsg('');
    try {
      const payload: Record<string, string> = { role: authRole };
      if (authMethod === 'mobile') payload.phone = loginPhone.trim();
      else payload.email = loginEmail.trim();

      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthMsg(data.message);
        setLoginOtp(data.demo_otp || '123456');
        setOnboardingStep('otp_verify');
      } else {
        const err = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
        alert(err.detail || 'Failed to send OTP. Please check input.');
      }
    } catch {
      setAuthMsg(authMethod === 'email' ? 'Brevo SMTP simulation: OTP is 123456' : 'Demo mode simulation: OTP is 123456');
      setLoginOtp('123456');
      setOnboardingStep('otp_verify');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!loginOtp.trim()) {
      alert(I18N[currentLang].otpPlaceholder);
      return;
    }
    setAuthLoading(true);
    try {
      const payload: Record<string, string> = {
        otp: loginOtp.trim(),
        role: authRole,
      };
      if (authMethod === 'mobile') payload.phone = loginPhone.trim() || '9876543210';
      else payload.email = loginEmail.trim() || 'collector@revive.gov.in';

      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        const fallbackId = authRole === 'collector' ? 101 : authRole === 'recycler' ? 201 : 301;
        const resolvedId = u?.id || fallbackId;
        const userObj: UserProfile = {
          id: resolvedId,
          custom_user_id:
            u?.custom_user_id ||
            (authRole === 'collector'
              ? `REV-COL-2026-${String(resolvedId).padStart(4, '0')}`
              : authRole === 'recycler'
              ? `REV-REC-2026-${String(resolvedId).padStart(4, '0')}`
              : `CPCB-GOV-2026-${String(resolvedId).padStart(4, '0')}`),
          name:
            u?.name ||
            (authRole === 'collector'
              ? 'Ram Yadav'
              : authRole === 'recycler'
              ? 'EcoCycle Solutions Pvt Ltd'
              : 'CPCB National Regulator'),
          phone: u?.phone || (authMethod === 'mobile' ? loginPhone.trim() || '9876543210' : '9876543210'),
          email: u?.email || (authMethod === 'email' ? loginEmail.trim() || 'collector@revive.gov.in' : undefined),
          role: u?.role || authRole,
          language: (u?.language as Lang) || currentLang,
          location: u?.location || (authRole === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP'),
          company_name: u?.company_name || (authRole === 'recycler' ? 'EcoCycle Solutions Pvt Ltd' : undefined),
          license_no: u?.license_no || (authRole === 'recycler' ? 'CPCB/EW/2024/0981' : undefined),
          service_area: u?.service_area,
        };
        setCurrentUser(userObj);
        setActiveRole(userObj.role);
        setCurrentLang(userObj.language);
        setLandingView('landing');
        setOnboardingOpen(false);
        window.localStorage.setItem('revive_user', JSON.stringify(userObj));
        if (data.access_token || data.token) {
          window.localStorage.setItem('revive_token', data.access_token || data.token);
        }
      } else {
        const err = await res.json().catch(() => ({ detail: 'Invalid OTP code' }));
        alert(err.detail || 'Invalid OTP code. Please use demo OTP 123456.');
      }
    } catch {
      // In case of any network disconnection, activate seamless demo user
      const fallbackId = authRole === 'collector' ? 101 : authRole === 'recycler' ? 201 : 301;
      const demoUser: UserProfile = {
        id: fallbackId,
        custom_user_id:
          authRole === 'collector'
            ? 'REV-COL-2026-1024'
            : authRole === 'recycler'
            ? 'REV-REC-2026-0812'
            : 'CPCB-GOV-2026-0001',
        name:
          authRole === 'collector'
            ? 'Ram Yadav'
            : authRole === 'recycler'
            ? 'EcoCycle Solutions Pvt Ltd'
            : 'CPCB National Regulator',
        phone: authMethod === 'mobile' ? loginPhone.trim() || '9876543210' : '9876543210',
        email: authMethod === 'email' ? loginEmail.trim() || `${authRole}@revive.gov.in` : undefined,
        role: authRole,
        language: currentLang,
        location: authRole === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP',
      };
      setCurrentUser(demoUser);
      setActiveRole(demoUser.role);
      setCurrentLang(demoUser.language);
      setLandingView('landing');
      setOnboardingOpen(false);
      window.localStorage.setItem('revive_user', JSON.stringify(demoUser));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!profileName.trim()) {
      alert('Please enter your full name or company name');
      return;
    }
    setAuthLoading(true);
    const phoneToUse = loginPhone.trim() || '9876543210';
    const emailToUse = loginEmail.trim() || `${authRole}@revive.gov.in`;

    try {
      const payload: Record<string, string> = {
        name: profileName.trim(),
        location: profileLocation.trim() || (authRole === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP'),
        language: currentLang,
        role: authRole,
      };
      if (loginPhone.trim()) payload.phone = loginPhone.trim();
      if (loginEmail.trim()) payload.email = loginEmail.trim();
      if (authRole === 'recycler') {
        payload.company_name = regCompanyName.trim();
        payload.license_no = regLicenseNo.trim();
        payload.service_area = regServiceArea.trim();
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const userObj: UserProfile = {
          id: data.id,
          custom_user_id:
            data.custom_user_id ||
            (authRole === 'collector'
              ? `REV-COL-2026-${String(data.id).padStart(4, '0')}`
              : authRole === 'recycler'
              ? `REV-REC-2026-${String(data.id).padStart(4, '0')}`
              : `CPCB-GOV-2026-${String(data.id).padStart(4, '0')}`),
          name: data.name,
          phone: data.phone,
          email: data.email,
          role: (data.role as 'collector' | 'recycler' | 'admin') || authRole,
          language: (data.language as Lang) || currentLang,
          location: data.location || payload.location,
          company_name: data.company_name,
          license_no: data.license_no,
          service_area: data.service_area,
        };
        setCurrentUser(userObj);
        setActiveRole(userObj.role);
        window.localStorage.setItem('revive_user', JSON.stringify(userObj));
        setOnboardingOpen(false);
      } else {
        throw new Error('Profile setup fallback');
      }
    } catch {
      const fallbackId = Date.now();
      const fallbackUserId =
        authRole === 'collector'
          ? `REV-COL-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : authRole === 'recycler'
          ? `REV-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : `CPCB-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackUser: UserProfile = {
        id: fallbackId,
        custom_user_id: fallbackUserId,
        name: profileName.trim(),
        phone: phoneToUse,
        email: emailToUse,
        role: authRole,
        language: currentLang,
        location: profileLocation.trim() || (authRole === 'recycler' ? 'Pune, Maharashtra' : 'Bhopal, MP'),
        company_name: authRole === 'recycler' ? regCompanyName.trim() : undefined,
        license_no: authRole === 'recycler' ? regLicenseNo.trim() : undefined,
        service_area: authRole === 'recycler' ? regServiceArea.trim() : undefined,
      };
      setCurrentUser(fallbackUser);
      setActiveRole(authRole);
      window.localStorage.setItem('revive_user', JSON.stringify(fallbackUser));
      setOnboardingOpen(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('revive_user');
      window.localStorage.removeItem('revive_token');
    }
    setCurrentUser(null);
    setLoginPhone('');
    setLoginEmail('');
    setLoginOtp('');
    setAuthRole('collector');
    setAuthMethod('mobile');
    setOnboardingStep('language_choice');
    setOnboardingOpen(false);
    setLandingView('landing');
  };

  // If user is not authenticated, show landing page or auth modal
  if (!currentUser) {
    if (landingView === 'landing') {
      return (
        <LandingPage
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenAuth={(role, tab, step) => {
            setAuthRole(role);
            setAuthTab(tab);
            if (step) setOnboardingStep(step);
            setLandingView('auth');
          }}
          onSpeak={speakIndicText}
          isAudioPlaying={audioPlaying}
        />
      );
    }

    if (authTab === 'signup') {
      return (
        <SignupPage
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onNavigateLogin={() => setAuthTab('login')}
          onClose={() => setLandingView('landing')}
          authRole={authRole}
          setAuthRole={setAuthRole}
          profileName={profileName}
          setProfileName={setProfileName}
          loginPhone={loginPhone}
          setLoginPhone={setLoginPhone}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          profileLocation={profileLocation}
          setProfileLocation={setProfileLocation}
          regCompanyName={regCompanyName}
          setRegCompanyName={setRegCompanyName}
          regLicenseNo={regLicenseNo}
          setRegLicenseNo={setRegLicenseNo}
          regServiceArea={regServiceArea}
          setRegServiceArea={setRegServiceArea}
          authLoading={authLoading}
          authMsg={authMsg}
          onCompleteProfile={handleCompleteProfile}
        />
      );
    }

    return (
      <LoginPage
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onNavigateSignup={() => setAuthTab('signup')}
        onClose={() => setLandingView('landing')}
        authMethod={authMethod}
        setAuthMethod={setAuthMethod}
        authRole={authRole}
        setAuthRole={setAuthRole}
        loginPhone={loginPhone}
        setLoginPhone={setLoginPhone}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginOtp={loginOtp}
        setLoginOtp={setLoginOtp}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        authLoading={authLoading}
        authMsg={authMsg}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
        onQuickDemoLogin={handleQuickDemoLogin}
      />
    );
  }

  // Filtered lists
  const pendingOffers = offers.filter((offer) => offer.status === 'pending');
  const acceptedOffers = offers.filter((offer) => offer.status === 'accepted');
  const deliveredLots = lots.filter((lot) => lot.status === 'payment_completed');
  const verifiedRecyclerCount = recyclers.filter((recycler) => recycler.verified).length;
  const pendingVerificationCount = recyclers.length - verifiedRecyclerCount;
  const filteredRecyclers =
    verificationView === 'pending' ? recyclers.filter((recycler) => !recycler.verified) : recyclers;

  return (
    <div className="app-layout">
      {/* 1. UPPER NAVIGATION PANEL (NAVBAR) */}
      <Navbar
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activePage={activePage}
        setActivePage={setActivePage}
        recyclerSubView={recyclerSubView}
        setRecyclerSubView={setRecyclerSubView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        currentUser={currentUser}
        apiStatus={apiStatus}
        audioPlaying={audioPlaying}
        onSpeakPageSummary={speakPageSummary}
        onLogout={handleLogout}
        onOpenLiveScanner={() => setCameraScannerOpen(true)}
        isMobileView={isMobileLayout}
        onToggleAppMode={handleToggleAppMode}
        pendingOffersCount={pendingOffers.length}
        openAnomaliesCount={adminAnomalies.filter((a) => a.status === 'open').length}
        acceptedOffersCount={acceptedOffers.length}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <main className="main-content">

        {/* 3. CONDITIONAL PAGE RENDERING */}
        {activeRole === 'recycler' ? (
          <RecyclerPortal
            currentUser={currentUser}
            recyclerSubView={recyclerSubView}
            setRecyclerSubView={setRecyclerSubView}
            lots={lots}
            materials={materials}
            pendingOffers={pendingOffers}
            acceptedOffers={acceptedOffers}
            deliveredLots={deliveredLots}
            getStatusLabel={getStatusLabel}
            setOfferLotId={setOfferLotId}
            setOfferPrice={setOfferPrice}
            setOfferDialogOpen={setOfferDialogOpen}
            acceptOffer={acceptOffer}
            setHandoverLotId={setHandoverLotId}
            setHandoverDialogOpen={setHandoverDialogOpen}
            openPassport={openPassport}
          />
        ) : activeRole === 'admin' ? (
          <AdminPortal
            currentLang={currentLang}
            demoRunning={demoRunning}
            triggerSihDemo={triggerSihDemo}
            demoResult={demoResult}
            openPassport={openPassport}
            adminMetrics={adminMetrics}
            lots={lots}
            offers={offers}
            verifiedRecyclerCount={verifiedRecyclerCount}
            recyclers={recyclers}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            adminAnomalies={adminAnomalies}
            resolveAnomaly={resolveAnomaly}
            verificationView={verificationView}
            setVerificationView={setVerificationView}
            pendingVerificationCount={pendingVerificationCount}
            filteredRecyclers={filteredRecyclers}
            toggleRecyclerVerification={toggleRecyclerVerification}
            materials={materials}
            getStatusLabel={getStatusLabel}
            setTraceabilityLotId={setTraceabilityLotId}
          />
        ) : isMobileLayout ? (
          <div className="mobile-view-container">
            {activePage === 'home' && (
              <CollectorHome
                currentLang={currentLang}
                currentUser={currentUser}
                lots={lots}
                materials={materials}
                recyclers={recyclers}
                benchmarks={benchmarks}
                passportLookupRef={passportLookupRef}
                setPassportLookupRef={setPassportLookupRef}
                onOpenPassport={openPassport}
                aiImageFile={aiImageFile}
                setAiImageFile={setAiImageFile}
                aiLoading={aiLoading}
                aiResult={aiResult}
                onPredictMaterialWithAi={predictMaterialWithAi}
                onApplyAiPredictionToLot={applyAiPredictionToLot}
                onNavigatePage={setActivePage}
                getStatusLabel={getStatusLabel}
                onOpenLiveScanner={() => setCameraScannerOpen(true)}
              />
            )}

            {activePage === 'create_lot' && (
              <MobileScanView
                currentLang={currentLang}
                materials={materials}
                recyclers={recyclers}
                onSellNow={handleCameraSellNow}
                speakIndicText={speakIndicText}
                onNavigateLots={() => setActivePage('transactions')}
              />
            )}

            {activePage === 'price_board' && (
              <MobilePriceBoard
                currentLang={currentLang}
                materials={materials}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                onNavigateScanWithMaterial={(matId) => {
                  setNewLotMaterialId(matId);
                  setActivePage('create_lot');
                }}
              />
            )}

            {activePage === 'find_recycler' && (
              <MobileRecyclersView
                currentLang={currentLang}
                onNavigateScan={() => setActivePage('create_lot')}
              />
            )}

            {activePage === 'earnings' && (
              <MobileEarningsView
                currentLang={currentLang}
                currentUser={currentUser}
                onNavigateScan={() => setActivePage('create_lot')}
              />
            )}

            {activePage === 'transactions' && (
              <MobileLotsView
                currentLang={currentLang}
                lots={lots}
                materials={materials}
                offers={offers}
                onOpenPassport={(lotId) => openPassport(lotId)}
                onOpenTraceability={(lotId) => setTraceabilityLotId(lotId)}
                onOpenHandover={(lotId, weight) => {
                  setHandoverLotId(lotId);
                  setHandoverFinalWeight(String(weight));
                  setHandoverDialogOpen(true);
                }}
                onCompletePayment={(lotId) => completePayment(lotId)}
                onNavigateScan={() => setActivePage('create_lot')}
                getStatusLabel={getStatusLabel}
              />
            )}

            {activePage === 'safety' && (
              <MobileSafetyView
                currentLang={currentLang}
                speakIndicText={speakIndicText}
                audioPlaying={audioPlaying}
              />
            )}

            {activePage === 'profile' && (
              <MobileProfileView
                currentLang={currentLang}
                setCurrentLang={setCurrentLang}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                handleLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          <div className="collector-multipage-view">
            {activePage === 'home' && (
              <CollectorHome
                currentLang={currentLang}
                currentUser={currentUser}
                lots={lots}
                materials={materials}
                recyclers={recyclers}
                benchmarks={benchmarks}
                passportLookupRef={passportLookupRef}
                setPassportLookupRef={setPassportLookupRef}
                onOpenPassport={openPassport}
                aiImageFile={aiImageFile}
                setAiImageFile={setAiImageFile}
                aiLoading={aiLoading}
                aiResult={aiResult}
                onPredictMaterialWithAi={predictMaterialWithAi}
                onApplyAiPredictionToLot={applyAiPredictionToLot}
                onNavigatePage={setActivePage}
                getStatusLabel={getStatusLabel}
                onOpenLiveScanner={() => setCameraScannerOpen(true)}
              />
            )}

            {activePage === 'create_lot' && (
              <CreateLotPage
                currentLang={currentLang}
                materials={materials}
                aiImageFile={aiImageFile}
                setAiImageFile={setAiImageFile}
                aiLoading={aiLoading}
                aiResult={aiResult}
                onPredictMaterialWithAi={predictMaterialWithAi}
                newLotMaterialId={newLotMaterialId}
                setNewLotMaterialId={setNewLotMaterialId}
                newLotQuantity={newLotQuantity}
                setNewLotQuantity={setNewLotQuantity}
                selectedScrapCondition={selectedScrapCondition}
                setSelectedScrapCondition={setSelectedScrapCondition}
                lotSuccessMsg={lotSuccessMsg}
                onCreateLot={createLot}
                onBack={() => setActivePage('home')}
                onNavigateTransactions={() => setActivePage('transactions')}
              />
            )}

            {activePage === 'price_board' && (
              <PriceBoardPage
                currentLang={currentLang}
                materials={materials}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                onNavigateCreateLotWithMaterial={(matId) => {
                  setNewLotMaterialId(matId);
                  setActivePage('create_lot');
                }}
                onNavigateCreateLot={() => setActivePage('create_lot')}
              />
            )}

            {activePage === 'find_recycler' && (
              <FindRecyclerPage
                currentLang={currentLang}
                onNavigateCreateLot={() => setActivePage('create_lot')}
                onRequestPickup={(recId) => {
                  setOfferRecyclerId(recId);
                  setActivePage('create_lot');
                }}
              />
            )}

            {activePage === 'earnings' && (
              <EarningsPage
                currentLang={currentLang}
                currentUser={currentUser}
                onNavigateCreateLot={() => setActivePage('create_lot')}
              />
            )}

            {activePage === 'transactions' && (
              <TransactionsPage
                currentLang={currentLang}
                lots={lots}
                materials={materials}
                offers={offers}
                txStatusFilter={txStatusFilter}
                setTxStatusFilter={setTxStatusFilter}
                setActivePage={setActivePage}
                speakIndicText={speakIndicText}
                setHandoverLotId={setHandoverLotId}
                setHandoverFinalWeight={setHandoverFinalWeight}
                setHandoverDialogOpen={setHandoverDialogOpen}
                completePayment={completePayment}
                openPassport={openPassport}
                setTraceabilityLotId={setTraceabilityLotId}
                getStatusLabel={getStatusLabel}
              />
            )}

            {activePage === 'safety' && (
              <SafetyPage
                currentLang={currentLang}
                setActivePage={setActivePage}
                speakIndicText={speakIndicText}
                audioPlaying={audioPlaying}
              />
            )}

            {activePage === 'profile' && (
              <ProfilePage
                currentLang={currentLang}
                setCurrentLang={setCurrentLang}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                activeRole={activeRole}
                setActivePage={setActivePage}
                handleLogout={handleLogout}
              />
            )}
          </div>
        )}

        {/* 4. MODAL DIALOGS */}
        <OfferModal
          isOpen={offerDialogOpen}
          onClose={() => setOfferDialogOpen(false)}
          offerLotId={offerLotId}
          setOfferLotId={setOfferLotId}
          offerRecyclerId={offerRecyclerId}
          setOfferRecyclerId={setOfferRecyclerId}
          offerPrice={offerPrice}
          setOfferPrice={setOfferPrice}
          lots={lots}
          materials={materials}
          recyclers={recyclers}
          submitOffer={submitOffer}
        />

        <HandoverModal
          isOpen={handoverDialogOpen}
          onClose={() => setHandoverDialogOpen(false)}
          handoverLotId={handoverLotId}
          setHandoverLotId={setHandoverLotId}
          handoverFinalWeight={handoverFinalWeight}
          setHandoverFinalWeight={setHandoverFinalWeight}
          handoverLocation={handoverLocation}
          setHandoverLocation={setHandoverLocation}
          lots={lots}
          materials={materials}
          confirmHandover={confirmHandover}
        />

        <TraceabilityModal
          traceabilityLotId={traceabilityLotId}
          onClose={() => setTraceabilityLotId(null)}
          traceabilityLoading={traceabilityLoading}
          traceabilityData={traceabilityData}
          lots={lots}
          materials={materials}
          recyclers={recyclers}
          offers={offers}
        />

        <PassportModal
          isOpen={passportModalOpen}
          onClose={() => setPassportModalOpen(false)}
          passportLoading={passportLoading}
          selectedPassport={selectedPassport}
          currentLang={currentLang}
          getStatusLabel={getStatusLabel}
        />

        {/* 5. MOBILE LIVE CAMERA SCANNER MODAL */}
        <CameraScannerModal
          isOpen={cameraScannerOpen}
          onClose={() => setCameraScannerOpen(false)}
          currentLang={currentLang}
          materials={materials}
          recyclers={recyclers}
          onSellNow={handleCameraSellNow}
          speakIndicText={speakIndicText}
        />

        {/* 6. MOBILE STICKY BOTTOM NAVIGATION (COLLECTOR) */}
        {activeRole === 'collector' && (
          <MobileBottomNav
            activePage={activePage}
            setActivePage={setActivePage}
            currentLang={currentLang}
            onOpenLiveScanner={() => setCameraScannerOpen(true)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
