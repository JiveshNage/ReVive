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
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  activeRole,
  setActiveRole,
  activePage,
  setActivePage,
  recyclerSubView,
  adminTab,
  currentUser,
  apiStatus,
  audioPlaying,
  onSpeakPageSummary,
  onLogout,
  onOpenLiveScanner,
  isMobileView,
  onToggleAppMode,
  onToggleSidebar,
  sidebarCollapsed = false,
  onOpenMobileSidebar,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  // Compute active page title for the breadcrumb
  const getBreadcrumbTitle = (): string => {
    if (activeRole === 'collector') {
      switch (activePage) {
        case 'home':
          return I18N[currentLang].navHome;
        case 'create_lot':
          return I18N[currentLang].navCreateLot;
        case 'price_board':
          return I18N[currentLang].navPriceBoard;
        case 'find_recycler':
          return I18N[currentLang].navFindRecycler;
        case 'earnings':
          return I18N[currentLang].navEarnings;
        case 'transactions':
          return I18N[currentLang].navTransactions;
        case 'safety':
          return I18N[currentLang].navSafety;
        case 'profile':
          return I18N[currentLang].navProfile;
        default:
          return 'Dashboard';
      }
    }
    if (activeRole === 'recycler') {
      switch (recyclerSubView) {
        case 'browse':
          return I18N[currentLang].tabBrowseLots || 'Browse Scrap Lots';
        case 'bids':
          return I18N[currentLang].tabBidsOffers || 'Bids & Offers';
        case 'pickups':
          return I18N[currentLang].tabPickups || 'Pickups & Weighment';
        case 'passports':
          return I18N[currentLang].tabPassports || 'CPCB Passports';
        case 'radar':
          return currentLang === 'hi' ? 'लाइव कबाड़ रडार' : 'Collector Live Radar';
        case 'scale':
          return currentLang === 'hi' ? 'डिजिटल कांटा' : 'Digital Scale Terminal';
        case 'payments':
          return currentLang === 'hi' ? 'भुगतान टर्मिनल' : 'Payment Terminal';
        case 'profile':
          return I18N[currentLang].tabOrgProfile || 'Recycler Profile';
        default:
          return 'Recycler Portal';
      }
    }
    if (activeRole === 'admin') {
      switch (adminTab) {
        case 'kpis':
          return I18N[currentLang].adminTabOverview || 'National KPIs';
        case 'radar':
          return currentLang === 'hi' ? 'लाइव परिपत्र रडार' : 'Live Circular Radar';
        case 'journey':
          return currentLang === 'hi' ? 'हैंडओवर यात्रा' : 'Handover Journey';
        case 'recyclers':
          return I18N[currentLang].adminTabRecyclers || 'Recycler Registry';
        case 'anomalies':
          return I18N[currentLang].adminTabAnomalies || 'Fraud Detector';
        case 'lots':
          return I18N[currentLang].adminTabLots || 'Master Statutory Ledger';
        case 'payments':
          return currentLang === 'hi' ? 'भुगतान ऑडिट' : 'Payment Tracking';
        default:
          return 'Admin Console';
      }
    }
    return 'Dashboard';
  };

  return (
    <header className="revive-app-header top-panel-header" role="banner">
      <div className="top-navbar-shell">
        {/* LEFT SECTION: SIDEBAR TOGGLE + BRAND + BREADCRUMB */}
        <div className="top-navbar-left">
          {/* Sidebar Toggle Button for Desktop */}
          {onToggleSidebar && (
            <button
              type="button"
              className="sidebar-toggle-btn desktop-only"
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? 'Expand Sidebar Navigation' : 'Collapse Sidebar Navigation'}
              aria-label="Toggle Sidebar Navigation"
            >
              <span className="toggle-icon">☰</span>
            </button>
          )}

          {/* Mobile Sidebar Hamburger */}
          {onOpenMobileSidebar && (
            <button
              type="button"
              className="sidebar-toggle-btn mobile-only"
              onClick={onOpenMobileSidebar}
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <span className="toggle-icon">☰</span>
            </button>
          )}

          {/* Brand Group */}
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

          {/* Contextual Location / Breadcrumb Indicator */}
          <div className="topbar-breadcrumb" title={`Current view: ${getBreadcrumbTitle()}`}>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-portal-tag">
              {activeRole === 'collector'
                ? '👷 Collector'
                : activeRole === 'recycler'
                ? '🏭 Recycler'
                : '🏛️ Admin'}
            </span>
            <span className="breadcrumb-arrow">›</span>
            <span className="breadcrumb-current-page">{getBreadcrumbTitle()}</span>
          </div>
        </div>

        {/* RIGHT SECTION: SEARCH + AUDIO + SCAN CTA + LANGUAGE + STATUS + ROLE + USER */}
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

          {/* Language Selector Chips */}
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

          {/* Role Switcher Selector */}
          <div className="role-switch-wrapper" ref={roleRef}>
            <button
              type="button"
              className="role-switch-trigger"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              aria-haspopup="true"
              aria-expanded={roleMenuOpen}
              title="Switch Platform Role"
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

          {/* User Profile Menu */}
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
        </div>
      </div>
    </header>
  );
};
