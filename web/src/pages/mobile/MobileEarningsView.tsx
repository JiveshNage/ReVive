import React from 'react';
import { Lang, UserProfile, I18N } from '../../types';

export interface MobileEarningsViewProps {
  currentLang: Lang;
  currentUser: UserProfile | null;
  onNavigateScan: () => void;
}

export const MobileEarningsView: React.FC<MobileEarningsViewProps> = ({
  currentLang,
  currentUser,
  onNavigateScan,
}) => {
  return (
    <div className="mobile-view-container">
      <div className="mobile-page-title-row">
        <div>
          <h2>💰 {currentLang === 'hi' ? 'कमाई और नकद लेज़र' : 'Earnings & Cash Ledger'}</h2>
          <p>{currentLang === 'hi' ? 'नकद और यूपीआई भुगतान का संपूर्ण डिजिटल खाता' : 'Transparent digital ledger for cash and UPI payouts'}</p>
        </div>
      </div>

      {/* Hero Earnings Card */}
      <div className="mobile-earnings-hero-card">
        <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
          {currentLang === 'hi' ? 'कुल जीवनकाल कमाई (Lifetime Revenue)' : 'Lifetime Revenue'}
        </span>
        <div style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff', margin: '4px 0 12px', lineHeight: 1 }}>
          ₹ 18,450
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#a7f3d0' }}>💵 {currentLang === 'hi' ? 'नकद मिला' : 'Cash Received'}</div>
            <strong style={{ fontSize: '18px', color: '#ffffff' }}>₹ 11,200</strong>
            <small style={{ display: 'block', fontSize: '10px', color: '#d1fae5' }}>60.7% Volume</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#a7f3d0' }}>📱 {currentLang === 'hi' ? 'UPI बैंक जमा' : 'UPI Transfer'}</div>
            <strong style={{ fontSize: '18px', color: '#ffffff' }}>₹ 7,250</strong>
            <small style={{ display: 'block', fontSize: '10px', color: '#d1fae5' }}>39.3% Volume</small>
          </div>
        </div>
      </div>

      {/* Monthly Target Progress */}
      <div className="mobile-target-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <strong style={{ fontSize: '14px', color: '#0c3b2d' }}>
            {currentLang === 'hi' ? 'सितंबर माह का लक्ष्य' : 'September Target'}
          </strong>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>74% पूरा</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: '74%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '5px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
          <span>₹18,450 कबाड़ बेचा</span>
          <span>लक्ष्य: ₹25,000</span>
        </div>
      </div>

      {/* Recent Payout Transactions */}
      <h3 style={{ margin: '20px 0 10px', fontSize: '17px', color: '#0c3b2d' }}>
        {currentLang === 'hi' ? 'हाल के भुगतान रसीदें' : 'Recent Payout Records'}
      </h3>

      <div className="mobile-cards-list">
        {[
          { id: 'PAY-2026-081', lot: 'REV-LOT-104', mat: 'Printed Circuit Boards (12.4 kg)', amt: 2294, mode: 'CASH', date: '08 Sep 2026', rec: 'EcoCycle Solutions' },
          { id: 'PAY-2026-080', lot: 'REV-LOT-103', mat: 'Copper Wire Bundle (18.0 kg)', amt: 1980, mode: 'UPI', date: '06 Sep 2026', rec: 'GreenLoop Recyclers' },
          { id: 'PAY-2026-079', lot: 'REV-LOT-102', mat: 'Lithium Battery Cells (8.5 kg)', amt: 552, mode: 'CASH', date: '04 Sep 2026', rec: 'EcoCycle Solutions' },
        ].map((p) => (
          <div className="mobile-rate-row-card" key={p.id}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{p.id} · {p.date}</span>
              <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0c3b2d' }}>{p.mat}</h4>
              <small style={{ color: '#059669' }}>Facility: {p.rec}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '17px', color: '#047857' }}>+ ₹ {p.amt}</strong>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: p.mode === 'CASH' ? '#fef3c7' : '#dbeafe', color: p.mode === 'CASH' ? '#92400e' : '#1e40af' }}>
                  {p.mode}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
