import React from 'react';
import { QRCodeGraphic } from '../../components/QRCodeGraphic';
import { Lang, I18N, ActivePage, UserProfile, ActiveRole } from '../../types';

interface ProfilePageProps {
  currentLang: Lang;
  setCurrentLang: (lang: Lang) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  activeRole: ActiveRole;
  setActivePage: (page: ActivePage) => void;
  handleLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentLang,
  setCurrentLang,
  currentUser,
  setCurrentUser,
  activeRole,
  setActivePage,
  handleLogout,
}) => {
  return (
    <div className="multipage-view">
      <div className="page-header-row">
        <div>
          <h1>{I18N[currentLang].navProfile}</h1>
          <p>Manage your identity, preferred vernacular language, and CPCB registration details.</p>
        </div>
        <button className="secondary-button" onClick={() => setActivePage('home')}>← {I18N[currentLang].backBtn}</button>
      </div>

      {/* Official CPCB Digital Identity Card */}
      <div className="digital-id-card">
        <div className="digital-id-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/revive-logo.jpeg" alt="ReVive" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em' }}>ReVive STATUTORY IDENTITY</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>MoEFCC / CPCB E-Waste Rules 2022</div>
            </div>
          </div>
          <span className="digital-id-chip">CPCB VERIFIED</span>
        </div>

        <div className="digital-id-number">
          {currentUser?.custom_user_id || (activeRole === 'collector' ? 'REV-COL-2026-1024' : activeRole === 'recycler' ? 'REV-REC-2026-0812' : 'CPCB-GOV-2026-0001')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>{currentUser?.name || 'राम यादव'}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>
              {activeRole === 'collector' ? 'Informal Sector Collector · Zone: ' + (currentUser?.location || 'Bhopal') : activeRole === 'recycler' ? 'Authorized Recycler · Lic: ' + (currentUser?.license_no || 'CPCB/EW/2024/0981') : 'Central Regulatory Auditor'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              Phone: +91 {currentUser?.phone || '9876543210'} · Status: Active & Compliant
            </div>
          </div>
          <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '8px', padding: '4px' }}>
            <QRCodeGraphic text={`REVIVE-ID:${currentUser?.custom_user_id || 'REV-COL-2026-1024'}:${currentUser?.phone || '9876543210'}`} />
          </div>
        </div>
      </div>

      <div className="profile-card-large">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'RY'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0c3b2d' }}>{currentUser?.name || 'राम यादव'}</h2>
            <span className="verified" style={{ marginTop: '6px', fontSize: '11px' }}>✓ CPCB Registered Informal Partner</span>
            <p style={{ margin: '4px 0 0', color: '#5b796c', fontSize: '12px' }}>Role: Collector (Kabadiwala) · ID: {currentUser?.custom_user_id || 'REV-COL-2026-1024'}</p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-data-box">
            <span>{I18N[currentLang].phoneLabel}</span>
            <strong>+91 {currentUser?.phone || '9876543210'}</strong>
          </div>
          <div className="profile-data-box">
            <span>{I18N[currentLang].locationLabel}</span>
            <strong>{currentUser?.location || 'Bhopal, MP'}</strong>
          </div>
          <div className="profile-data-box">
            <span>Current Language</span>
            <strong>{currentLang === 'hi' ? 'हिन्दी (Hindi)' : currentLang === 'mr' ? 'मराठी (Marathi)' : 'English'}</strong>
          </div>
          <div className="profile-data-box">
            <span>Traceability Status</span>
            <strong style={{ color: '#086c4b' }}>Active & Compliant</strong>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5ede7', paddingTop: '20px', marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a4234', marginBottom: '10px' }}>
            {I18N[currentLang].onboardingLangTitle}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              type="button"
              className={`lang-card-option ${currentLang === 'en' ? 'selected' : ''}`}
              style={{ padding: '12px' }}
              onClick={() => {
                setCurrentLang('en');
                if (currentUser) {
                  const updated = { ...currentUser, language: 'en' as Lang };
                  setCurrentUser(updated);
                  window.localStorage.setItem('revive_user', JSON.stringify(updated));
                }
              }}
            >
              <span style={{ fontSize: '24px' }}>🇬🇧</span>
              <div>
                <strong>English</strong>
                <small>Default</small>
              </div>
            </button>

            <button
              type="button"
              className={`lang-card-option ${currentLang === 'hi' ? 'selected' : ''}`}
              style={{ padding: '12px' }}
              onClick={() => {
                setCurrentLang('hi');
                if (currentUser) {
                  const updated = { ...currentUser, language: 'hi' as Lang };
                  setCurrentUser(updated);
                  window.localStorage.setItem('revive_user', JSON.stringify(updated));
                }
              }}
            >
              <span style={{ fontSize: '24px' }}>🇮🇳</span>
              <div>
                <strong>हिन्दी</strong>
                <small>अनुशंसित</small>
              </div>
            </button>

            <button
              type="button"
              className={`lang-card-option ${currentLang === 'mr' ? 'selected' : ''}`}
              style={{ padding: '12px' }}
              onClick={() => {
                setCurrentLang('mr');
                if (currentUser) {
                  const updated = { ...currentUser, language: 'mr' as Lang };
                  setCurrentUser(updated);
                  window.localStorage.setItem('revive_user', JSON.stringify(updated));
                }
              }}
            >
              <span style={{ fontSize: '24px' }}>🚩</span>
              <div>
                <strong>मराठी</strong>
                <small>सुलभ</small>
              </div>
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="wizard-btn-secondary"
            style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
            onClick={handleLogout}
          >
            🚪 {I18N[currentLang].logoutBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
