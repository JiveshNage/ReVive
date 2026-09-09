import React, { useState } from 'react';
import { Lot, Material, Offer, Lang, I18N } from '../../types';

export interface MobileLotsViewProps {
  currentLang: Lang;
  lots: Lot[];
  materials: Material[];
  offers: Offer[];
  onOpenPassport: (lotId: number) => void;
  onOpenTraceability: (lotId: number) => void;
  onOpenHandover: (lotId: number, weight: number) => void;
  onCompletePayment: (lotId: number) => void;
  onNavigateScan: () => void;
  getStatusLabel: (status: string) => string;
}

export const MobileLotsView: React.FC<MobileLotsViewProps> = ({
  currentLang,
  lots,
  materials,
  offers,
  onOpenPassport,
  onOpenTraceability,
  onOpenHandover,
  onCompletePayment,
  onNavigateScan,
  getStatusLabel,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? lots : lots.filter((l) => l.status === filter);

  return (
    <div className="mobile-view-container">
      {/* Title Bar */}
      <div className="mobile-page-title-row">
        <div>
          <h2>📦 {currentLang === 'hi' ? 'मेरे कबाड़ लॉट' : currentLang === 'mr' ? 'माझे स्क्रॅप लॉट्स' : 'My Scrap Lots'}</h2>
          <p>{currentLang === 'hi' ? 'सभी लॉट्स का लाइव स्टेटस, डिजिटल पासपोर्ट व रसीद' : 'Track live status, CPCB passports, and receipts'}</p>
        </div>
        <button className="primary-button" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={onNavigateScan}>
          + {currentLang === 'hi' ? 'नया स्कैन' : 'Scan Scrap'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mobile-filter-strip">
        {['all', 'created', 'offers', 'pickup', 'handed_over', 'payment_completed'].map((st) => (
          <button
            key={st}
            type="button"
            className={`mobile-filter-chip ${filter === st ? 'active' : ''}`}
            onClick={() => setFilter(st)}
          >
            {st === 'all' ? (currentLang === 'hi' ? 'सभी' : 'All') : getStatusLabel(st)}
          </button>
        ))}
      </div>

      {/* Card-based List */}
      <div className="mobile-cards-list">
        {filtered.length === 0 ? (
          <div className="mobile-empty-card">
            <span style={{ fontSize: '42px' }}>📭</span>
            <p style={{ margin: '8px 0', fontWeight: 700 }}>
              {currentLang === 'hi' ? 'कोई लॉट नहीं मिला' : 'No lots in this category'}
            </p>
            <button className="primary-button" style={{ marginTop: '10px' }} onClick={onNavigateScan}>
              📸 {currentLang === 'hi' ? 'कैमरा से नया लॉट जोड़ें' : 'Scan Scrap with Camera'}
            </button>
          </div>
        ) : (
          filtered.map((lot) => {
            const mat = materials.find((m) => m.id === lot.material_id);
            const relOffer = [...offers].reverse().find((o) => o.lot_id === lot.id);

            return (
              <div className="mobile-lot-card" key={lot.id}>
                <div className="mobile-lot-card-header">
                  <div>
                    <span className="mobile-lot-ref">REV-LOT-{lot.id}</span>
                    <h3 style={{ margin: '4px 0 2px', fontSize: '17px', color: '#0c3b2d' }}>
                      {mat?.name || 'E-Waste Scrap'}
                    </h3>
                  </div>
                  <span className={`offer-status ${lot.status}`}>
                    {getStatusLabel(lot.status)}
                  </span>
                </div>

                <div className="mobile-lot-grid-row">
                  <div className="mobile-lot-metric">
                    <span>{currentLang === 'hi' ? 'वजन' : 'Weight'}</span>
                    <strong>{lot.quantity_kg} kg</strong>
                  </div>
                  <div className="mobile-lot-metric">
                    <span>{currentLang === 'hi' ? 'मूल्य' : 'Value'}</span>
                    <strong style={{ color: '#047857' }}>₹ {relOffer?.offer_price || lot.estimated_value}</strong>
                  </div>
                  <div className="mobile-lot-metric">
                    <span>{currentLang === 'hi' ? 'भुगतान' : 'Payment'}</span>
                    <strong style={{ color: lot.status === 'payment_completed' ? '#047857' : '#d97706' }}>
                      {lot.status === 'payment_completed' ? '✓ Paid' : '⏳ In Transit'}
                    </strong>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mobile-lot-actions-row">
                  {lot.status === 'pickup' && (
                    <button
                      type="button"
                      className="mini-action"
                      style={{ background: '#0284c7', flex: 1, padding: '10px' }}
                      onClick={() => onOpenHandover(lot.id, lot.quantity_kg)}
                    >
                      🤝 {I18N[currentLang].btnHandover}
                    </button>
                  )}
                  {(lot.status === 'pickup' || lot.status === 'handed_over') && (
                    <button
                      type="button"
                      className="mini-action"
                      style={{ background: '#16a34a', flex: 1, padding: '10px' }}
                      onClick={() => onCompletePayment(lot.id)}
                    >
                      💵 {I18N[currentLang].btnMarkPaid}
                    </button>
                  )}
                  <button
                    type="button"
                    className="mini-action passport-btn"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => onOpenPassport(lot.id)}
                  >
                    📜 {I18N[currentLang].btnPassportQr}
                  </button>
                  <button
                    type="button"
                    className="mini-action trace-btn"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => onOpenTraceability(lot.id)}
                  >
                    🔍 {I18N[currentLang].btnTrace}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
