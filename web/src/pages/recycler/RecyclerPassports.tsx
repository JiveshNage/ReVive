import React from 'react';
import { Lot } from '../../types';

export interface RecyclerPassportsProps {
  deliveredLots: Lot[];
  openPassport: (referenceOrId: string | number) => void;
}

export const RecyclerPassports: React.FC<RecyclerPassportsProps> = ({ deliveredLots, openPassport }) => {
  return (
    <div className="recycler-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>📜 Statutory Recycling Passports</h2>
          <p>Cryptographically sealed CPCB EPR compliance certificates with complete material traceability</p>
        </div>
        <div>
          <button
            type="button"
            className="mini-action"
            onClick={() => openPassport('REV-2026-LOT-0001')}
          >
            🔍 Inspect Demo Passport (REV-2026-LOT-0001)
          </button>
        </div>
      </div>

      <div className="panel legacy-panel">
        <div className="panel-header">
          <h3>Settled Transactions & Certified Lots ({deliveredLots.length})</h3>
          <span>Immutable SHA-256 Certificates</span>
        </div>

        {deliveredLots.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">📜</span>
            <h3>No Settled Passports Yet</h3>
            <p>Once material weigh-in and payments are complete, passports appear here.</p>
            <button
              type="button"
              className="primary-button"
              style={{ marginTop: '12px' }}
              onClick={() => openPassport('REV-2026-LOT-0001')}
            >
              View Sample CPCB Passport
            </button>
          </div>
        ) : (
          <div className="passports-table-wrapper">
            <table className="trend-table">
              <thead>
                <tr>
                  <th>Passport Ref</th>
                  <th>Material Lot</th>
                  <th>Quantity</th>
                  <th>Payout Value</th>
                  <th>CPCB Hash</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveredLots.map((lot) => (
                  <tr key={lot.id}>
                    <td>
                      <code>REV-2026-LOT-{lot.id}</code>
                    </td>
                    <td>
                      <strong>Lot #{lot.id}</strong>
                    </td>
                    <td>{lot.quantity_kg} kg</td>
                    <td>₹ {lot.estimated_value.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="hash-pill">SHA256: 4f9a...812d</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => openPassport(`REV-2026-LOT-${lot.id}`)}
                      >
                        View Passport →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
