import React from 'react';
import { Lot, Material, Recycler, Offer, TraceabilityData } from '../../types';

interface TraceabilityModalProps {
  traceabilityLotId: number | null;
  onClose: () => void;
  traceabilityLoading: boolean;
  traceabilityData: TraceabilityData | null;
  lots: Lot[];
  materials: Material[];
  recyclers: Recycler[];
  offers: Offer[];
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  traceabilityLotId,
  onClose,
  traceabilityLoading,
  traceabilityData,
  lots,
  materials,
  recyclers,
  offers,
}) => {
  if (traceabilityLotId === null) return null;

  const traceabilityLot = lots.find((lot) => lot.id === traceabilityLotId);
  const traceabilityOffer = offers.find((offer) => offer.lot_id === traceabilityLotId);
  const traceabilityRecycler = recyclers.find((r) => r.id === traceabilityOffer?.recycler_id);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="offer-dialog traceability-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="traceability-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <h2 id="traceability-title">Lot #{traceabilityLotId} Traceability & Custody</h2>
          <button aria-label="Close traceability" onClick={onClose}>×</button>
        </div>

        {traceabilityLoading ? (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#6d8179' }}>
            Loading verified chain of custody...
          </p>
        ) : (
          <>
            <div className="traceability-summary">
              <div>
                <span className="label">Lot ID</span>
                <strong>#{traceabilityData?.lot_id ?? traceabilityLotId}</strong>
              </div>
              <div>
                <span className="label">Material</span>
                <strong>
                  {traceabilityData?.material?.name ??
                    materials.find((m) => m.id === traceabilityLot?.material_id)?.name ??
                    'Material'}
                </strong>
              </div>
              <div>
                <span className="label">Recycler</span>
                <strong>
                  {traceabilityData?.recycler?.name ??
                    traceabilityRecycler?.name ??
                    'Assigned Recycler'}
                </strong>
              </div>
            </div>

            <div className="trace-grid">
              <div className="receipt-block">
                <span className="label">Initial Weight</span>
                <strong>{traceabilityData?.quantity_kg ?? traceabilityLot?.quantity_kg ?? 0} kg</strong>
              </div>
              <div className="receipt-block">
                <span className="label">Handover Weight</span>
                <strong>
                  {traceabilityData?.final_weight_kg !== null &&
                  traceabilityData?.final_weight_kg !== undefined
                    ? `${traceabilityData.final_weight_kg} kg`
                    : 'Pending'}
                </strong>
              </div>
              <div className="receipt-block amount-block">
                <span className="label">Final Settlement</span>
                <strong>
                  ₹ {traceabilityData?.final_price ??
                    traceabilityOffer?.offer_price ??
                    traceabilityLot?.estimated_value ??
                    0}
                </strong>
              </div>
            </div>

            {traceabilityData?.weight_discrepancy_kg !== null &&
              traceabilityData?.weight_discrepancy_kg !== undefined && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '11px',
                    color:
                      Math.abs(traceabilityData.weight_discrepancy_kg) > 0.5
                        ? '#b45309'
                        : '#166534',
                    background: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px',
                  }}
                >
                  Weight delta:{' '}
                  {traceabilityData.weight_discrepancy_kg > 0
                    ? `-${traceabilityData.weight_discrepancy_kg}`
                    : `+${Math.abs(traceabilityData.weight_discrepancy_kg)}`}{' '}
                  kg from initial declaration
                </div>
              )}

            {traceabilityData?.certificate_hash && (
              <div className="cert-hash-box">
                <span>✓ SHA-256 Tamper-Evident Verification Hash</span>
                {traceabilityData.certificate_hash}
              </div>
            )}

            <div className="timeline">
              {(
                traceabilityData?.timeline ?? [
                  {
                    step: 1,
                    title: 'Lot created',
                    description: `${traceabilityLot?.quantity_kg ?? 0} kg scheduled for pickup`,
                    completed: true,
                  },
                  {
                    step: 2,
                    title: 'Bid received',
                    description: `Estimated ₹ ${traceabilityLot?.estimated_value ?? 0}`,
                    completed: true,
                  },
                  {
                    step: 3,
                    title: 'Offer accepted',
                    description: 'Pickup and collection confirmed',
                    completed: true,
                  },
                  {
                    step: 4,
                    title: 'Digital handover',
                    description: 'Physical inspection completed',
                    completed: true,
                  },
                  {
                    step: 5,
                    title: 'Payment completed',
                    description: 'Transaction closed',
                    completed: traceabilityLot?.status === 'payment_completed',
                  },
                ]
              ).map((event) => (
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
          </>
        )}
      </section>
    </div>
  );
};
