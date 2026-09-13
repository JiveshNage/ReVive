import React, { useState } from 'react';
import { CollectorLocation } from '../../types';

export interface AdminCollectorTrackingProps {
  collectors: CollectorLocation[];
  onInspectCollector?: (collector: CollectorLocation) => void;
  onOpenLiveRoute?: (collectorId: number) => void;
}

export const AdminCollectorTracking: React.FC<AdminCollectorTrackingProps> = ({
  collectors,
  onInspectCollector,
  onOpenLiveRoute,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_transit' | 'idle'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollector, setActiveCollector] = useState<CollectorLocation | null>(collectors[0] || null);

  const filteredCollectors = collectors.filter((c) => {
    const matchRegion = selectedRegion === 'all' || c.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRegion && matchStatus && matchSearch;
  });

  const totalActiveWeight = collectors.reduce((acc, c) => acc + c.total_weight_kg, 0);
  const totalCollectorsCount = collectors.length;
  const inTransitCount = collectors.filter((c) => c.status === 'in_transit').length;
  const activeCount = collectors.filter((c) => c.status === 'active').length;

  return (
    <div className="admin-radar-wrapper">
      {/* Top Banner & KPI Strip */}
      <div className="radar-header-banner">
        <div>
          <span className="badge-cpcb-statutory">CPCB GIS TELEMETRY RADAR · FORMALIZATION MESH</span>
          <h2>Informal Collector Geolocation & Scrap Yard Telemetry</h2>
          <p>
            Real-time geospatial tracking of registered informal waste pickers, aggregators, and scrap depots across prioritized e-waste clusters.
          </p>
        </div>

        <div className="radar-quick-kpis">
          <div className="radar-kpi-pill">
            <span className="dot pulse-green"></span>
            <strong>{activeCount}</strong>
            <small>Active in Wards</small>
          </div>
          <div className="radar-kpi-pill">
            <span className="dot pulse-orange"></span>
            <strong>{inTransitCount}</strong>
            <small>Transit / Dispatched</small>
          </div>
          <div className="radar-kpi-pill">
            <span className="icon">⚖</span>
            <strong>{totalActiveWeight.toFixed(1)} kg</strong>
            <small>Catalogued Scrap Volume</small>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="radar-filter-bar">
        <div className="radar-region-tabs">
          <button
            type="button"
            className={selectedRegion === 'all' ? 'active' : ''}
            onClick={() => setSelectedRegion('all')}
          >
            🇮🇳 All India ({totalCollectorsCount})
          </button>
          <button
            type="button"
            className={selectedRegion === 'bhopal' ? 'active' : ''}
            onClick={() => setSelectedRegion('bhopal')}
          >
            Bhopal Cluster
          </button>
          <button
            type="button"
            className={selectedRegion === 'pune' ? 'active' : ''}
            onClick={() => setSelectedRegion('pune')}
          >
            Pune MIDC Hub
          </button>
          <button
            type="button"
            className={selectedRegion === 'mumbai' ? 'active' : ''}
            onClick={() => setSelectedRegion('mumbai')}
          >
            Mumbai Dharavi
          </button>
          <button
            type="button"
            className={selectedRegion === 'delhi' ? 'active' : ''}
            onClick={() => setSelectedRegion('delhi')}
          >
            Delhi Mayapuri
          </button>
        </div>

        <div className="radar-search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search collector name, ID, ward or scrap area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Map Radar + Live Telemetry Panel */}
      <div className="radar-main-layout">
        {/* Map Viewport Card */}
        <div className="radar-map-card">
          <div className="radar-map-toolbar">
            <div className="toolbar-status">
              <span className="live-pulse-indicator"></span>
              <span className="status-label">LIVE RADAR GRID · REFRESH 2.4s</span>
            </div>
            <div className="toolbar-controls">
              <span className="legend-item">
                <span className="legend-pin green"></span> Active Depot
              </span>
              <span className="legend-item">
                <span className="legend-pin orange"></span> EV Transit
              </span>
              <span className="legend-item">
                <span className="legend-pin blue"></span> Registered Idle
              </span>
            </div>
          </div>

          {/* Interactive SVG Radar Canvas */}
          <div className="radar-canvas-container">
            <svg
              className="radar-canvas-svg"
              viewBox="0 0 800 520"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="radarScanGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#10B981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Geo Matrix */}
              <rect width="800" height="520" fill="#0B132B" rx="14" />

              {/* Grid Lines */}
              <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3">
                <line x1="100" y1="0" x2="100" y2="520" />
                <line x1="200" y1="0" x2="200" y2="520" />
                <line x1="300" y1="0" x2="300" y2="520" />
                <line x1="400" y1="0" x2="400" y2="520" />
                <line x1="500" y1="0" x2="500" y2="520" />
                <line x1="600" y1="0" x2="600" y2="520" />
                <line x1="700" y1="0" x2="700" y2="520" />
                <line x1="0" y1="100" x2="800" y2="100" />
                <line x1="0" y1="200" x2="800" y2="200" />
                <line x1="0" y1="300" x2="800" y2="300" />
                <line x1="0" y1="400" x2="800" y2="400" />
              </g>

              {/* Radar Sweeper Rings */}
              <circle cx="400" cy="260" r="220" fill="none" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="400" cy="260" r="150" fill="none" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="400" cy="260" r="75" fill="none" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="400" cy="260" r="240" fill="url(#radarScanGrad)" />

              {/* Stylized India Geography Vector Outlines */}
              <path
                d="M 330 80 Q 360 70 380 90 T 400 120 T 440 150 T 460 210 T 420 270 T 440 330 T 410 400 T 360 460 T 320 380 T 260 300 T 270 200 T 310 130 Z"
                fill="#1E293B"
                fillOpacity="0.45"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Active Transit Route from Karond to Mandideep */}
              <path
                d="M 352 249 Q 390 270 430 290"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
                className="animated-dash-route"
              />

              {/* EV Vehicle on Route */}
              <g transform="translate(390, 270)">
                <circle r="9" fill="#F59E0B" filter="url(#glow)" />
                <text x="0" y="4" fontSize="10" textAnchor="middle" fill="#000" fontWeight="bold">
                  🚚
                </text>
              </g>

              {/* Destination Recycler Facility Hubs */}
              <g transform="translate(430, 290)">
                <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="0" y="4" fontSize="12" textAnchor="middle" fill="#10B981">
                  🏭
                </text>
                <text x="0" y="24" fontSize="9.5" textAnchor="middle" fill="#A7F3D0" fontWeight="bold">
                  GreenLoop Hub
                </text>
              </g>

              <g transform="translate(256, 322)">
                <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                <text x="0" y="4" fontSize="12" textAnchor="middle" fill="#3B82F6">
                  🏭
                </text>
                <text x="0" y="24" fontSize="9.5" textAnchor="middle" fill="#93C5FD" fontWeight="bold">
                  EcoCycle Pune
                </text>
              </g>

              {/* Interactive Collector Pins */}
              {collectors.map((c) => {
                const posX = c.coordinates.xPercent * 8; // Convert % to 800 width
                const posY = c.coordinates.yPercent * 5.2; // Convert % to 520 height
                const isSelected = activeCollector?.id === c.id;
                const pinColor =
                  c.status === 'in_transit' ? '#F59E0B' : c.status === 'active' ? '#10B981' : '#3B82F6';

                return (
                  <g
                    key={c.id}
                    transform={`translate(${posX}, ${posY})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setActiveCollector(c);
                      if (onInspectCollector) onInspectCollector(c);
                    }}
                  >
                    {/* Pulsing Beacon Ring */}
                    <circle
                      r={isSelected ? 18 : 12}
                      fill={pinColor}
                      fillOpacity={isSelected ? 0.35 : 0.2}
                      className="radar-pulse-ring"
                    />
                    {/* Pin Center */}
                    <circle
                      r={isSelected ? 8 : 6}
                      fill={pinColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      filter="url(#glow)"
                    />
                    {/* Collector Label Badge */}
                    <rect
                      x="-42"
                      y="-28"
                      width="84"
                      height="18"
                      rx="4"
                      fill="#0F172A"
                      stroke={isSelected ? pinColor : '#334155'}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    <text
                      x="0"
                      y="-15"
                      fontSize="9"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontWeight="bold"
                    >
                      {c.name.split(' ')[0]} · {c.total_weight_kg}kg
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* In-Map Telemetry HUD Floating Card */}
            {activeCollector && (
              <div className="radar-map-floating-card">
                <div className="card-top-row">
                  <div className="collector-avatar-pill">
                    <span className="avatar-icon">🧺</span>
                    <div>
                      <strong>{activeCollector.name}</strong>
                      <span className="code-badge">{activeCollector.code}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${activeCollector.status}`}>
                    {activeCollector.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <div className="card-metrics-row">
                  <div>
                    <span className="label">Ward / Area</span>
                    <strong className="value">{activeCollector.area}</strong>
                  </div>
                  <div>
                    <span className="label">Catalogued Scrap</span>
                    <strong className="value">{activeCollector.total_weight_kg} kg</strong>
                  </div>
                  <div>
                    <span className="label">Assigned Recycler</span>
                    <strong className="value highlight">{activeCollector.assigned_recycler || 'Unassigned'}</strong>
                  </div>
                </div>

                <div className="card-footer-row">
                  <span className="telemetry-ping">📡 {activeCollector.last_ping}</span>
                  <span className="battery-level">🔋 {activeCollector.battery_level}% Battery</span>
                  {onOpenLiveRoute && (
                    <button
                      type="button"
                      className="action-btn-sm"
                      onClick={() => onOpenLiveRoute(activeCollector.id)}
                    >
                      Track Route →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Collector Roster & Ward Density Breakdown */}
        <div className="radar-sidebar-panel">
          <div className="panel-header">
            <h3>Registered Informal Pickers ({filteredCollectors.length})</h3>
            <span className="live-count-badge">Active Mesh</span>
          </div>

          <div className="collector-cards-scroll">
            {filteredCollectors.map((c) => {
              const isSelected = activeCollector?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`collector-radar-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveCollector(c)}
                >
                  <div className="card-header">
                    <div className="title-group">
                      <span className="avatar">🧺</span>
                      <div>
                        <h4>{c.name}</h4>
                        <small>{c.code}</small>
                      </div>
                    </div>
                    <span className={`status-tag ${c.status}`}>
                      {c.status === 'in_transit' ? '🚚 In Transit' : c.status === 'active' ? '🟢 Active' : '⚪ Idle'}
                    </span>
                  </div>

                  <p className="area-text">
                    📍 {c.area}, {c.city}
                  </p>

                  <div className="stats-row">
                    <span>
                      <strong>{c.active_lots_count}</strong> Active Lots
                    </span>
                    <span>
                      <strong>{c.total_weight_kg} kg</strong> Scrap
                    </span>
                    <span>
                      <strong>{c.battery_level}%</strong> Battery
                    </span>
                  </div>

                  <div className="card-actions">
                    <a href={`tel:${c.phone}`} className="phone-link">
                      📞 {c.phone}
                    </a>
                    <button
                      type="button"
                      className="inspect-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCollector(c);
                        if (onInspectCollector) onInspectCollector(c);
                      }}
                    >
                      Inspect Depot ⌕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Ward Density Breakdown */}
          <div className="ward-density-box">
            <h4>Ward-Wise E-Waste Recovery Density</h4>
            <div className="density-item">
              <div className="density-labels">
                <span>Bhopal · Karond Scrap Mandi (Ward 14)</span>
                <strong>34.5 kg · 32%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill green" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div className="density-item">
              <div className="density-labels">
                <span>Pune · Bhosari MIDC (Ward 22)</span>
                <strong>28.0 kg · 26%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill blue" style={{ width: '26%' }}></div>
              </div>
            </div>

            <div className="density-item">
              <div className="density-labels">
                <span>Mumbai · Dharavi 13th Compound</span>
                <strong>62.4 kg · 58%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill purple" style={{ width: '58%' }}></div>
              </div>
            </div>

            <div className="density-item">
              <div className="density-labels">
                <span>Delhi · Mayapuri Metal Market</span>
                <strong>15.2 kg · 14%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill orange" style={{ width: '14%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
