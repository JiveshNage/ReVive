import React from 'react';
import { ActivePage, Lang } from '../types';

export interface MobileBottomNavProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentLang: Lang;
  onOpenLiveScanner: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  setActivePage,
  currentLang,
  onOpenLiveScanner,
}) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* 1. HOME */}
      <button
        type="button"
        className={`mobile-nav-item ${activePage === 'home' ? 'active' : ''}`}
        onClick={() => setActivePage('home')}
      >
        <span className="mobile-nav-icon">🏠</span>
        <span className="mobile-nav-label">
          {currentLang === 'hi' ? 'होम' : currentLang === 'mr' ? 'मुख्य' : 'Home'}
        </span>
      </button>

      {/* 2. PRICE RATES */}
      <button
        type="button"
        className={`mobile-nav-item ${activePage === 'price_board' ? 'active' : ''}`}
        onClick={() => setActivePage('price_board')}
      >
        <span className="mobile-nav-icon">📈</span>
        <span className="mobile-nav-label">
          {currentLang === 'hi' ? 'लाइव भाव' : currentLang === 'mr' ? 'बाजार दर' : 'Rates'}
        </span>
      </button>

      {/* 3. CENTER ELEVATED CAMERA SCAN BUTTON */}
      <div className="mobile-scan-center-wrap">
        <button
          type="button"
          className="mobile-scan-fab"
          onClick={onOpenLiveScanner}
          aria-label="Open Camera Scanner"
        >
          <span className="fab-icon">📸</span>
          <span className="fab-pulse" />
        </button>
        <span className="fab-label">
          {currentLang === 'hi' ? 'स्कैन करें' : currentLang === 'mr' ? 'स्कॅन करा' : 'Scan'}
        </span>
      </div>

      {/* 4. TRANSACTIONS / LOTS */}
      <button
        type="button"
        className={`mobile-nav-item ${activePage === 'transactions' ? 'active' : ''}`}
        onClick={() => setActivePage('transactions')}
      >
        <span className="mobile-nav-icon">📦</span>
        <span className="mobile-nav-label">
          {currentLang === 'hi' ? 'मेरे लॉट' : currentLang === 'mr' ? 'माझे लॉट्स' : 'My Lots'}
        </span>
      </button>

      {/* 5. SAFETY */}
      <button
        type="button"
        className={`mobile-nav-item ${activePage === 'safety' ? 'active' : ''}`}
        onClick={() => setActivePage('safety')}
      >
        <span className="mobile-nav-icon">🛡️</span>
        <span className="mobile-nav-label">
          {currentLang === 'hi' ? 'सुरक्षा' : currentLang === 'mr' ? 'सुरक्षा' : 'Safety'}
        </span>
      </button>
    </nav>
  );
};
