import React, { useState } from 'react';
import { Lang, ActivePage, UserProfile, I18N } from '../types';

export interface NavbarProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  activeRole: 'collector' | 'recycler' | 'admin';
  setActiveRole: (role: 'collector' | 'recycler' | 'admin') => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  recyclerSubView: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (view: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
  adminTab: 'kpis' | 'recyclers' | 'anomalies' | 'lots';
  setAdminTab: (tab: 'kpis' | 'recyclers' | 'anomalies' | 'lots') => void;
  currentUser: UserProfile | null;
  apiStatus: 'online' | 'offline';
  audioPlaying: boolean;
  onSpeakPageSummary: () => void;
  onLogout: () => void;
  onOpenLiveScanner: () => void;
  isMobileView?: boolean;
  onToggleAppMode?: () => void;
  pendingOffersCount?: number;
  openAnomaliesCount?: number;
  acceptedOffersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  activeRole,
  setActiveRole,
  activePage,
  setActivePage,
  recyclerSubView,
  setRecyclerSubView,
  adminTab,
  setAdminTab,
  currentUser,
  apiStatus,
  audioPlaying,
  onSpeakPageSummary,
  onLogout,
  onOpenLiveScanner,
  isMobileView,
  onToggleAppMode,
  pendingOffersCount = 0,
  openAnomaliesCount = 0,
  acceptedOffersCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="upper-navbar-container">
      {/* 1. TOP UTILITY BAR */}
      <div className="navbar-top-row">
        {/* Brand Logo & Name */}
        <div className="navbar-brand-group" onClick={() => setActivePage('home')}>
          <img
            src={currentLang === 'hi' ? '/revive-logo-hi.jpeg' : '/revive-logo.jpeg'}
            alt="ReVive"
            className="navbar-brand-logo"
          />
          <div className="navbar-brand-text">
            <strong className="brand-name">ReVive</strong>
            <small className="brand-tagline">
              {currentLang === 'hi' ? 'ई-कचरा परिपत्र अर्थव्यवस्था' : 'National E-Waste Circular Exchange'}
            </small>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="navbar-search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder={I18N[currentLang].searchPlaceholder}
            aria-label="Global Search"
          />
          <span className="search-shortcut-hint">⌘K</span>
        </div>

        {/* Top Right Utilities */}
        <div className="navbar-utilities">
          {/* Indic Voice TTS Assistant */}
          <button
            type="button"
            className={`navbar-tts-btn ${audioPlaying ? 'playing' : ''}`}
            onClick={onSpeakPageSummary}
            title="Listen to page summary in Hindi, Marathi, or English"
          >
            {audioPlaying ? '🔊 ' + I18N[currentLang].audioStopBtn : '🎙️ ' + I18N[currentLang].audioAssistantBtn}
          </button>

          {/* Location Chip */}
          <span
            className="navbar-location-chip"
            onClick={() => {
              if (activeRole === 'collector') setActivePage('profile');
              else if (activeRole === 'recycler') setRecyclerSubView('profile');
            }}
          >
            ⌖ {currentUser?.location || 'Bhopal, MP'} ⌄
          </span>

          {/* Language Switcher */}
          <div className="navbar-lang-picker">
            <button
              type="button"
              className={currentLang === 'en' ? 'active' : ''}
              onClick={() => onSelectLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={currentLang === 'hi' ? 'active' : ''}
              onClick={() => onSelectLang('hi')}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={currentLang === 'mr' ? 'active' : ''}
              onClick={() => onSelectLang('mr')}
            >
              मराठी
            </button>
          </div>

          {/* Online API Pill */}
          <span className={`status-pill ${apiStatus}`}>
            {apiStatus === 'online' ? I18N[currentLang].onlineStatus : I18N[currentLang].offlineStatus}
          </span>

          {/* Digital ID Badge */}
          <span className="digital-id-chip">
            ID: {currentUser?.custom_user_id ||
              (activeRole === 'collector'
                ? 'REV-COL-2026-1024'
                : activeRole === 'recycler'
                ? 'REV-REC-2026-0812'
                : 'CPCB-GOV-2026-0001')}
          </span>

          {/* Role Switcher Dropdown */}
          <div className="navbar-role-switcher">
            <button
              type="button"
              className="role-selector-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            >
              {activeRole === 'collector' && '👷 Collector'}
              {activeRole === 'recycler' && '🏭 Recycler'}
              {activeRole === 'admin' && '🏛️ CPCB Admin'}
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {roleDropdownOpen && (
              <div className="role-dropdown-menu">
                <button
                  type="button"
                  className={activeRole === 'collector' ? 'active' : ''}
                  onClick={() => {
                    setActiveRole('collector');
                    setRoleDropdownOpen(false);
                  }}
                >
                  👷 Collector (Kabadiwala)
                </button>
                <button
                  type="button"
                  className={activeRole === 'recycler' ? 'active' : ''}
                  onClick={() => {
                    setActiveRole('recycler');
                    setRoleDropdownOpen(false);
                  }}
                >
                  🏭 Recycler (CPCB Facility)
                </button>
                <button
                  type="button"
                  className={activeRole === 'admin' ? 'active' : ''}
                  onClick={() => {
                    setActiveRole('admin');
                    setRoleDropdownOpen(false);
                  }}
                >
                  🏛️ Platform Admin (CPCB)
                </button>
              </div>
            )}
          </div>

          {/* Mobile App vs Web Portal Mode Toggle */}
          {activeRole === 'collector' && onToggleAppMode && (
            <button
              type="button"
              className={`navbar-view-mode-btn ${isMobileView ? 'mobile-active' : ''}`}
              onClick={onToggleAppMode}
              title="Toggle between Mobile App View & Web Portal View"
            >
              {isMobileView ? '📱 Mobile App View' : '🖥️ Web Portal'}
            </button>
          )}

          {/* User Profile / Exit Button */}
          <button
            type="button"
            className="navbar-logout-btn"
            onClick={onLogout}
            title="Log out and return to landing page"
          >
            Exit ⎋
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="navbar-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 2. LOWER PRIMARY NAVIGATION BAR (TABS) */}
      <nav className={`navbar-bottom-row ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-tabs-list">
          {/* COLLECTOR ROLE NAVIGATION */}
          {activeRole === 'collector' && (
            <>
              <button
                type="button"
                className={`nav-tab-item ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('home');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🏠</span>
                <span>{I18N[currentLang].navHome}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'create_lot' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('create_lot');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📸</span>
                <span>{I18N[currentLang].navCreateLot}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'price_board' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('price_board');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📈</span>
                <span>{I18N[currentLang].navPriceBoard}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'find_recycler' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('find_recycler');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🏭</span>
                <span>{I18N[currentLang].navFindRecycler}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'earnings' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('earnings');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">💰</span>
                <span>{I18N[currentLang].navEarnings}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'transactions' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('transactions');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📦</span>
                <span>{I18N[currentLang].navTransactions}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'safety' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('safety');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🛡️</span>
                <span>{I18N[currentLang].navSafety}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${activePage === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('profile');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">👤</span>
                <span>{I18N[currentLang].navProfile}</span>
              </button>
            </>
          )}

          {/* RECYCLER ROLE NAVIGATION */}
          {activeRole === 'recycler' && (
            <>
              <button
                type="button"
                className={`nav-tab-item ${recyclerSubView === 'browse' ? 'active' : ''}`}
                onClick={() => {
                  setRecyclerSubView('browse');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🔍</span>
                <span>Browse Scrap Lots</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${recyclerSubView === 'bids' ? 'active' : ''}`}
                onClick={() => {
                  setRecyclerSubView('bids');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🏷️</span>
                <span>Bids & Offers</span>
                {pendingOffersCount > 0 && <span className="tab-badge">{pendingOffersCount}</span>}
              </button>

              <button
                type="button"
                className={`nav-tab-item ${recyclerSubView === 'pickups' ? 'active' : ''}`}
                onClick={() => {
                  setRecyclerSubView('pickups');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🚚</span>
                <span>Pickups & Weigh-in</span>
                {acceptedOffersCount > 0 && (
                  <span className="tab-badge success">{acceptedOffersCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-tab-item ${recyclerSubView === 'passports' ? 'active' : ''}`}
                onClick={() => {
                  setRecyclerSubView('passports');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📜</span>
                <span>CPCB Passports</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${recyclerSubView === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setRecyclerSubView('profile');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🏢</span>
                <span>Recycler Profile</span>
              </button>
            </>
          )}

          {/* ADMIN ROLE NAVIGATION */}
          {activeRole === 'admin' && (
            <>
              <button
                type="button"
                className={`nav-tab-item ${adminTab === 'kpis' ? 'active' : ''}`}
                onClick={() => {
                  setAdminTab('kpis');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📊</span>
                <span>National E-Waste KPIs</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${adminTab === 'recyclers' ? 'active' : ''}`}
                onClick={() => {
                  setAdminTab('recyclers');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">🏭</span>
                <span>Recycler CPCB Registry</span>
              </button>

              <button
                type="button"
                className={`nav-tab-item ${adminTab === 'anomalies' ? 'active' : ''}`}
                onClick={() => {
                  setAdminTab('anomalies');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">⚠️</span>
                <span>Anomaly & Fraud Detector</span>
                {openAnomaliesCount > 0 && (
                  <span className="tab-badge danger">{openAnomaliesCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-tab-item ${adminTab === 'lots' ? 'active' : ''}`}
                onClick={() => {
                  setAdminTab('lots');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="tab-icon">📋</span>
                <span>Traceability Master Ledger</span>
              </button>
            </>
          )}
        </div>

        {/* Action Shortcut Button on the Right of Nav */}
        <div className="nav-tab-actions">
          {activeRole === 'collector' && (
            <button
              type="button"
              className="navbar-quick-scan-btn"
              onClick={onOpenLiveScanner}
            >
              📷 Instant Camera Scan
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
