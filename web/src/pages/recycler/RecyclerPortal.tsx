import React from 'react';
import { UserProfile, Lot, Material, Offer } from '../../types';
import { RecyclerBrowseLots } from './RecyclerBrowseLots';
import { RecyclerOffers } from './RecyclerOffers';
import { RecyclerPickups } from './RecyclerPickups';
import { RecyclerPassports } from './RecyclerPassports';
import { RecyclerProfile } from './RecyclerProfile';

export interface RecyclerPortalProps {
  currentUser: UserProfile | null;
  recyclerSubView: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (view: 'browse' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
  lots: Lot[];
  materials: Material[];
  pendingOffers: Offer[];
  acceptedOffers: Offer[];
  deliveredLots: Lot[];
  getStatusLabel: (status: string) => string;
  setOfferLotId: (id: number) => void;
  setOfferPrice: (price: string) => void;
  setOfferDialogOpen: (open: boolean) => void;
  acceptOffer: (id: number) => void;
  setHandoverLotId: (id: number) => void;
  setHandoverDialogOpen: (open: boolean) => void;
  openPassport: (lotId: number | string) => void;
  onLogout?: () => void;
}

export const RecyclerPortal: React.FC<RecyclerPortalProps> = ({
  currentUser,
  recyclerSubView,
  setRecyclerSubView,
  lots,
  materials,
  pendingOffers,
  acceptedOffers,
  deliveredLots,
  getStatusLabel,
  setOfferLotId,
  setOfferPrice,
  setOfferDialogOpen,
  acceptOffer,
  setHandoverLotId,
  setHandoverDialogOpen,
  openPassport,
  onLogout,
}) => {
  const handleSendOffer = (lotId: number, estimatedValue: number) => {
    setOfferLotId(lotId);
    setOfferPrice(String(estimatedValue));
    setOfferDialogOpen(true);
  };

  const handleOpenHandover = (lotId: number) => {
    setHandoverLotId(lotId);
    setHandoverDialogOpen(true);
  };

  return (
    <section className="recycler-dashboard">
      {/* Recycler Welcome Hero Banner */}
      <div className="welcome-row">
        <div>
          <p className="eyebrow">CPCB Authorized Recycler Portal · Formal Value Chain</p>
          <h1>{currentUser?.company_name || 'EcoCycle Pune Solutions Pvt Ltd'}</h1>
          <p>
            CPCB License: <code>{currentUser?.license_no || 'CPCB/EW/2024/0981'}</code> · Operating Region:{' '}
            {currentUser?.service_area || currentUser?.location || 'Pune, Maharashtra'}
          </p>
        </div>
      </div>

      {/* Recycler Top Metrics Grid */}
      <section className="stats-grid">
        <div className="stat-card tint-green" onClick={() => setRecyclerSubView('browse')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">▣</span>
          <div>
            <strong>{lots.length}</strong>
            <span>Available Lots</span>
            <small>Active in service area</small>
          </div>
        </div>
        <div className="stat-card tint-blue" onClick={() => setRecyclerSubView('bids')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">✓</span>
          <div>
            <strong>{acceptedOffers.length}</strong>
            <span>Accepted Bids</span>
            <small>Awaiting collection</small>
          </div>
        </div>
        <div className="stat-card tint-yellow">
          <span className="stat-symbol">₹</span>
          <div>
            <strong>₹ {acceptedOffers.reduce((total, offer) => total + offer.offer_price, 0).toLocaleString('en-IN')}</strong>
            <span>Committed Pipeline</span>
            <small>Procurement turnover</small>
          </div>
        </div>
        <div className="stat-card tint-purple" onClick={() => setRecyclerSubView('passports')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">♻</span>
          <div>
            <strong>{deliveredLots.length}</strong>
            <span>Completed Lots</span>
            <small>CPCB Passports Issued</small>
          </div>
        </div>
      </section>

      {/* Subpage View Switching */}
      {recyclerSubView === 'browse' && (
        <RecyclerBrowseLots
          lots={lots}
          materials={materials}
          getStatusLabel={getStatusLabel}
          onSendOffer={handleSendOffer}
        />
      )}

      {recyclerSubView === 'bids' && (
        <RecyclerOffers
          pendingOffers={pendingOffers}
          acceptedOffers={acceptedOffers}
          acceptOffer={acceptOffer}
          onOpenHandover={handleOpenHandover}
        />
      )}

      {recyclerSubView === 'pickups' && (
        <RecyclerPickups
          lots={lots}
          onOpenHandover={handleOpenHandover}
        />
      )}

      {recyclerSubView === 'passports' && (
        <RecyclerPassports
          deliveredLots={deliveredLots}
          openPassport={openPassport}
        />
      )}

      {recyclerSubView === 'profile' && (
        <RecyclerProfile
          currentUser={currentUser}
          onLogout={onLogout || (() => {})}
        />
      )}
    </section>
  );
};
