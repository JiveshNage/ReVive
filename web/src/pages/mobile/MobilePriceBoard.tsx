import React, { useState } from 'react';
import { Material, Lang, I18N } from '../../types';

export interface MobilePriceBoardProps {
  currentLang: Lang;
  materials: Material[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onNavigateScanWithMaterial: (matId: number) => void;
}

export const MobilePriceBoard: React.FC<MobilePriceBoardProps> = ({
  currentLang,
  materials,
  selectedCity,
  setSelectedCity,
  onNavigateScanWithMaterial,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('PCB');

  const cityFactor = selectedCity.includes('Pune')
    ? 1.08
    : selectedCity.includes('Indore')
    ? 1.03
    : selectedCity.includes('Delhi')
    ? 1.12
    : selectedCity.includes('Mumbai')
    ? 1.1
    : 1.0;

  const baseMap: Record<string, number[]> = {
    PCB: [168, 172, 178, 182, 186, 192],
    Battery: [54, 56, 58, 62, 65, 68],
    Cable: [92, 95, 102, 106, 110, 115],
    Display: [82, 85, 89, 92, 95, 98],
    Metal: [85, 88, 90, 94, 98, 102],
    Plastic: [34, 36, 38, 40, 42, 44],
  };

  const series = (baseMap[activeCategory] || baseMap['PCB']).map((p) => Math.round(p * cityFactor));
  const currentRate = series[series.length - 1];
  const previousRate = series[series.length - 2];
  const delta = currentRate - previousRate;

  // SVG dimensions for mobile
  const width = 340;
  const height = 140;
  const padL = 35;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const minVal = Math.min(...series) * 0.9;
  const maxVal = Math.max(...series) * 1.08;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const coords = series.map((val, idx) => {
    const x = padL + (idx / (series.length - 1)) * plotW;
    const y = padT + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
    return { x, y, val };
  });

  const linePath = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padT + plotH} L ${coords[0].x} ${padT + plotH} Z`;

  return (
    <div className="mobile-view-container">
      <div className="mobile-page-title-row">
        <div>
          <h2>📈 {currentLang === 'hi' ? 'लाइव ई-कचरा भाव बोर्ड' : currentLang === 'mr' ? 'थेट ई-कचरा बाजार दर' : 'E-Waste Price Board'}</h2>
          <p>{currentLang === 'hi' ? 'पारदर्शी दैनिक दरें व 6 महीने के ऐतिहासिक रुझान' : 'Daily transparent buying rates & market trends'}</p>
        </div>
      </div>

      {/* City Chips */}
      <div className="mobile-city-chips">
        {['Bhopal, MP', 'Indore, MP', 'Pune, MH', 'Delhi NCR', 'Mumbai, MH'].map((city) => (
          <button
            key={city}
            type="button"
            className={`city-filter-chip ${selectedCity === city ? 'active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            📍 {city}
          </button>
        ))}
      </div>

      {/* Featured Rate Card with Sparkline Chart */}
      <div className="mobile-featured-rate-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>
              Live Benchmark · {selectedCity}
            </span>
            <h3 style={{ margin: '4px 0 2px', fontSize: '22px', color: '#ffffff' }}>{activeCategory} Scrap</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>₹ {currentRate}</span>
              <small style={{ color: '#a7f3d0', fontSize: '13px' }}>/ kg</small>
              <span style={{ fontSize: '12px', fontWeight: 800, color: delta >= 0 ? '#34d399' : '#f87171', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                {delta >= 0 ? `↑ +₹${delta}` : `↓ -₹${Math.abs(delta)}`} this month
              </span>
            </div>
          </div>
        </div>

        {/* Mobile SVG Chart */}
        <div style={{ margin: '14px 0 4px', width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="mobilePriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#mobilePriceGrad)" />
            <path d={linePath} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {coords.map((c, idx) => (
              <circle key={idx} cx={c.x} cy={c.y} r={idx === coords.length - 1 ? 5 : 3.5} fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
            ))}
          </svg>
        </div>

        {/* Category Switcher Tabs */}
        <div className="mobile-category-pill-row">
          {['PCB', 'Battery', 'Cable', 'Display', 'Metal', 'Plastic'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`mobile-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'PCB' ? '💻 PCB' : cat === 'Battery' ? '🔋 Battery' : cat === 'Cable' ? '🔌 Cable' : cat === 'Display' ? '📱 Screen' : cat === 'Metal' ? '⚙️ Metal' : '♻️ Plastic'}
            </button>
          ))}
        </div>
      </div>

      {/* Rate List Cards */}
      <h3 style={{ margin: '20px 0 10px', fontSize: '17px', color: '#0c3b2d' }}>
        {currentLang === 'hi' ? 'सभी श्रेणियों के दैनिक भाव' : 'All Category Daily Benchmarks'}
      </h3>

      <div className="mobile-rates-list">
        {materials.map((mat) => {
          const sampleRate = mat.name.includes('PCB') ? 185 : mat.name.includes('Battery') ? 65 : mat.name.includes('Cable') ? 110 : mat.name.includes('Screen') ? 95 : 85;
          const adjustedRate = Math.round(sampleRate * cityFactor);

          return (
            <div className="mobile-rate-row-card" key={mat.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>
                  {mat.name.includes('PCB') ? '💻' : mat.name.includes('Battery') ? '🔋' : mat.name.includes('Cable') ? '🔌' : '⚙️'}
                </span>
                <div>
                  <strong style={{ fontSize: '15px', color: '#0c3b2d' }}>{mat.name}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Category: {mat.category}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857' }}>
                  ₹ {adjustedRate} <small style={{ fontSize: '11px', color: '#64748b' }}>/ kg</small>
                </div>
                <button
                  type="button"
                  className="mini-action primary-btn"
                  style={{ marginTop: '4px', fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => onNavigateScanWithMaterial(mat.id)}
                >
                  {currentLang === 'hi' ? 'बेचें →' : 'Sell →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
