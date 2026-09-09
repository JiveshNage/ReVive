import React from 'react';
import { Lang, I18N } from '../../types';

export interface SignupPageProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  onNavigateLogin: () => void;
  onClose?: () => void;
  authRole: 'collector' | 'recycler' | 'admin';
  setAuthRole: (role: 'collector' | 'recycler' | 'admin') => void;
  profileName: string;
  setProfileName: (n: string) => void;
  loginPhone: string;
  setLoginPhone: (p: string) => void;
  loginEmail: string;
  setLoginEmail: (e: string) => void;
  profileLocation: string;
  setProfileLocation: (loc: string) => void;
  regCompanyName: string;
  setRegCompanyName: (c: string) => void;
  regLicenseNo: string;
  setRegLicenseNo: (l: string) => void;
  regServiceArea: string;
  setRegServiceArea: (s: string) => void;
  authLoading: boolean;
  authMsg: string;
  onCompleteProfile: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  currentLang,
  onSelectLang,
  onNavigateLogin,
  onClose,
  authRole,
  setAuthRole,
  profileName,
  setProfileName,
  loginPhone,
  setLoginPhone,
  loginEmail,
  setLoginEmail,
  profileLocation,
  setProfileLocation,
  regCompanyName,
  setRegCompanyName,
  regLicenseNo,
  setRegLicenseNo,
  regServiceArea,
  setRegServiceArea,
  authLoading,
  authMsg,
  onCompleteProfile,
}) => {
  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        {/* Left Visual Brand Panel */}
        <div className="auth-brand-side">
          <div className="auth-brand-badge">
            <img src={currentLang === 'hi' ? '/revive-logo-hi.jpeg' : '/revive-logo.jpeg'} alt="ReVive" />
            <div>
              <h3>ReVive</h3>
              <p>National E-Waste Circular Exchange</p>
            </div>
          </div>

          <div className="auth-quote-box">
            <h4>{currentLang === 'hi' ? 'सीपीसीबी पंजीकृत अनौपचारिक ई-कचरा भागीदार' : 'Formalize Your Green Recycling Journey'}</h4>
            <p>
              {currentLang === 'hi'
                ? 'अनौपचारिक कबाड़ीवालों को डिजिटल पहचान, प्रत्यक्ष बैंक भुगतान, और स्वास्थ्य सुरक्षा उपकरण प्रदान करना।'
                : 'Get registered under Central Pollution Control Board guidelines with digital identity and statutory compliance.'}
            </p>
          </div>

          <div className="auth-trust-pills">
            <span>🌿 Green EPR Credit System</span>
            <span>📱 Trilingual Mobile Audio Support</span>
            <span>⚖️ Certified Digital Scales</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-side">
          {onClose && (
            <button type="button" className="auth-close-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}

          {/* Top Bar with Language Picker */}
          <div className="auth-top-actions">
            <div className="auth-lang-picker">
              <button
                type="button"
                className={currentLang === 'en' ? 'active' : ''}
                onClick={() => onSelectLang('en')}
              >
                English
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
          </div>

          <div className="auth-header-text">
            <h2>{currentLang === 'hi' ? 'नया खाता बनाएं' : currentLang === 'mr' ? 'नवीन खाते नोंदणी' : 'Create an Account'}</h2>
            <p>
              {currentLang === 'hi'
                ? 'नया खाता बनाएं और ई-कचरा आपूर्ति श्रृंखला से तुरंत जुड़ें'
                : 'Create your account to start selling or procuring certified e-waste scrap'}
            </p>
          </div>

          {/* Role Choice */}
          <div className="auth-role-selector">
            <button
              type="button"
              className={authRole === 'collector' ? 'active' : ''}
              onClick={() => setAuthRole('collector')}
            >
              👷 {I18N[currentLang].collectorRole} (Kabadiwala)
            </button>
            <button
              type="button"
              className={authRole === 'recycler' ? 'active' : ''}
              onClick={() => setAuthRole('recycler')}
            >
              🏭 {I18N[currentLang].recyclerRole} (CPCB Unit)
            </button>
          </div>

          {/* Dynamic Registration Fields */}
          <div className="auth-field-group">
            <label>{currentLang === 'hi' ? 'पूरा नाम / प्रतिनिधि का नाम' : 'Full Name / Representative'}</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Ram Yadav / Suresh Patil"
              className="auth-input"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>{currentLang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="auth-input"
                  required
                />
              </div>
              <div>
                <label>{currentLang === 'hi' ? 'शहर / जिला' : 'City / District'}</label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  placeholder="e.g. Bhopal, MP"
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div>
              <label>{currentLang === 'hi' ? 'ईमेल पता' : 'Email Address'}</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="user@revive-ewaste.gov.in"
                className="auth-input"
              />
            </div>

            {authRole === 'recycler' && (
              <>
                <div className="recycler-specific-box">
                  <h4>CPCB Statutory Licensing Verification</h4>
                  <div>
                    <label>{currentLang === 'hi' ? 'कंपनी / रीसाइक्लिंग इकाई का नाम' : 'Company / Facility Name'}</label>
                    <input
                      type="text"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="EcoCycle Solutions Pvt Ltd"
                      className="auth-input"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <label>{currentLang === 'hi' ? 'सीपीसीबी लाइसेंस संख्या' : 'CPCB License No.'}</label>
                      <input
                        type="text"
                        value={regLicenseNo}
                        onChange={(e) => setRegLicenseNo(e.target.value)}
                        placeholder="CPCB/EW/2025/1102"
                        className="auth-input"
                        required
                      />
                    </div>
                    <div>
                      <label>{currentLang === 'hi' ? 'ऑपरेटिंग क्षेत्र (MIDC/Zone)' : 'Operating Area'}</label>
                      <input
                        type="text"
                        value={regServiceArea}
                        onChange={(e) => setRegServiceArea(e.target.value)}
                        placeholder="Pune MIDC & Western Region"
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              className="auth-submit-btn"
              onClick={onCompleteProfile}
              disabled={authLoading || !profileName || loginPhone.length < 10}
            >
              {authLoading ? '...' : currentLang === 'hi' ? 'पंजीकरण पूरा करें' : 'Complete Registration'}
            </button>
          </div>

          {authMsg && <p className="auth-status-msg">{authMsg}</p>}

          <div className="auth-footer-prompt">
            <p>
              {currentLang === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
              <button type="button" onClick={onNavigateLogin} className="link-button">
                {currentLang === 'hi' ? 'लॉगिन करें' : 'Sign In'} →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
