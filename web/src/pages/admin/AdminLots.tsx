import React from 'react';
import { Lot, Material, Offer } from '../../types';
import { ExportButton } from '../../components/common/ExportButton';
import { downloadCSV, downloadXLSX, downloadElementAsJPG } from '../../utils/exportUtils';

export interface AdminLotsProps {
  lots: Lot[];
  materials: Material[];
  offers: Offer[];
  getStatusLabel: (status: string) => string;
  openPassport: (lotId: number | string) => void;
  setTraceabilityLotId: (lotId: number) => void;
}

export const AdminLots: React.FC<AdminLotsProps> = ({
  lots,
  materials,
  offers,
  getStatusLabel,
  openPassport,
  setTraceabilityLotId,
}) => {
  const adminLotsExportRows = lots.map((l) => {
    const mat = materials.find((m) => m.id === l.material_id);
    const relatedOffer = [...offers].reverse().find((o) => o.lot_id === l.id);
    return [
      `REV-LOT-${l.id}`,
      mat?.name ?? 'E-Waste',
      `${l.quantity_kg} kg`,
      `₹ ${(relatedOffer?.offer_price ?? l.estimated_value).toLocaleString('en-IN')}`,
      getStatusLabel(l.status),
      l.created_at || 'Recorded on Blockchain',
    ];
  });

  return (
    <div className="admin-subpage-container" id="admin-master-ledger-box">
      <div className="subpage-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>📋 Master Statutory E-Waste Ledger</h2>
          <p>National immutable traceability ledger recording material flow from informal waste pickers to recyclers</p>
        </div>
        <ExportButton
          label="Export Master Ledger"
          onExportCSV={() =>
            downloadCSV(
              'ReVive_Master_Statutory_Ledger',
              ['Lot Reference', 'Material Category', 'Quantity', 'Settlement Value', 'Lifecycle Status', 'Date Logged'],
              adminLotsExportRows
            )
          }
          onExportXLSX={() =>
            downloadXLSX(
              'ReVive_Master_Statutory_Ledger',
              'CPCB_Ledger',
              ['Lot Reference', 'Material Category', 'Quantity', 'Settlement Value', 'Lifecycle Status', 'Date Logged'],
              adminLotsExportRows
            )
          }
          onExportJPG={() =>
            downloadElementAsJPG(
              'admin-master-ledger-box',
              'ReVive_CPCB_Master_Ledger.jpg',
              'CPCB Master Statutory E-Waste Ledger'
            )
          }
        />
      </div>

      <div className="panel legacy-panel">
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Lot Reference</th>
                <th>Material Category</th>
                <th>Quantity</th>
                <th>Settlement Value</th>
                <th>Lifecycle Status</th>
                <th>Compliance & Audit Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => {
                const mat = materials.find((m) => m.id === l.material_id);
                const relatedOffer = [...offers].reverse().find((o) => o.lot_id === l.id);
                return (
                  <tr key={l.id}>
                    <td>
                      <code>REV-LOT-{l.id}</code>
                    </td>
                    <td>
                      <strong>{mat?.name ?? 'E-Waste'}</strong>
                    </td>
                    <td>{l.quantity_kg} kg</td>
                    <td>₹ {(relatedOffer?.offer_price ?? l.estimated_value).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`offer-status ${l.status}`}>{getStatusLabel(l.status)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="mini-action passport-btn"
                          onClick={() => void openPassport(l.id)}
                        >
                          📜 Passport & QR
                        </button>
                        <button
                          type="button"
                          className="mini-action trace-btn"
                          onClick={() => setTraceabilityLotId(l.id)}
                        >
                          🔍 Trace Journey
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
    </div>
  );
};
