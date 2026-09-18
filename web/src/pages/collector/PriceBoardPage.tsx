import React, { useState } from 'react';
import { Lang, Material, I18N } from '../../types';
import { ExportButton } from '../../components/common/ExportButton';
import { downloadCSV, downloadXLSX, downloadElementAsJPG } from '../../utils/exportUtils';

export interface PriceBoardPageProps {
  currentLang: Lang;
  materials: Material[];
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  onNavigateCreateLotWithMaterial: (materialId: number) => void;
  onNavigateCreateLot: () => void;
}

export const PriceBoardPage: React.FC<PriceBoardPageProps> = ({
  currentLang,
  materials,
  selectedCity,
  setSelectedCity,
  onNavigateCreateLotWithMaterial,
  onNavigateCreateLot,
}) => {
  const [chartCategory, setChartCategory] = useState<string>('PCB');
  const [chartHoverIdx, setChartHoverIdx] = useState<number | null>(null);

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

  const series = (baseMap[chartCategory] || baseMap['PCB']).map((p) =>
    Math.round(p * cityFactor)
  );
  const liveRate = series[series.length - 1];
  const startRate = series[0];
  const pctChange = (((liveRate - startRate) / startRate) * 100).toFixed(1);

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Live)'];
  const minVal = Math.min(...series) * 0.88;
  const maxVal = Math.max(...series) * 1.08;
  const width = 720;
  const height = 180;
  const padL = 45;
  const padR = 25;
  const padT = 20;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const coords = series.map((val, idx) => {
    const x = padL + (idx / (series.length - 1)) * plotW;
    const y = padT + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
    return { x, y, val, month: months[idx] };
  });

  const linePath = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padT + plotH} L ${coords[0].x} ${
    padT + plotH
  } Z`;

  const benchmarkExportRows = [
    { cat: 'Printed Circuit Boards (PCB)', median: Math.round(185 * cityFactor), min: Math.round(165 * cityFactor), max: Math.round(195 * cityFactor), samples: 14 },
    { cat: 'Copper Wire & Insulated Cables', median: Math.round(110 * cityFactor), min: Math.round(90 * cityFactor), max: Math.round(125 * cityFactor), samples: 18 },
    { cat: 'Lithium-Ion & Lead Batteries', median: Math.round(65 * cityFactor), min: Math.round(55 * cityFactor), max: Math.round(75 * cityFactor), samples: 9 },
    { cat: 'LCD & LED Monitor Screens', median: Math.round(95 * cityFactor), min: Math.round(70 * cityFactor), max: Math.round(110 * cityFactor), samples: 12 },
    { cat: 'Non-Ferrous E-Waste Metals', median: Math.round(98 * cityFactor), min: Math.round(80 * cityFactor), max: Math.round(115 * cityFactor), samples: 16 },
    { cat: 'Recycled Polymer Plastics', median: Math.round(42 * cityFactor), min: Math.round(35 * cityFactor), max: Math.round(50 * cityFactor), samples: 21 },
  ].map((i) => [i.cat, selectedCity, `₹ ${i.median}/kg`, `₹ ${i.min}/kg`, `₹ ${i.max}/kg`, i.samples]);

  return (
    <div className="multipage-view" id="price-board-content">
      <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div>
          <h1>{I18N[currentLang].priceBoardTitle}</h1>
          <p>{I18N[currentLang].priceBoardSubtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ExportButton
            label={currentLang === 'hi' ? 'भाव सूची डाउनलोड' : 'Download Rates'}
            onExportCSV={() =>
              downloadCSV(
                `ReVive_Price_Index_${selectedCity.replace(/[\s,]+/g, '_')}`,
                ['Category', 'Region', 'Median Rate', 'Min Rate', 'Max Rate', 'Sample Count'],
                benchmarkExportRows
              )
            }
            onExportXLSX={() =>
              downloadXLSX(
                `ReVive_Price_Index_${selectedCity.replace(/[\s,]+/g, '_')}`,
                'Live_Rates',
                ['Category', 'Region', 'Median Rate', 'Min Rate', 'Max Rate', 'Sample Count'],
                benchmarkExportRows
              )
            }
            onExportJPG={() =>
              downloadElementAsJPG(
                'price-board-content',
                `ReVive_Price_Board_${selectedCity.replace(/[\s,]+/g, '_')}`,
                `ReVive Live Price Board - ${selectedCity}`
              )
            }
          />
          <button className="primary-button" onClick={onNavigateCreateLot}>
            + {I18N[currentLang].createLot}
          </button>
        </div>
      </div>

      {/* City Filter Strip */}
      <div className="city-filter-strip">
        {['Bhopal, MP', 'Indore, MP', 'Pune, MH', 'Delhi NCR', 'Mumbai, MH'].map((city) => (
          <button
            key={city}
            className={`city-filter-chip ${selectedCity === city ? 'active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            ⌖ {city}
          </button>
        ))}
      </div>

      {/* Live Benchmark Grid */}
      <section
        className="rate-strip"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
      >
        {[
          { cat: 'Printed Circuit Boards (PCB)', median: 185, min: 165, max: 195, samples: 14, art: '♧' },
          { cat: 'Copper Wire & Insulated Cables', median: 110, min: 90, max: 125, samples: 18, art: '▧' },
          { cat: 'Lithium-Ion & Lead Batteries', median: 65, min: 55, max: 75, samples: 9, art: '◒' },
          { cat: 'LCD & LED Monitor Screens', median: 95, min: 70, max: 110, samples: 12, art: '▤' },
          { cat: 'Non-Ferrous E-Waste Metals', median: 98, min: 80, max: 115, samples: 16, art: '▣' },
          { cat: 'Recycled Polymer Plastics', median: 42, min: 35, max: 50, samples: 21, art: '◎' },
        ].map((item, idx) => (
          <article
            className="rate-card"
            key={item.cat}
            style={{ padding: '14px', borderRadius: '14px' }}
          >
            <div
              className={`rate-art art-${idx % 4}`}
              style={{ width: '48px', height: '48px', fontSize: '22px' }}
            >
              {item.art}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '13px' }}>{item.cat}</strong>
              <small>
                {item.samples} recycler benchmark points in {selectedCity}
              </small>
              <b style={{ fontSize: '15px', color: '#086c4b' }}>₹ {item.median} / kg</b>
              <div style={{ fontSize: '10px', color: '#688478', marginTop: '2px' }}>
                Range: ₹{item.min} - ₹{item.max}
              </div>
            </div>
            <button
              className="mini-action"
              style={{ alignSelf: 'center', background: '#086c4b' }}
              onClick={() => {
                const matchingMat = materials.find((m) =>
                  m.name.toLowerCase().includes(item.cat.split(' ')[0].toLowerCase())
                );
                if (matchingMat) onNavigateCreateLotWithMaterial(matchingMat.id);
                else onNavigateCreateLot();
              }}
            >
              {I18N[currentLang].sellThisMaterialBtn}
            </button>
          </article>
        ))}
      </section>

      {/* LIVE INTERACTIVE PRICE TRENDS CHART */}
      <div className="live-chart-container">
        <div className="live-chart-top">
          <div>
            <div className="live-pulse-badge">
              <span className="live-pulse-dot" />
              <span>LIVE MARKET FEED · {selectedCity}</span>
            </div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '18px', color: '#0c3b2d' }}>
              {currentLang === 'hi'
                ? 'रीयल-टाइम मूल्य रुझान चार्ट'
                : currentLang === 'mr'
                ? 'थेट बाजार भाव कल आलेख'
                : 'Real-Time Dynamic Price Trends'}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#57786b' }}>
              Interactive monthly valuation trajectory with regional CPCB procurement benchmarks.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#57786b' }}>Current Benchmark</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#086c4b' }}>
              ₹ {liveRate} <span style={{ fontSize: '13px', fontWeight: 500, color: '#4d6f60' }}>/ kg</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
              ▲ +{pctChange}% over 6 months
            </span>
          </div>
        </div>

        {/* Material Filter Tabs for the Chart */}
        <div className="chart-cat-strip">
          {[
            { key: 'PCB', label: 'Printed Circuit Boards (PCB)' },
            { key: 'Cable', label: 'Copper Wire & Cables' },
            { key: 'Battery', label: 'Lithium & Lead Batteries' },
            { key: 'Display', label: 'LCD Displays & Screens' },
            { key: 'Metal', label: 'Non-Ferrous Metals' },
            { key: 'Plastic', label: 'Polymer Plastics' },
          ].map((c) => (
            <button
              key={c.key}
              className={`chart-cat-pill ${chartCategory === c.key ? 'active' : ''}`}
              onClick={() => {
                setChartCategory(c.key);
                setChartHoverIdx(null);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* SVG Line / Area Graph */}
        <div className="chart-svg-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#086c4b" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#086c4b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((frac, i) => {
              const y = padT + frac * plotH;
              const labelVal = Math.round(maxVal - frac * (maxVal - minVal));
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#eaf2ec" strokeDasharray="3 3" />
                  <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#7d988c">
                    ₹{labelVal}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            <path d={areaPath} fill="url(#priceGrad)" />

            {/* Trend Line */}
            <path d={linePath} fill="none" stroke="#086c4b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points & X-axis labels */}
            {coords.map((c, i) => {
              const isHovered = chartHoverIdx === i;
              const isLive = i === coords.length - 1;
              return (
                <g
                  key={i}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setChartHoverIdx(i)}
                  onMouseLeave={() => setChartHoverIdx(null)}
                >
                  <line x1={c.x} y1={padT + plotH} x2={c.x} y2={padT + plotH + 5} stroke="#cfe0d8" />
                  <text
                    x={c.x}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isLive ? 700 : 500}
                    fill={isLive ? '#086c4b' : '#648476'}
                  >
                    {c.month}
                  </text>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 7 : isLive ? 6 : 4}
                    fill={isLive ? '#10b981' : '#ffffff'}
                    stroke="#086c4b"
                    strokeWidth={isHovered ? 3 : 2}
                  />
                  {isHovered && (
                    <g>
                      <rect x={c.x - 38} y={c.y - 32} width="76" height="24" rx="4" fill="#0c3b2d" />
                      <text x={c.x} y={c.y - 16} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                        ₹ {c.val}/kg
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Benchmark Metrics Bar */}
          <div className="chart-metrics-row">
            <div className="chart-metric-item">
              <small>6-Month Low</small>
              <strong>₹ {Math.min(...series)} / kg</strong>
            </div>
            <div className="chart-metric-item">
              <small>6-Month High</small>
              <strong>₹ {Math.max(...series)} / kg</strong>
            </div>
            <div className="chart-metric-item">
              <small>Average Price</small>
              <strong>₹ {(series.reduce((a, b) => a + b, 0) / series.length).toFixed(1)} / kg</strong>
            </div>
            <div className="chart-metric-item">
              <small>Volatility Risk</small>
              <strong style={{ color: '#16a34a' }}>Low (Stable ↑)</strong>
            </div>
            <div className="chart-metric-item">
              <small>Certified Hub</small>
              <strong style={{ fontSize: '13px', color: '#114432' }}>{selectedCity}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Historical Price Trajectory */}
      <div className="trend-table-box">
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#114432' }}>
          {I18N[currentLang].histTrendTitle}
        </h3>
        <table className="trend-table">
          <thead>
            <tr>
              <th>Material Category</th>
              <th>Jun</th>
              <th>Jul</th>
              <th>Aug</th>
              <th>Sep</th>
              <th>Oct</th>
              <th>Nov (Live)</th>
              <th style={{ width: '160px' }}>6-Month Trajectory</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {[
              { mat: 'PCB (Printed Circuit Boards)', r: [168, 172, 178, 182, 185, 192], trend: '+14%', pct: 85 },
              { mat: 'Copper Wire & Cables', r: [92, 95, 102, 106, 110, 115], trend: '+25%', pct: 75 },
              { mat: 'Lithium-Ion Batteries', r: [54, 56, 58, 62, 65, 68], trend: '+26%', pct: 60 },
              { mat: 'LCD / LED Display Screens', r: [82, 85, 89, 92, 95, 98], trend: '+19%', pct: 68 },
              { mat: 'Non-Ferrous E-Waste Metals', r: [85, 88, 90, 94, 98, 102], trend: '+20%', pct: 70 },
              { mat: 'Mixed Polymer Scrap', r: [34, 36, 38, 40, 42, 44], trend: '+29%', pct: 50 },
            ].map((row) => (
              <tr key={row.mat}>
                <td>
                  <strong>{row.mat}</strong>
                </td>
                <td>₹ {row.r[0]}</td>
                <td>₹ {row.r[1]}</td>
                <td>₹ {row.r[2]}</td>
                <td>₹ {row.r[3]}</td>
                <td>₹ {row.r[4]}</td>
                <td>
                  <b style={{ color: '#086c4b' }}>₹ {row.r[5]}</b>
                </td>
                <td>
                  <div className="trend-bar-wrap">
                    <div className="trend-bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                </td>
                <td>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>↑ {row.trend}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
