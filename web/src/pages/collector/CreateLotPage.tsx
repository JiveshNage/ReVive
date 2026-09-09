import React, { useState, useEffect, useMemo } from 'react';
import { Lang, Material, RecyclerMatch, I18N, API_BASE_URL } from '../../types';

export interface CreateLotPageProps {
  currentLang: Lang;
  materials: Material[];
  aiImageFile: File | null;
  setAiImageFile: (file: File | null) => void;
  aiLoading: boolean;
  aiResult: {
    category: string;
    confidence: number;
    confidence_tier?: string;
  } | null;
  onPredictMaterialWithAi: () => void;
  newLotMaterialId: number;
  setNewLotMaterialId: (id: number) => void;
  newLotQuantity: string;
  setNewLotQuantity: (q: string) => void;
  selectedScrapCondition: 'good' | 'mixed' | 'damaged' | 'unknown';
  setSelectedScrapCondition: (c: 'good' | 'mixed' | 'damaged' | 'unknown') => void;
  lotSuccessMsg: string;
  onCreateLot: () => void;
  onBack: () => void;
  onNavigateTransactions: () => void;
}

const getMaterialIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('pcb') || n.includes('circuit') || n.includes('motherboard')) return '⚡';
  if (n.includes('battery') || n.includes('cell')) return '🔋';
  if (n.includes('cable') || n.includes('wire') || n.includes('copper')) return '🔌';
  if (n.includes('mobile') || n.includes('phone') || n.includes('gadget')) return '📱';
  if (n.includes('display') || n.includes('crt') || n.includes('lcd') || n.includes('screen')) return '📺';
  if (n.includes('metal') || n.includes('iron') || n.includes('aluminum')) return '🔩';
  if (n.includes('plastic') || n.includes('pvc')) return '♻️';
  return '📦';
};

