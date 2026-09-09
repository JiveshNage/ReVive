import React, { useState } from 'react';
import { Lang, I18N, ActivePage } from '../../types';

interface SafetyPageProps {
  currentLang: Lang;
  setActivePage: (page: ActivePage) => void;
  speakIndicText: (text: string, lang?: Lang) => void;
  audioPlaying: boolean;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({
  currentLang,
  setActivePage,
  speakIndicText,
  audioPlaying,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'chemical' | 'dodonts' | 'ppe'>('all');
  const [audioLang, setAudioLang] = useState<Lang>(currentLang);

  const triggerSafetySpeech = (targetLang: Lang = audioLang) => {
    const speechMap: Record<Lang, string> = {
      hi: 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! तारों को आग कभी मत लगाओ। एसिड से सोना मत निकालो। बैटरी को न तोड़ें, न जलाएं। सारा ई-कचरा सीधे प्रमाणित सीपीसीबी रीसाइक्लर को सौंपें और पूरा दाम पाएं।',
      mr: 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! तारा उघड्यावर जाळू नका. ॲसिड वापरून सोने काढू नका. बॅटरी फोडू नका. सर्व ई-कचरा अधिकृत सीपीसीबी रिसायकलरला द्या आणि योग्य मोबदला मिळवा.',
      en: 'Do not burn cables, do not leach circuit boards with acid! Protect your lungs and environment. Never smash batteries or CRT displays. Hand over electronic scrap directly to CPCB authorized recyclers through ReVive for safe handling and guaranteed payments.',
    };
    speakIndicText(speechMap[targetLang], targetLang);
  };

  const hazards = [
    {
      id: 'battery',
      category: 'critical',
      title: 'Lithium-Ion & Lead Acid Batteries',
      titleHi: 'लिथियम-आयन व लेड एसिड बैटरियां',
      icon: '🔋',
      iconType: 'battery',
      severity: 'CRITICAL FIRE & EXPLOSION',
      severityType: 'danger',
      risk: 'Explosion, catastrophic thermal runaway reaching 800°C, and severe sulfuric acid skin burns. Releases toxic hydrofluoric gas if crushed.',
      riskHi: 'धमाका, 800 डिग्री तक अत्यधिक आग, और तेजाब से त्वचा का जलना। टूटने पर जहरीली हाइड्रोफ्लोरिक गैस निकलती है।',
      action: 'Tape all exposed terminal poles with non-conductive PVC tape. Store in a cool, dry sandbox away from rain, flammables, and direct sunlight.',
      actionHi: 'सभी टर्मिनल पिनों पर इंसुलेशन टेप लगाएं। पानी और धूप से दूर सूखी रेत वाली जगह पर रखें।',
      route: 'Certified Hydrometallurgical Battery Recycler',
    },
    {
      id: 'cables',
      category: 'chemical',
      title: 'Open Cable & Wire Burning',
      titleHi: 'खुले मैदान में केबल व तार जलाना',
      icon: '🔥',
      iconType: 'fire',
      severity: 'DEADLY DIOXINS & NEUROTOXIN',
      severityType: 'danger',
      risk: 'Releases cancer-causing polychlorinated dioxins and furans. Inhaling fumes causes irreversible pulmonary fibrosis, chronic asthma, and neurological harm.',
      riskHi: 'कैंसर पैदा करने वाली डायऑक्सिन और फ्यूरान गैसें। धुएं से फेफड़े खराब होते हैं और गंभीर दमा होता है।',
      action: 'Never ignite PVC or rubber insulation. Sell unburnt cables directly on ReVive to recyclers with high-speed automated mechanical strippers.',
      actionHi: 'तारों को कभी आग मत लगाएं। बिना जलाए सीधे मैकेनिकल स्ट्रिपर वाले रीसाइक्लर को बेचें।',
      route: 'CPCB Automated Wire Granulation & Stripping Facility',
    },
    {
      id: 'crt',
      category: 'critical',
      title: 'CRT Monitor Glass & Mercury Lamps',
      titleHi: 'सीआरटी मॉनिटर व फ्लोरोसेंट ट्यूब',
      icon: '📺',
      iconType: 'toxic',
      severity: 'LEAD POISON & MERCURY VAPOR',
      severityType: 'warning',
      risk: 'Funnel glass contains 1.5–2.5 kg of toxic lead oxide. CCFL fluorescent backlights release elemental mercury vapor which destroys the nervous system.',
      riskHi: 'कांच में 2 किलो तक जहरीला सीसा (Lead) होता है। ट्यूब टूटने पर पारा (Mercury) हवा में घुल जाता है।',
      action: 'Handle glass housings gently with cut-resistant gloves and safety goggles. Never hammer CRT glass or smash tubes into common scrap piles.',
      actionHi: 'मोटे दस्ताने और चश्मा पहनकर संभालें। हथौड़े से स्क्रीन या ट्यूब को कभी मत तोड़ें।',
      route: 'Specialized Lead Smelters & Mercury Distillation Retorts',
    },
    {
      id: 'pcb',
      category: 'chemical',
      title: 'Printed Circuit Boards (Acid Leaching)',
      titleHi: 'सर्किट बोर्ड (एसिड व तेजाब धुलाई)',
      icon: '💻',
      iconType: 'acid',
      severity: 'LETHAL NO₂ & CYANIDE VAPORS',
      severityType: 'danger',
      risk: 'Informal aqua regia, nitric acid, and cyanide baths produce lethal nitrogen dioxide gas (NO₂), cause chemical burns, and contaminate drinking water.',
      riskHi: 'नाइट्रिक एसिड व साइनाइड से जानलेवा नाइट्रोजन डाइऑक्साइड गैस बनती है और भूजल जहरीला होता है।',
      action: 'Keep motherboards and circuit boards whole. Do not use chemical acid washes. Authorized recyclers recover 99%+ gold cleanly using closed-loop systems.',
      actionHi: 'मदरबोर्ड को साबुत रखें। तेजाब में मत धोएं। रजिस्टर्ड रिफाइनरी में 99% सोना सुरक्षित निकलता है।',
      route: 'CPCB Closed-Loop Hydrometallurgical Refining Center',
    },
    {
      id: 'capacitors',
      category: 'chemical',
      title: 'Heavy Capacitors & Transformers (PCBs)',
      titleHi: 'कैपेसिटर व ट्रांसफार्मर ऑयल (पीसीबी)',
      icon: '⚡',
      iconType: 'battery',
      severity: 'PERSISTENT BIO-TOXIN (POPs)',
      severityType: 'warning',
      risk: 'Older dielectric fluids and oil capacitors contain Polychlorinated Biphenyls (PCBs) which trigger endocrine failure, liver tumors, and chloracne.',
      riskHi: 'पुराने कैपेसिटर के तेल में खतरनाक रसायन होते हैं जो लीवर और त्वचा को गंभीर नुकसान पहुंचाते हैं।',
      action: 'Inspect transformers for oil leaks. Never drain chemical oils into municipal sewers or soil. Store upright in double-contained steel drums.',
      actionHi: 'तेल को कभी नाली या मिट्टी में न बहाएं। लीक होने पर तुरंत सूखे ड्रम में अलग रखें।',
      route: 'High-Temperature Hazardous Waste Incineration (TSDF)',
    },
  ];

  const filteredHazards = hazards.filter((h) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return h.category === 'critical';
    if (activeTab === 'chemical') return h.category === 'chemical';
    return false;
  });

  return (
    <div className="safety-page-wrap">
      {/* Top Header Hero */}
      <div className="safety-header-hero">
        <div>
          <span className="safety-header-badge">
            🛡️ CPCB OCCUPATIONAL SAFETY DIRECTIVE 2026
          </span>
          <h1>
            🛡️ {I18N[currentLang].safetyTitle}
          </h1>
          <p>
            {currentLang === 'hi'
              ? 'कबाड़ संग्रह और पृथक्करण के दौरान अपनी सेहत, परिवार और पर्यावरण को जहरीले धुएं, रसायनों और भारी धातुओं से सुरक्षित रखें।'
              : currentLang === 'mr'
              ? 'कचरा गोळा करताना आणि वेगळे करताना तुमचे आरोग्य, कुटुंब आणि पर्यावरण विषारी धूर, रसायने व धातूंपासून सुरक्षित ठेवा.'
              : 'Protect your health, family, and environment from hazardous substances, toxic fumes, and chemical leaching during electronic scrap handling.'}
          </p>
        </div>

        <div className="safety-header-actions">
          <button className="safety-back-btn" onClick={() => setActivePage('home')}>
            ← {I18N[currentLang].backBtn}
          </button>
          <div className="safety-hotline-badge">
            <span className="safety-pulse-dot"></span>
            <span>Hazmat Helpline: <strong>1800-11-0031</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Vernacular Audio Directive Banner */}
      <div className="safety-directive-banner">
        <div className="safety-directive-content">
          <div className="safety-directive-tag">
            📢 {currentLang === 'hi' ? 'राष्ट्रीय सुरक्षा निर्देश · सीपीसीबी' : 'Statutory Safety Directive · SIH 2026'}
          </div>
          <h2>
            {audioLang === 'hi'
              ? 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! एसिड से मत धो, रीसाइक्लर को दो!'
              : audioLang === 'mr'
              ? 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! ॲसिड वापरू नका, प्रमाणित रिसायकलरला द्या!'
              : 'Do not burn cables, do not leach with acid! Protect your lungs and soil!'}
          </h2>
          <p>
            {audioLang === 'hi'
              ? 'तारों को खुले में जलाने और तेजाब से तांबा/सोना निकालने से निकलने वाले जहरीले धुएं से फेफड़े खराब होते हैं और कैंसर का खतरा बढ़ता है।'
              : audioLang === 'mr'
              ? 'उघड्यावर तारा जाळल्याने आणि ॲसिडने धातू काढल्याने हवेत विषारी वायू पसरून फुफ्फुसांचे गंभीर आजार होतात.'
              : 'Informal open burning and chemical acid leaching release carcinogenic dioxins, furans, and heavy neurotoxins directly into your lungs.'}
          </p>
        </div>

        <div className="safety-directive-controls">
          <button
            type="button"
            className={`safety-audio-cta ${audioPlaying ? 'is-playing' : ''}`}
            onClick={() => triggerSafetySpeech(audioLang)}
          >
            <span>{audioPlaying ? '⏹️' : '🔊'}</span>
            <span>
              {audioPlaying
                ? (audioLang === 'hi' ? 'आवाज़ चल रही है...' : 'Playing Audio...')
                : (audioLang === 'hi' ? 'सुरक्षा नियम सुनें (Audio)' : 'Listen Vernacular Audio')}
            </span>
          </button>

          <div className="safety-lang-toggles">
            <button
              type="button"
              className={`safety-lang-pill ${audioLang === 'hi' ? 'active' : ''}`}
              onClick={() => {
                setAudioLang('hi');
                triggerSafetySpeech('hi');
              }}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              type="button"
              className={`safety-lang-pill ${audioLang === 'mr' ? 'active' : ''}`}
              onClick={() => {
                setAudioLang('mr');
                triggerSafetySpeech('mr');
              }}
            >
              🚩 मराठी
            </button>
            <button
              type="button"
              className={`safety-lang-pill ${audioLang === 'en' ? 'active' : ''}`}
              onClick={() => {
                setAudioLang('en');
                triggerSafetySpeech('en');
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Navigation / Filter Tabs */}
      <div className="safety-nav-tabs">
        <button
          type="button"
          className={`safety-nav-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>🚨</span> {currentLang === 'hi' ? 'सभी मुख्य जोखिम' : 'All Primary Hazards'} ({hazards.length})
        </button>
        <button
          type="button"
          className={`safety-nav-tab ${activeTab === 'critical' ? 'active' : ''}`}
          onClick={() => setActiveTab('critical')}
        >
          <span>💥</span> {currentLang === 'hi' ? 'आग व विस्फोट जोखिम' : 'Fire & Explosion Hazards'}
        </button>
        <button
          type="button"
          className={`safety-nav-tab ${activeTab === 'chemical' ? 'active' : ''}`}
          onClick={() => setActiveTab('chemical')}
        >
          <span>🧪</span> {currentLang === 'hi' ? 'एसिड व जहरीला धुआं' : 'Acid & Chemical Vapors'}
        </button>
        <button
          type="button"
          className={`safety-nav-tab ${activeTab === 'dodonts' ? 'active' : ''}`}
          onClick={() => setActiveTab('dodonts')}
        >
          <span>⚖️</span> {currentLang === 'hi' ? 'क्या करें / क्या न करें' : "Do's & Don'ts Comparison"}
        </button>
        <button
          type="button"
          className={`safety-nav-tab ${activeTab === 'ppe' ? 'active' : ''}`}
          onClick={() => setActiveTab('ppe')}
        >
          <span>🦺</span> {currentLang === 'hi' ? 'सुरक्षा किट (PPE)' : 'Mandatory Safety Gear'}
        </button>
      </div>

      {/* Hazardous Materials Cards Grid */}
      {(activeTab === 'all' || activeTab === 'critical' || activeTab === 'chemical') && (
        <div className="safety-hazard-grid">
          {filteredHazards.map((h) => (
            <div
              key={h.id}
              className={`safety-hazard-card ${h.severityType === 'danger' ? 'critical' : 'warning'}`}
            >
              <div className="safety-card-top">
                <div className={`safety-card-icon-wrap ${h.iconType}`}>
                  {h.icon}
                </div>
                <span className={`safety-hazard-pill ${h.severityType}`}>
                  {h.severity}
                </span>
              </div>

              <h3>{currentLang === 'hi' ? h.titleHi : h.title}</h3>

              <div className="safety-risk-box">
                <strong>⚠️ {currentLang === 'hi' ? 'स्वास्थ्य व जीवन का खतरा:' : 'Health Consequence:'}</strong>
                {currentLang === 'hi' ? h.riskHi : h.risk}
              </div>

              <div className="safety-action-box">
                <strong>🛡️ {currentLang === 'hi' ? 'अनिवार्य सुरक्षित तरीका:' : 'Mandatory Safe Handling:'}</strong>
                {currentLang === 'hi' ? h.actionHi : h.action}
              </div>

              <div className="safety-route-badge">
                <span>🏭</span>
                <span>{h.route}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Do's & Don'ts Comparison Section */}
      {(activeTab === 'all' || activeTab === 'dodonts') && (
        <div className="safety-dodonts-section">
          <h2 className="safety-section-title">
            <span>⚖️</span> {currentLang === 'hi' ? 'सुरक्षित कार्य पद्धतियां (तुलना चार्ट)' : "Statutory Handling Standards (Do's vs Don'ts)"}
          </h2>
          <p className="safety-section-subtitle">
            {currentLang === 'hi'
              ? 'सीपीसीबी ई-कचरा नियम 2022 के तहत अनुमत व प्रतिबंधित गतिविधियों का स्पष्ट विवरण'
              : 'Clear standards compliant with the Ministry of Environment E-Waste (Management) Rules 2022.'}
          </p>

          <div className="safety-split-grid">
            {/* Do's Panel */}
            <div className="safety-split-panel dos">
              <div className="safety-split-panel-header">
                <span style={{ fontSize: '24px' }}>✅</span>
                <h3>{I18N[currentLang].dosTitle || '✓ Safe Handling Best Practices (Always Follow)'}</h3>
              </div>
              <div className="safety-rules-list">
                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🧤</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'हमेशा मजबूत दस्ताने व जूते पहनें' : 'Wear Protective Gloves & Boots'}</strong>
                    <p>{currentLang === 'hi' ? 'धारदार पीसीबी पिंस, कांच और एसिड रिसाव से बचने के लिए कट-रेजिस्टेंट दस्ताने पहनें।' : 'Shield hands and feet from glass shards, sharp soldered pins, and corrosive electrolytes.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🔋</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'बैटरी को तुरंत अलग करें' : 'Isolate Batteries Instantly'}</strong>
                    <p>{currentLang === 'hi' ? 'मिश्रित ई-कचरे से बैटरी को तुरंत अलग कर सूखे रेत वाले बक्से में रखें ताकि शॉर्ट सर्किट न हो।' : 'Separate lithium & lead batteries immediately into dry, sand-lined bins with terminal ends taped.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">📦</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'सूखे व हवादार शेड में रखें' : 'Sheltered, Ventilated Storage'}</strong>
                    <p>{currentLang === 'hi' ? 'कबाड़ को बच्चों और बारिश के पानी से दूर पक्के शेड में रखें ताकि भूजल में रसायन न घुलें।' : 'Store scrap under covered roofs away from stormwater runoff, children, and domestic areas.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🧾</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'डिजिटल हैंडओवर पर्ची मांगें' : 'Insist on Digital Handover Receipts'}</strong>
                    <p>{currentLang === 'hi' ? 'ReVive पोर्टल के माध्यम से डिजिटल प्रमाण लें ताकि आप किसी भी कानूनी जांच से पूरी तरह सुरक्षित रहें।' : 'Demand digital QR handover records on ReVive to verify transfer to licensed CPCB recyclers.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🧼</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'काम के बाद साबुन से हाथ धोएं' : 'Post-Work Hygiene Protocol'}</strong>
                    <p>{currentLang === 'hi' ? 'कबाड़ छूने के बाद खाना खाने या घर जाने से पहले हाथ-मुंह साबुन से अच्छी तरह साफ करें।' : 'Decontaminate hands and face with soap before eating to prevent accidental lead and heavy metal ingestion.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Don'ts Panel */}
            <div className="safety-split-panel donts">
              <div className="safety-split-panel-header">
                <span style={{ fontSize: '24px' }}>🚫</span>
                <h3>{I18N[currentLang].dontsTitle || '❌ Unsafe Practices (Strictly Prohibited)'}</h3>
              </div>
              <div className="safety-rules-list">
                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🔥</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'तारों को कभी आग मत लगाएं' : 'NEVER Burn Wires or Plastic Sheaths'}</strong>
                    <p>{currentLang === 'hi' ? 'खुले में प्लास्टिक जलाने पर निकलने वाला धुआं फेफड़ों का कैंसर और दमा करता है। यह कानूनन जुर्म है।' : 'Open burning releases neurotoxic dioxins and carries penalties up to ₹1,00,000 under E-Waste Rules 2022.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🧪</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'तेजाब से सोना निकालने की कोशिश न करें' : 'NEVER Leach Gold With Acid Baths'}</strong>
                    <p>{currentLang === 'hi' ? 'नाइट्रिक एसिड या साइनाइड की भाप सीधे फेफड़े गला देती है और नाली का पानी जहर बन जाता है।' : 'Acid leaching generates lethal nitrogen dioxide (NO₂) fumes and pollutes community drinking aquifers.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🔨</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'सीआरटी कांच या लाइट ट्यूब न फोड़ें' : 'NEVER Smash CRT Glass or CCFL Tubes'}</strong>
                    <p>{currentLang === 'hi' ? 'कांच तोड़ने पर लेड की धूल और पारे (Mercury) की गैस पूरे मोहल्ले की हवा में जहर घोल देती है।' : 'Smashing funnels disperses 2 kg of lead oxide dust and elemental mercury directly into worker breathing zones.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">🏭</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'बिना लाइसेंस वाली भट्ठियों को न बेचें' : 'NEVER Sell to Unregistered Backyard Smelters'}</strong>
                    <p>{currentLang === 'hi' ? 'अवैध भट्ठियों में कबाड़ बेचने पर कानूनी जब्ती और भारी जुर्माने की सीधी जिम्मेदारी कबाड़ी की होती है।' : 'Trading with unauthorized bhattis risks immediate impoundment and cancellation of collection rights.'}</p>
                  </div>
                </div>

                <div className="safety-rule-item">
                  <span className="safety-rule-icon">👶</span>
                  <div className="safety-rule-text">
                    <strong>{currentLang === 'hi' ? 'बच्चों को ई-कचरे से दूर रखें' : 'NEVER Involve Children in Scrap Dismantling'}</strong>
                    <p>{currentLang === 'hi' ? 'लेड और कैडमियम की हल्की सी भी मात्रा बच्चों के दिमागी विकास को हमेशा के लिए रोक देती है।' : 'Lead and mercury exposure irreversibly harms children’s neural and cognitive development.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PPE Gear Section */}
      {(activeTab === 'all' || activeTab === 'ppe') && (
        <div className="safety-ppe-section">
          <h2 className="safety-section-title">
            <span>🦺</span> {currentLang === 'hi' ? 'अनिवार्य सुरक्षा उपकरण (PPE Gear Checklist)' : 'Mandatory Personal Protective Equipment (PPE)'}
          </h2>
          <p className="safety-section-subtitle">
            {currentLang === 'hi'
              ? 'हर कबाड़ी भाई व स्क्रैप कार्यकर्ता के पास काम के समय यह 4 सुरक्षा उपकरण होना आवश्यक है'
              : 'The four essential protective layers required during any sorting, weighing, or transport of e-waste.'}
          </p>

          <div className="safety-ppe-grid">
            <div className="safety-ppe-card">
              <span className="safety-ppe-icon">🧤</span>
              <strong>{currentLang === 'hi' ? 'कट-रेजिस्टेंट नाइट्राइल दस्ताने' : 'Cut-Resistant Nitrile Gloves'}</strong>
              <p>{currentLang === 'hi' ? 'लेवल 5 सुरक्षा: धारदार तांबे, एल्युमिनियम और एसिड रिसाव से बचाव।' : 'Level 5 cut protection against sharp copper, solder burrs, and corrosive electrolytes.'}</p>
            </div>

            <div className="safety-ppe-card">
              <span className="safety-ppe-icon">🥽</span>
              <strong>{currentLang === 'hi' ? 'इम्पैक्ट सेफ्टी चश्मा' : 'Sealed Impact Safety Goggles'}</strong>
              <p>{currentLang === 'hi' ? 'कांच के कणों, बैटरी वेंटिंग और धूल से आंखों की शत-प्रतिशत सुरक्षा।' : 'Shields eyes from glass implosion splinters, electrolyte venting, and metal particles.'}</p>
            </div>

            <div className="safety-ppe-card">
              <span className="safety-ppe-icon">😷</span>
              <strong>{currentLang === 'hi' ? 'एन-95 / एक्टिव कार्बन मास्क' : 'N95 / Organic Vapor Respirator'}</strong>
              <p>{currentLang === 'hi' ? 'लेड डस्ट, भारी धातु कणों और जहरीली गैसों को फेफड़ों में जाने से रोकता है।' : 'Filters airborne lead-phosphor particulate dust and noxious trace volatile gases.'}</p>
            </div>

            <div className="safety-ppe-card">
              <span className="safety-ppe-icon">🥾</span>
              <strong>{currentLang === 'hi' ? 'स्टील-टो एंटी-स्किड बूट्स' : 'Steel-Toe Non-Slip Work Boots'}</strong>
              <p>{currentLang === 'hi' ? 'भारी ट्रांसफार्मर व कबाड़ गिरने पर पैरों और उंगलियों को सुरक्षित रखता है।' : 'Protects feet from falling heavy chassis, motors, sharp scrap, and slippery spill surfaces.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Legal Assurance Banner */}
      <div className="safety-legal-card">
        <div className="safety-legal-text">
          <span>⚖️ STATUTORY COMPLIANCE & LEGAL ASSURANCE</span>
          <h4>
            {currentLang === 'hi'
              ? 'सीपीसीबी ई-कचरा प्रबंधन नियम 2022 एवं पर्यावरण संरक्षण अधिनियम 1986'
              : 'CPCB E-Waste (Management) Rules 2022 & Environment (Protection) Act 1986'}
          </h4>
          <p>
            {currentLang === 'hi'
              ? 'ReVive से जुड़े सभी कबाड़ी साथी सुरक्षित व अधिकृत नेटवर्क का हिस्सा हैं। अपने कबाड़ का डिजिटल इंद्राज करके आप सरकारी नियमों का पूरा पालन करते हैं और सुरक्षित पारदर्शी भुगतान पाते हैं।'
              : 'By using ReVive to transfer e-waste directly to authorized CPCB recyclers, collectors are fully indemnified against informal handling penalties while securing guaranteed minimum support prices.'}
          </p>
        </div>

        <div className="safety-legal-seal">
          <span style={{ fontSize: '32px' }}>🏛️</span>
          <div>
            <strong>CPCB COMPLIANT</strong>
            <small>Zero Hazard Escrow Network</small>
          </div>
        </div>
      </div>
    </div>
  );
};
