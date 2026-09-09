import React from 'react';
import { UserProfile } from '../../types';

export interface RecyclerProfileProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const RecyclerProfile: React.FC<RecyclerProfileProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="recycler-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>🏢 Recycler Organization Profile</h2>
          <p>Central Pollution Control Board statutory registration and facility profile</p>
        </div>
        <div>
          <button type="button" className="danger-button" onClick={onLogout}>
            Logout / Switch Account
          </button>
        </div>
      </div>

      <div className="enterprise-profile-card">
        <div className="profile-hero-section">
          <div className="facility-logo-placeholder">🏭</div>
          <div>
            <h3>{currentUser?.company_name || 'EcoCycle Pune Solutions Pvt Ltd'}</h3>
            <span className="status-pill verified" style={{ fontSize: '13px' }}>
              ✓ CPCB Authorized Dismantler & Recycler
            </span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-field-item">
            <span>CPCB Registration / EPR License</span>
            <strong style={{ color: '#059669', fontFamily: 'monospace', fontSize: '16px' }}>
              {currentUser?.license_no || 'CPCB/EW/2024/0981'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span>Headquarter Facility Location</span>
            <strong>{currentUser?.location || 'Pune MIDC, Bhosari, Maharashtra'}</strong>
          </div>

          <div className="profile-field-item">
            <span>Service Coverage Area</span>
            <strong>{currentUser?.service_area || 'Pune, PCMC, Nashik & Western Region'}</strong>
          </div>

          <div className="profile-field-item">
            <span>Registered Representative</span>
            <strong>{currentUser?.name || 'Raj Recycler'}</strong>
          </div>

          <div className="profile-field-item">
            <span>Official Contact Phone</span>
            <strong>+91 {currentUser?.phone || '9123456780'}</strong>
          </div>

          <div className="profile-field-item">
            <span>Official Contact Email</span>
            <strong>{currentUser?.email || 'ops@ecocycle.in'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
