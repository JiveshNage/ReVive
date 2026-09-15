import React from 'react';
import { Lang, I18N } from '../../types';

export interface LoginPageProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  onNavigateSignup: () => void;
  onClose?: () => void;
  authMethod: 'mobile' | 'email';
  setAuthMethod: (m: 'mobile' | 'email') => void;
  authRole: 'collector' | 'recycler' | 'admin';
  setAuthRole: (role: 'collector' | 'recycler' | 'admin') => void;
  loginPhone: string;
  setLoginPhone: (p: string) => void;
  loginEmail: string;
  setLoginEmail: (e: string) => void;
  loginOtp: string;
  setLoginOtp: (otp: string) => void;
  onboardingStep: 'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup';
  setOnboardingStep: (step: 'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup') => void;
  authLoading: boolean;
  authMsg: string;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onQuickDemoLogin: (role: 'collector' | 'recycler' | 'admin') => void;
  onFirebaseLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentLang,
  onSelectLang,
  onNavigateSignup,
  onClose,
  authMethod,
  setAuthMethod,
  authRole,
  setAuthRole,
  loginPhone,
  setLoginPhone,
  loginEmail,
  setLoginEmail,
  loginOtp,
  setLoginOtp,
  onboardingStep,
  setOnboardingStep,
  authLoading,
  authMsg,
  onSendOtp,
  onVerifyOtp,
  onQuickDemoLogin,
  onFirebaseLogin,
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
            <h4>{currentLang === 'hi' ? 'कबाड़ से समृद्धि, पर्यावरण की सुरक्षा' : 'Empowering Informal Waste Pickers into Authorized Green Heroes'}</h4>
            <p>
              {currentLang === 'hi'
                ? 'सीपीसीबी प्रमाणित रीसाइक्लिंग नेटवर्क, निष्पक्ष लाइव एमएसपी भाव, और डिजिटल तराजू सत्यापन।'
                : 'Government CPCB compliant digital bridge providing fair live MSP scrap prices and traceable tamper-evident passports.'}
            </p>
          </div>

          <div className="auth-trust-pills">
            <span>🛡️ CPCB EPR Recognized</span>
            <span>⚡ Instant UPI / Cash Ledger</span>
            <span>🔒 SHA-256 Tamper Proof</span>
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
            <h2>{currentLang === 'hi' ? 'लॉगिन करें' : currentLang === 'mr' ? 'लॉगिन करा' : 'Sign In to ReVive'}</h2>
            <p>
              {currentLang === 'hi'
                ? 'अपने पंजीकृत मोबाइल नंबर या ईमेल से सुरक्षित लॉगिन करें'
                : 'Sign in to access live scrap prices, digital scale verification, and passports'}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="auth-role-selector">
            <button
              type="button"
              className={authRole === 'collector' ? 'active' : ''}
              onClick={() => setAuthRole('collector')}
            >
              👷 {I18N[currentLang].collectorRole}
            </button>
            <button
              type="button"
              className={authRole === 'recycler' ? 'active' : ''}
              onClick={() => setAuthRole('recycler')}
            >
              🏭 {I18N[currentLang].recyclerRole}
            </button>
            <button
              type="button"
              className={authRole === 'admin' ? 'active' : ''}
              onClick={() => setAuthRole('admin')}
            >
              🏛️ {I18N[currentLang].adminRole}
            </button>
          </div>

          {/* Auth Method Toggle */}
          <div className="auth-method-tabs">
            <button
              type="button"
              className={authMethod === 'mobile' ? 'active' : ''}
              onClick={() => {
                setAuthMethod('mobile');
                setOnboardingStep('phone_input');
              }}
            >
              📱 {currentLang === 'hi' ? 'मोबाइल नंबर' : 'Mobile OTP'}
            </button>
            <button
              type="button"
              className={authMethod === 'email' ? 'active' : ''}
              onClick={() => {
                setAuthMethod('email');
                setOnboardingStep('phone_input');
              }}
            >
              ✉️ {currentLang === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
            </button>
          </div>

          {/* Form Controls */}
          {onboardingStep === 'otp_verify' ? (
            <div className="auth-field-group">
              <label>
                {currentLang === 'hi' ? '6-अंकों का ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                <span className="otp-demo-hint">(Demo OTP: 123456)</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="auth-input otp-large"
                autoFocus
              />
              <button
                type="button"
                className="auth-submit-btn"
                onClick={onVerifyOtp}
                disabled={authLoading || loginOtp.length < 6}
              >
                {authLoading ? '...' : currentLang === 'hi' ? 'ओटीपी सत्यापित करें' : 'Verify OTP & Sign In'}
              </button>
              <div className="auth-sub-links">
                <button type="button" onClick={() => setOnboardingStep('phone_input')}>
                  ← {currentLang === 'hi' ? 'नंबर बदलें' : 'Change number'}
                </button>
                <button type="button" onClick={onSendOtp}>
                  {currentLang === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-field-group">
              {authMethod === 'mobile' ? (
                <>
                  <label>{currentLang === 'hi' ? 'मोबाइल नंबर दर्ज करें' : 'Enter 10-Digit Mobile Number'}</label>
                  <div className="phone-input-wrapper">
                    <span className="country-prefix">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="auth-input phone"
                      autoFocus
                    />
                  </div>
                </>
              ) : (
                <>
                  <label>{currentLang === 'hi' ? 'ईमेल पता दर्ज करें' : 'Official Email Address'}</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@revive-ewaste.gov.in"
                    className="auth-input"
                    autoFocus
                  />
                </>
              )}

              <button
                type="button"
                className="auth-submit-btn"
                onClick={onSendOtp}
                disabled={authLoading || (authMethod === 'mobile' ? loginPhone.length < 10 : !loginEmail)}
              >
                {authLoading ? '...' : currentLang === 'hi' ? 'ओटीपी भेजें' : 'Send One-Time Password'}
              </button>
            </div>
          )}

          {authMsg && <p className="auth-status-msg">{authMsg}</p>}

          {onFirebaseLogin && (
            <div className="firebase-auth-section" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <div className="divider-label" style={{ marginBottom: '0.75rem' }}>
                <span>{currentLang === 'hi' ? 'या गूगल के साथ सुरक्षित लॉगिन' : 'Or Continue with Firebase'}</span>
              </div>
              <button
                type="button"
                className="firebase-google-btn"
                onClick={onFirebaseLogin}
                disabled={authLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {currentLang === 'hi' ? 'गूगल से लॉगिन करें (Firebase)' : 'Sign in with Google (Firebase)'}
              </button>
            </div>
          )}

          {/* Quick Demo Instant Access Buttons */}
          <div className="auth-quick-demo-section">
            <div className="divider-label">
              <span>{currentLang === 'hi' ? 'या 1-क्लिक त्वरित डेमो लॉगिन' : 'Or 1-Click Fast Demo Login'}</span>
            </div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="demo-role-btn collector"
                onClick={() => onQuickDemoLogin('collector')}
              >
                👷 {I18N[currentLang].collectorRole}
                <small>Ram Yadav · Bhopal</small>
              </button>
              <button
                type="button"
                className="demo-role-btn recycler"
                onClick={() => onQuickDemoLogin('recycler')}
              >
                🏭 {I18N[currentLang].recyclerRole}
                <small>EcoCycle · Pune MIDC</small>
              </button>
              <button
                type="button"
                className="demo-role-btn admin"
                onClick={() => onQuickDemoLogin('admin')}
              >
                🏛️ {I18N[currentLang].adminRole}
                <small>CPCB Officer · Delhi</small>
              </button>
            </div>
          </div>

          <div className="auth-footer-prompt">
            <p>
              {currentLang === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
              <button type="button" onClick={onNavigateSignup} className="link-button">
                {currentLang === 'hi' ? 'नया खाता बनाएं' : 'Sign Up'} →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
