import React from 'react';
import { Lot, Material, Offer, Lang, I18N, ActivePage } from '../../types';
import { ExportButton } from '../../components/common/ExportButton';
import { downloadCSV, downloadXLSX, downloadElementAsJPG } from '../../utils/exportUtils';

interface TransactionsPageProps {
  currentLang: Lang;
  lots: Lot[];
  materials: Material[];
  offers: Offer[];
  txStatusFilter: string;
  setTxStatusFilter: (filter: string) => void;
  setActivePage: (page: ActivePage) => void;
  speakIndicText: (text: string, lang?: Lang) => void;
  setHandoverLotId: (id: number) => void;
  setHandoverFinalWeight: (wt: string) => void;
  setHandoverDialogOpen: (open: boolean) => void;
  completePayment: (lotId: number) => void;
  openPassport: (lotId: number) => void;
  setTraceabilityLotId: (lotId: number) => void;
  getStatusLabel: (status: string) => string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  currentLang,
  lots,
  materials,
  offers,
  txStatusFilter,
  setTxStatusFilter,
  setActivePage,
  speakIndicText,
  setHandoverLotId,
  setHandoverFinalWeight,
  setHandoverDialogOpen,
  completePayment,
  openPassport,
  setTraceabilityLotId,
  getStatusLabel,
}) => {
  const filteredLots = txStatusFilter === 'all' ? lots : lots.filter((l) => l.status === txStatusFilter);

  const transactionExportRows = filteredLots.map((l) => {
    const mat = materials.find((m) => m.id === l.material_id);
    const relOffer = [...offers].reverse().find((o) => o.lot_id === l.id);
    return [
      `REV-LOT-${l.id}`,
      mat?.name ?? 'E-Waste Material',
      `${l.quantity_kg} kg`,
      `₹ ${relOffer?.offer_price ?? l.estimated_value}`,
      getStatusLabel(l.status),
      l.created_at || 'Verified Record',
    ];
  });

  return (
    <div className="multipage-view" id="transactions-ledger-box">
      <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {I18N[currentLang].auditTrailTitle}
            <button
              type="button"
              className="tts-speaker-icon"
              onClick={() => speakIndicText(`${I18N[currentLang].auditTrailTitle}. ${I18N[currentLang].auditTrailSubtitle}`)}
              title={I18N[currentLang].audioAssistantBtn}
              aria-label="Listen audio narration"
            >
              🔊
            </button>
          </h1>
          <p>{I18N[currentLang].auditTrailSubtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ExportButton
            label={currentLang === 'hi' ? 'लेनदेन लेजर डाउनलोड' : 'Download Ledger'}
            onExportCSV={() =>
              downloadCSV(
                `ReVive_Transactions_${txStatusFilter}`,
                ['Lot Reference', 'Material', 'Weight', 'Settlement Value', 'Status', 'Record Date'],
                transactionExportRows
              )
            }
            onExportXLSX={() =>
              downloadXLSX(
                `ReVive_Transactions_${txStatusFilter}`,
                'Transactions_Ledger',
                ['Lot Reference', 'Material', 'Weight', 'Settlement Value', 'Status', 'Record Date'],
                transactionExportRows
              )
            }
            onExportJPG={() =>
              downloadElementAsJPG(
                'transactions-ledger-box',
                `ReVive_Transactions_Ledger.jpg`,
                'ReVive E-Waste Transactions & Traceability Ledger'
              )
            }
          />
          <button className="primary-button" onClick={() => setActivePage('create_lot')}>
            + {I18N[currentLang].createLot}
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'created', 'offers', 'pickup', 'handed_over', 'payment_completed'].map((st) => (
          <button
            key={st}
            className={`city-filter-chip ${txStatusFilter === st ? 'active' : ''}`}
            onClick={() => setTxStatusFilter(st)}
          >
            {st === 'all' ? I18N[currentLang].allTransactions : getStatusLabel(st)}
          </button>
        ))}
      </div>

      <div className="trend-table-box">
        <table className="trend-table">
          <thead>
            <tr>
              <th>{I18N[currentLang].thLotRef}</th>
              <th>{I18N[currentLang].thMaterial}</th>
              <th>{I18N[currentLang].thWeight}</th>
              <th>{I18N[currentLang].thEstValue}</th>
              <th>{I18N[currentLang].thStatus}</th>
              <th>{I18N[currentLang].thActions}</th>
            </tr>
          </thead>
          <tbody>
            {(txStatusFilter === 'all' ? lots : lots.filter((l) => l.status === txStatusFilter)).map((l) => {
              const mat = materials.find((m) => m.id === l.material_id);
              const relOffer = [...offers].reverse().find((o) => o.lot_id === l.id);

              return (
                <tr key={l.id}>
                  <td><strong>REV-LOT-{l.id}</strong></td>
                  <td>{mat?.name ?? 'E-Waste Material'}</td>
                  <td>{l.quantity_kg} kg</td>
                  <td><strong>₹ {relOffer?.offer_price ?? l.estimated_value}</strong></td>
                  <td><span className={`offer-status ${l.status}`}>{getStatusLabel(l.status)}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {l.status === 'pickup' && (
                        <button
                          className="mini-action"
                          style={{ background: '#0284c7' }}
                          onClick={() => {
                            setHandoverLotId(l.id);
                            setHandoverFinalWeight(String(l.quantity_kg));
                            setHandoverDialogOpen(true);
                          }}
                        >
                          {I18N[currentLang].btnHandover}
                        </button>
                      )}
                      {(l.status === 'pickup' || l.status === 'handed_over') && (
                        <button className="mini-action" style={{ background: '#16a34a' }} onClick={() => completePayment(l.id)}>
                          {I18N[currentLang].btnMarkPaid}
                        </button>
                      )}
                      <button className="mini-action passport-btn" onClick={() => void openPassport(l.id)}>
                        {I18N[currentLang].btnPassportQr}
                      </button>
                      <button className="mini-action trace-btn" onClick={() => setTraceabilityLotId(l.id)}>
                        {I18N[currentLang].btnTrace}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
