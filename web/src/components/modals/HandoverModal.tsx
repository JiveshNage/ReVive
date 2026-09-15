import React, { useState } from 'react';
import { Lot, Material } from '../../types';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverLotId: number;
  setHandoverLotId: (id: number) => void;
  handoverFinalWeight: string;
  setHandoverFinalWeight: (wt: string) => void;
  handoverLocation: string;
  setHandoverLocation: (loc: string) => void;
  lots: Lot[];
  materials: Material[];
  confirmHandover: () => void;
  onVerifyOtpHandover?: (lotId: number, otp: string, scaleWeight: number) => Promise<void>;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  handoverLotId,
  setHandoverLotId,
  handoverFinalWeight,
  setHandoverFinalWeight,
  handoverLocation,
  setHandoverLocation,
  lots,
  materials,
  confirmHandover,
  onVerifyOtpHandover,
}) => {
  const [handoverMode, setHandoverMode] = useState<'otp' | 'direct'>('otp');
  const [collectorOtp, setCollectorOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentLot = lots.find((l) => l.id === handoverLotId);
  const estimatedWt = currentLot ? currentLot.quantity_kg : 0;
  const finalWt = Number(handoverFinalWeight) || 0;
  const diffPct = estimatedWt > 0 && finalWt > 0 ? (Math.abs(estimatedWt - finalWt) / estimatedWt) * 100 : 0;
  const isDiscrepant = diffPct > 5.0;

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorOtp || collectorOtp.length < 4) {
      setErrorMsg('Please enter a valid 6-digit handover OTP.');
      return;
    }
    if (finalWt <= 0) {
      setErrorMsg('Please enter a valid physical scale weight.');
      return;
    }

    if (onVerifyOtpHandover) {
      setIsVerifying(true);
      setErrorMsg('');
      try {
        await onVerifyOtpHandover(handoverLotId, collectorOtp, finalWt);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'OTP verification failed. Please re-check code.');
      } finally {
        setIsVerifying(false);
      }
    } else {
      confirmHandover();
    }
  };

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="offer-dialog" role="dialog" aria-modal="true" aria-labelledby="handover-title" style={{ maxWidth: '520px' }}>
        <div className="dialog-heading">
          <div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              CPCB SCALE CUSTODY
            </span>
            <h2 id="handover-title" style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 800 }}>
              Physical Scale Handover
            </h2>
          </div>
          <button aria-label="Close handover" onClick={onClose} style={{ cursor: 'pointer' }}>×</button>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setHandoverMode('otp')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: handoverMode === 'otp' ? '2px solid #059669' : '1px solid #cbd5e1',
              background: handoverMode === 'otp' ? '#ecfdf5' : '#fff',
              color: handoverMode === 'otp' ? '#065f46' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🔐 6-Digit OTP Mode
          </button>
          <button
            type="button"
            onClick={() => setHandoverMode('direct')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: handoverMode === 'direct' ? '2px solid #059669' : '1px solid #cbd5e1',
              background: handoverMode === 'direct' ? '#ecfdf5' : '#fff',
              color: handoverMode === 'direct' ? '#065f46' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ✍️ Direct Signature
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <label>
          Select Scrap Lot
          <select value={handoverLotId} onChange={(event) => setHandoverLotId(Number(event.target.value))}>
            {lots.map((lot) => (
              <option value={lot.id} key={lot.id}>
                Lot #{lot.id} · {materials.find((material) => material.id === lot.material_id)?.name ?? 'Material'} ({lot.quantity_kg} kg)
              </option>
            ))}
          </select>
        </label>

        {handoverMode === 'otp' && (
          <label>
            Collector 6-Digit Handover OTP
            <input
              type="text"
              maxLength={6}
              value={collectorOtp}
              onChange={(e) => setCollectorOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 584920"
              style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
              required
            />
          </label>
        )}

        <label>
          Physical Scale Weight (kg)
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={handoverFinalWeight}
            onChange={(event) => setHandoverFinalWeight(event.target.value)}
            placeholder="Weight from digital scale"
            required
          />
        </label>

        {/* Tolerance check indicator */}
        {estimatedWt > 0 && finalWt > 0 && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '12px',
              background: isDiscrepant ? '#fef3c7' : '#ecfdf5',
              border: isDiscrepant ? '1px solid #fcd34d' : '1px solid #a7f3d0',
              color: isDiscrepant ? '#92400e' : '#065f46',
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {isDiscrepant ? '⚠️ Weight Discrepancy Flagged (> ±5%)' : '✓ Weight Verified within Tolerance (±5%)'}
            </div>
            <div>
              Estimated: {estimatedWt} kg | Scale: {finalWt} kg ({diffPct.toFixed(1)}% variance)
              {isDiscrepant && ' — An anomaly event will be flagged to CPCB administrative audit.'}
            </div>
          </div>
        )}

        <label>
          Handover Scale Location / Facility
          <input
            type="text"
            value={handoverLocation}
            onChange={(event) => setHandoverLocation(event.target.value)}
            placeholder="e.g. Bhopal Central Scrap Cluster Scale #2"
          />
        </label>

        {handoverMode === 'otp' ? (
          <button
            className="dialog-submit"
            onClick={handleOtpSubmit}
            disabled={isVerifying}
            style={{ opacity: isVerifying ? 0.7 : 1 }}
          >
            {isVerifying ? 'Verifying OTP & Sealing...' : 'Verify OTP & Confirm Custody'}
          </button>
        ) : (
          <button className="dialog-submit" onClick={confirmHandover}>
            Create Handover Record
          </button>
        )}
      </section>
    </div>
  );
};
