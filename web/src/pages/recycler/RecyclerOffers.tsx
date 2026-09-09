import React from 'react';
import { Offer } from '../../types';

export interface RecyclerOffersProps {
  pendingOffers: Offer[];
  acceptedOffers: Offer[];
  acceptOffer: (id: number) => void;
  onOpenHandover: (lotId: number) => void;
}

export const RecyclerOffers: React.FC<RecyclerOffersProps> = ({
  pendingOffers,
  acceptedOffers,
  acceptOffer,
  onOpenHandover,
}) => {
  return (
    <div className="recycler-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>🏷️ Bids & Purchase Offers</h2>
          <p>Manage and track procurement offers submitted to informal collectors</p>
        </div>
      </div>

      <div className="offers-split-layout">
        {/* Pending Bids Column */}
        <div className="offers-column">
          <div className="offers-column-header">
            <h3>Pending Offers ({pendingOffers.length})</h3>
            <span className="info-chip">Awaiting Collector Confirmation</span>
          </div>

          {pendingOffers.length === 0 ? (
            <div className="empty-subcard">
              <p>No active pending bids. Browse lots to send offers.</p>
            </div>
          ) : (
            <div className="offers-list">
              {pendingOffers.map((offer) => (
                <div className="enterprise-offer-card" key={offer.id}>
                  <div className="offer-header">
                    <span className="offer-id">Offer #{offer.id}</span>
                    <strong className="offer-rate">₹ {offer.offer_price.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="offer-details">
                    <p>
                      <strong>Target:</strong> Lot #{offer.lot_id}
                    </p>
                    <p>
                      <strong>Fulfillment:</strong>{' '}
                      {offer.pickup_available ? 'Recycler Pickup Included' : 'Drop-off at Yard'}
                    </p>
                  </div>
                  <div className="offer-actions">
                    <button
                      type="button"
                      className="simulate-accept-btn"
                      onClick={() => acceptOffer(offer.id)}
                    >
                      ⚡ Simulate Collector Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Bids Ready for Pickup Column */}
        <div className="offers-column">
          <div className="offers-column-header">
            <h3>Accepted Lots ({acceptedOffers.length})</h3>
            <span className="info-chip success">Locked for Collection</span>
          </div>

          {acceptedOffers.length === 0 ? (
            <div className="empty-subcard">
              <p>No accepted offers awaiting collection.</p>
            </div>
          ) : (
            <div className="offers-list">
              {acceptedOffers.map((offer) => (
                <div className="enterprise-offer-card accepted" key={offer.id}>
                  <div className="offer-header">
                    <span className="offer-id">Locked Lot #{offer.lot_id}</span>
                    <strong className="offer-rate" style={{ color: '#059669' }}>
                      ₹ {offer.offer_price.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="offer-details">
                    <p>
                      <strong>Contract:</strong> Price Locked & Agreed
                    </p>
                    <p>
                      <strong>Next Step:</strong> Digital scale weigh-in & CPCB passport generation
                    </p>
                  </div>
                  <div className="offer-actions">
                    <button
                      type="button"
                      className="weigh-receive-btn"
                      onClick={() => onOpenHandover(offer.lot_id)}
                    >
                      🚚 Weigh & Confirm Handover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
