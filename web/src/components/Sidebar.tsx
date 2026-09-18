import React from 'react';
import { Lang, ActivePage, UserProfile, I18N } from '../types';

export interface SidebarProps {
  currentLang: Lang;
  activeRole: 'collector' | 'recycler' | 'admin';
  setActiveRole: (role: 'collector' | 'recycler' | 'admin') => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  recyclerSubView: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (view: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
  adminTab: 'kpis' | 'radar' | 'journey' | 'payments' | 'recyclers' | 'anomalies' | 'lots';
  setAdminTab: (tab: 'kpis' | 'radar' | 'journey' | 'payments' | 'recyclers' | 'anomalies' | 'lots') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingOffersCount?: number;
  openAnomaliesCount?: number;
  acceptedOffersCount?: number;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenLiveScanner?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLang,
  activeRole,
  setActiveRole,
  activePage,
  setActivePage,
  recyclerSubView,
  setRecyclerSubView,
  adminTab,
  setAdminTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  pendingOffersCount = 0,
  openAnomaliesCount = 0,
  acceptedOffersCount = 0,
  currentUser,
  onLogout,
  onOpenLiveScanner,
}) => {
  const roleName =
    activeRole === 'collector'
      ? currentLang === 'hi'
        ? 'कबाड़ीवाला वर्कस्पेस'
        : currentLang === 'mr'
        ? 'कबाडीवाला कार्यक्षेत्र'
        : 'Collector Workspace'
      : activeRole === 'recycler'
      ? currentLang === 'hi'
        ? 'रीसाइक्लर फैसिलिटी'
        : currentLang === 'mr'
        ? 'पुनर्प्रक्रिया सुविधा'
        : 'Recycler Facility'
      : currentLang === 'hi'
      ? 'CPCB प्रशासनिक मंच'
      : currentLang === 'mr'
      ? 'CPCB प्रशासकीय मंच'
      : 'CPCB Governance';

  const roleEmoji = activeRole === 'collector' ? '👷' : activeRole === 'recycler' ? '🏭' : '🏛️';

  const handleNav = (action: () => void) => {
    action();
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop for mobile drawer mode */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Side Navigation Panel"
      >
        {/* SIDEBAR HEADER / ROLE BADGE */}
        <div className="sidebar-header">
          <div className="sidebar-role-badge" title={roleName}>
            <span className="role-icon">{roleEmoji}</span>
            {!isCollapsed && (
              <div className="role-info">
                <span className="role-title">{roleName}</span>
                <span className="role-sub">
                  {activeRole === 'collector'
                    ? 'Informal E-Waste Exchange'
                    : activeRole === 'recycler'
                    ? 'Authorized Facility'
                    : 'Statutory Regulator'}
                </span>
              </div>
            )}
          </div>
          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* QUICK SCAN BANNER (Collector only in expanded state) */}
        {activeRole === 'collector' && !isCollapsed && onOpenLiveScanner && (
          <div className="sidebar-quick-action-box">
            <button
              type="button"
              className="sidebar-scanner-cta"
              onClick={() => handleNav(onOpenLiveScanner)}
            >
              <span className="cta-icon">📷</span>
              <div>
                <strong>{currentLang === 'hi' ? 'AI कबाड़ स्कैनर' : 'Instant AI Scan'}</strong>
                <small>{currentLang === 'hi' ? 'फोटो से भाव जानें' : 'Auto Valuation'}</small>
              </div>
            </button>
          </div>
        )}

        {/* SCROLLABLE NAVIGATION LINKS */}
        <nav className="sidebar-nav-container">
          {/* ===================== 1. COLLECTOR ROLE ===================== */}
          {activeRole === 'collector' && (
            <>
              {/* Group: Core */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'मुख्य' : currentLang === 'mr' ? 'मुख्य' : 'CORE'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('home'))}
                  title={I18N[currentLang].navHome}
                >
                  <span className="nav-item-icon">🏠</span>
                  {!isCollapsed && <span className="nav-item-label">{I18N[currentLang].navHome}</span>}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'create_lot' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('create_lot'))}
                  title={I18N[currentLang].navCreateLot}
                >
                  <span className="nav-item-icon">📸</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navCreateLot}</span>
                  )}
                </button>
              </div>

              {/* Group: Market */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'बाज़ार व नेटवर्क' : currentLang === 'mr' ? 'बाजार व नेटवर्क' : 'MARKET & NETWORK'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'price_board' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('price_board'))}
                  title={I18N[currentLang].navPriceBoard}
                >
                  <span className="nav-item-icon">📈</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navPriceBoard}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'find_recycler' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('find_recycler'))}
                  title={I18N[currentLang].navFindRecycler}
                >
                  <span className="nav-item-icon">🏭</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navFindRecycler}</span>
                  )}
                </button>
              </div>

              {/* Group: Ledger & Finance */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'वित्त व बहीखाता' : currentLang === 'mr' ? 'वित्त व हिशोब' : 'FINANCE & LEDGER'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'earnings' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('earnings'))}
                  title={I18N[currentLang].navEarnings}
                >
                  <span className="nav-item-icon">💰</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navEarnings}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'transactions' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('transactions'))}
                  title={I18N[currentLang].navTransactions}
                >
                  <span className="nav-item-icon">📦</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navTransactions}</span>
                  )}
                </button>
              </div>

              {/* Group: Safety & Settings */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'सहायता व प्रोफ़ाइल' : currentLang === 'mr' ? 'मदत व प्रोफाइल' : 'ASSISTANCE & PROFILE'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'safety' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('safety'))}
                  title={I18N[currentLang].navSafety}
                >
                  <span className="nav-item-icon">🛡️</span>
                  {!isCollapsed && <span className="nav-item-label">{I18N[currentLang].navSafety}</span>}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${activePage === 'profile' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setActivePage('profile'))}
                  title={I18N[currentLang].navProfile}
                >
                  <span className="nav-item-icon">👤</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">{I18N[currentLang].navProfile}</span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ===================== 2. RECYCLER ROLE ===================== */}
          {activeRole === 'recycler' && (
            <>
              {/* Group: Core Operations */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'संचालन' : currentLang === 'mr' ? 'कामकाज' : 'OPERATIONS'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'browse' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('browse'))}
                  title={I18N[currentLang].tabBrowseLots || 'Browse Scrap Lots'}
                >
                  <span className="nav-item-icon">🔍</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].tabBrowseLots || 'Browse Scrap Lots'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'bids' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('bids'))}
                  title={I18N[currentLang].tabBidsOffers || 'Bids & Offers'}
                >
                  <span className="nav-item-icon">🏷️</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].tabBidsOffers || 'Bids & Offers'}
                    </span>
                  )}
                  {pendingOffersCount > 0 && (
                    <span className="sidebar-badge">{pendingOffersCount}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'pickups' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('pickups'))}
                  title={I18N[currentLang].tabPickups || 'Pickups & Weighment'}
                >
                  <span className="nav-item-icon">🚚</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].tabPickups || 'Pickups & Weighment'}
                    </span>
                  )}
                  {acceptedOffersCount > 0 && (
                    <span className="sidebar-badge success">{acceptedOffersCount}</span>
                  )}
                </button>
              </div>

              {/* Group: Traceability */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'अनुपालन व पासपोर्ट' : currentLang === 'mr' ? 'अनुपालन व पासपोर्ट' : 'COMPLIANCE & PASSPORT'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'passports' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('passports'))}
                  title={I18N[currentLang].tabPassports || 'CPCB Digital Passports'}
                >
                  <span className="nav-item-icon">📜</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].tabPassports || 'CPCB Passports'}
                    </span>
                  )}
                </button>
              </div>

              {/* Group: Terminals */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'टर्मिनल टूल्स' : currentLang === 'mr' ? 'टर्मिनल साधने' : 'FIELD TERMINALS'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'radar' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('radar'))}
                  title="Collector Live Radar"
                >
                  <span className="nav-item-icon">📍</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'लाइव कबाड़ रडार' : 'Collector Live Radar'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'scale' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('scale'))}
                  title="Digital Scale Terminal"
                >
                  <span className="nav-item-icon">⚖️</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'डिजिटल कांटा' : 'Digital Scale Terminal'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'payments' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('payments'))}
                  title="Payment Release Terminal"
                >
                  <span className="nav-item-icon">💳</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'भुगतान टर्मिनल' : 'Payment Terminal'}
                    </span>
                  )}
                </button>
              </div>

              {/* Group: Facility Profile */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'संस्थान' : currentLang === 'mr' ? 'संस्था' : 'FACILITY'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${recyclerSubView === 'profile' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setRecyclerSubView('profile'))}
                  title={I18N[currentLang].tabOrgProfile || 'Recycler Facility Profile'}
                >
                  <span className="nav-item-icon">🏢</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].tabOrgProfile || 'Recycler Profile'}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ===================== 3. ADMIN ROLE ===================== */}
          {activeRole === 'admin' && (
            <>
              {/* Group: Monitoring */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'राष्ट्रीय निगरानी' : currentLang === 'mr' ? 'राष्ट्रीय देखरेख' : 'NATIONAL MONITORING'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'kpis' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('kpis'))}
                  title={I18N[currentLang].adminTabOverview || 'National KPIs'}
                >
                  <span className="nav-item-icon">📊</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].adminTabOverview || 'National KPIs'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'radar' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('radar'))}
                  title="Live Circular Radar"
                >
                  <span className="nav-item-icon">📍</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'लाइव परिपत्र रडार' : 'Live Circular Radar'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'journey' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('journey'))}
                  title="Handover Journey"
                >
                  <span className="nav-item-icon">🚚</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'हैंडओवर यात्रा' : 'Handover Journey'}
                    </span>
                  )}
                </button>
              </div>

              {/* Group: Governance & Audit */}
              <div className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {currentLang === 'hi' ? 'सांविधिक नियंत्रण' : currentLang === 'mr' ? 'वैधानिक नियंत्रण' : 'STATUTORY GOVERNANCE'}
                  </div>
                )}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'recyclers' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('recyclers'))}
                  title={I18N[currentLang].adminTabRecyclers || 'Recycler Registry'}
                >
                  <span className="nav-item-icon">🏭</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].adminTabRecyclers || 'Recycler Registry'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'anomalies' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('anomalies'))}
                  title={I18N[currentLang].adminTabAnomalies || 'Fraud Detector'}
                >
                  <span className="nav-item-icon">⚠️</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].adminTabAnomalies || 'Fraud Detector'}
                    </span>
                  )}
                  {openAnomaliesCount > 0 && (
                    <span className="sidebar-badge danger">{openAnomaliesCount}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'lots' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('lots'))}
                  title={I18N[currentLang].adminTabLots || 'Master Ledger'}
                >
                  <span className="nav-item-icon">📋</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {I18N[currentLang].adminTabLots || 'Master Ledger'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'payments' ? 'active' : ''}`}
                  onClick={() => handleNav(() => setAdminTab('payments'))}
                  title="Payment Tracking"
                >
                  <span className="nav-item-icon">💳</span>
                  {!isCollapsed && (
                    <span className="nav-item-label">
                      {currentLang === 'hi' ? 'भुगतान ऑडिट' : 'Payment Tracking'}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-compliance-badge">
              <span className="compliance-dot">●</span>
              <span>SIH 2024 • MoEFCC / CPCB Node</span>
            </div>
          )}

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="collapse-icon">{isCollapsed ? '⮞' : '⮜'}</span>
            {!isCollapsed && (
              <span className="collapse-text">
                {currentLang === 'hi' ? 'पैनल छोटा करें' : 'Collapse Panel'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
