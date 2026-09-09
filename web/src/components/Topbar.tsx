import React from 'react';
import { Lang, UserProfile, I18N } from '../types';

export interface TopbarProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  activeRole: 'collector' | 'recycler' | 'admin';
  currentUser: UserProfile | null;
  apiStatus: 'online' | 'offline';
  audioPlaying: boolean;
  onSpeakPageSummary: () => void;
  onOpenMobileMenu: () => void;
  onNavigateProfile: () => void;
  onLogout: () => void;
  isMobileView?: boolean;
  onToggleAppMode?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentLang,
  onSelectLang,
  activeRole,
  currentUser,
  apiStatus,
  audioPlaying,
  onSpeakPageSummary,
  onOpenMobileMenu,
  onNavigateProfile,
  onLogout,
  isMobileView,
  onToggleAppMode,
}) => {
  return (
    <header className="topbar">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label="Open Menu"
        onClick={onOpenMobileMenu}
      >
        ☰
      </button>

      <div className="search-box">
        <span>⌕</span>
        <input aria-label="Search" placeholder={I18N[currentLang].searchPlaceholder} />
      </div>

      <div className="topbar-actions">
        {/* Device Mode Switcher: Desktop Web Portal vs Mobile App */}
        {activeRole === 'collector' && onToggleAppMode && (
          <button
            type="button"
            className="app-mode-toggle-btn"
            onClick={onToggleAppMode}
            title="Switch between Web Portal & Mobile App View"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: isMobileView ? '1px solid #10b981' : '1px solid var(--border-color)',
              background: isMobileView ? '#10b981' : 'var(--bg-card)',
              color: isMobileView ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: isMobileView ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isMobileView ? '📱 Mobile App View' : '🖥️ Web Portal View'}
          </button>
        )}

        {/* Indic Text-to-Speech Global Audio Assistant Button */}
        <button
          type="button"
          className={`tts-topbar-btn ${audioPlaying ? 'playing' : ''}`}
          onClick={onSpeakPageSummary}
          title="Indic Text-to-Speech Voice Assistant"
        >
          {audioPlaying ? I18N[currentLang].audioStopBtn : I18N[currentLang].audioAssistantBtn}
        </button>

        <span
          className="location"
          style={{ cursor: 'pointer' }}
          onClick={onNavigateProfile}
        >
          ⌖ {currentUser?.location || 'Bhopal, MP'} ⌄
        </span>

        <div className="lang-picker" aria-label="Language selection">
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

        <span className={`status-pill ${apiStatus}`}>
          {apiStatus === 'online' ? I18N[currentLang].onlineStatus : I18N[currentLang].offlineStatus}
        </span>

        {/* Authenticated Role & Statutory ID Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="digital-id-chip" style={{ fontSize: '11px', padding: '4px 10px' }}>
            ID:{' '}
            {currentUser?.custom_user_id ||
              (activeRole === 'collector'
                ? 'REV-COL-2026-1024'
                : activeRole === 'recycler'
                ? 'REV-REC-2026-0812'
                : 'CPCB-GOV-2026-0001')}
          </span>
          <span
            className="role-card-badge"
            style={{
              fontSize: '12px',
              padding: '5px 12px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            }}
          >
            {activeRole === 'admin'
              ? I18N[currentLang].roleAdminVerified
              : activeRole === 'recycler'
              ? I18N[currentLang].roleRecyclerVerified
              : I18N[currentLang].roleCollectorVerified}
          </span>
        </div>

        <button
          type="button"
          className="city-filter-chip"
          style={{ fontSize: '12px', padding: '5px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
          onClick={onLogout}
          title={I18N[currentLang].logoutBtn}
        >
          {I18N[currentLang].btnExit}
        </button>
      </div>
    </header>
  );
};
