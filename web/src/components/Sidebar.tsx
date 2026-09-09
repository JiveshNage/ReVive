import React from 'react';
import { Lang, ActivePage, UserProfile, I18N } from '../types';

export interface SidebarProps {
  currentLang: Lang;
  activeRole: 'collector' | 'recycler' | 'admin';
  activePage: ActivePage;
  setActivePage: (p: ActivePage) => void;
  recyclerSubView: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (v: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
  adminTab: 'kpis' | 'recyclers' | 'anomalies' | 'lots';
  setAdminTab: (t: 'kpis' | 'recyclers' | 'anomalies' | 'lots') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  currentUser: UserProfile | null;
  pendingOffersCount: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLang,
  activeRole,
  activePage,
  setActivePage,
  recyclerSubView,
  setRecyclerSubView,
  adminTab,
  setAdminTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  pendingOffersCount,
  onLogout,
}) => {
  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
    >
      <div className="brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img className="brand-logo" src="/revive-logo.jpeg" alt="ReVive" />
          <div className="brand-text">
            <strong>{I18N[currentLang].appName}</strong>
            <small>{I18N[currentLang].tagline}</small>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={
            sidebarCollapsed
              ? I18N[currentLang].expandSidebarTooltip
              : I18N[currentLang].collapseSidebarTooltip
          }
          aria-label="Toggle sidebar panel"
        >
          {sidebarCollapsed ? '⇥' : '⇤'}
        </button>
        {mobileMenuOpen && (
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 0,
              fontSize: '20px',
              cursor: 'pointer',
              color: '#475569',
              marginLeft: 'auto',
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        )}
      </div>

      {/* RBAC Scoped Navigation */}
      <nav>
        {activeRole === 'collector' ? (
          <>
            <button
              className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
              title={I18N[currentLang].navHome}
              onClick={() => {
                setActivePage('home');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌂</span>
              <span>{I18N[currentLang].navHome}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'create_lot' ? 'active' : ''}`}
              title={I18N[currentLang].navCreateLot}
              onClick={() => {
                setActivePage('create_lot');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌾</span>
              <span>{I18N[currentLang].navCreateLot}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'price_board' ? 'active' : ''}`}
              title={I18N[currentLang].navPriceBoard}
              onClick={() => {
                setActivePage('price_board');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">▥</span>
              <span>{I18N[currentLang].navPriceBoard}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'find_recycler' ? 'active' : ''}`}
              title={I18N[currentLang].navFindRecycler}
              onClick={() => {
                setActivePage('find_recycler');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌖</span>
              <span>{I18N[currentLang].navFindRecycler}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'earnings' ? 'active' : ''}`}
              title={I18N[currentLang].navEarnings}
              onClick={() => {
                setActivePage('earnings');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">₹</span>
              <span>{I18N[currentLang].navEarnings}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`}
              title={I18N[currentLang].navTransactions}
              onClick={() => {
                setActivePage('transactions');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">◴</span>
              <span>{I18N[currentLang].navTransactions}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'safety' ? 'active' : ''}`}
              title={I18N[currentLang].navSafety}
              onClick={() => {
                setActivePage('safety');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">♡</span>
              <span>{I18N[currentLang].navSafety}</span>
            </button>
            <button
              className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
              title={I18N[currentLang].navProfile}
              onClick={() => {
                setActivePage('profile');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">●</span>
              <span>{I18N[currentLang].navProfile}</span>
            </button>
          </>
        ) : activeRole === 'recycler' ? (
          <>
            <button
              className={`nav-item ${recyclerSubView === 'browse' ? 'active' : ''}`}
              title={I18N[currentLang].tabBrowseLots}
              onClick={() => {
                setRecyclerSubView('browse');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌂</span>
              <span>{I18N[currentLang].tabBrowseLots}</span>
            </button>
            <button
              className={`nav-item ${recyclerSubView === 'bids' ? 'active' : ''}`}
              title={I18N[currentLang].tabBidsOffers}
              onClick={() => {
                setRecyclerSubView('bids');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">▥</span>
              <span>
                {I18N[currentLang].tabBidsOffers} ({pendingOffersCount})
              </span>
            </button>
            <button
              className={`nav-item ${recyclerSubView === 'pickups' ? 'active' : ''}`}
              title={I18N[currentLang].tabPickups}
              onClick={() => {
                setRecyclerSubView('pickups');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌖</span>
              <span>{I18N[currentLang].tabPickups}</span>
            </button>
            <button
              className={`nav-item ${recyclerSubView === 'passports' ? 'active' : ''}`}
              title={I18N[currentLang].tabPassports}
              onClick={() => {
                setRecyclerSubView('passports');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">₹</span>
              <span>{I18N[currentLang].tabPassports}</span>
            </button>
            <button
              className={`nav-item ${recyclerSubView === 'profile' ? 'active' : ''}`}
              title={I18N[currentLang].tabOrgProfile}
              onClick={() => {
                setRecyclerSubView('profile');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">●</span>
              <span>{I18N[currentLang].tabOrgProfile}</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-item ${adminTab === 'kpis' ? 'active' : ''}`}
              title={I18N[currentLang].adminTabOverview}
              onClick={() => {
                setAdminTab('kpis');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌂</span>
              <span>{I18N[currentLang].adminTabOverview}</span>
            </button>
            <button
              className={`nav-item ${adminTab === 'recyclers' ? 'active' : ''}`}
              title={I18N[currentLang].adminTabRecyclers}
              onClick={() => {
                setAdminTab('recyclers');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⌖</span>
              <span>{I18N[currentLang].adminTabRecyclers}</span>
            </button>
            <button
              className={`nav-item ${adminTab === 'anomalies' ? 'active' : ''}`}
              title={I18N[currentLang].adminTabAnomalies}
              onClick={() => {
                setAdminTab('anomalies');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">⚠</span>
              <span>{I18N[currentLang].adminTabAnomalies}</span>
            </button>
            <button
              className={`nav-item ${adminTab === 'lots' ? 'active' : ''}`}
              title={I18N[currentLang].adminTabLots}
              onClick={() => {
                setAdminTab('lots');
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">▥</span>
              <span>{I18N[currentLang].adminTabLots}</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-note">
        <span className="leaf large">⌁</span>
        <strong>
          {I18N[currentLang].cleanToday}
          <br />
          {I18N[currentLang].greenerTomorrow}
        </strong>
        <button
          type="button"
          aria-label="Open impact information"
          onClick={() => {
            if (activeRole === 'collector') setActivePage('transactions');
            else if (activeRole === 'recycler') setRecyclerSubView('passports');
            else setAdminTab('kpis');
          }}
        >
          →
        </button>
      </div>

      {/* Authenticated User Footprint & Logout */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #dce9df',
          background: '#f8faf9',
          marginTop: 'auto',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
            {activeRole === 'admin'
              ? 'AD'
              : activeRole === 'recycler'
              ? 'RR'
              : currentUser?.name
              ? currentUser.name.slice(0, 2).toUpperCase()
              : 'CO'}
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0c3b2d',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUser?.name || 'Authorized User'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#059669',
                }}
              >
                {currentUser?.custom_user_id ||
                  (activeRole === 'collector'
                    ? 'REV-COL-2026-1024'
                    : activeRole === 'recycler'
                    ? 'REV-REC-2026-0812'
                    : 'CPCB-GOV-2026-0001')}
              </div>
              <div style={{ fontSize: '11.5px', color: '#57786b' }}>
                {activeRole === 'admin'
                  ? I18N[currentLang].roleAdminVerified
                  : activeRole === 'recycler'
                  ? I18N[currentLang].roleRecyclerVerified
                  : I18N[currentLang].roleCollectorVerified}
              </div>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            type="button"
            className="secondary-button"
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '12px',
              color: '#dc2626',
              borderColor: '#fca5a5',
              background: '#fff',
            }}
            onClick={onLogout}
          >
            {I18N[currentLang].logoutBtn}
          </button>
        )}
      </div>
    </aside>
  );
};
