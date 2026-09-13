import React, { useState } from 'react';
import { UserProfile, Lot, Material, Offer, CollectorLocation, fallbackCollectors } from '../../types';
import { RecyclerBrowseLots } from './RecyclerBrowseLots';
import { RecyclerOffers } from './RecyclerOffers';
import { RecyclerPickups } from './RecyclerPickups';
import { RecyclerPassports } from './RecyclerPassports';
import { RecyclerProfile } from './RecyclerProfile';
import { RecyclerCollectorRadar } from './RecyclerCollectorRadar';
import { RecyclerScaleTerminal } from './RecyclerScaleTerminal';
import { RecyclerPaymentTerminal } from './RecyclerPaymentTerminal';

export interface RecyclerPortalProps {
  currentUser: UserProfile | null;
  recyclerSubView: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile';
  setRecyclerSubView: (view: 'radar' | 'browse' | 'scale' | 'payments' | 'bids' | 'pickups' | 'passports' | 'profile') => void;
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
  collectors?: CollectorLocation[];
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
  collectors,
  onLogout,
}) => {
  const [activeScaleLotId, setActiveScaleLotId] = useState<number>(102);
  const [verifiedScaleWeight, setVerifiedScaleWeight] = useState<number>(5.4);
  const [calculatedPayout, setCalculatedPayout] = useState<number>(2176.2);

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
        <div className="stat-card tint-green" onClick={() => setRecyclerSubView('radar')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">📍</span>
          <div>
            <strong>{(collectors || fallbackCollectors).length} Pickers</strong>
            <span>Collector Radar</span>
            <small>Nearby scrap depots</small>
          </div>
        </div>
        <div className="stat-card tint-blue" onClick={() => setRecyclerSubView('scale')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">⚖</span>
          <div>
            <strong>Digital Scale</strong>
            <span>Weigh-in Terminal</span>
            <small>Tare & Net verification</small>
          </div>
        </div>
        <div className="stat-card tint-yellow" onClick={() => setRecyclerSubView('payments')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">₹</span>
          <div>
            <strong>Instant Payout</strong>
            <span>Payment Terminal</span>
            <small>UPI / IMPS / Escrow</small>
          </div>
        </div>
        <div className="stat-card tint-purple" onClick={() => setRecyclerSubView('passports')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">♻</span>
          <div>
            <strong>{deliveredLots.length} Passports</strong>
            <span>Completed Lots</span>
            <small>CPCB Passports Issued</small>
          </div>
        </div>
      </section>


      {/* Subpage View Switching */}
      {recyclerSubView === 'radar' && (
        <RecyclerCollectorRadar
          currentUser={currentUser}
          collectors={collectors || fallbackCollectors}
          lots={lots}
          onDispatchVehicle={(cId, lId) => {
            alert(`✓ Zero-Emission EV pickup dispatched for Lot #${lId}. Driver Sunil Kumar notified.`);
          }}
          onOpenScaleTerminal={(lId) => {
            setActiveScaleLotId(lId);
            setRecyclerSubView('scale');
          }}
        />
      )}

      {recyclerSubView === 'scale' && (
        <RecyclerScaleTerminal
          lots={lots}
          materials={materials}
          onWeightVerified={(lId, weight, payout) => {
            setActiveScaleLotId(lId);
            setVerifiedScaleWeight(weight);
            setCalculatedPayout(payout);
            setRecyclerSubView('payments');
          }}
        />
      )}

      {recyclerSubView === 'payments' && (
        <RecyclerPaymentTerminal
          currentUser={currentUser}
          lots={lots}
          materials={materials}
          selectedLotId={activeScaleLotId}
          verifiedWeightKg={verifiedScaleWeight}
          totalAmountInr={calculatedPayout}
          onPaymentSettled={(lId, utr, passport) => {
            // Settled
          }}
          openPassport={openPassport}
        />
      )}

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
