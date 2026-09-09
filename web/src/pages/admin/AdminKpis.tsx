import React from 'react';
import { Lang, I18N, DemoWorkflowResult, AdminAnomaly, Lot } from '../../types';

export interface AdminKpisProps {
  currentLang: Lang;
  demoRunning: boolean;
  triggerSihDemo: () => Promise<void>;
  demoResult: DemoWorkflowResult | null;
  openPassport: (lotId: number | string) => void;
  lots: Lot[];
  adminAnomalies: AdminAnomaly[];
}

export const AdminKpis: React.FC<AdminKpisProps> = ({
  currentLang,
  demoRunning,
  triggerSihDemo,
  demoResult,
  openPassport,
  lots,
  adminAnomalies,
}) => {
  return (
    <div className="admin-subpage-container">
      {/* SIH Simulation Trigger Banner */}
      <div className="sih-simulator-card">
        <div className="sih-simulator-info">
          <div className="simulator-badge">⚡ SIH Automated Verification Pipeline</div>
          <h3>Smart India Hackathon Live Simulation</h3>
          <p>
            Triggers an end-to-end 7-step test: Collector photo scan → AI material identification →
            Fair price matching → Authorized recycler pickup → Calibrated weigh-in →
            Tamper-proof SHA-256 certificate generation.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="demo-run-button"
            disabled={demoRunning}
            onClick={() => void triggerSihDemo()}
          >
            <span className="demo-icon">⚡</span>
            <div>
              <strong>{demoRunning ? I18N[currentLang].runningDemo : I18N[currentLang].runSihDemo}</strong>
              <small>Execute Automated Live Pipeline</small>
            </div>
          </button>
        </div>
      </div>

      {/* SIH Demo Workflow Result Box */}
      {demoResult && (
        <div className="demo-result-card">
          <div className="demo-result-header">
            <span className="check-badge">✓ SIH Demo Workflow Completed with SHA-256 Seal</span>
            <button
              type="button"
              className="mini-action passport-btn"
              onClick={() => void openPassport(demoResult.passport_id)}
            >
              Inspect CPCB Passport ({demoResult.passport_id}) →
            </button>
          </div>
          <div className="demo-steps-grid">
            {demoResult.steps_completed.map((step, idx) => (
              <div key={idx} className="demo-step-pill">
                <span className="step-num">{idx + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Governance & Real-time Verification Policy */}
      <div className="admin-overview-grid">
        <div className="panel legacy-panel">
          <div className="panel-header">
            <h2>Statutory Governance & Compliance Metrics</h2>
            <span className="rule-badge">Rule 2022 Mandate</span>
          </div>
          <div className="governance-rule-box">
            <p>
              <strong>AI Classification Policy:</strong> Under CPCB guidelines, deep learning AI aids informal
              collectors with fair market estimates. Digital scale calibration and recycler authorization
              ensure tamper-proof statutory chain of custody.
            </p>
            <div className="rule-metrics">
              <div className="rule-metric-item">
                <span>Active Pipeline Lots:</span>{' '}
                <b>{lots.filter((l) => ['created', 'offers', 'pickup'].includes(l.status)).length}</b>
              </div>
              <div className="rule-metric-item">
                <span>Completed Cycles:</span>{' '}
                <b>{lots.filter((l) => ['handed_over', 'payment_completed'].includes(l.status)).length}</b>
              </div>
              <div className="rule-metric-item">
                <span>Active Anomalies:</span>{' '}
                <b style={{ color: '#ef4444' }}>{adminAnomalies.filter((a) => a.status === 'open').length}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="panel legacy-panel">
          <div className="panel-header">
            <h2>Recent Anomaly Alerts</h2>
            <span>{adminAnomalies.filter((a) => a.status === 'open').length} Unresolved</span>
          </div>
          <div className="anomaly-summary-list">
            {adminAnomalies.filter((a) => a.status === 'open').length === 0 ? (
              <p className="empty-state">No anomalies flagged. All scale weights and MSP rates conform to policy.</p>
            ) : (
              adminAnomalies.filter((a) => a.status === 'open').slice(0, 3).map((anom) => (
                <div key={anom.id} className="anomaly-mini-row">
                  <span className={`severity-tag ${anom.severity}`}>{anom.severity.toUpperCase()}</span>
                  <div className="anomaly-desc">
                    <strong>{anom.title} (Lot #{anom.lot_id})</strong>
                    <small>{anom.description}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
