import React from 'react';
import { AdminAnomaly } from '../../types';

export interface AdminAnomaliesProps {
  adminAnomalies: AdminAnomaly[];
  resolveAnomaly: (id: string) => Promise<void>;
  openPassport: (lotId: number | string) => void;
}

export const AdminAnomalies: React.FC<AdminAnomaliesProps> = ({
  adminAnomalies,
  resolveAnomaly,
  openPassport,
}) => {
  return (
    <div className="admin-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>⚠️ Fraud & Operational Anomaly Detector</h2>
          <p>Automated telemetry monitoring for scale tampering, price collusions, and weight inflation</p>
        </div>
        <div>
          <span className="alert-count-pill" style={{ fontSize: '13px', padding: '6px 14px' }}>
            {adminAnomalies.filter((a) => a.status === 'open').length} Actionable Incidents
          </span>
        </div>
      </div>

      {adminAnomalies.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">🛡️</span>
          <h3>All Systems Operating Normally</h3>
          <p>No operational anomalies detected across scrap lots, scale weigh-ins, or recycler bids.</p>
        </div>
      ) : (
        <div className="anomaly-cards-grid">
          {adminAnomalies.map((anom) => (
            <div key={anom.id} className={`anomaly-card ${anom.status}`}>
              <div className="anomaly-card-header">
                <span className={`severity-tag ${anom.severity}`}>{anom.severity.toUpperCase()} ALERT</span>
                <span className={`status-pill ${anom.status}`}>
                  {anom.status === 'resolved' ? '✓ Resolved' : '● Action Required'}
                </span>
              </div>

              <h3>{anom.title}</h3>
              <p className="anomaly-body-desc">{anom.description}</p>

              <div className="anomaly-values-row">
                <div>
                  <span>Expected Benchmark:</span> <b>{anom.expected_value}</b>
                </div>
                <div>
                  <span>Logged Scale Value:</span> <b>{anom.actual_value}</b>
                </div>
                <div>
                  <span>Associated Lot:</span> <b>Lot #{anom.lot_id}</b>
                </div>
              </div>

              <div className="anomaly-card-footer">
                <button
                  type="button"
                  className="mini-action passport-btn"
                  onClick={() => void openPassport(anom.lot_id)}
                >
                  Inspect Lot Passport →
                </button>
                {anom.status === 'open' && (
                  <button
                    type="button"
                    className="mini-action primary-btn"
                    onClick={() => void resolveAnomaly(anom.id)}
                  >
                    Acknowledge & Clear Incident
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
