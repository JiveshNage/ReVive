import React, { useState, useRef, useEffect } from 'react';
import { Lang, ActivePage, UserProfile, I18N } from '../types';

export interface NavbarProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  activeRole: 'collector' | 'recycler' | 'admin';
  setActiveRole: (role: 'collector' | 'recycler' | 'admin') => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  recyclerSubView: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (view: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
  adminTab: 'kpis' | 'radar' | 'journey' | 'payments' | 'recyclers' | 'anomalies' | 'lots';
  setAdminTab: (tab: 'kpis' | 'radar' | 'journey' | 'payments' | 'recyclers' | 'anomalies' | 'lots') => void;
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const customId =
    currentUser?.custom_user_id ||
    (activeRole === 'collector'
      ? 'REV-COL-2026-1024'
      : activeRole === 'recycler'
      ? 'REV-REC-2026-0812'
      : 'CPCB-GOV-2026-0001');

  const userInitials =
    activeRole === 'admin'
      ? 'AD'
      : activeRole === 'recycler'
      ? 'RR'
      : currentUser?.name
      ? currentUser.name.slice(0, 2).toUpperCase()
      : 'CO';

  return (
    <header className="revive-app-header" role="banner">
      {/* UNIFIED TOP NAVIGATION BAR */}
      <div className="top-navbar-shell">
        {/* 1. BRAND GROUP */}
        <div
          className="brand-group"
          onClick={() => setActivePage('home')}
          role="button"
          tabIndex={0}
          aria-label="ReVive Home"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActivePage('home');
          }}
        >
          <img
            src={currentLang === 'hi' ? '/revive-logo-hi.jpeg' : '/revive-logo.jpeg'}
            alt="ReVive E-Waste Circular Exchange"
            className="brand-logo"
          />
          <div className="brand-text">
            <span className="brand-name">ReVive</span>
            <span className="brand-tagline">
              {currentLang === 'hi'
                ? 'ई-कचरा परिपत्र अर्थव्यवस्था'
                : currentLang === 'mr'
                ? 'ई-कचरा वर्तुळाकार व्यवस्था'
                : 'National E-Waste Circular Exchange'}
            </span>
          </div>
        </div>

        {/* 2. PRIMARY NAVIGATION LINKS (DESKTOP / MEDIUM DESKTOP) */}
        <nav className="desktop-nav-bar" aria-label="Primary Platform Navigation">
          {/* COLLECTOR ROLE LINKS */}
          {activeRole === 'collector' && (
            <>
              <button
                type="button"
                className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => setActivePage('home')}
              >
                <span className="nav-icon" aria-hidden="true">🏠</span>
                <span>{I18N[currentLang].navHome}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${activePage === 'create_lot' ? 'active' : ''}`}
                onClick={() => setActivePage('create_lot')}
              >
                <span className="nav-icon" aria-hidden="true">📸</span>
                <span>{I18N[currentLang].navCreateLot}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${activePage === 'price_board' ? 'active' : ''}`}
                onClick={() => setActivePage('price_board')}
              >
                <span className="nav-icon" aria-hidden="true">📈</span>
                <span>{I18N[currentLang].navPriceBoard}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${activePage === 'find_recycler' ? 'active' : ''}`}
                onClick={() => setActivePage('find_recycler')}
              >
                <span className="nav-icon" aria-hidden="true">🏭</span>
                <span>{I18N[currentLang].navFindRecycler}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${activePage === 'earnings' ? 'active' : ''}`}
                onClick={() => setActivePage('earnings')}
              >
                <span className="nav-icon" aria-hidden="true">💰</span>
                <span>{I18N[currentLang].navEarnings}</span>
              </button>

              {/* Collector "More" Dropdown for secondary pages */}
              <div className="nav-dropdown-wrapper" ref={moreRef}>
                <button
                  type="button"
                  className={`nav-link dropdown-toggle ${
                    ['transactions', 'safety', 'profile'].includes(activePage) ? 'active' : ''
                  }`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  aria-expanded={moreMenuOpen}
                >
                  <span>{currentLang === 'hi' ? 'और' : currentLang === 'mr' ? 'अधिक' : 'More'} ▾</span>
                </button>

                {moreMenuOpen && (
                  <div className="nav-dropdown-popover" role="menu">
                    <button
                      type="button"
                      className={`dropdown-item ${activePage === 'transactions' ? 'active' : ''}`}
                      onClick={() => {
                        setActivePage('transactions');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">📦</span>
                      <span>{I18N[currentLang].navTransactions}</span>
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item ${activePage === 'safety' ? 'active' : ''}`}
                      onClick={() => {
                        setActivePage('safety');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">🛡️</span>
                      <span>{I18N[currentLang].navSafety}</span>
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item ${activePage === 'profile' ? 'active' : ''}`}
                      onClick={() => {
                        setActivePage('profile');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">👤</span>
                      <span>{I18N[currentLang].navProfile}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* RECYCLER ROLE LINKS */}
          {activeRole === 'recycler' && (
            <>
              <button
                type="button"
                className={`nav-link ${recyclerSubView === 'browse' ? 'active' : ''}`}
                onClick={() => setRecyclerSubView('browse')}
              >
                <span className="nav-icon" aria-hidden="true">🔍</span>
                <span>{I18N[currentLang].tabBrowseLots || 'Browse Scrap Lots'}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${recyclerSubView === 'bids' ? 'active' : ''}`}
                onClick={() => setRecyclerSubView('bids')}
              >
                <span className="nav-icon" aria-hidden="true">🏷️</span>
                <span>{I18N[currentLang].tabBidsOffers || 'Bids & Offers'}</span>
                {pendingOffersCount > 0 && <span className="nav-badge">{pendingOffersCount}</span>}
              </button>

              <button
                type="button"
                className={`nav-link ${recyclerSubView === 'pickups' ? 'active' : ''}`}
                onClick={() => setRecyclerSubView('pickups')}
              >
                <span className="nav-icon" aria-hidden="true">🚚</span>
                <span>{I18N[currentLang].tabPickups || 'Pickups & QR'}</span>
                {acceptedOffersCount > 0 && (
                  <span className="nav-badge success">{acceptedOffersCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-link ${recyclerSubView === 'passports' ? 'active' : ''}`}
                onClick={() => setRecyclerSubView('passports')}
              >
                <span className="nav-icon" aria-hidden="true">📜</span>
                <span>{I18N[currentLang].tabPassports || 'CPCB Passports'}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${recyclerSubView === 'profile' ? 'active' : ''}`}
                onClick={() => setRecyclerSubView('profile')}
              >
                <span className="nav-icon" aria-hidden="true">🏢</span>
                <span>{I18N[currentLang].tabOrgProfile || 'Recycler Profile'}</span>
              </button>

              {/* Recycler "More" Dropdown for scale & payments */}
              <div className="nav-dropdown-wrapper" ref={moreRef}>
                <button
                  type="button"
                  className={`nav-link dropdown-toggle ${
                    ['radar', 'scale', 'payments'].includes(recyclerSubView) ? 'active' : ''
                  }`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  aria-expanded={moreMenuOpen}
                >
                  <span>{currentLang === 'hi' ? 'और' : currentLang === 'mr' ? 'अधिक' : 'More'} ▾</span>
                </button>

                {moreMenuOpen && (
                  <div className="nav-dropdown-popover" role="menu">
                    <button
                      type="button"
                      className={`dropdown-item ${recyclerSubView === 'radar' ? 'active' : ''}`}
                      onClick={() => {
                        setRecyclerSubView('radar');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">📍</span>
                      <span>Collector Live Radar</span>
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item ${recyclerSubView === 'scale' ? 'active' : ''}`}
                      onClick={() => {
                        setRecyclerSubView('scale');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">⚖️</span>
                      <span>Digital Scale Terminal</span>
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item ${recyclerSubView === 'payments' ? 'active' : ''}`}
                      onClick={() => {
                        setRecyclerSubView('payments');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">💳</span>
                      <span>Payment Release Terminal</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ADMIN ROLE LINKS */}
          {activeRole === 'admin' && (
            <>
              <button
                type="button"
                className={`nav-link ${adminTab === 'kpis' ? 'active' : ''}`}
                onClick={() => setAdminTab('kpis')}
              >
                <span className="nav-icon" aria-hidden="true">📊</span>
                <span>{I18N[currentLang].adminTabOverview || 'National KPIs'}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${adminTab === 'radar' ? 'active' : ''}`}
                onClick={() => setAdminTab('radar')}
              >
                <span className="nav-icon" aria-hidden="true">📍</span>
                <span>Live Radar</span>
              </button>

              <button
                type="button"
                className={`nav-link ${adminTab === 'journey' ? 'active' : ''}`}
                onClick={() => setAdminTab('journey')}
              >
                <span className="nav-icon" aria-hidden="true">🚚</span>
                <span>Handover Journey</span>
              </button>

              <button
                type="button"
                className={`nav-link ${adminTab === 'recyclers' ? 'active' : ''}`}
                onClick={() => setAdminTab('recyclers')}
              >
                <span className="nav-icon" aria-hidden="true">🏭</span>
                <span>{I18N[currentLang].adminTabRecyclers || 'Recycler Registry'}</span>
              </button>

              <button
                type="button"
                className={`nav-link ${adminTab === 'anomalies' ? 'active' : ''}`}
                onClick={() => setAdminTab('anomalies')}
              >
                <span className="nav-icon" aria-hidden="true">⚠️</span>
                <span>{I18N[currentLang].adminTabAnomalies || 'Fraud Detector'}</span>
                {openAnomaliesCount > 0 && (
                  <span className="nav-badge danger">{openAnomaliesCount}</span>
                )}
              </button>

              {/* Admin "More" Dropdown for payments & lots */}
              <div className="nav-dropdown-wrapper" ref={moreRef}>
                <button
                  type="button"
                  className={`nav-link dropdown-toggle ${
                    ['payments', 'lots'].includes(adminTab) ? 'active' : ''
                  }`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  aria-expanded={moreMenuOpen}
                >
                  <span>{currentLang === 'hi' ? 'और' : currentLang === 'mr' ? 'अधिक' : 'More'} ▾</span>
                </button>

                {moreMenuOpen && (
                  <div className="nav-dropdown-popover" role="menu">
                    <button
                      type="button"
                      className={`dropdown-item ${adminTab === 'payments' ? 'active' : ''}`}
                      onClick={() => {
                        setAdminTab('payments');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">💳</span>
                      <span>Payment Tracking</span>
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item ${adminTab === 'lots' ? 'active' : ''}`}
                      onClick={() => {
                        setAdminTab('lots');
                        setMoreMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="nav-icon">📋</span>
                      <span>{I18N[currentLang].adminTabLots || 'Master Lots Ledger'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* 3. GLOBAL UTILITIES */}
        <div className="navbar-utilities-cluster">
          {/* Global Search Box */}
          <div className="navbar-search-container" role="search">
            <span className="search-symbol" aria-hidden="true">⌕</span>
            <input
              type="text"
              placeholder={I18N[currentLang].searchPlaceholder || 'Search lots, items...'}
              aria-label="Global Search"
              className="navbar-search-input"
            />
            <span className="search-kbd-badge" title="Press Ctrl+K to search">⌘K</span>
          </div>

          {/* Vernacular Voice TTS Assistant */}
          <button
            type="button"
            className={`navbar-tool-btn tts-btn ${audioPlaying ? 'playing' : ''}`}
            onClick={onSpeakPageSummary}
            title="Listen to page summary in Hindi, Marathi, or English"
            aria-label="Listen to page content"
          >
            {audioPlaying ? '🔊 ' + I18N[currentLang].audioStopBtn : '🎙️ ' + I18N[currentLang].audioAssistantBtn}
          </button>

          {/* Language Selector */}
          <div className="navbar-lang-group" role="group" aria-label="Language selector">
            <button
              type="button"
              className={`lang-chip ${currentLang === 'en' ? 'active' : ''}`}
              onClick={() => onSelectLang('en')}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-chip ${currentLang === 'hi' ? 'active' : ''}`}
              onClick={() => onSelectLang('hi')}
              title="हिन्दी (Hindi)"
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`lang-chip ${currentLang === 'mr' ? 'active' : ''}`}
              onClick={() => onSelectLang('mr')}
              title="मराठी (Marathi)"
            >
              मराठी
            </button>
          </div>

          {/* Online/Offline Status Indicator */}
          <span
            className={`connection-status-pill ${apiStatus}`}
            title={`Backend Service: ${apiStatus.toUpperCase()}`}
          >
            <span className="status-dot" aria-hidden="true" />
            <span className="status-label">
              {apiStatus === 'online' ? I18N[currentLang].onlineStatus : I18N[currentLang].offlineStatus}
            </span>
          </span>

          {/* Quick Camera Scan CTA (Collector only) */}
          {activeRole === 'collector' && (
            <button
              type="button"
              className="navbar-quick-scan-btn"
              onClick={onOpenLiveScanner}
              title="Instant AI Material Scanner"
            >
              📷 {currentLang === 'hi' ? 'स्कैन करें' : 'AI Scan'}
            </button>
          )}

          {/* Role Switcher Selector */}
          <div className="role-switch-wrapper" ref={roleRef}>
            <button
              type="button"
              className="role-switch-trigger"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              aria-haspopup="true"
              aria-expanded={roleMenuOpen}
            >
              {activeRole === 'collector' && '👷 Collector'}
              {activeRole === 'recycler' && '🏭 Recycler'}
              {activeRole === 'admin' && '🏛️ CPCB Admin'}
              <span className="dropdown-caret">▾</span>
            </button>

            {roleMenuOpen && (
              <div className="role-dropdown-popover" role="menu">
                <button
                  type="button"
                  className={`role-option ${activeRole === 'collector' ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveRole('collector');
                    setRoleMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  👷 Collector (Kabadiwala)
                </button>
                <button
                  type="button"
                  className={`role-option ${activeRole === 'recycler' ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveRole('recycler');
                    setRoleMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  🏭 Recycler (CPCB Facility)
                </button>
                <button
                  type="button"
                  className={`role-option ${activeRole === 'admin' ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveRole('admin');
                    setRoleMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  🏛️ Platform Admin (CPCB)
                </button>
              </div>
            )}
          </div>

          {/* 4. USER PROFILE MENU / FOOTPRINT */}
          <div className="user-menu-wrapper" ref={userRef}>
            <button
              type="button"
              className="user-menu-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="User profile and account settings"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <div className="user-avatar-badge">{userInitials}</div>
              <div className="user-meta-summary">
                <span className="user-display-name">
                  {currentUser?.name || 'Authorized User'}
                </span>
                <span className="user-id-code">{customId}</span>
              </div>
              <span className="dropdown-caret">▾</span>
            </button>

            {userMenuOpen && (
              <div className="user-menu-popover" role="menu">
                <div className="user-popover-header">
                  <div className="popover-avatar">{userInitials}</div>
                  <div className="popover-user-details">
                    <strong>{currentUser?.name || 'Authorized User'}</strong>
                    <small className="popover-custom-id">{customId}</small>
                    <span className="popover-role-tag">
                      {activeRole === 'admin'
                        ? I18N[currentLang].roleAdminVerified
                        : activeRole === 'recycler'
                        ? I18N[currentLang].roleRecyclerVerified
                        : I18N[currentLang].roleCollectorVerified}
                    </span>
                    {activeRole === 'recycler' && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginTop: '4px',
                          background:
                            currentUser?.verification_status === 'VERIFIED'
                              ? '#dcfce7'
                              : currentUser?.verification_status === 'REJECTED'
                              ? '#fee2e2'
                              : currentUser?.verification_status === 'UNDER_REVIEW'
                              ? '#fef9c3'
                              : '#f1f5f9',
                          color:
                            currentUser?.verification_status === 'VERIFIED'
                              ? '#15803d'
                              : currentUser?.verification_status === 'REJECTED'
                              ? '#b91c1c'
                              : currentUser?.verification_status === 'UNDER_REVIEW'
                              ? '#a16207'
                              : '#475569',
                        }}
                      >
                        {currentUser?.verification_status === 'VERIFIED'
                          ? '✓ Verified Facility'
                          : currentUser?.verification_status === 'UNDER_REVIEW'
                          ? '⏳ Verification Pending'
                          : currentUser?.verification_status === 'REJECTED'
                          ? '✕ Verification Rejected'
                          : '● Verification Needed'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="popover-divider" />

                <div className="popover-section">
                  <div className="popover-info-row">
                    <span className="info-icon">⌖</span>
                    <span>{currentUser?.location || 'Bhopal, Madhya Pradesh'}</span>
                  </div>
                </div>

                {activeRole === 'collector' && onToggleAppMode && (
                  <button
                    type="button"
                    className="popover-action-btn"
                    onClick={() => {
                      onToggleAppMode();
                      setUserMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    {isMobileView ? '🖥️ Switch to Web Portal View' : '📱 Switch to Mobile App View'}
                  </button>
                )}

                <button
                  type="button"
                  className="popover-action-btn"
                  onClick={() => {
                    if (activeRole === 'collector') setActivePage('profile');
                    else if (activeRole === 'recycler') setRecyclerSubView('profile');
                    setUserMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  ⚙️ {I18N[currentLang].navProfile || 'Account & Profile'}
                </button>

                <div className="popover-divider" />

                <button
                  type="button"
                  className="popover-logout-btn"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  role="menuitem"
                >
                  ⎋ {I18N[currentLang].logoutBtn || 'Log Out / Exit'}
                </button>
              </div>
            )}
          </div>

          {/* 5. MOBILE HAMBURGER BUTTON */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Drawer"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MOBILE FULL-FEATURED NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-header">
            <div className="drawer-user-card">
              <div className="drawer-avatar">{userInitials}</div>
              <div>
                <strong>{currentUser?.name || 'Authorized User'}</strong>
                <div className="drawer-custom-id">{customId}</div>
              </div>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Role selector in drawer */}
          <div className="drawer-role-selector">
            <button
              type="button"
              className={`drawer-role-btn ${activeRole === 'collector' ? 'active' : ''}`}
              onClick={() => {
                setActiveRole('collector');
                setMobileMenuOpen(false);
              }}
            >
              👷 Collector
            </button>
            <button
              type="button"
              className={`drawer-role-btn ${activeRole === 'recycler' ? 'active' : ''}`}
              onClick={() => {
                setActiveRole('recycler');
                setMobileMenuOpen(false);
              }}
            >
              🏭 Recycler
            </button>
            <button
              type="button"
              className={`drawer-role-btn ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setActiveRole('admin');
                setMobileMenuOpen(false);
              }}
            >
              🏛️ Admin
            </button>
          </div>

          {/* Navigation Links for Active Role */}
          <div className="drawer-nav-list">
            {activeRole === 'collector' && (
              <>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('home');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🏠</span>
                  <span>{I18N[currentLang].navHome}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'create_lot' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('create_lot');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📸</span>
                  <span>{I18N[currentLang].navCreateLot}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'price_board' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('price_board');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📈</span>
                  <span>{I18N[currentLang].navPriceBoard}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'find_recycler' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('find_recycler');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🏭</span>
                  <span>{I18N[currentLang].navFindRecycler}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'earnings' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('earnings');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">💰</span>
                  <span>{I18N[currentLang].navEarnings}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'transactions' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('transactions');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📦</span>
                  <span>{I18N[currentLang].navTransactions}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'safety' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('safety');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🛡️</span>
                  <span>{I18N[currentLang].navSafety}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${activePage === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('profile');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">👤</span>
                  <span>{I18N[currentLang].navProfile}</span>
                </button>
              </>
            )}

            {activeRole === 'recycler' && (
              <>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'browse' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('browse');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🔍</span>
                  <span>{I18N[currentLang].tabBrowseLots || 'Browse Scrap Lots'}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'bids' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('bids');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🏷️</span>
                  <span>{I18N[currentLang].tabBidsOffers || 'Bids & Offers'}</span>
                  {pendingOffersCount > 0 && (
                    <span className="nav-badge">{pendingOffersCount}</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'pickups' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('pickups');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🚚</span>
                  <span>{I18N[currentLang].tabPickups || 'Pickups & QR'}</span>
                  {acceptedOffersCount > 0 && (
                    <span className="nav-badge success">{acceptedOffersCount}</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'passports' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('passports');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📜</span>
                  <span>{I18N[currentLang].tabPassports || 'CPCB Passports'}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'radar' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('radar');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📍</span>
                  <span>Collector Live Radar</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'scale' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('scale');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">⚖️</span>
                  <span>Digital Scale Terminal</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'payments' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('payments');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">💳</span>
                  <span>Payment Release Terminal</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${recyclerSubView === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setRecyclerSubView('profile');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🏢</span>
                  <span>{I18N[currentLang].tabOrgProfile || 'Recycler Profile'}</span>
                </button>
              </>
            )}

            {activeRole === 'admin' && (
              <>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'kpis' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('kpis');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📊</span>
                  <span>{I18N[currentLang].adminTabOverview || 'National KPIs'}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'radar' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('radar');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📍</span>
                  <span>Live Radar</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'journey' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('journey');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🚚</span>
                  <span>Handover Journey</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'recyclers' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('recyclers');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">🏭</span>
                  <span>{I18N[currentLang].adminTabRecyclers || 'Recycler Registry'}</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'anomalies' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('anomalies');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">⚠️</span>
                  <span>{I18N[currentLang].adminTabAnomalies || 'Fraud Detector'}</span>
                  {openAnomaliesCount > 0 && (
                    <span className="nav-badge danger">{openAnomaliesCount}</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'payments' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('payments');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">💳</span>
                  <span>Payment Tracking</span>
                </button>
                <button
                  type="button"
                  className={`drawer-nav-item ${adminTab === 'lots' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminTab('lots');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-icon">📋</span>
                  <span>{I18N[currentLang].adminTabLots || 'Master Ledger'}</span>
                </button>
              </>
            )}
          </div>

          <div className="drawer-footer">
            <button
              type="button"
              className="drawer-logout-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
            >
              ⎋ {I18N[currentLang].logoutBtn || 'Log Out'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
