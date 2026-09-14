import React, { useState } from 'react';
import { Recycler } from '../../types';
import { AdminDocumentVerification } from './AdminDocumentVerification';

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
  const [subTab, setSubTab] = useState<'documents' | 'registry'>('documents');

  return (
    <div className="admin-subpage-container" style={{ width: '100%' }}>
      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setSubTab('documents')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: subTab === 'documents' ? '#059669' : '#f1f5f9',
            color: subTab === 'documents' ? '#fff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: subTab === 'documents' ? '0 2px 8px rgba(5, 150, 105, 0.2)' : 'none',
          }}
        >
          📜 Certificate Verification Queue
        </button>

        <button
          type="button"
          onClick={() => setSubTab('registry')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: subTab === 'registry' ? '#059669' : '#f1f5f9',
            color: subTab === 'registry' ? '#fff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: subTab === 'registry' ? '0 2px 8px rgba(5, 150, 105, 0.2)' : 'none',
          }}
        >
          🏢 Facility Licensing Registry ({recyclers.length})
        </button>
      </div>

      {subTab === 'documents' ? (
        <AdminDocumentVerification />
      ) : (
        <div>
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
      )}
    </div>
  );
};
