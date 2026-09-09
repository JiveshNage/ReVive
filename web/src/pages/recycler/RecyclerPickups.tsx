import React from 'react';
import { Lot } from '../../types';

export interface RecyclerPickupsProps {
  lots: Lot[];
  onOpenHandover: (lotId: number) => void;
}

export const RecyclerPickups: React.FC<RecyclerPickupsProps> = ({ lots, onOpenHandover }) => {
  return (
    <div className="recycler-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>🚚 Pickup & Digital Weigh-In Desk</h2>
          <p>Verify collector QR identity token and perform dual-party calibrated scale weigh-in</p>
        </div>
      </div>

      <div className="enterprise-hero-box">
        <div className="hero-box-text">
          <h3>Dual-Party Scale Handover & Weigh-in Verification</h3>
          <p>
            Under CPCB e-waste rules, material collected from the informal sector must be verified
            on certified electronic scales with photographic evidence and digital signature sealing.
          </p>
          <ul className="guidance-list">
            <li>✓ Collector presents their ReVive Digital Identity Card / QR Token.</li>
            <li>✓ E-waste is weighed on Bluetooth/certified platform scale.</li>
            <li>✓ Discrepancy checks prevent water soaking or lead weight tampering.</li>
            <li>✓ Immediate cryptographic SHA-256 statutory passport is generated.</li>
          </ul>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="primary-button"
              style={{ padding: '12px 24px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => onOpenHandover(lots[0]?.id || 101)}
            >
              ⚖️ Open Calibrated Scale Weigh-in Modal
            </button>
          </div>
        </div>

        <div className="hero-box-badge">
          <span style={{ fontSize: '48px' }}>⚖️</span>
          <strong>CPCB Dual-Party Protocol</strong>
          <small>Tamper-Evident Anti-Fraud Engine</small>
        </div>
      </div>
    </div>
  );
};
