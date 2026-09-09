import React from 'react';
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
  return (
    <div className="multipage-view">
      <div className="page-header-row">
        <div>
          <h1>{I18N[currentLang].safetyTitle}</h1>
          <p>{I18N[currentLang].safetySubtitle}</p>
        </div>
        <button className="secondary-button" onClick={() => setActivePage('home')}>← {I18N[currentLang].backBtn}</button>
      </div>

      {/* Slogan Banner with Web Speech API Playback */}
      <div className="safety-slogan-banner">
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', fontWeight: 800 }}>
            📢 Vernacular Safety Directive · SIH 2026
          </span>
          <h2 style={{ margin: '6px 0', fontSize: '18px', color: '#78350f' }}>
            {currentLang === 'hi'
              ? 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! एसिड से मत धो, रीसाइक्लर को दो!'
              : currentLang === 'mr'
              ? 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! ॲसिड वापरू नका, प्रमाणित रिसायकलरला द्या!'
              : 'Do not burn cables, do not leach with acid! Protect your health and the environment!'}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
            {currentLang === 'hi'
              ? 'अनौपचारिक रूप से तार जलाने और एसिड से तांबा निकालने से फेफड़े और त्वचा को भारी नुकसान पहुंचता है।'
              : currentLang === 'mr'
              ? 'उघड्यावर तारा जाळल्याने आणि ॲसिडने तांबे काढल्याने फुफ्फुसांचे गंभीर आजार होतात.'
              : 'Informal open burning and chemical acid leaching releases dioxins and heavy metal neurotoxins.'}
          </p>
        </div>
        <button
          className="audio-speech-btn"
          onClick={() => {
            const msg = currentLang === 'hi'
              ? 'कचरा मत जलाओ, पर्यावरण और सेहत बचाओ! बैटरी को न तोड़ें और न जलाएं। सीधे प्रमाणित रीसाइक्लर को सौंपें।'
              : currentLang === 'mr'
              ? 'कचरा जाळू नका, पर्यावरण आणि आरोग्य वाचवा! बॅटरी फोडू नका आणि जाळू नका. प्रमाणित रिसायकलरला द्या.'
              : 'Do not burn cables or break batteries. Deliver hazardous scrap only to authorized CPCB recyclers.';
            speakIndicText(msg, currentLang);
          }}
        >
          {audioPlaying ? I18N[currentLang].speakingAudio : I18N[currentLang].listenAudioBtn}
        </button>
      </div>

      {/* Hazardous Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Lithium-Ion & Lead Batteries', icon: '🔋', risk: 'Explosion, thermal runaway, sulfuric acid burns', action: 'Store in dry place, tape terminals, never puncture.' },
          { title: 'Open Cable Burning', icon: '🔥', risk: 'Dioxins, furans, carcinogenic fumes causing chronic asthma', action: 'Sell unburnt to recyclers equipped with mechanical strippers.' },
          { title: 'CRT Monitor Glass', icon: '📺', risk: 'Implosion hazard, toxic lead-phosphor coating', action: 'Handle with gloves, do not smash glass funnel.' },
          { title: 'Printed Circuit Boards (PCBs)', icon: '💻', risk: 'Acid washing generates toxic nitrogen dioxide gas', action: 'Transfer directly for formal hydrometallurgical refining.' },
        ].map((h) => (
          <div className="panel" key={h.title} style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{h.icon}</span>
              <strong style={{ fontSize: '14px', color: '#991b1b' }}>{h.title}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
              <strong>Hazard:</strong> {h.risk}
            </div>
            <div style={{ fontSize: '11px', color: '#166534', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px' }}>
              <strong>Safe Action:</strong> {h.action}
            </div>
          </div>
        ))}
      </div>

      {/* Do's and Don'ts */}
      <div className="safety-dos-donts-grid">
        <div className="safety-col dos">
          <h3>{I18N[currentLang].dosTitle}</h3>
          <ul className="safety-list">
            <li><span>✓</span> Always wear protective gloves and shoes when sorting scrap.</li>
            <li><span>✓</span> Separate batteries from mixed electronic scrap immediately.</li>
            <li><span>✓</span> Keep e-waste in a sheltered, dry location away from children and rain.</li>
            <li><span>✓</span> Demand verified digital handover records from authorized recyclers.</li>
          </ul>
        </div>
        <div className="safety-col donts">
          <h3>{I18N[currentLang].dontsTitle}</h3>
          <ul className="safety-list">
            <li><span>❌</span> NEVER burn plastic coatings off copper wires in open air.</li>
            <li><span>❌</span> NEVER use nitric acid or cyanide to extract gold from circuit boards.</li>
            <li><span>❌</span> NEVER smash CRT glass or fluorescent tubes in landfills.</li>
            <li><span>❌</span> NEVER sell hazardous components to unlicensed backyard smelters.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
