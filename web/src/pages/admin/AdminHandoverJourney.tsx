import React, { useState } from 'react';
import { HandoverJourney } from '../../types';

export interface AdminHandoverJourneyProps {
  journeys: HandoverJourney[];
  openPassport: (lotId: number | string) => void;
  onFlagDiscrepancy?: (journeyId: string) => void;
}

export const AdminHandoverJourney: React.FC<AdminHandoverJourneyProps> = ({
  journeys,
  openPassport,
  onFlagDiscrepancy,
}) => {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    journeys[0]?.journey_id || 'HJ-2026-MP-0491'
  );
  const [filterStage, setFilterStage] = useState<'all' | 'transit' | 'scale' | 'completed'>('all');

  const selectedJourney =
    journeys.find((j) => j.journey_id === selectedJourneyId) || journeys[0];

  const filteredJourneys = journeys.filter((j) => {
    if (filterStage === 'transit') return j.current_stage <= 4;
    if (filterStage === 'scale') return j.current_stage === 5;
    if (filterStage === 'completed') return j.current_stage === 6;
    return true;
  });

  return (
    <div className="handover-journey-wrapper">
      {/* Header Banner */}
      <div className="journey-header-banner">
        <div>
          <span className="badge-cpcb-statutory">STATUTORY CPCB HANDOVER & WEIGHBRIDGE AUDIT</span>
          <h2>E-Waste Handover Journey & Digital Scale Discrepancy Audit</h2>
          <p>
            Real-time verification of custody transfers from informal collectors to CPCB authorized recyclers with IoT scale tare checks and anti-fraud variance detection.
          </p>
        </div>

        {/* Quick Summary Strip */}
        <div className="journey-summary-strip">
          <div className="summary-pill">
            <span className="icon">🚚</span>
            <div>
              <strong>{journeys.filter((j) => j.current_stage <= 4).length}</strong>
              <small>EV Pickups in Transit</small>
            </div>
          </div>
          <div className="summary-pill">
            <span className="icon">⚖</span>
            <div>
              <strong>{journeys.filter((j) => j.current_stage === 5).length}</strong>
              <small>At Scale Weigh-in</small>
            </div>
          </div>
          <div className="summary-pill">
            <span className="icon">✓</span>
            <div>
              <strong>{journeys.filter((j) => j.current_stage === 6).length}</strong>
              <small>Passports Minted</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="journey-filter-tabs">
        <button
          type="button"
          className={filterStage === 'all' ? 'active' : ''}
          onClick={() => setFilterStage('all')}
        >
          All Handover Journeys ({journeys.length})
        </button>
        <button
          type="button"
          className={filterStage === 'transit' ? 'active' : ''}
          onClick={() => setFilterStage('transit')}
        >
          En Route EV Pickups
        </button>
        <button
          type="button"
          className={filterStage === 'scale' ? 'active' : ''}
          onClick={() => setFilterStage('scale')}
        >
          Scale Weighbridge Verification
        </button>
        <button
          type="button"
          className={filterStage === 'completed' ? 'active' : ''}
          onClick={() => setFilterStage('completed')}
        >
          Settled Passports
        </button>
      </div>

      {/* Main Grid: Left Journey List + Right Detailed Journey & Scale Audit */}
      <div className="journey-main-layout">
        {/* Left Column: Active Handover Journeys List */}
        <div className="journey-list-panel">
          <h3>Active Custody Journeys</h3>
          <div className="journey-cards-container">
            {filteredJourneys.map((j) => {
              const isSelected = selectedJourney?.journey_id === j.journey_id;
              const stageLabels = [
                'Catalogued',
                'Offer Locked',
                'EV Dispatched',
                'In Transit',
                'Scale Weigh-in',
                'Completed & Passport Minted',
              ];

              return (
                <div
                  key={j.journey_id}
                  className={`journey-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedJourneyId(j.journey_id)}
                >
                  <div className="card-top">
                    <span className="journey-ref">{j.journey_id}</span>
                    <span className={`stage-tag stage-${j.current_stage}`}>
                      Stage {j.current_stage}: {stageLabels[j.current_stage - 1]}
                    </span>
                  </div>

                  <h4 className="material-title">{j.material_name}</h4>

                  <div className="parties-row">
                    <span>🧺 {j.collector_name} ({j.collector_area})</span>
                    <span className="arrow">➔</span>
                    <span>🏭 {j.recycler_name}</span>
                  </div>

                  <div className="meta-row">
                    <span>
                      ⚖ <strong>{j.catalogued_weight_kg} kg</strong>
                    </span>
                    <span>
                      🚚 <strong>{j.vehicle_reg}</strong> ({j.vehicle_type.split(' ')[0]})
                    </span>
                    {j.current_stage <= 4 && (
                      <span className="eta-badge">ETA: {j.eta_minutes} Mins</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed 6-Stage Journey Tracker & Certified Scale Audit */}
        {selectedJourney && (
          <div className="journey-detail-panel">
            {/* Header with Vehicle & Status */}
            <div className="detail-header-card">
              <div className="header-info">
                <span className="journey-id-pill">TRACKING: {selectedJourney.journey_id}</span>
                <h2>{selectedJourney.material_name}</h2>
                <div className="facility-credentials">
                  <span><strong>Collector:</strong> {selectedJourney.collector_name} ({selectedJourney.collector_code})</span>
                  <span><strong>Authorized Recycler:</strong> {selectedJourney.recycler_name} (CPCB Lic: {selectedJourney.recycler_license})</span>
                </div>
              </div>

              <div className="telemetry-box">
                <div className="vehicle-badge">
                  <span className="ev-icon">⚡</span>
                  <div>
                    <strong>{selectedJourney.vehicle_reg}</strong>
                    <small>{selectedJourney.vehicle_type}</small>
                  </div>
                </div>
                <div className="driver-contact">
                  <span>Driver: <strong>{selectedJourney.driver_name}</strong></span>
                  <a href={`tel:${selectedJourney.driver_phone}`}>📞 {selectedJourney.driver_phone}</a>
                </div>
              </div>
            </div>

            {/* 6-Stage Visual Stepper */}
            <div className="stepper-card">
              <h3>Statutory 6-Stage Custody Transfer Pipeline</h3>
              <div className="timeline-stepper">
                {selectedJourney.steps.map((step) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div
                      key={step.stage}
                      className={`timeline-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-marker-container">
                        <div className="step-marker">
                          {isDone ? '✓' : isCurrent ? '◉' : step.stage}
                        </div>
                        {step.stage < 6 && <div className="step-connector-line"></div>}
                      </div>

                      <div className="step-content">
                        <div className="step-title-row">
                          <strong>{step.title}</strong>
                          <span className="step-time">{step.timestamp}</span>
                        </div>
                        <p className="step-subtitle">{step.subtitle}</p>
                        <span className="step-location">📍 {step.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Digital Scale Weighbridge Verification & Anti-Fraud Audit */}
            <div className="scale-audit-card">
              <div className="scale-audit-header">
                <div>
                  <h3>Certified Digital Scale Audit Station</h3>
                  <p>Comparing collector initial estimate vs certified weighbridge gross & tare weights</p>
                </div>
                <div className="calibration-badge">
                  <span>🔒 CPCB SEAL #IND-SCALE-2026-09</span>
                </div>
              </div>

              <div className="scale-weights-grid">
                <div className="weight-box">
                  <span className="weight-label">Initial Catalogued Weight</span>
                  <strong className="weight-value">{selectedJourney.catalogued_weight_kg} kg</strong>
                  <small>AI Vision & Field Scale</small>
                </div>

                <div className="weight-box">
                  <span className="weight-label">Weighbridge Gross Weight</span>
                  <strong className="weight-value">{selectedJourney.gross_weight_kg} kg</strong>
                  <small>Container + Material</small>
                </div>

                <div className="weight-box">
                  <span className="weight-label">Tare Weight (Container)</span>
                  <strong className="weight-value">{selectedJourney.tare_weight_kg} kg</strong>
                  <small>Calibrated Tare</small>
                </div>

                <div className="weight-box highlight">
                  <span className="weight-label">Certified Net Weight</span>
                  <strong className="weight-value green">{selectedJourney.verified_net_weight_kg} kg</strong>
                  <small>Gross − Tare = Net Weight</small>
                </div>
              </div>

              {/* Discrepancy & Fraud Indicator */}
              <div
                className={`discrepancy-banner ${
                  selectedJourney.is_flagged || selectedJourney.discrepancy_percentage > 5
                    ? 'danger'
                    : 'clean'
                }`}
              >
                <div className="banner-left">
                  <span className="status-icon">
                    {selectedJourney.discrepancy_percentage > 5 ? '⚠️' : '🛡️'}
                  </span>
                  <div>
                    <strong>
                      {selectedJourney.discrepancy_percentage > 5
                        ? `POTENTIAL DOWN-WEIGHING ALERT: ${selectedJourney.discrepancy_percentage}% Variance`
                        : `ZERO FRAUD CONFIRMED: 0.0% Scale Discrepancy`}
                    </strong>
                    <p>
                      {selectedJourney.discrepancy_percentage > 5
                        ? 'Variance exceeds allowable 2.0% CPCB tolerance. Transaction flagged for regional officer inspection.'
                        : 'Certified weighbridge net weight matches collector catalogued weight within strict statutory tolerances.'}
                    </p>
                  </div>
                </div>

                {selectedJourney.discrepancy_percentage > 5 && onFlagDiscrepancy && (
                  <button
                    type="button"
                    className="flag-btn"
                    onClick={() => onFlagDiscrepancy(selectedJourney.journey_id)}
                  >
                    Issue Statutory Notice
                  </button>
                )}
              </div>

              {/* Action Buttons: Passport Inspection */}
              <div className="journey-actions-bar">
                <button
                  type="button"
                  className="passport-inspect-btn"
                  onClick={() => openPassport(selectedJourney.lot_id)}
                >
                  📜 Inspect CPCB Digital Waste Passport ({selectedJourney.passport_id}) →
                </button>
                <div className="dual-signatures">
                  <span>✓ Collector Confirmed</span>
                  <span>✓ Recycler Scale Agent Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
