import React, { useState } from 'react';
import { Lang, I18N } from '../../types';

export interface FindRecyclerPageProps {
  currentLang: Lang;
  onNavigateCreateLot: () => void;
  onRequestPickup: (recyclerId: number) => void;
}

export const FindRecyclerPage: React.FC<FindRecyclerPageProps> = ({
  currentLang,
  onNavigateCreateLot,
  onRequestPickup,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const recyclersList = [
    { id: 1, name: 'EcoCycle Pune', loc: 'Pune, Maharashtra', dist: '4.2 km', pickup: true, phone: '+91 98765 40001', cert: 'CPCB/EW/2024/0981' },
    { id: 2, name: 'GreenLoop Nashik', loc: 'Nashik, Maharashtra', dist: '7.1 km', pickup: true, phone: '+91 98765 40002', cert: 'CPCB/EW/2023/0412' },
    { id: 3, name: 'CleanEarth Bhopal', loc: 'Bhopal, MP', dist: '2.5 km', pickup: true, phone: '+91 98765 40003', cert: 'CPCB/EW/2025/1102' },
    { id: 4, name: 'EcoReclaim Indore', loc: 'Indore, MP', dist: '5.8 km', pickup: false, phone: '+91 98765 40004', cert: 'CPCB/EW/2024/0744' },
    { id: 5, name: 'Metro E-Recyclers Delhi', loc: 'Okhla, New Delhi', dist: '11.4 km', pickup: true, phone: '+91 98765 40005', cert: 'CPCB/EW/2024/1589' },
    { id: 6, name: 'MahaGreen Recycling Hub', loc: 'Navi Mumbai, MH', dist: '8.9 km', pickup: true, phone: '+91 98765 40006', cert: 'CPCB/EW/2025/0319' },
  ];

  return (
    <div className="multipage-view">
      <div className="page-header-row">
        <div>
          <h1>{I18N[currentLang].dirTitle}</h1>
          <p>{I18N[currentLang].dirSubtitle}</p>
        </div>
        <button className="primary-button" onClick={onNavigateCreateLot}>
          + {I18N[currentLang].createLot}
        </button>
      </div>

      {/* Filter Strip */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'PCB', 'Battery', 'Cable', 'Display', 'Metal'].map((cat) => (
          <button
            key={cat}
            className={`city-filter-chip ${selectedCategoryFilter === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategoryFilter(cat)}
          >
            {cat === 'all' ? 'All Materials' : cat}
          </button>
        ))}
      </div>

      <div className="recycler-cards-dir">
        {recyclersList.map((rec) => (
          <div className="dir-recycler-card" key={rec.id}>
            <div className="dir-card-header">
              <div>
                <strong style={{ fontSize: '15px', color: '#0c3b2d' }}>{rec.name}</strong>
                <small style={{ color: '#587a6c', display: 'block', marginTop: '2px' }}>
                  ⌖ {rec.loc}
                </small>
              </div>
              <span className="cpcb-tag">✓ CPCB Verified</span>
            </div>
            <div style={{ fontSize: '11px', color: '#4a6b5e', margin: '10px 0' }}>
              <div>
                <strong>Distance:</strong> {rec.dist} from your location
              </div>
              <div>
                <strong>Pickup:</strong> {rec.pickup ? '✓ Doorstep Pickup Available' : 'Drop-off Only'}
              </div>
              <div>
                <strong>Licence:</strong> <code>{rec.cert}</code>
              </div>
              <div>
                <strong>Phone:</strong> {rec.phone}
              </div>
            </div>
            <button
              className="wizard-btn-primary"
              style={{ padding: '8px', fontSize: '12px' }}
              onClick={() => onRequestPickup(rec.id)}
            >
              {I18N[currentLang].requestPickupBtn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
