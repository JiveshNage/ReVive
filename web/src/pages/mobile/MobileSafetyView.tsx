import React, { useState } from 'react';
import { Lang } from '../../types';

export interface MobileSafetyViewProps {
  currentLang: Lang;
  speakIndicText: (text: string, lang?: Lang) => void;
  audioPlaying: boolean;
}

export const MobileSafetyView: React.FC<MobileSafetyViewProps> = ({
  currentLang,
  speakIndicText,
  audioPlaying,
}) => {
  const [mobileLang, setMobileLang] = useState<Lang>(currentLang);

  const playSafetySpeech = (targetLang: Lang = mobileLang) => {
    const msg =
      targetLang === 'hi'
        ? 'कचरा मत जलाओ! फेफड़े और सेहत बचाओ! एसिड से तांबा मत निकालो, सीधे प्रमाणित रीसाइक्लर को दो। बैटरी को कभी न तोड़ें।'
        : targetLang === 'mr'
        ? 'कचरा जाळू नका! आरोग्य वाचवा! ॲसिड वापरू नका, प्रमाणित रिसायकलरला द्या. बॅटरी फोडू नका.'
        : 'Do not burn cables or break batteries! Deliver hazardous electronic scrap only to authorized CPCB recyclers.';
    speakIndicText(msg, targetLang);
  };

  return (
    <div className="mobile-view-container" style={{ paddingBottom: '90px' }}>
      <div className="mobile-page-title-row">
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px' }}>
            CPCB Safety Directives
          </span>
          <h2 style={{ margin: '6px 0 2px', fontSize: '20px', color: '#0c3b2d' }}>
            🛡️ {currentLang === 'hi' ? 'स्वास्थ्य व सामग्री सुरक्षा' : 'Material Safety Guidance'}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            {currentLang === 'hi' ? 'सीपीसीबी दिशा-निर्देश व सुरक्षित काम करने के नियम' : 'Occupational safety standards & hazardous scrap rules'}
          </p>
        </div>
      </div>

      {/* Audio Slogan Card */}
      <div className="safety-directive-banner" style={{ padding: '18px 20px', margin: '14px 0 20px', borderRadius: '16px' }}>
        <div className="safety-directive-content" style={{ minWidth: 'unset' }}>
          <div className="safety-directive-tag" style={{ fontSize: '10px' }}>
            📢 {currentLang === 'hi' ? 'राष्ट्रीय सुरक्षा निर्देश · सीपीसीबी' : 'Statutory Safety Directive'}
          </div>
          <h3 style={{ margin: '4px 0 6px', fontSize: '16px', color: '#78350f', lineHeight: 1.35 }}>
            {mobileLang === 'hi'
              ? 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! एसिड से मत धो, रीसाइक्लर को दो!'
              : mobileLang === 'mr'
              ? 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! ॲसिड वापरू नका!'
              : 'Do not burn cables, do not leach with acid! Protect your lungs and soil.'}
          </h3>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#92400e' }}>
            {mobileLang === 'hi'
              ? 'खुले में तार जलाने से कैंसर कारक धुआं निकलता है। रीसाइक्लर को बिना जलाए सीधे बेचें।'
              : 'Informal burning emits toxic dioxins. Sell directly to authorized mechanical strippers.'}
          </p>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`safety-audio-cta ${audioPlaying ? 'is-playing' : ''}`}
              style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px' }}
              onClick={() => playSafetySpeech(mobileLang)}
            >
              <span>{audioPlaying ? '⏹️' : '🔊'}</span>
              <span>{audioPlaying ? 'आवाज़ चालू है...' : 'नियम सुनें (Audio)'}</span>
            </button>

            <div className="safety-lang-toggles" style={{ padding: '2px' }}>
              <button
                type="button"
                className={`safety-lang-pill ${mobileLang === 'hi' ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => {
                  setMobileLang('hi');
                  playSafetySpeech('hi');
                }}
              >
                हिन्दी
              </button>
              <button
                type="button"
                className={`safety-lang-pill ${mobileLang === 'mr' ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => {
                  setMobileLang('mr');
                  playSafetySpeech('mr');
                }}
              >
                मराठी
              </button>
              <button
                type="button"
                className={`safety-lang-pill ${mobileLang === 'en' ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => {
                  setMobileLang('en');
                  playSafetySpeech('en');
                }}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hazard Warning Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0c3b2d' }}>
          🚨 {currentLang === 'hi' ? 'प्रमुख जोखिम और बचाव' : 'Key Hazards & Actions'}
        </h3>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>4 Categories</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[
          { icon: '🔋', title: 'Lithium & Lead Batteries', titleHi: 'लिथियम व लेड एसिड बैटरी', pill: 'CRITICAL FIRE', pillClass: 'danger', risk: 'धमाका, 800°C आग, और तेजाब से त्वचा का जलना', action: 'टर्मिनलों पर टेप लगाएं, रेत में सूखा रखें', route: 'Authorized Battery Recycler' },
          { icon: '🔥', title: 'Open Cable Burning', titleHi: 'खुले में तार व केबल जलाना', pill: 'DEADLY DIOXINS', pillClass: 'danger', risk: 'कैंसर कारक फ्यूरान गैस व दमा, फेफड़े खराब', action: 'बिना जलाए सीधे रीसाइक्लर को अधिक दाम पर दें', route: 'Automated Granulator Facility' },
          { icon: '📺', title: 'CRT Monitor Glass', titleHi: 'सीआरटी मॉनिटर व ट्यूब', pill: 'LEAD POISON', pillClass: 'warning', risk: 'विस्फोट व सीसा-फॉस्फोरस विष (Lead Oxide)', action: 'दस्ताने पहनें, कांच को हथौड़े से कभी न तोड़ें', route: 'Specialized Lead Smelter' },
          { icon: '💻', title: 'Circuit Boards (PCBs)', titleHi: 'सर्किट बोर्ड (एसिड धुलाई)', pill: 'TOXIC VAPORS', pillClass: 'danger', risk: 'एसिड धुलाई से जहरीली NO₂ गैस व भूजल प्रदूषण', action: 'बोर्ड साबुत रखें, तेजाब में मत धोएं', route: 'Hydrometallurgical Refining' },
        ].map((h) => (
          <div className={`safety-hazard-card ${h.pillClass === 'danger' ? 'critical' : 'warning'}`} key={h.title} style={{ padding: '16px', borderRadius: '16px' }}>
            <div className="safety-card-top" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>{h.icon}</span>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                    {currentLang === 'hi' ? h.titleHi : h.title}
                  </strong>
                  <span className={`safety-hazard-pill ${h.pillClass}`} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                    {h.pill}
                  </span>
                </div>
              </div>
            </div>

            <div className="safety-risk-box" style={{ padding: '8px 10px', fontSize: '11.5px', marginBottom: '8px' }}>
              <strong>⚠️ खतरा:</strong> {h.risk}
            </div>

            <div className="safety-action-box" style={{ padding: '8px 10px', fontSize: '11.5px', marginBottom: '8px' }}>
              <strong>🛡️ सुरक्षित उपाय:</strong> {h.action}
            </div>

            <div className="safety-route-badge" style={{ fontSize: '10.5px', padding: '4px 8px' }}>
              <span>🏭</span> <span>{h.route}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Do's and Don'ts */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#0c3b2d' }}>
          ⚖️ {currentLang === 'hi' ? 'सुरक्षा नियम (Do & Don’t)' : 'Handling Protocols'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Do's Panel */}
          <div className="safety-split-panel dos" style={{ padding: '16px', borderRadius: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✅</span> {currentLang === 'hi' ? 'क्या करें (Do’s)' : 'Safe Best Practices'}
            </h4>
            <div className="safety-rules-list" style={{ gap: '8px' }}>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🧤</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'हमेशा दस्ताने व जूते पहनें' : 'Wear Gloves & Boots'}</strong>
                  <p style={{ fontSize: '11px' }}>धारदार पीसीबी और एसिड रिसाव से बचाव के लिए।</p>
                </div>
              </div>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🔋</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'बैटरी को तुरंत अलग करें' : 'Isolate Batteries Instantly'}</strong>
                  <p style={{ fontSize: '11px' }}>टर्मिनलों पर टेप लगाकर सूखे रेत के डिब्बे में रखें।</p>
                </div>
              </div>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🧾</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'डिजिटल रसीद मांगें' : 'Demand Digital Receipts'}</strong>
                  <p style={{ fontSize: '11px' }}>ReVive पोर्टल पर सत्यापित QR कोड से हैंडओवर करें।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Don'ts Panel */}
          <div className="safety-split-panel donts" style={{ padding: '16px', borderRadius: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚫</span> {currentLang === 'hi' ? 'क्या न करें (Don’ts)' : 'Strictly Prohibited'}
            </h4>
            <div className="safety-rules-list" style={{ gap: '8px' }}>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🔥</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'तारों को कभी आग मत लगाएं' : 'NEVER Burn Wires'}</strong>
                  <p style={{ fontSize: '11px' }}>धुएं से कैंसर होता है और कानूनन ₹1 लाख तक का जुर्माना है।</p>
                </div>
              </div>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🧪</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'तेजाब से सोना मत निकालें' : 'NEVER Acid Wash PCBs'}</strong>
                  <p style={{ fontSize: '11px' }}>नाइट्रिक एसिड की भाप सीधे फेफड़े गला देती है।</p>
                </div>
              </div>
              <div className="safety-rule-item" style={{ padding: '8px 10px' }}>
                <span className="safety-rule-icon">🔨</span>
                <div className="safety-rule-text">
                  <strong style={{ fontSize: '12px' }}>{currentLang === 'hi' ? 'सीआरटी कांच न तोड़ें' : 'NEVER Smash CRT Glass'}</strong>
                  <p style={{ fontSize: '11px' }}>कांच तोड़ने से 2 किलो लेड की जहरीली धूल फैलती है।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Footer */}
      <div className="safety-legal-card" style={{ padding: '16px 18px', marginTop: '20px', borderRadius: '16px' }}>
        <div className="safety-legal-text" style={{ minWidth: 'unset' }}>
          <span style={{ fontSize: '9.5px' }}>CPCB COMPLIANCE ASSURANCE</span>
          <h4 style={{ fontSize: '14px', margin: '2px 0 4px' }}>
            {currentLang === 'hi' ? 'ई-कचरा प्रबंधन नियम 2022' : 'E-Waste (Management) Rules 2022'}
          </h4>
          <p style={{ fontSize: '11.5px', color: '#a7f3d0' }}>
            {currentLang === 'hi'
              ? 'ReVive के माध्यम से सत्यापित रीसाइक्लर को कबाड़ सौंपने पर आपको कानूनी सुरक्षा और सुनिश्चित एमएसपी दाम मिलता है।'
              : 'Full statutory compliance and guaranteed minimum support price payments for all authorized handovers.'}
          </p>
        </div>
      </div>
    </div>
  );
};
