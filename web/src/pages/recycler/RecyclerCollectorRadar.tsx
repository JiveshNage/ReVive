import React, { useState } from 'react';
import { CollectorLocation, Lot, UserProfile } from '../../types';

export interface RecyclerCollectorRadarProps {
  currentUser: UserProfile | null;
  collectors: CollectorLocation[];
  lots: Lot[];
  onDispatchVehicle?: (collectorId: number, lotId: number) => void;
  onOpenScaleTerminal?: (lotId: number) => void;
}

export const RecyclerCollectorRadar: React.FC<RecyclerCollectorRadarProps> = ({
  currentUser,
  collectors,
  lots,
  onDispatchVehicle,
  onOpenScaleTerminal,
}) => {
  const [activeRadiusKm, setActiveRadiusKm] = useState<number>(25);
  const [selectedCollector, setSelectedCollector] = useState<CollectorLocation>(collectors[0] || null);

  const recyclerFacilityName = currentUser?.company_name || 'EcoCycle Pune Solutions Pvt Ltd';
  const recyclerLocation = currentUser?.location || 'Bhosari MIDC, Pune';

  return (
    <div className="recycler-radar-wrapper">
      {/* Top Banner */}
      <div className="recycler-radar-header">
        <div>
          <span className="badge-recycler-hub">LOGISTICS DISPATCH & INCOMING SCRAP RADAR</span>
          <h2>Informal Collector Mesh & Zero-Emission EV Fleet Dispatch</h2>
          <p>
            Locate registered informal kabadiwalas within your {activeRadiusKm} km service radius, review incoming lots, and coordinate certified digital scale pickups.
          </p>
        </div>

        <div className="radius-selector-group">
          <label>Service Radius:</label>
          <div className="radius-pills">
            {[10, 25, 50].map((km) => (
              <button
                key={km}
                type="button"
                className={activeRadiusKm === km ? 'active' : ''}
                onClick={() => setActiveRadiusKm(km)}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Fleet & Logistics Stats */}
      <div className="fleet-stats-grid">
        <div className="fleet-stat-card">
          <span className="icon">📍</span>
          <div>
            <strong>{collectors.length}</strong>
            <span>Active Collectors</span>
            <small>Within {activeRadiusKm} km radius</small>
          </div>
        </div>

        <div className="fleet-stat-card">
          <span className="icon">🚚</span>
          <div>
            <strong>2 Vehicles Active</strong>
            <span>Tata Ace EV Fleet</span>
            <small>Zero-Emission Pickups</small>
          </div>
        </div>

        <div className="fleet-stat-card">
          <span className="icon">⚖</span>
          <div>
            <strong>
              {collectors.reduce((acc, c) => acc + c.total_weight_kg, 0).toFixed(1)} kg
            </strong>
            <span>Available Scrap</span>
            <small>Awaiting procurement</small>
          </div>
        </div>

        <div className="fleet-stat-card highlight">
          <span className="icon">⏱</span>
          <div>
            <strong>14 Mins</strong>
            <span>Nearest Pickup ETA</span>
            <small>Vehicle MP 04 GA 8821</small>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Map Canvas + Logistics Dispatch Cards */}
      <div className="recycler-radar-main-layout">
        {/* Left: Vector Radar Canvas */}
        <div className="radar-canvas-panel">
          <div className="canvas-header-toolbar">
            <span className="status-pulse">
              <span className="dot pulse-green"></span> FACILITY HUB: {recyclerFacilityName}
            </span>
            <span className="geo-badge">⌖ {recyclerLocation} (25 km Coverage)</span>
          </div>

          <div className="canvas-svg-box">
            <svg viewBox="0 0 700 440" className="recycler-svg-map">
              <defs>
                <radialGradient id="recRadarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#10B981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="evRouteLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect width="700" height="440" fill="#0F172A" rx="16" />

              {/* Grid concentric rings for radius */}
              <circle cx="350" cy="220" r="190" fill="none" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="350" cy="220" r="130" fill="none" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="350" cy="220" r="70" fill="none" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="350" cy="220" r="190" fill="url(#recRadarSweep)" />

              {/* Distance Labels */}
              <text x="355" y="155" fill="#475569" fontSize="10">10 km</text>
              <text x="355" y="95" fill="#475569" fontSize="10">20 km</text>
              <text x="355" y="35" fill="#475569" fontSize="10">{activeRadiusKm} km</text>

              {/* Facility Hub Center Marker */}
              <g transform="translate(350, 220)">
                <circle r="22" fill="#059669" fillOpacity="0.25" />
                <circle r="12" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="4" fontSize="12" textAnchor="middle" fill="#FFFFFF">🏭</text>
                <rect x="-60" y="18" width="120" height="18" rx="4" fill="#1E293B" stroke="#059669" />
                <text x="0" y="30" fontSize="9" textAnchor="middle" fill="#34D399" fontWeight="bold">
                  Your Facility Depot
                </text>
              </g>

              {/* Live EV Route to Collector */}
              <path
                d="M 350 220 Q 280 180 230 140"
                fill="none"
                stroke="url(#evRouteLine)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
              />

              {/* Dispatched Vehicle Marker */}
              <g transform="translate(290, 180)">
                <circle r="12" fill="#F59E0B" />
                <text x="0" y="4" fontSize="11" textAnchor="middle" fill="#000">🚚</text>
                <rect x="-45" y="-24" width="90" height="16" rx="4" fill="#0F172A" stroke="#F59E0B" />
                <text x="0" y="-12" fontSize="8.5" textAnchor="middle" fill="#FDE68A" fontWeight="bold">
                  Tata Ace EV · 14m
                </text>
              </g>

              {/* Collector Markers */}
              {collectors.map((c, i) => {
                // Layout positions around the center
                const angles = [0.8, 2.3, 3.8, 5.1, 1.4];
                const angle = angles[i % angles.length];
                const dist = 60 + ((i * 35) % 110);
                const posX = 350 + Math.cos(angle) * dist;
                const posY = 220 + Math.sin(angle) * dist;
                const isSelected = selectedCollector?.id === c.id;

                return (
                  <g
                    key={c.id}
                    transform={`translate(${posX}, ${posY})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCollector(c)}
                  >
                    <circle
                      r={isSelected ? 16 : 10}
                      fill={c.status === 'in_transit' ? '#F59E0B' : '#10B981'}
                      fillOpacity={0.3}
                    />
                    <circle
                      r={isSelected ? 8 : 6}
                      fill={c.status === 'in_transit' ? '#F59E0B' : '#10B981'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="-38"
                      y="-22"
                      width="76"
                      height="16"
                      rx="4"
                      fill="#1E293B"
                      stroke={isSelected ? '#34D399' : '#334155'}
                    />
                    <text x="0" y="-10" fontSize="8.5" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">
                      {c.name.split(' ')[0]} ({c.total_weight_kg}kg)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Radar Legend Footer */}
            <div className="radar-legend-strip">
              <span>🏭 Your Certified Processing Facility</span>
              <span>🟢 Available Collector Yard</span>
              <span>🚚 EV Pickup Dispatched (In Transit)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Collector Dispatch & Action Card */}
        <div className="collector-dispatch-panel">
          {selectedCollector ? (
            <div className="dispatch-detail-card">
              <div className="card-top-bar">
                <div className="collector-badge">
                  <span className="icon">🧺</span>
                  <div>
                    <h3>{selectedCollector.name}</h3>
                    <small>{selectedCollector.code} · CPCB Informal Partner</small>
                  </div>
                </div>
                <span className={`status-pill ${selectedCollector.status}`}>
                  {selectedCollector.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div className="location-info-box">
                <span className="location-title">📍 Registered Scrap Depot</span>
                <strong>{selectedCollector.area}, {selectedCollector.city}</strong>
                <small>GPS: {selectedCollector.coordinates.lat.toFixed(4)}°N, {selectedCollector.coordinates.lng.toFixed(4)}°E (±3m)</small>
              </div>

              <div className="scrap-volume-box">
                <div className="volume-metric">
                  <span className="label">Active Catalogued Scrap</span>
                  <strong className="value">{selectedCollector.total_weight_kg} kg</strong>
                </div>
                <div className="volume-metric">
                  <span className="label">Registered Lots</span>
                  <strong className="value">{selectedCollector.active_lots_count} Lots</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="dispatch-actions-group">
                <button
                  type="button"
                  className="dispatch-ev-btn"
                  onClick={() => {
                    if (onDispatchVehicle) {
                      onDispatchVehicle(selectedCollector.id, 102);
                    } else {
                      alert(`✓ Zero-Emission EV pickup vehicle dispatched to ${selectedCollector.name} at ${selectedCollector.area}. Driver Sunil Kumar (MP 04 GA 8821) notified.`);
                    }
                  }}
                >
                  ⚡ Dispatch Zero-Emission EV Pickup →
                </button>

                <button
                  type="button"
                  className="open-scale-btn"
                  onClick={() => {
                    if (onOpenScaleTerminal) {
                      onOpenScaleTerminal(102);
                    } else {
                      alert('Redirecting to Certified Digital Scale Terminal for weigh-in verification...');
                    }
                  }}
                >
                  ⚖️ Open Digital Scale Handover Console
                </button>

                <a href={`tel:${selectedCollector.phone}`} className="call-collector-btn">
                  📞 Call Collector ({selectedCollector.phone})
                </a>
              </div>
            </div>
          ) : (
            <div className="empty-selection-card">
              <p>Select any collector pin on the radar map to view details and dispatch pickup vehicles.</p>
            </div>
          )}

          {/* Incoming Scrap Lots from Assigned Collectors */}
          <div className="incoming-lots-box">
            <h4>Incoming Scrap Lots Assigned to Your Facility</h4>
            <div className="mini-lot-item">
              <div className="lot-info">
                <strong>Lot #102 · Printed Circuit Boards</strong>
                <small>From: Ram Yadav (Karond Mandi, Bhopal) · 5.4 kg</small>
              </div>
              <span className="rate-badge">₹ 403 / kg</span>
            </div>

            <div className="mini-lot-item">
              <div className="lot-info">
                <strong>Lot #103 · High-Grade Mobile Phones</strong>
                <small>From: Santosh Shinde (Bhosari Gaonthan) · 12.1 kg</small>
              </div>
              <span className="rate-badge">₹ 210 / kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
