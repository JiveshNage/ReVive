import React from 'react';
import { AdminAnomaly } from '../../types';
import { ExportButton } from '../../components/common/ExportButton';
import { downloadCSV, downloadXLSX, downloadElementAsJPG } from '../../utils/exportUtils';

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
  const anomalyExportRows = adminAnomalies.map((a) => [
    a.id,
    a.severity.toUpperCase(),
    a.title,
    a.description,
    a.expected_value,
    a.actual_value,
    `Lot #${a.lot_id}`,
    a.status === 'resolved' ? 'Resolved' : 'Action Required',
  ]);

  return (
    <div className="admin-subpage-container" id="admin-anomalies-container">
      <div className="subpage-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>⚠️ Fraud & Operational Anomaly Detector</h2>
          <p>Automated telemetry monitoring for scale tampering, price collusions, and weight inflation</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="alert-count-pill" style={{ fontSize: '13px', padding: '6px 14px' }}>
            {adminAnomalies.filter((a) => a.status === 'open').length} Actionable Incidents
          </span>
          <ExportButton
            label="Download Log"
            onExportCSV={() =>
              downloadCSV(
                'ReVive_Anomalies_Audit_Log',
                ['Incident ID', 'Severity', 'Title', 'Description', 'Expected Value', 'Actual Logged', 'Lot Ref', 'Status'],
                anomalyExportRows
              )
            }
            onExportXLSX={() =>
              downloadXLSX(
                'ReVive_Anomalies_Audit_Log',
                'Anomalies_Log',
                ['Incident ID', 'Severity', 'Title', 'Description', 'Expected Value', 'Actual Logged', 'Lot Ref', 'Status'],
                anomalyExportRows
              )
            }
            onExportJPG={() =>
              downloadElementAsJPG(
                'admin-anomalies-container',
                'ReVive_Anomalies_Audit.jpg',
                'CPCB Fraud & Operational Anomaly Audit Log'
              )
            }
          />
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
