import React from 'react';
import { Lang, UserProfile, I18N } from '../../types';

export interface EarningsPageProps {
  currentLang: Lang;
  currentUser: UserProfile | null;
  onNavigateCreateLot: () => void;
}

export const EarningsPage: React.FC<EarningsPageProps> = ({
  currentLang,
  currentUser,
  onNavigateCreateLot,
}) => {
  return (
    <div className="multipage-view">
      <div className="page-header-row">
        <div>
          <h1>{I18N[currentLang].earningsTitle}</h1>
          <p>{I18N[currentLang].earningsSubtitle}</p>
        </div>
        <button className="primary-button" onClick={onNavigateCreateLot}>
          + Sell New Scrap
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card tint-green">
          <span className="stat-symbol">₹</span>
          <div>
            <strong>₹ 18,450</strong>
            <span>{I18N[currentLang].totalRevenue}</span>
            <small>All Time Earnings</small>
          </div>
        </div>
        <div className="stat-card tint-yellow">
          <span className="stat-symbol">💵</span>
          <div>
            <strong>₹ 11,200</strong>
            <span>{I18N[currentLang].cashReceived}</span>
            <small>60.7% of Volume (FR-21)</small>
          </div>
        </div>
        <div className="stat-card tint-blue">
          <span className="stat-symbol">📱</span>
          <div>
            <strong>₹ 7,250</strong>
            <span>{I18N[currentLang].upiReceived}</span>
            <small>39.3% Instant Settlements</small>
          </div>
        </div>
        <div className="stat-card tint-purple">
          <span className="stat-symbol">✓</span>
          <div>
            <strong>14</strong>
            <span>{I18N[currentLang].completedCount}</span>
            <small>100% Traceable Records</small>
          </div>
        </div>
      </section>

      <div className="panel" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '15px' }}>
          Financial Inclusion & Cash Support Notice (PRD FR-21)
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#4d6f60', lineHeight: 1.5 }}>
          ReVive supports both <strong>Cash on Handover</strong> and <strong>Direct UPI transfers</strong>. Informal
          kabadiwalas are not subjected to mandatory digital-only payouts. Every cash handover generates an official
          tamper-evident digital receipt.
        </p>
      </div>

      {/* Payment Receipts Ledger */}
      <div className="trend-table-box" style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>Payment Settlements Ledger</h3>
        <table className="trend-table">
          <thead>
            <tr>
              <th>Lot Ref</th>
              <th>Material</th>
              <th>Weight</th>
              <th>Recycler</th>
              <th>Mode</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {[
              { ref: 'REV-LOT-001', mat: 'Printed Circuit Boards', w: 10.0, rec: 'EcoCycle Pune', mode: 'Cash Handover', amt: 1850, date: 'Today' },
              { ref: 'REV-LOT-002', mat: 'Insulated Copper Wire', w: 25.5, rec: 'CleanEarth Bhopal', mode: 'Instant UPI', amt: 2805, date: 'Yesterday' },
              { ref: 'REV-LOT-003', mat: 'Lithium-Ion Batteries', w: 15.0, rec: 'GreenLoop Nashik', mode: 'Cash Handover', amt: 975, date: '3 days ago' },
              { ref: 'REV-LOT-004', mat: 'LCD Display Monitors', w: 12.0, rec: 'EcoCycle Pune', mode: 'Instant UPI', amt: 1140, date: '1 week ago' },
            ].map((tx) => (
              <tr key={tx.ref}>
                <td>
                  <strong>{tx.ref}</strong>
                </td>
                <td>{tx.mat}</td>
                <td>{tx.w} kg</td>
                <td>{tx.rec}</td>
                <td>
                  <span className="cpcb-tag">{tx.mode}</span>
                </td>
                <td>
                  <strong style={{ color: '#086c4b' }}>₹ {tx.amt}</strong>
                </td>
                <td>
                  <span className="verification-badge verified">✓ Settled</span>
                </td>
                <td>
                  <button
                    className="mini-action"
                    style={{ background: '#086c4b' }}
                    onClick={() =>
                      alert(
                        `Receipt #${tx.ref} downloaded. Certified payment of ₹ ${tx.amt} to ${
                          currentUser?.name || 'राम यादव'
                        }.`
                      )
                    }
                  >
                    {I18N[currentLang].downloadReceipt}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
