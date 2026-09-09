import React from 'react';
import { Lang, I18N } from '../types';

export interface AuthModalProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
  onClose: () => void;
  authTab: 'login' | 'signup';
  setAuthTab: (tab: 'login' | 'signup') => void;
  authRole: 'collector' | 'recycler' | 'admin';
  setAuthRole: (role: 'collector' | 'recycler' | 'admin') => void;
  onboardingStep: 'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup';
  setOnboardingStep: (step: 'language_choice' | 'phone_input' | 'otp_verify' | 'profile_setup') => void;
  authMethod: 'mobile' | 'email';
  setAuthMethod: (m: 'mobile' | 'email') => void;
  loginPhone: string;
  setLoginPhone: (p: string) => void;
  loginEmail: string;
  setLoginEmail: (e: string) => void;
  loginOtp: string;
  setLoginOtp: (otp: string) => void;
  profileName: string;
  setProfileName: (n: string) => void;
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
  onQuickDemoLogin: (role: 'collector' | 'recycler' | 'admin') => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onCompleteProfile: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentLang,
  onSelectLang,
  onClose,
  authTab,
  setAuthTab,
  authRole,
  setAuthRole,
  onboardingStep,
  setOnboardingStep,
  authMethod,
  setAuthMethod,
  loginPhone,
  setLoginPhone,
  loginEmail,
  setLoginEmail,
  loginOtp,
  setLoginOtp,
  profileName,
  setProfileName,
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
  onQuickDemoLogin,
  onSendOtp,
  onVerifyOtp,
  onCompleteProfile,
}) => {
  return (
    <div
      className="auth-portal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-box" role="dialog" aria-modal="true">
        {/* 1. Header of the Box with Logo and Title */}
        <div className="auth-box-header">
          <div className="auth-box-brand">
            <img
              src={currentLang === 'hi' ? '/revive-logo-hi.jpeg' : '/revive-logo.jpeg'}
              alt="ReVive"
              className="auth-box-logo"
            />
            <div>
              <strong style={{ fontSize: '18px', color: '#0c3b2d', display: 'block', lineHeight: 1.1 }}>
                ReVive
              </strong>
              <small style={{ fontSize: '11px', color: '#57786b', fontWeight: 600 }}>
                Circular Economy Exchange
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="lang-picker" aria-label="Language switcher">
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
            <button
              type="button"
              className="auth-box-close-btn"
              title="Back to Homepage"
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* 2. Login vs Sign Up Mode Tabs inside the Box */}
        <div className="auth-box-mode-tabs">
          <button
            type="button"
            className={`auth-box-mode-tab ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthTab('login');
              setOnboardingStep('phone_input');
            }}
          >
            🔑 {currentLang === 'hi' ? 'लॉगिन करें (Sign In)' : currentLang === 'mr' ? 'लॉगिन करा (Sign In)' : 'Login / Sign In'}
          </button>
          <button
            type="button"
            className={`auth-box-mode-tab ${authTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setAuthTab('signup');
              setOnboardingStep('profile_setup');
            }}
          >
            ✍️ {currentLang === 'hi' ? 'नया खाता बनाएं (Sign Up)' : currentLang === 'mr' ? 'नवीन खाते (Sign Up)' : 'Sign Up / Register'}
          </button>
        </div>

        {/* 3. Persona Selector inside the Box */}
        <div className="auth-box-role-tabs">
          <button
            type="button"
            className={`auth-box-role-tab ${authRole === 'collector' ? 'active' : ''}`}
            onClick={() => setAuthRole('collector')}
          >
            🧺 {I18N[currentLang].collectorRole}
          </button>
          <button
            type="button"
            className={`auth-box-role-tab ${authRole === 'recycler' ? 'active' : ''}`}
            onClick={() => setAuthRole('recycler')}
          >
            🏭 {I18N[currentLang].recyclerRole}
          </button>
          <button
            type="button"
            className={`auth-box-role-tab ${authRole === 'admin' ? 'active' : ''}`}
            onClick={() => setAuthRole('admin')}
          >
            🏛️ {I18N[currentLang].adminRole}
          </button>
        </div>

        {/* 4. Active Role Context Banner */}
        <div
          style={{
            background: authRole === 'collector' ? '#ecfdf5' : authRole === 'recycler' ? '#eff6ff' : '#faf5ff',
            border: `1px solid ${
              authRole === 'collector' ? '#a7f3d0' : authRole === 'recycler' ? '#bfdbfe' : '#e9d5ff'
            }`,
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: authRole === 'collector' ? '#065f46' : authRole === 'recycler' ? '#1e40af' : '#6b21a8',
            }}
          >
            {authRole === 'collector'
              ? '🧺 Informal Kabadiwala Gateway'
              : authRole === 'recycler'
              ? '🏭 Authorized Recycler Plant'
              : '🏛️ CPCB Regulatory Directorate'}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 800,
              color: '#475569',
              background: '#fff',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
            }}
          >
            {authRole === 'collector'
              ? 'ID: REV-COL-2026-1024'
              : authRole === 'recycler'
              ? 'ID: REV-REC-2026-0812'
              : 'ID: CPCB-GOV-2026-0001'}
          </span>
        </div>

        {/* 5. BOX BODY: IF LOGIN MODE */}
        {authTab === 'login' && (
          <div>
            {/* Fast 1-Click Evaluator Demo Login */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#334155',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                ⚡ 1-Click Fast Evaluator Login:
              </div>
              <button
                type="button"
                className="primary-button"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                disabled={authLoading}
                onClick={() => onQuickDemoLogin(authRole)}
              >
                {authRole === 'collector' && '🧺 Instant Login: Ram Yadav (REV-COL-2026-1024)'}
                {authRole === 'recycler' && '🏭 Instant Login: EcoCycle Solutions (REV-REC-2026-0812)'}
                {authRole === 'admin' && '🏛️ Instant Login: CPCB Directorate (CPCB-GOV-2026-0001)'}
              </button>
            </div>

            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                margin: '14px 0',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              <span style={{ background: '#fff', padding: '0 10px', position: 'relative', zIndex: 1 }}>
                OR SIGN IN WITH OTP
              </span>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: '#e2e8f0',
                  zIndex: 0,
                }}
              />
            </div>

            {/* Login Method Tabs */}
            <div className="login-method-tabs" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`login-method-tab ${authMethod === 'mobile' ? 'active' : ''}`}
                onClick={() => setAuthMethod('mobile')}
              >
                📱 Mobile OTP (+91)
              </button>
              <button
                type="button"
                className={`login-method-tab ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => setAuthMethod('email')}
              >
                ✉️ Email OTP (Brevo)
              </button>
            </div>

            {onboardingStep === 'phone_input' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1a4234',
                      marginBottom: '6px',
                    }}
                  >
                    {authMethod === 'mobile' ? I18N[currentLang].phoneLabel : 'Official Email Address'} *
                  </label>
                  {authMethod === 'mobile' ? (
                    <div className="phone-input-wrap">
                      <span className="country-code">🇮🇳 +91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className="modal-input-field"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                  ) : (
                    <input
                      type="email"
                      className="modal-input-field"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cfe0d8',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. collector@revive.gov.in"
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="wizard-btn-primary"
                  style={{ width: '100%' }}
                  disabled={authLoading}
                  onClick={onSendOtp}
                >
                  {authLoading
                    ? 'Sending...'
                    : currentLang === 'hi'
                    ? 'ओटीपी प्राप्त करें (Send OTP) →'
                    : currentLang === 'mr'
                    ? 'ओटीपी पाठवा (Send OTP) →'
                    : 'Send Verification OTP →'}
                </button>
              </div>
            )}

            {onboardingStep === 'otp_verify' && (
              <div>
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    color: '#065f46',
                  }}
                >
                  {authMsg ||
                    `Demo Code: 123456 sent to ${
                      authMethod === 'mobile' ? '+91 ' + loginPhone : loginEmail
                    }`}
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1a4234',
                      marginBottom: '6px',
                    }}
                  >
                    Enter 6-Digit OTP Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="modal-input-field"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #086c4b',
                      borderRadius: '8px',
                      fontSize: '18px',
                      textAlign: 'center',
                      letterSpacing: '0.3em',
                      fontWeight: 800,
                      boxSizing: 'border-box',
                    }}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="wizard-btn-secondary"
                    onClick={() => setOnboardingStep('phone_input')}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="wizard-btn-primary"
                    style={{ flex: 1 }}
                    disabled={authLoading}
                    onClick={onVerifyOtp}
                  >
                    {authLoading ? 'Verifying...' : 'Verify OTP & Log In →'}
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                textAlign: 'center',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '13px',
                color: '#64748b',
              }}
            >
              Don't have an account yet?{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#086c4b',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => {
                  setAuthTab('signup');
                  setOnboardingStep('profile_setup');
                }}
              >
                Create Account & Get Statutory ID →
              </button>
            </div>
          </div>
        )}

        {/* 6. BOX BODY: IF SIGN UP MODE */}
        {authTab === 'signup' && (
          <div>
            {/* Statutory ID Minting Preview Banner */}
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#065f46',
                  }}
                >
                  ✓ Statutory Unique ID Assigned On Registration
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: '#047857',
                    marginTop: '2px',
                  }}
                >
                  {authRole === 'collector'
                    ? 'REV-COL-2026-XXXX'
                    : authRole === 'recycler'
                    ? 'REV-REC-2026-XXXX'
                    : 'CPCB-GOV-2026-XXXX'}
                </div>
              </div>
              <span className="digital-id-chip">CPCB DIRECTORY</span>
            </div>

            {/* Vernacular Language Preference */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1a4234',
                  marginBottom: '6px',
                }}
              >
                Preferred Vernacular Language / भाषा *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  className={`lang-card-option ${currentLang === 'hi' ? 'selected' : ''}`}
                  style={{ padding: '8px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => onSelectLang('hi')}
                >
                  <strong>🇮🇳 हिन्दी</strong>
                </button>
                <button
                  type="button"
                  className={`lang-card-option ${currentLang === 'mr' ? 'selected' : ''}`}
                  style={{ padding: '8px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => onSelectLang('mr')}
                >
                  <strong>🚩 मराठी</strong>
                </button>
                <button
                  type="button"
                  className={`lang-card-option ${currentLang === 'en' ? 'selected' : ''}`}
                  style={{ padding: '8px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => onSelectLang('en')}
                >
                  <strong>🇬🇧 English</strong>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#1a4234',
                    marginBottom: '4px',
                  }}
                >
                  {authRole === 'recycler' ? 'Company / Plant Name *' : 'Full Legal Name / पूरा नाम *'}
                </label>
                <input
                  type="text"
                  required
                  className="modal-input-field"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cfe0d8',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder={
                    authRole === 'recycler' ? 'e.g. EcoCycle Solutions Pvt Ltd' : 'e.g. राम यादव / Ram Yadav'
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1a4234',
                      marginBottom: '4px',
                    }}
                  >
                    Mobile Phone Number *
                  </label>
                  <div className="phone-input-wrap">
                    <span className="country-code">🇮🇳 +91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      className="modal-input-field"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1a4234',
                      marginBottom: '4px',
                    }}
                  >
                    Official Email *
                  </label>
                  <input
                    type="email"
                    className="modal-input-field"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cfe0d8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. user@revive.gov.in"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#1a4234',
                    marginBottom: '4px',
                  }}
                >
                  Operating City & State / कार्यक्षेत्र *
                </label>
                <input
                  type="text"
                  required
                  className="modal-input-field"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cfe0d8',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  placeholder={authRole === 'recycler' ? 'e.g. Pune, Maharashtra' : 'e.g. Bhopal, MP or Pune, MH'}
                />
              </div>

              {authRole === 'recycler' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1a4234',
                        marginBottom: '4px',
                      }}
                    >
                      CPCB License Number *
                    </label>
                    <input
                      type="text"
                      className="modal-input-field"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cfe0d8',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                      value={regLicenseNo}
                      onChange={(e) => setRegLicenseNo(e.target.value)}
                      placeholder="CPCB/EW/2024/0981"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1a4234',
                        marginBottom: '4px',
                      }}
                    >
                      Collection Radius / Service Area *
                    </label>
                    <input
                      type="text"
                      className="modal-input-field"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cfe0d8',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                      value={regServiceArea}
                      onChange={(e) => setRegServiceArea(e.target.value)}
                      placeholder="e.g. Pune, PCMC, Western MH"
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  background: '#f8fafc',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                  color: '#475569',
                }}
              >
                <span style={{ color: '#059669', fontWeight: 700 }}>✓ CPCB Statutory Digital Registry</span>
                <p style={{ margin: '4px 0 0' }}>
                  {authRole === 'recycler'
                    ? 'Your organization is registered in the CPCB central directory for fair procurement and tamper-proof recycling passports.'
                    : 'Your profile creates an official digital identity on ReVive, entitling you to statutory fair price guarantees and traceable receipts.'}
                </p>
              </div>

              <button
                type="button"
                className="wizard-btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
                disabled={authLoading}
                onClick={onCompleteProfile}
              >
                {authLoading ? 'Creating Account...' : '🚀 Create Account & Issue Statutory ID'}
              </button>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '13px',
                  color: '#64748b',
                }}
              >
                Already registered on ReVive?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#086c4b',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    setAuthTab('login');
                    setOnboardingStep('phone_input');
                  }}
                >
                  Click here to Sign In →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
