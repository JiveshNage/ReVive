import React from 'react';
import { Lang, I18N } from '../../types';

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
  const playSafetySpeech = () => {
    const msg =
      currentLang === 'hi'
        ? 'कचरा मत जलाओ! फेफड़े और सेहत बचाओ! एसिड से तांबा मत निकालो, सीधे प्रमाणित रीसाइक्लर को दो। बैटरी को कभी न तोड़ें।'
        : currentLang === 'mr'
        ? 'कचरा जाळू नका! आरोग्य वाचवा! ॲसिड वापरू नका, प्रमाणित रिसायकलरला द्या. बॅटरी फोडू नका.'
        : 'Do not burn cables or break batteries! Deliver hazardous electronic scrap only to authorized CPCB recyclers.';
    speakIndicText(msg, currentLang);
  };

  return (
    <div className="mobile-view-container">
      <div className="mobile-page-title-row">
        <div>
          <h2>🛡️ {currentLang === 'hi' ? 'स्वास्थ्य व सामग्री सुरक्षा' : 'Safety Directives'}</h2>
          <p>{currentLang === 'hi' ? 'सीपीसीबी दिशा-निर्देश व सुरक्षित काम करने के नियम' : 'CPCB health and hazardous material rules'}</p>
        </div>
      </div>

      {/* Audio Slogan Card */}
      <div className="mobile-safety-slogan-card">
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', fontWeight: 800 }}>
          📢 {currentLang === 'hi' ? 'राष्ट्रीय सुरक्षा निर्देश · सीपीसीबी' : 'Statutory Safety Directive'}
        </span>
        <h3 style={{ margin: '6px 0', fontSize: '17px', color: '#78350f', lineHeight: 1.3 }}>
          {currentLang === 'hi'
            ? 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! एसिड से मत धो, रीसाइक्लर को दो!'
            : currentLang === 'mr'
            ? 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! ॲसिड वापरू नका!'
            : 'Do not burn cables, do not leach with acid! Protect your lungs and soil.'}
        </h3>
        <button
          type="button"
          className="audio-speech-btn"
          style={{ marginTop: '8px', padding: '10px 16px', fontSize: '13px' }}
          onClick={playSafetySpeech}
        >
          {audioPlaying ? '🔊 आवाज़ चालू है...' : '🔊 नियम सुनें (Listen Audio)'}
        </button>
      </div>

      {/* Hazard Warning Cards */}
      <h3 style={{ margin: '20px 0 10px', fontSize: '17px', color: '#0c3b2d' }}>
        {currentLang === 'hi' ? 'प्रमुख जोखिम और बचाव' : 'Key Hazards & Actions'}
      </h3>

      <div className="mobile-cards-list">
        {[
          { icon: '🔋', title: 'Lithium & Lead Batteries', risk: 'धमाका, तेजाब का रिसाव व आग', action: 'टर्मिनलों पर टेप लगाएं, कभी न तोड़ें' },
          { icon: '🔥', title: 'Open Cable Burning', risk: 'कैंसर कारक फ्यूरान गैस व दमा', action: 'बिना जलाए सीधे रीसाइक्लर को दें' },
          { icon: '📺', title: 'CRT Monitor Glass', risk: 'विस्फोट व सीसा-फॉस्फोरस विष', action: 'दस्ताने पहनें, कांच कभी न तोड़ें' },
          { icon: '💻', title: 'Circuit Boards (PCBs)', risk: 'एसिड धुलाई से जहरीली गैस', action: 'प्रमाणित रिफाइनरी को भेजें' },
        ].map((h) => (
          <div className="mobile-hazard-card" key={h.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '26px' }}>{h.icon}</span>
              <strong style={{ fontSize: '15px', color: '#991b1b' }}>{h.title}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
              <strong>खतरा:</strong> {h.risk}
            </div>
            <div style={{ fontSize: '12px', color: '#166534', background: '#f0fdf4', padding: '6px 10px', borderRadius: '8px' }}>
              <strong>सुरक्षित उपाय:</strong> {h.action}
            </div>
          </div>
        ))}
      </div>

      {/* Do's and Don'ts */}
      <div className="safety-dos-donts-grid" style={{ marginTop: '16px' }}>
        <div className="safety-col dos">
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#166534' }}>✓ क्या करें (Do's)</h4>
          <ul className="safety-list" style={{ paddingLeft: '16px', margin: 0, fontSize: '12.5px' }}>
            <li>कबाड़ अलग करते समय हमेशा दस्ताने पहनें।</li>
            <li>बैटरी को सूखे सुरक्षित स्थान पर रखें।</li>
            <li>प्रमाणित रीसाइक्लर से डिजिटल रसीद मांगें।</li>
          </ul>
        </div>
        <div className="safety-col donts">
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#991b1b' }}>❌ क्या न करें (Don'ts)</h4>
          <ul className="safety-list" style={{ paddingLeft: '16px', margin: 0, fontSize: '12.5px' }}>
            <li>खुले मैदान में तारों को कभी आग मत लगाएं।</li>
            <li>गोल्ड निकालने के लिए तेजाब का उपयोग न करें।</li>
            <li>कांच की स्क्रीन को हथौड़े से मत तोड़ें।</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
