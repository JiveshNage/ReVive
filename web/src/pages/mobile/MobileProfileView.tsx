import React from 'react';
import { QRCodeGraphic } from '../../components/QRCodeGraphic';
import { Lang, UserProfile } from '../../types';

export interface MobileProfileViewProps {
  currentLang: Lang;
  setCurrentLang: (lang: Lang) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  handleLogout: () => void;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  currentLang,
  setCurrentLang,
  currentUser,
  setCurrentUser,
  handleLogout,
}) => {
  return (
    <div className="mobile-view-container">
      <div className="mobile-page-title-row">
        <div>
          <h2>👤 {currentLang === 'hi' ? 'कबाड़ीवाला साथी पहचान पत्र' : 'Statutory Digital Identity'}</h2>
          <p>{currentLang === 'hi' ? 'सीपीसीबी पंजीकृत अनौपचारिक क्षेत्र पहचान पत्र' : 'CPCB registered informal partner card'}</p>
        </div>
      </div>

      {/* Official CPCB Digital Identity Card */}
      <div className="digital-id-card" style={{ margin: '8px 0 20px' }}>
        <div className="digital-id-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/revive-logo.jpeg" alt="ReVive" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>ReVive STATUTORY ID</div>
              <div style={{ fontSize: '9px', opacity: 0.85 }}>MoEFCC / CPCB Rules 2022</div>
            </div>
          </div>
          <span className="digital-id-chip">CPCB VERIFIED</span>
        </div>

        <div className="digital-id-number" style={{ fontSize: '20px' }}>
          {currentUser?.custom_user_id || 'REV-COL-2026-1024'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{currentUser?.name || 'राम यादव'}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>
              Informal Collector · Zone: {currentUser?.location || 'Bhopal, MP'}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '2px' }}>
              Phone: +91 {currentUser?.phone || '9876543210'}
            </div>
          </div>
          <div style={{ width: '56px', height: '56px', background: '#fff', borderRadius: '6px', padding: '3px' }}>
            <QRCodeGraphic text={`REVIVE-ID:${currentUser?.custom_user_id || 'REV-COL-2026-1024'}`} />
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="panel" style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#0c3b2d' }}>
          🌐 {currentLang === 'hi' ? 'अपनी भाषा चुनें (Select Language)' : 'Preferred Language'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            type="button"
            className={`lang-card-option ${currentLang === 'en' ? 'selected' : ''}`}
            style={{ padding: '10px 6px', textAlign: 'center' }}
            onClick={() => {
              setCurrentLang('en');
              if (currentUser) {
                const u = { ...currentUser, language: 'en' as Lang };
                setCurrentUser(u);
                window.localStorage.setItem('revive_user', JSON.stringify(u));
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>🇬🇧</span>
            <div><strong>English</strong></div>
          </button>

          <button
            type="button"
            className={`lang-card-option ${currentLang === 'hi' ? 'selected' : ''}`}
            style={{ padding: '10px 6px', textAlign: 'center' }}
            onClick={() => {
              setCurrentLang('hi');
              if (currentUser) {
                const u = { ...currentUser, language: 'hi' as Lang };
                setCurrentUser(u);
                window.localStorage.setItem('revive_user', JSON.stringify(u));
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>🇮🇳</span>
            <div><strong>हिन्दी</strong></div>
          </button>

          <button
            type="button"
            className={`lang-card-option ${currentLang === 'mr' ? 'selected' : ''}`}
            style={{ padding: '10px 6px', textAlign: 'center' }}
            onClick={() => {
              setCurrentLang('mr');
              if (currentUser) {
                const u = { ...currentUser, language: 'mr' as Lang };
                setCurrentUser(u);
                window.localStorage.setItem('revive_user', JSON.stringify(u));
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>🚩</span>
            <div><strong>मराठी</strong></div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div style={{ marginTop: '20px' }}>
        <button
          type="button"
          className="wizard-btn-secondary"
          style={{ width: '100%', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', padding: '14px', fontSize: '15px' }}
          onClick={handleLogout}
        >
          🚪 {currentLang === 'hi' ? 'लॉगआउट करें (Sign Out)' : 'Logout'}
        </button>
      </div>
    </div>
  );
};
