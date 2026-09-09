import React from 'react';
import { QRCodeGraphic } from '../QRCodeGraphic';
import { RecyclingPassport, Lang, I18N } from '../../types';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passportLoading: boolean;
  selectedPassport: RecyclingPassport | null;
  currentLang: Lang;
  getStatusLabel: (status: string) => string;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  passportLoading,
  selectedPassport,
  currentLang,
  getStatusLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="passport-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="passport-banner">
          <div>
            <small style={{ textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              National Digital E-Waste Registry · SIH 2026
            </small>
            <h2 id="passport-title">Recycling Passport</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="passport-id-badge">{selectedPassport?.passport_id ?? 'REV-2026-LOT-XXXX'}</span>
            <button
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 0,
                color: 'white',
                fontSize: '24px',
                marginLeft: '12px',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="passport-body">
          {passportLoading ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Fetching certified digital passport & QR code...
            </p>
          ) : selectedPassport ? (
            <>
              <div className="passport-qr-wrapper">
                <QRCodeGraphic text={selectedPassport.qr_data || selectedPassport.passport_id} />
                <div className="qr-details">
                  <strong>Official Recycling Passport QR</strong>
                  <p><strong>Status:</strong> {getStatusLabel(selectedPassport.status)}</p>
                  <p><strong>Material:</strong> {selectedPassport.material_name} ({selectedPassport.material_category})</p>
                  <p>
                    <strong>Initial / Verified Weight:</strong> {selectedPassport.initial_weight_kg} kg /{' '}
                    {selectedPassport.verified_weight_kg ? `${selectedPassport.verified_weight_kg} kg` : 'In transit'}
                  </p>
                  <p>
                    <strong>Actors:</strong> {selectedPassport.collector_alias} &rarr;{' '}
                    {selectedPassport.recycler_name ?? 'Authorized Recycler'}
                  </p>
                  <p style={{ fontSize: '10px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                    ✓ Certified by {selectedPassport.recycler_authorization ?? 'CPCB Registered Facility'}
                  </p>
                </div>
              </div>

              <div className="esg-grid">
                <div className="esg-card co2">
                  <span style={{ fontSize: '28px' }}>🌱</span>
                  <div>
                    <strong>{selectedPassport.co2_saved_kg} kg</strong>
                    <small>{I18N[currentLang].co2Saved}</small>
                  </div>
                </div>
                <div className="esg-card toxic">
                  <span style={{ fontSize: '28px' }}>🛡️</span>
                  <div>
                    <strong>{selectedPassport.toxic_diverted_kg} kg</strong>
                    <small>{I18N[currentLang].toxicDiverted}</small>
                  </div>
                </div>
              </div>

              <div className="cert-hash-box">
                <span>✓ {I18N[currentLang].sha256Certificate}</span>
                {selectedPassport.certificate_hash}
              </div>

              <div className="timeline" style={{ marginTop: '16px' }}>
                {selectedPassport.timeline.map((event) => (
                  <div className={`timeline-item ${event.completed ? 'done' : ''}`} key={event.step}>
                    <span>{event.step}</span>
                    <div>
                      <strong>{event.title}</strong>
                      <small>{event.description}</small>
                      {event.timestamp && (
                        <small style={{ opacity: 0.7, fontSize: '9px' }}>
                          {new Date(event.timestamp).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button
                  className="dialog-submit"
                  style={{ background: '#047857' }}
                  onClick={() => window.print()}
                >
                  🖨️ Print / Export Passport
                </button>
                <button
                  className="secondary-button"
                  style={{ width: '40%' }}
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedPassport.passport_id);
                    alert(`Passport reference copied: ${selectedPassport.passport_id}`);
                  }}
                >
                  Copy Reference
                </button>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', padding: '24px' }}>No passport record found.</p>
          )}
        </div>
      </section>
    </div>
  );
};
