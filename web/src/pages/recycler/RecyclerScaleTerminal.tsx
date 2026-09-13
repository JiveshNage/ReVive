import React, { useState } from 'react';
import { Lot, Material } from '../../types';

export interface RecyclerScaleTerminalProps {
  lots: Lot[];
  materials: Material[];
  onWeightVerified: (lotId: number, verifiedWeightKg: number, totalPayout: number) => void;
}

export const RecyclerScaleTerminal: React.FC<RecyclerScaleTerminalProps> = ({
  lots,
  materials,
  onWeightVerified,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<number>(lots[0]?.id || 102);
  const [tareWeight, setTareWeight] = useState<number>(1.2);
  const [grossWeight, setGrossWeight] = useState<number>(6.6);
  const [scaleCalibrated, setScaleCalibrated] = useState<boolean>(true);

  const selectedLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const material = materials.find((m) => m.id === selectedLot?.material_id) || materials[0];

  const netWeight = Math.max(0, Number((grossWeight - tareWeight).toFixed(2)));
  const cataloguedWeight = selectedLot?.quantity_kg || 5.4;
  const discrepancyKg = Math.abs(netWeight - cataloguedWeight);
  const discrepancyPercent = Number(((discrepancyKg / Math.max(0.1, cataloguedWeight)) * 100).toFixed(1));
  const isToleranceOk = discrepancyPercent <= 2.0;

  // Benchmark MSP rate
  const mspRate = material.name.includes('PCB') ? 403 : material.name.includes('Wire') ? 145 : 101;
  const totalPayout = Number((netWeight * mspRate).toFixed(2));

  const handleTare = () => {
    setTareWeight(grossWeight);
    setScaleCalibrated(true);
  };

  const handleResetTare = () => {
    setTareWeight(1.2);
  };

  return (
    <div className="scale-terminal-wrapper">
      {/* Top Banner */}
      <div className="terminal-header-banner">
        <div>
          <span className="badge-recycler-hub">CPCB COMPLIANT WEIGHBRIDGE STATION · IOT DOCKED</span>
          <h2>Certified Digital Weigh-in & Scale Calibration Terminal</h2>
          <p>
            Verify incoming e-waste scrap using dual-sensor certified electronic scales. Ensure tamper-proof gross, tare, and net weights before releasing digital payments.
          </p>
        </div>

        <div className="calibration-status-chip">
          <span className="dot pulse-green"></span>
          <div>
            <strong>SCALE CALIBRATION: ACTIVE</strong>
            <small>CPCB Standard Ind-Weigh-2026</small>
          </div>
        </div>
      </div>

      {/* Main Terminal Workspace */}
      <div className="scale-terminal-grid">
        {/* Left: Incoming Lot Selection */}
        <div className="lot-selection-card">
          <h3>1. Select Incoming Scrap Lot</h3>
          <p className="card-subtext">Choose the lot currently placed on the weighbridge scale:</p>

          <div className="scale-lot-list">
            {lots.map((l) => {
              const isSelected = selectedLotId === l.id;
              const mat = materials.find((m) => m.id === l.material_id);

              return (
                <div
                  key={l.id}
                  className={`scale-lot-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLotId(l.id);
                    // Match default weights
                    if (l.id === 102) {
                      setGrossWeight(6.6);
                      setTareWeight(1.2);
                    } else if (l.id === 103) {
                      setGrossWeight(14.2);
                      setTareWeight(2.1);
                    } else {
                      setGrossWeight(10.0);
                      setTareWeight(1.5);
                    }
                  }}
                >
                  <div className="item-title-row">
                    <strong>Lot #{l.id} · {mat?.name || 'Scrap Material'}</strong>
                    <span className="status-tag">{l.status.toUpperCase()}</span>
                  </div>
                  <div className="item-meta">
                    <span>Initial Weight: <strong>{l.quantity_kg} kg</strong></span>
                    <span>Guaranteed MSP: <strong>₹ {l.id === 102 ? 403 : l.id === 103 ? 210 : 145}/kg</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="collector-manifest-box">
            <h4>Collector Manifest Details</h4>
            <div className="manifest-row">
              <span>Collector Name:</span>
              <strong>Ram Yadav (ID: REV-COL-2026-1024)</strong>
            </div>
            <div className="manifest-row">
              <span>Pickup Yard:</span>
              <strong>Karond Scrap Mandi, Ward 14, Bhopal</strong>
            </div>
            <div className="manifest-row">
              <span>Arrived By EV:</span>
              <strong>MP 04 GA 8821 (Driver: Sunil Kumar)</strong>
            </div>
          </div>
        </div>

        {/* Right: Industrial Digital Scale Console */}
        <div className="scale-console-card">
          <div className="console-top-bar">
            <span className="device-id">DEVICE: DIGITAL WEIGHBRIDGE MODEL W-8000</span>
            <span className="cpcb-seal">🔒 LEGAL METROLOGY SEAL VALID 2026</span>
          </div>

          {/* Seven-Segment Digital Display */}
          <div className="digital-display-box">
            <div className="display-header">
              <span>CERTIFIED NET WEIGHT</span>
              <span className="tare-indicator">{tareWeight > 0 ? 'TARE ACTIVE' : 'ZERO'}</span>
            </div>

            <div className="digital-readout">
              <span className="number">{netWeight.toFixed(2)}</span>
              <span className="unit">KG</span>
            </div>

            <div className="display-subweights">
              <span>GROSS: {grossWeight.toFixed(2)} kg</span>
              <span>•</span>
              <span>TARE: {tareWeight.toFixed(2)} kg</span>
              <span>•</span>
              <span>NET: {netWeight.toFixed(2)} kg</span>
            </div>
          </div>

          {/* Scale Control Buttons */}
          <div className="scale-controls-row">
            <button type="button" className="scale-btn tare-btn" onClick={handleTare}>
              ⚖️ Tare Current Container ({tareWeight.toFixed(1)} kg)
            </button>
            <button type="button" className="scale-btn reset-btn" onClick={handleResetTare}>
              ↺ Reset Scale Zero
            </button>
          </div>

          {/* Weight Adjuster for Testing Discrepancy Scenarios */}
          <div className="weight-adjuster-box">
            <label>Weighbridge Sensor Gross Input:</label>
            <div className="slider-row">
              <input
                type="range"
                min="1.0"
                max="30.0"
                step="0.1"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
              />
              <span className="gross-val">{grossWeight.toFixed(1)} kg</span>
            </div>
          </div>

          {/* Anti-Fraud Discrepancy & Tolerance Verification */}
          <div className={`tolerance-card ${isToleranceOk ? 'ok' : 'warning'}`}>
            <div className="tolerance-header">
              <span className="icon">{isToleranceOk ? '🛡️' : '⚠️'}</span>
              <div>
                <strong>
                  {isToleranceOk
                    ? `LEGAL TOLERANCE MET (${discrepancyPercent}% Variance)`
                    : `EXCESS VARIANCE DETECTED (${discrepancyPercent}% Variance)`}
                </strong>
                <p>
                  Collector Estimate: {cataloguedWeight} kg · Weighbridge Net: {netWeight} kg · Diff: {discrepancyKg.toFixed(2)} kg
                </p>
              </div>
            </div>
            {!isToleranceOk && (
              <small className="warning-note">
                Variances above 2.0% require scale re-calibration or collector written consent under CPCB e-waste rules.
              </small>
            )}
          </div>

          {/* Payout Calculation Card */}
          <div className="payout-calculation-box">
            <div className="payout-row">
              <span>Statutory Rate (CPCB MSP):</span>
              <strong>₹ {mspRate} / kg</strong>
            </div>
            <div className="payout-row">
              <span>Verified Net Weight:</span>
              <strong>{netWeight} kg</strong>
            </div>
            <div className="payout-row total">
              <span>Total Payment Payable to Collector:</span>
              <strong className="grand-total">₹ {totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            className="confirm-weight-btn"
            onClick={() => onWeightVerified(selectedLotId, netWeight, totalPayout)}
          >
            ✓ Lock Verified Weight & Open Payment Settlement →
          </button>
        </div>
      </div>
    </div>
  );
};
