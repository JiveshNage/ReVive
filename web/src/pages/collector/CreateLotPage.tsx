import React from 'react';
import { Lang, Material, I18N } from '../../types';

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
  const mat = materials.find((m) => m.id === newLotMaterialId) || materials[0];
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
  const totalVal = Math.round(Number(newLotQuantity || 5) * baseRate * multiplier);
  const co2 = (Number(newLotQuantity || 5) * 1.8).toFixed(1);
  const toxic = (Number(newLotQuantity || 5) * 0.12).toFixed(2);

  return (
    <div className="multipage-view">
      <div className="page-header-row">
        <div>
          <h1>{I18N[currentLang].studioTitle}</h1>
          <p>{I18N[currentLang].studioSubtitle}</p>
        </div>
        <button className="secondary-button" onClick={onBack}>
          ← {I18N[currentLang].backBtn}
        </button>
      </div>

      {lotSuccessMsg && (
        <div
          style={{
            padding: '14px 18px',
            background: '#eaf8ed',
            border: '1px solid #b7e8c3',
            borderRadius: '12px',
            color: '#0d6537',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{lotSuccessMsg}</span>
          <button className="mini-action" onClick={onNavigateTransactions}>
            View Transactions →
          </button>
        </div>
      )}

      <div className="lot-studio-layout">
        {/* Left Column: Data Entry & AI */}
        <div className="panel" style={{ padding: '22px' }}>
          <div className="form-group">
            <label>{I18N[currentLang].uploadPhotoTitle}</label>
            <div
              className="photo-dropzone"
              onClick={() => document.getElementById('studio-file-input')?.click()}
            >
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📷</span>
              <strong>{aiImageFile ? aiImageFile.name : 'Click to take picture or upload image'}</strong>
              <small style={{ display: 'block', color: '#688478', marginTop: '4px' }}>
                JPEG, PNG supported. Auto-scanned with PyTorch MobileNet model.
              </small>
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="mini-action"
                style={{ padding: '8px 16px', background: '#086c4b' }}
                disabled={!aiImageFile || aiLoading}
                onClick={onPredictMaterialWithAi}
              >
                {aiLoading ? I18N[currentLang].scanningAi : I18N[currentLang].scanAiBtn}
              </button>
              {aiResult && (
                <span className="verification-badge verified" style={{ alignSelf: 'center' }}>
                  ✓ {aiResult.category} ({(aiResult.confidence * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              1.{' '}
              {currentLang === 'hi'
                ? 'सामग्री श्रेणी चुनें'
                : currentLang === 'mr'
                ? 'साहित्याचा प्रकार निवडा'
                : 'Select Material Category'}
            </label>
            <div className="category-chip-grid">
              {materials.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`category-chip ${newLotMaterialId === m.id ? 'active' : ''}`}
                  onClick={() => setNewLotMaterialId(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>2. {I18N[currentLang].approxWeightLabel}</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={newLotQuantity}
                onChange={(e) => setNewLotQuantity(e.target.value)}
                style={{
                  width: '120px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #c9ded0',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              />
              <span style={{ fontWeight: 700, color: '#335747' }}>kg</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['+1', '+5', '+10', '+25'].map((step) => (
                  <button
                    key={step}
                    type="button"
                    className="quick-helper-btn"
                    style={{ margin: 0 }}
                    onClick={() =>
                      setNewLotQuantity(
                        String(Math.max(0.5, Number(newLotQuantity) + Number(step)))
                      )
                    }
                  >
                    {step} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>3. {I18N[currentLang].conditionLabel}</label>
            <div className="condition-selector-group">
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'good' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('good')}
              >
                {I18N[currentLang].condGood}
              </button>
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'mixed' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('mixed')}
              >
                {I18N[currentLang].condMixed}
              </button>
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'damaged' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('damaged')}
              >
                {I18N[currentLang].condDamaged}
              </button>
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'unknown' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('unknown')}
              >
                {I18N[currentLang].condUnknown}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Valuation & Submission */}
        <div>
          <div className="estimate-preview-banner">
            <div>
              <small
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#45745e',
                }}
              >
                {I18N[currentLang].estimatedValuationLabel}
              </small>
              <strong>₹ {totalVal}</strong>
              <span style={{ fontSize: '11px', color: '#38634f' }}>
                ₹ {Math.round(baseRate * multiplier)} / kg · {newLotQuantity} kg declared
              </span>
            </div>
            <span style={{ fontSize: '36px' }}>💰</span>
          </div>

          <div className="panel" style={{ padding: '18px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#164836' }}>
              🌱 ESG & Environmental Credits
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                style={{
                  background: '#f2faf4',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #d3ebd9',
                }}
              >
                <small style={{ color: '#587a6a', display: 'block', fontSize: '10px' }}>
                  {I18N[currentLang].co2Saved}
                </small>
                <strong style={{ fontSize: '16px', color: '#0e633d' }}>{co2} kg</strong>
              </div>
              <div
                style={{
                  background: '#f2faf4',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #d3ebd9',
                }}
              >
                <small style={{ color: '#587a6a', display: 'block', fontSize: '10px' }}>
                  {I18N[currentLang].toxicDiverted}
                </small>
                <strong style={{ fontSize: '16px', color: '#0e633d' }}>{toxic} kg</strong>
              </div>
            </div>
            <small style={{ display: 'block', color: '#688478', fontSize: '10px', marginTop: '10px' }}>
              Certified under CPCB E-Waste (Management) Rules 2022. QR passport issued on handover.
            </small>
          </div>

          <button className="wizard-btn-primary" onClick={onCreateLot}>
            {I18N[currentLang].submitLotBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
