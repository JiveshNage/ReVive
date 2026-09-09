import React from 'react';
import {
  Lang,
  I18N,
  DemoWorkflowResult,
  AdminMetrics,
  AdminAnomaly,
  Lot,
  Offer,
  Recycler,
  Material,
} from '../../types';
import { AdminKpis } from './AdminKpis';
import { AdminRecyclers } from './AdminRecyclers';
import { AdminAnomalies } from './AdminAnomalies';
import { AdminLots } from './AdminLots';

export interface AdminPortalProps {
  currentLang: Lang;
  demoRunning: boolean;
  triggerSihDemo: () => Promise<void>;
  demoResult: DemoWorkflowResult | null;
  openPassport: (lotId: number | string) => void;
  adminMetrics: AdminMetrics | null;
  lots: Lot[];
  offers: Offer[];
  verifiedRecyclerCount: number;
  recyclers: Recycler[];
  adminTab: 'kpis' | 'recyclers' | 'anomalies' | 'lots';
  setAdminTab: (tab: 'kpis' | 'recyclers' | 'anomalies' | 'lots') => void;
  adminAnomalies: AdminAnomaly[];
  resolveAnomaly: (id: string) => Promise<void>;
  verificationView: 'all' | 'pending';
  setVerificationView: (view: 'all' | 'pending') => void;
  pendingVerificationCount: number;
  filteredRecyclers: Recycler[];
  toggleRecyclerVerification: (id: number) => Promise<void>;
  materials: Material[];
  getStatusLabel: (status: string) => string;
  setTraceabilityLotId: (lotId: number) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentLang,
  demoRunning,
  triggerSihDemo,
  demoResult,
  openPassport,
  adminMetrics,
  lots,
  offers,
  verifiedRecyclerCount,
  recyclers,
  adminTab,
  setAdminTab,
  adminAnomalies,
  resolveAnomaly,
  verificationView,
  setVerificationView,
  pendingVerificationCount,
  filteredRecyclers,
  toggleRecyclerVerification,
  materials,
  getStatusLabel,
  setTraceabilityLotId,
}) => {
  return (
    <section className="admin-dashboard">
      <div className="admin-hero">
        <div className="admin-hero-text">
          <p className="eyebrow">Platform Governance & Statutory CPCB Oversight</p>
          <h1>{I18N[currentLang].adminDashboardTitle}</h1>
          <p>{I18N[currentLang].adminDashboardSubtitle}</p>
        </div>
      </div>

      {/* Top 5 Key National Environmental & Financial Metrics */}
      <section className="stats-grid admin-stats-grid">
        <div className="stat-card tint-green" onClick={() => setAdminTab('kpis')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">⚖</span>
          <div>
            <strong>
              {adminMetrics
                ? `${adminMetrics.total_weight_kg} kg`
                : `${lots.reduce((acc, l) => acc + l.quantity_kg, 0).toFixed(1)} kg`}
            </strong>
            <span>Total E-Waste Diverted</span>
            <small>Formalized recovery volume</small>
          </div>
        </div>

        <div className="stat-card tint-yellow">
          <span className="stat-symbol">₹</span>
          <div>
            <strong>
              {adminMetrics
                ? `₹ ${adminMetrics.total_turnover_inr.toLocaleString('en-IN')}`
                : `₹ ${offers.filter((o) => o.status === 'accepted').reduce((acc, o) => acc + o.offer_price, 0).toLocaleString('en-IN')}`}
            </strong>
            <span>Platform Turnover</span>
            <small>Direct to informal collectors</small>
          </div>
        </div>

        <div className="stat-card tint-blue">
          <span className="stat-symbol">🌱</span>
          <div>
            <strong>
              {adminMetrics
                ? `${adminMetrics.co2_saved_kg} kg`
                : `${(lots.reduce((acc, l) => acc + l.quantity_kg, 0) * 1.44).toFixed(1)} kg`}
            </strong>
            <span>CO₂ Emissions Abated</span>
            <small>1.44 kg CO₂ per kg diverted</small>
          </div>
        </div>

        <div className="stat-card tint-purple">
          <span className="stat-symbol">🛡</span>
          <div>
            <strong>
              {adminMetrics
                ? `${adminMetrics.toxic_metals_diverted_kg} kg`
                : `${(lots.reduce((acc, l) => acc + l.quantity_kg, 0) * 0.12).toFixed(1)} kg`}
            </strong>
            <span>Toxic Metals Isolated</span>
            <small>Lead, Cadmium, Mercury safely captured</small>
          </div>
        </div>

        <div className="stat-card tint-orange" onClick={() => setAdminTab('recyclers')} style={{ cursor: 'pointer' }}>
          <span className="stat-symbol">✓</span>
          <div>
            <strong>
              {adminMetrics
                ? `${Math.round(adminMetrics.recycler_verification_ratio * 100)}%`
                : `${Math.round((verifiedRecyclerCount / Math.max(1, recyclers.length)) * 100)}%`}
            </strong>
            <span>Recycler Compliance</span>
            <small>{verifiedRecyclerCount} of {recyclers.length} authorized</small>
          </div>
        </div>
      </section>

      {/* Subpage View Switching */}
      {adminTab === 'kpis' && (
        <AdminKpis
          currentLang={currentLang}
          demoRunning={demoRunning}
          triggerSihDemo={triggerSihDemo}
          demoResult={demoResult}
          openPassport={openPassport}
          lots={lots}
          adminAnomalies={adminAnomalies}
        />
      )}

      {adminTab === 'recyclers' && (
        <AdminRecyclers
          recyclers={recyclers}
          verificationView={verificationView}
          setVerificationView={setVerificationView}
          pendingVerificationCount={pendingVerificationCount}
          filteredRecyclers={filteredRecyclers}
          toggleRecyclerVerification={toggleRecyclerVerification}
        />
      )}

      {adminTab === 'anomalies' && (
        <AdminAnomalies
          adminAnomalies={adminAnomalies}
          resolveAnomaly={resolveAnomaly}
          openPassport={openPassport}
        />
      )}

      {adminTab === 'lots' && (
        <AdminLots
          lots={lots}
          materials={materials}
          offers={offers}
          getStatusLabel={getStatusLabel}
          openPassport={openPassport}
          setTraceabilityLotId={setTraceabilityLotId}
        />
      )}
    </section>
  );
};
