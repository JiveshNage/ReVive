import React, { useState } from 'react';
import { Lang, I18N } from '../../types';

export interface MobileRecyclersViewProps {
  currentLang: Lang;
  onNavigateScan: () => void;
}

export const MobileRecyclersView: React.FC<MobileRecyclersViewProps> = ({
  currentLang,
  onNavigateScan,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const facilities = [
    { id: 1, name: 'EcoCycle Solutions', loc: 'Bhopal Industrial Area', dist: '2.5 km', pickup: true, phone: '+91 98765 40003', cert: 'CPCB/EW/2025/1102', materials: ['PCB', 'Battery', 'Cable'] },
    { id: 2, name: 'GreenLoop Recyclers', loc: 'Indore Sector 3', dist: '5.8 km', pickup: true, phone: '+91 98765 40004', cert: 'CPCB/EW/2024/0744', materials: ['PCB', 'Display', 'Metal'] },
    { id: 3, name: 'MahaGreen Recycling Hub', loc: 'Pune Bhosari MIDC', dist: '4.2 km', pickup: true, phone: '+91 98765 40001', cert: 'CPCB/EW/2024/0981', materials: ['Battery', 'Cable', 'Plastic'] },
    { id: 4, name: 'CleanEarth Facilities', loc: 'Okhla Phase 2, Delhi', dist: '11.4 km', pickup: false, phone: '+91 98765 40005', cert: 'CPCB/EW/2024/1589', materials: ['PCB', 'Battery', 'Metal'] },
  ];

  const filtered = filter === 'all' ? facilities : facilities.filter((f) => f.materials.includes(filter));

  return (
    <div className="mobile-view-container">
      <div className="mobile-page-title-row">
        <div>
          <h2>🏢 {currentLang === 'hi' ? 'प्रमाणित रीसाइक्लर केंद्र' : 'Authorized Recyclers'}</h2>
          <p>{currentLang === 'hi' ? 'सीपीसीबी पंजीकृत सुविधाएं व डोरस्टेप पिकअप सेवा' : 'CPCB registered facilities with doorstep pickup'}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mobile-filter-strip">
        {['all', 'PCB', 'Battery', 'Cable', 'Display'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`mobile-filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? (currentLang === 'hi' ? 'सभी केंद्र' : 'All') : cat}
          </button>
        ))}
      </div>

      {/* Recycler Cards */}
      <div className="mobile-cards-list">
        {filtered.map((r) => (
          <div className="mobile-recycler-card" key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '17px', color: '#0c3b2d' }}>{r.name}</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {r.loc}</div>
              </div>
              <span className="mobile-dist-badge">📍 {r.dist}</span>
            </div>

            <div style={{ margin: '10px 0', fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
              ✓ CPCB License: <code>{r.cert}</code>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {r.materials.map((m) => (
                <span key={m} style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', color: '#334155' }}>
                  {m}
                </span>
              ))}
              {r.pickup && <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>🚚 Pickup ✓</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`tel:${r.phone}`}
                className="secondary-button"
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px', fontSize: '13px' }}
              >
                📞 {currentLang === 'hi' ? 'कॉल करें' : 'Call'}
              </a>
              <button
                type="button"
                className="primary-button"
                style={{ flex: 1.5, padding: '10px', fontSize: '13px', background: '#059669' }}
                onClick={onNavigateScan}
              >
                📸 {currentLang === 'hi' ? 'स्क्रैप बेचें' : 'Sell Scrap'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
