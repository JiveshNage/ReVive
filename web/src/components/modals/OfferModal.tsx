import React from 'react';
import { Lot, Material, Recycler } from '../../types';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerLotId: number;
  setOfferLotId: (id: number) => void;
  offerRecyclerId: number;
  setOfferRecyclerId: (id: number) => void;
  offerPrice: string;
  setOfferPrice: (price: string) => void;
  lots: Lot[];
  materials: Material[];
  recyclers: Recycler[];
  submitOffer: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  offerLotId,
  setOfferLotId,
  offerRecyclerId,
  setOfferRecyclerId,
  offerPrice,
  setOfferPrice,
  lots,
  materials,
  recyclers,
  submitOffer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="offer-dialog" role="dialog" aria-modal="true" aria-labelledby="offer-title">
        <div className="dialog-heading">
          <h2 id="offer-title">Create recycler offer</h2>
          <button aria-label="Close" onClick={onClose}>×</button>
        </div>
        <label>
          Lot
          <select value={offerLotId} onChange={(event) => setOfferLotId(Number(event.target.value))}>
            {lots.map((lot) => (
              <option value={lot.id} key={lot.id}>
                Lot #{lot.id} · {materials.find((material) => material.id === lot.material_id)?.name ?? 'Material'}
              </option>
            ))}
          </select>
        </label>
        <label>
          Recycler
          <select value={offerRecyclerId} onChange={(event) => setOfferRecyclerId(Number(event.target.value))}>
            {recyclers.map((recycler) => (
              <option value={recycler.id} key={recycler.id}>
                {recycler.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Offer price
          <input
            type="number"
            min="1"
            value={offerPrice}
            onChange={(event) => setOfferPrice(event.target.value)}
            placeholder="Enter total rupees"
          />
        </label>
        <button className="dialog-submit" onClick={submitOffer}>
          Submit offer
        </button>
      </section>
    </div>
  );
};
