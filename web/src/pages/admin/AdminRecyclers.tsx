import React from 'react';
import { Recycler } from '../../types';

export interface AdminRecyclersProps {
  recyclers: Recycler[];
  verificationView: 'all' | 'pending';
  setVerificationView: (view: 'all' | 'pending') => void;
  pendingVerificationCount: number;
  filteredRecyclers: Recycler[];
  toggleRecyclerVerification: (id: number) => Promise<void>;
}

export const AdminRecyclers: React.FC<AdminRecyclersProps> = ({
  recyclers,
  verificationView,
  setVerificationView,
  pendingVerificationCount,
  filteredRecyclers,
  toggleRecyclerVerification,
}) => {
  return (
    <div className="admin-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>🏢 CPCB Recycler Licensing Registry</h2>
          <p>Verify and authorize industrial recycling and dismantling facilities across states</p>
        </div>
        <div className="verification-toggle">
          <button
            type="button"
            className={verificationView === 'all' ? 'role-tab active' : 'role-tab'}
            onClick={() => setVerificationView('all')}
          >
            All Units ({recyclers.length})
          </button>
          <button
            type="button"
            className={verificationView === 'pending' ? 'role-tab active' : 'role-tab'}
            onClick={() => setVerificationView('pending')}
          >
            Pending Inspection ({pendingVerificationCount})
          </button>
        </div>
      </div>

      <div className="panel legacy-panel">
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Location & Zone</th>
                <th>License Number</th>
                <th>Contact</th>
                <th>Statutory Status</th>
                <th>Regulatory Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecyclers.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.location}</td>
                  <td>
                    <code>{r.verified ? `CPCB-EW-${String(r.id).padStart(3, '0')}-REG` : 'Pending Verification'}</code>
                  </td>
                  <td>{r.contact_phone ?? 'N/A'}</td>
                  <td>
                    <span className={r.verified ? 'verification-badge verified' : 'verification-badge pending'}>
                      {r.verified ? '✓ CPCB Authorized' : '● Inspection Needed'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={r.verified ? 'mini-action danger-btn' : 'mini-action primary-btn'}
                      onClick={() => void toggleRecyclerVerification(r.id)}
                    >
                      {r.verified ? 'Revoke Authorization' : 'Grant CPCB License'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
