import React from 'react';
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="offer-dialog" role="dialog" aria-modal="true" aria-labelledby="handover-title">
        <div className="dialog-heading">
          <h2 id="handover-title">Confirm digital handover</h2>
          <button aria-label="Close handover" onClick={onClose}>×</button>
        </div>
        <label>
          Lot
          <select value={handoverLotId} onChange={(event) => setHandoverLotId(Number(event.target.value))}>
            {lots.map((lot) => (
              <option value={lot.id} key={lot.id}>
                Lot #{lot.id} · {materials.find((material) => material.id === lot.material_id)?.name ?? 'Material'}
              </option>
            ))}
          </select>
        </label>
        <label>
          Final weight (kg)
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={handoverFinalWeight}
            onChange={(event) => setHandoverFinalWeight(event.target.value)}
            placeholder="Final weight"
          />
        </label>
        <label>
          Handover location
          <input
            type="text"
            value={handoverLocation}
            onChange={(event) => setHandoverLocation(event.target.value)}
            placeholder="Location"
          />
        </label>
        <button className="dialog-submit" onClick={confirmHandover}>
          Create handover record
        </button>
      </section>
    </div>
  );
};