export const CreateLotPage: React.FC<CreateLotPageProps> = ({
  currentLang,
  materials,
  aiImageFile,
  setAiImageFile,
  aiLoading,
  aiResult,
  onPredictMaterialWithAi,
  newLotMaterialId,
  setNewLotMaterialId,
  newLotQuantity,
  setNewLotQuantity,
  selectedScrapCondition,
  setSelectedScrapCondition,
  lotSuccessMsg,
  onCreateLot,
  onBack,
  onNavigateTransactions,
}) => {
  const [matchedBuyers, setMatchedBuyers] = useState<RecyclerMatch[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);

  // Local object URL for instant image preview
  const imagePreviewUrl = useMemo(() => {
    if (!aiImageFile) return null;
    return URL.createObjectURL(aiImageFile);
  }, [aiImageFile]);

  const mat = materials.find((m) => m.id === newLotMaterialId) || materials[0];

  useEffect(() => {
    let isMounted = true;
    const catName = mat?.name || 'PCB';
    fetch(`${API_BASE_URL}/api/recyclers/match?category=${encodeURIComponent(catName)}&location=Bhopal&limit=3`)
      .then((res) => res.json())
      .then((data: RecyclerMatch[]) => {
        if (isMounted && Array.isArray(data)) {
          setMatchedBuyers(data);
          if (data.length > 0 && !selectedBuyerId) {
            setSelectedBuyerId(data[0].recycler_id);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setMatchedBuyers([
            {
              recycler_id: 1,
              recycler_name: 'EcoCycle Central Hub Solutions',
              location: 'Bhopal',
              accepted_materials: 'PCB, Mixed Metal, Battery, Cable',
              authorization_status: 'Authorized',
              contact: '+91 98137 07364',
              rate: 'PCB: ₹450/kg | Metal: ₹95/kg',
              pickup_availability: 'Yes',
              service_area: 'Bhopal Region',
              score: 98,
            },
            {
              recycler_id: 2,
              recycler_name: 'CleanEarth Recyclers Ltd',
              location: 'Bhopal',
              accepted_materials: 'Battery, Lead-Acid, Cable',
              authorization_status: 'Authorized',
              contact: '+91 98765 40002',
              rate: 'Battery: ₹70/kg | Cable: ₹110/kg',
              pickup_availability: 'Yes',
              service_area: 'Central MP',
              score: 92,
            },
          ]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [newLotMaterialId, mat]);

  const baseRate = mat?.name?.toLowerCase().includes('pcb')
    ? 185
    : mat?.name?.toLowerCase().includes('cable')
    ? 110
    : mat?.name?.toLowerCase().includes('battery')
    ? 65
    : 95;

  const multiplier =
    selectedScrapCondition === 'good'
      ? 1.0
      : selectedScrapCondition === 'mixed'
      ? 0.9
      : selectedScrapCondition === 'damaged'
      ? 0.75
      : 0.85;

  const qty = Math.max(0.1, Number(newLotQuantity) || 5);
  const totalVal = Math.round(qty * baseRate * multiplier);
  const co2 = (qty * 1.8).toFixed(1);
  const toxic = (qty * 0.12).toFixed(2);

  return (
    <div className="multipage-view" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page Header */}
      <div className="page-header-row" style={{ alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#064e3b', fontWeight: 800 }}>
              {I18N[currentLang].studioTitle}
            </h1>
            <span
              style={{
                fontSize: '11px',
                background: '#ecfdf5',
                color: '#047857',
                padding: '3px 10px',
                borderRadius: '999px',
                fontWeight: 700,
                border: '1px solid #a7f3d0',
              }}
            >
              CPCB Certified Studio
            </span>
          </div>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
            {I18N[currentLang].studioSubtitle}
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
        >
          ← {I18N[currentLang].backBtn}
        </button>
      </div>

      {/* Success Notification */}
      {lotSuccessMsg && (
        <div
          style={{
            padding: '16px 20px',
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: '14px',
            color: '#065f46',
            fontWeight: 700,
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <span>{lotSuccessMsg}</span>
          </div>
          <button
            className="mini-action"
            style={{ background: '#059669', color: '#fff', padding: '8px 16px', borderRadius: '8px' }}
            onClick={onNavigateTransactions}
          >
            {currentLang === 'hi' ? 'लेनदेन देखें →' : 'View In Ledger →'}
          </button>
        </div>
      )}

      {/* Main Studio Two-Column Grid */}
      <div className="lot-studio-layout">
        {/* Left Column: Scrap Details & AI Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: AI Scrap Photo Inspector */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📸</span>
                <span>{I18N[currentLang].uploadPhotoTitle}</span>
              </label>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>MobileNet AI v3</span>
            </div>

            <div
              className="photo-dropzone"
              onClick={() => document.getElementById('studio-file-input')?.click()}
            >
              {imagePreviewUrl ? (
                <div>
                  <img src={imagePreviewUrl} alt="Scrap Preview" className="photo-preview-thumb" />
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px' }}>
                    📷 {aiImageFile?.name}
                  </div>
                  <small style={{ color: '#059669', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                    {currentLang === 'hi' ? 'फोटो बदलने के लिए क्लिक करें' : 'Click to change or retake photo'}
                  </small>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      fontSize: '22px',
                    }}
                  >
                    📷
                  </div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                    {currentLang === 'hi' ? 'स्क्रैप की फोटो खींचें या अपलोड करें' : 'Photograph Scrap or Upload Image'}
                  </strong>
                  <small style={{ display: 'block', color: '#64748b', fontSize: '12px' }}>
                    JPEG, PNG supported. Neural vision auto-classifies PCB, batteries, and cables.
                  </small>
                </div>
              )}
            </div>

            <input
              id="studio-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setAiImageFile(file);
              }}
            />

            {/* AI Action Strip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="ai-scan-pulse-btn"
                disabled={!aiImageFile || aiLoading}
                onClick={onPredictMaterialWithAi}
              >
                <span>⚡</span>
                <span>{aiLoading ? I18N[currentLang].scanningAi : currentLang === 'hi' ? 'एआई से पहचानें' : 'Scan with Neural AI'}</span>
              </button>

              {aiResult ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #86efac',
                    padding: '8px 14px',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#065f46', display: 'block' }}>
                      {aiResult.category}
                    </strong>
                    <small style={{ color: '#047857', fontWeight: 600, fontSize: '11px' }}>
                      {(aiResult.confidence * 100).toFixed(1)}% Confidence
                    </small>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {currentLang === 'hi' ? 'फोटो अपलोड करके एआई स्कैन दबाएं' : 'Upload photo to auto-detect category'}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Material Category Selection */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                1. {currentLang === 'hi' ? 'सामग्री श्रेणी चुनें' : 'Select Material Category'}
              </label>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                {mat?.name} (₹{baseRate}/kg)
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              {currentLang === 'hi' ? 'अपनी सामग्री का चयन करें जिससे सटीक बाज़ार भाव मिल सके।' : 'Choose the matching e-waste material to activate official CPCB rates.'}
            </p>

            <div className="category-chip-grid">
              {materials.map((m) => {
                const isSelected = newLotMaterialId === m.id;
                const icon = getMaterialIcon(m.name);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`category-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setNewLotMaterialId(m.id)}
                  >
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                    <span>{m.name}</span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: '#059669',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: '999px',
                        }}
                      >
                        ✓ Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Approximate Weight */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <label style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              2. {I18N[currentLang].approxWeightLabel}
            </label>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>
              {currentLang === 'hi' ? 'अनुमानित वजन दर्ज करें। अंतिम वजन डिजिटल वेइंग कांटे पर होगा।' : 'Enter estimated weight. Verified on certified scale during handover.'}
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '160px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={newLotQuantity}
                  onChange={(e) => setNewLotQuantity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #cbd5e1',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: '#64748b',
                    fontSize: '14px',
                  }}
                >
                  kg
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['+1', '+5', '+10', '+25', '+50'].map((step) => (
                  <button
                    key={step}
                    type="button"
                    className="quick-helper-btn"
                    onClick={() =>
                      setNewLotQuantity(
                        String(Math.max(0.5, Number(newLotQuantity || 0) + Number(step)))
                      )
                    }
                  >
                    {step} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Scrap Condition */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                3. {I18N[currentLang].conditionLabel}
              </label>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Fair Value Multiplier: {Math.round(multiplier * 100)}%
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              {currentLang === 'hi' ? 'स्क्रैप की वर्तमान स्थिति चुनें।' : 'Physical grade determines the benchmark recovery multiplier.'}
            </p>

            <div className="condition-selector-group">
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'good' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('good')}
              >
                <span style={{ fontSize: '18px' }}>🟢</span>
                <strong>{I18N[currentLang].condGood}</strong>
                <small style={{ color: '#059669', fontWeight: 700 }}>100% Value</small>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'mixed' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('mixed')}
              >
                <span style={{ fontSize: '18px' }}>🟡</span>
                <strong>{I18N[currentLang].condMixed}</strong>
                <small style={{ color: '#d97706', fontWeight: 700 }}>90% Value</small>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'damaged' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('damaged')}
              >
                <span style={{ fontSize: '18px' }}>🟠</span>
                <strong>{I18N[currentLang].condDamaged}</strong>
                <small style={{ color: '#ea580c', fontWeight: 700 }}>75% Value</small>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'unknown' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('unknown')}
              >
                <span style={{ fontSize: '18px' }}>⚪</span>
                <strong>{I18N[currentLang].condUnknown}</strong>
                <small style={{ color: '#64748b', fontWeight: 700 }}>85% Value</small>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Valuation, Matched Recycler & ESG Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          {/* Hero Valuation Banner */}
          <div className="estimate-preview-banner">
            <div>
              <span
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#a7f3d0',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {I18N[currentLang].estimatedValuationLabel}
              </span>
              <strong>₹ {totalVal.toLocaleString('en-IN')}</strong>
              <div style={{ fontSize: '13px', color: '#d1fae5', marginTop: '4px', fontWeight: 600 }}>
                ₹ {Math.round(baseRate * multiplier)} / kg · {qty} kg declared
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  marginTop: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                <span>🛡️</span>
                <span>Guaranteed Floor Price</span>
              </div>
            </div>
            <span style={{ fontSize: '46px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }}>💰</span>
          </div>

          {/* AI Matched Recycler Buyers */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🤝</span>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {currentLang === 'hi' ? 'अनुशंसित अधिकृत खरीदार' : 'Recommended CPCB Buyers'}
                </h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  background: '#ecfdf5',
                  color: '#047857',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  border: '1px solid #a7f3d0',
                }}
              >
                Top AI Match
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matchedBuyers.map((b) => {
                const isSelected = selectedBuyerId === b.recycler_id;
                return (
                  <div
                    key={b.recycler_id}
                    onClick={() => setSelectedBuyerId(b.recycler_id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{b.recycler_name}</strong>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#047857',
                          background: '#d1fae5',
                          padding: '2px 6px',
                          borderRadius: '999px',
                        }}
                      >
                        ★ {b.score}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                      <span>📍 {b.location}</span>
                      <span>·</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {b.pickup_availability.toLowerCase() === 'yes' ? '🚚 Pickup Avail' : 'Drop-off'}
                      </span>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px dashed #86efac',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>✓</span>
                        <span>Preferred buyer pre-selected for lot handover</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ESG Environmental Impact */}
          <div
            className="studio-panel"
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>🌱</span>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {currentLang === 'hi' ? 'पर्यावरणीय प्रभाव क्रेडिट' : 'ESG & Environmental Credits'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <small style={{ color: '#166534', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                  {I18N[currentLang].co2Saved}
                </small>
                <strong style={{ fontSize: '18px', color: '#065f46', display: 'block', marginTop: '2px' }}>
                  {co2} kg
                </strong>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <small style={{ color: '#166534', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                  {I18N[currentLang].toxicDiverted}
                </small>
                <strong style={{ fontSize: '18px', color: '#065f46', display: 'block', marginTop: '2px' }}>
                  {toxic} kg
                </strong>
              </div>
            </div>

            <small style={{ display: 'block', color: '#64748b', fontSize: '11px', lineHeight: 1.4 }}>
              Certified under CPCB E-Waste Rules 2022. QR traceability passport generated upon handover.
            </small>
          </div>

          {/* Big Primary Submission Button */}
          <button
            type="button"
            className="wizard-btn-primary"
            onClick={onCreateLot}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
            }}
          >
            <span>🚀</span>
            <span>{I18N[currentLang].submitLotBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
