import React, { useState } from 'react';
import { Lot, Material } from '../../types';

export interface RecyclerBrowseLotsProps {
  lots: Lot[];
  materials: Material[];
  getStatusLabel: (status: string) => string;
  onSendOffer: (lotId: number, estimatedValue: number) => void;
}

export const RecyclerBrowseLots: React.FC<RecyclerBrowseLotsProps> = ({
  lots,
  materials,
  getStatusLabel,
  onSendOffer,
}) => {
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLots = lots.filter((lot) => {
    const mat = materials.find((m) => m.id === lot.material_id);
    const matchesFilter =
      selectedMaterialFilter === 'all' ||
      mat?.category.toLowerCase() === selectedMaterialFilter.toLowerCase() ||
      mat?.name.toLowerCase().includes(selectedMaterialFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      String(lot.id).includes(searchQuery) ||
      mat?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(lot.collector_id).includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="recycler-subpage-container">
      <div className="subpage-header-row">
        <div>
          <h2>📦 Available E-Waste Lots</h2>
          <p>Verified e-waste lots catalogued by regional informal collectors awaiting recycler bids</p>
        </div>
        <div className="subpage-search-bar">
          <input
            type="text"
            placeholder="Search lot ID, material, collector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-input"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="category-chips-row">
        {['all', 'PCB', 'Battery', 'Display', 'Cable', 'Metal'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-chip ${selectedMaterialFilter === cat ? 'active' : ''}`}
            onClick={() => setSelectedMaterialFilter(cat)}
          >
            {cat === 'all' ? 'All Materials' : cat}
          </button>
        ))}
      </div>

      {/* Lots Grid */}
      {filteredLots.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📭</span>
          <h3>No Available Lots Found</h3>
          <p>No scrap lots match the current filter or search criteria.</p>
        </div>
      ) : (
        <div className="lots-cards-grid">
          {filteredLots.map((lot) => {
            const material = materials.find((m) => m.id === lot.material_id);
            const isClosed = lot.status === 'payment_completed' || lot.status === 'handed_over';

            return (
              <div className="enterprise-lot-card" key={lot.id}>
                <div className="lot-card-top">
                  <div className="lot-badge-group">
                    <span className="lot-id-chip">LOT #{lot.id}</span>
                    <span className={`status-pill ${lot.status}`}>{getStatusLabel(lot.status)}</span>
                  </div>
                  <strong className="lot-price">₹ {lot.estimated_value.toLocaleString('en-IN')}</strong>
                </div>

                <div className="lot-card-body">
                  <h4 className="lot-material-title">{material?.name || 'Uncategorized E-Waste'}</h4>
                  <div className="lot-meta-grid">
                    <div>
                      <span>Weight</span>
                      <strong>{lot.quantity_kg} kg</strong>
                    </div>
                    <div>
                      <span>Benchmark MSP</span>
                      <strong>₹ {Math.round(lot.estimated_value / Math.max(1, lot.quantity_kg))}/kg</strong>
                    </div>
                    <div>
                      <span>Collector</span>
                      <strong>ID #{lot.collector_id}</strong>
                    </div>
                    <div>
                      <span>Hazard Tier</span>
                      <strong style={{ color: material?.category === 'Battery' ? '#ef4444' : '#10b981' }}>
                        {material?.category === 'Battery' ? 'Hazardous' : 'Standard'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="lot-card-actions">
                  <button
                    type="button"
                    className="bid-action-btn"
                    disabled={isClosed}
                    onClick={() => onSendOffer(lot.id, lot.estimated_value)}
                  >
                    {isClosed ? 'Lot Handed Over' : '🏷️ Place Bid / Send Offer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
