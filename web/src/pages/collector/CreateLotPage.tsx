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

interface MaterialMeta {
  icon: string;
  bg: string;
  color: string;
  defaultRate: number;
  description: string;
}

const MATERIAL_META: Record<string, MaterialMeta> = {
  pcb: {
    icon: '⚡',
    bg: '#ecfdf5',
    color: '#059669',
    defaultRate: 185,
    description: 'Printed circuit boards, motherboards, gold-plated connectors',
  },
  battery: {
    icon: '🔋',
    bg: '#fef3c7',
    color: '#d97706',
    defaultRate: 65,
    description: 'Lithium-ion batteries, lead-acid inverter & laptop cells',
  },
  cable: {
    icon: '🔌',
    bg: '#eff6ff',
    color: '#2563eb',
    defaultRate: 110,
    description: 'Insulated copper cables, network wires, automotive harnesses',
  },
  wire: {
    icon: '🔌',
    bg: '#eff6ff',
    color: '#2563eb',
    defaultRate: 110,
    description: 'Stripped copper wire, high-grade bright copper windings',
  },
  mobile: {
    icon: '📱',
    bg: '#f3e8ff',
    color: '#7c3aed',
    defaultRate: 95,
    description: 'Smartphones, feature phones, embedded circuit handsets',
  },
  display: {
    icon: '📺',
    bg: '#e0f2fe',
    color: '#0284c7',
    defaultRate: 85,
    description: 'TFT LCD screens, LED panels, television monitors',
  },
  metal: {
    icon: '🔩',
    bg: '#f1f5f9',
    color: '#475569',
    defaultRate: 95,
    description: 'Aluminum heat sinks, copper coils, steel casings',
  },
  plastic: {
    icon: '♻️',
    bg: '#f0fdf4',
    color: '#16a34a',
    defaultRate: 40,
    description: 'ABS e-waste casings, engineering polymer scrap',
  },
};

const getMaterialDetails = (name: string): MaterialMeta => {
  const n = name.toLowerCase();
  for (const key of Object.keys(MATERIAL_META)) {
    if (n.includes(key)) {
      return MATERIAL_META[key];
    }
  }
  return {
    icon: '📦',
    bg: '#f8fafc',
    color: '#059669',
    defaultRate: 90,
    description: 'Certified electrical & electronic scrap equipment',
  };
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
  const matMeta = getMaterialDetails(mat?.name || '');

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

  const baseRate = matMeta.defaultRate;
  const multiplier =
    selectedScrapCondition === 'good'
      ? 1.0
      : selectedScrapCondition === 'mixed'
      ? 0.9
      : selectedScrapCondition === 'damaged'
      ? 0.75
      : 0.85;

  const currentWeight = Math.max(0.1, Number(newLotQuantity) || 5);
  const effectiveRate = Math.round(baseRate * multiplier);
  const totalVal = Math.round(currentWeight * effectiveRate);
  const co2 = (currentWeight * 1.8).toFixed(1);
  const toxic = (currentWeight * 0.12).toFixed(2);

  const handleStepWeight = (delta: number) => {
    const nextVal = Math.max(0.5, Number((currentWeight + delta).toFixed(1)));
    setNewLotQuantity(String(nextVal));
  };

  return (
    <div className="multipage-view" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              ✨
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: '26px', color: '#064e3b', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {I18N[currentLang].studioTitle}
              </h1>
              <span style={{ fontSize: '13px', color: '#4b5563' }}>
                {I18N[currentLang].studioSubtitle}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '12px',
              background: '#ecfdf5',
              color: '#047857',
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 700,
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🛡️</span>
            <span>CPCB EPR Registered Studio</span>
          </span>

          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 700,
            }}
          >
            ← {I18N[currentLang].backBtn}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {lotSuccessMsg && (
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1.5px solid #6ee7b7',
            borderRadius: '16px',
            color: '#065f46',
            fontWeight: 700,
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎉</span>
            <span style={{ fontSize: '15px' }}>{lotSuccessMsg}</span>
          </div>
          <button
            className="mini-action"
            style={{
              background: '#059669',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
            }}
            onClick={onNavigateTransactions}
          >
            {currentLang === 'hi' ? 'लेनदेन खाता देखें →' : 'View In Ledger →'}
          </button>
        </div>
      )}

      {/* Main Studio Two-Column Workstation Grid */}
      <div className="lot-studio-layout" style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* ===================================================================
            LEFT COLUMN: Scrap Visual Inspector & Step Inputs
            =================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: AI Scrap Visual Inspector */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📸</span>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {I18N[currentLang].uploadPhotoTitle}
                </label>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                }}
              >
                PyTorch MobileNet Vision
              </span>
            </div>

            {/* Dropzone Container */}
            <div
              className="photo-dropzone"
              onClick={() => document.getElementById('studio-file-input')?.click()}
              style={{
                border: '2px dashed #059669',
                background: imagePreviewUrl
                  ? '#ffffff'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                borderRadius: '16px',
                padding: imagePreviewUrl ? '16px' : '28px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {imagePreviewUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left' }}>
                  <img
                    src={imagePreviewUrl}
                    alt="Scrap Preview"
                    style={{
                      width: '120px',
                      height: '100px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '2px solid #a7f3d0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✓ Image Loaded
                    </span>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginTop: '2px' }}>
                      {aiImageFile?.name}
                    </strong>
                    <small style={{ display: 'block', color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                      {(aiImageFile?.size ? (aiImageFile.size / 1024).toFixed(1) : 0)} KB · Ready for Neural Vision Analysis
                    </small>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#047857',
                        fontWeight: 700,
                        textDecoration: 'underline',
                      }}
                    >
                      {currentLang === 'hi' ? 'फोटो बदलें ↺' : 'Click to Replace Image ↺'}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: '26px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.15)',
                    }}
                  >
                    📷
                  </div>
                  <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                    {currentLang === 'hi' ? 'स्क्रैप की फोटो खींचें या यहां अपलोड करें' : 'Photograph Scrap or Drag Image Here'}
                  </strong>
                  <small style={{ display: 'block', color: '#64748b', fontSize: '13px' }}>
                    Supports PNG, JPG, WebP. Real-time vision classifies PCB, cables, batteries, and appliances.
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

            {/* Neural AI Action Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="ai-scan-pulse-btn"
                disabled={!aiImageFile || aiLoading}
                onClick={onPredictMaterialWithAi}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '11px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                <span>⚡</span>
                <span>
                  {aiLoading
                    ? I18N[currentLang].scanningAi
                    : currentLang === 'hi'
                    ? 'एआई से पहचानें'
                    : 'Scan with Neural Vision'}
                </span>
              </button>

              {aiResult ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#ecfdf5',
                    border: '1.5px solid #86efac',
                    padding: '8px 16px',
                    borderRadius: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#065f46', display: 'block' }}>
                      {aiResult.category}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#047857', fontWeight: 700, fontSize: '12px' }}>
                        {(aiResult.confidence * 100).toFixed(1)}% Match
                      </span>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <span style={{ color: '#15803d', fontSize: '11px', fontWeight: 600 }}>
                        Auto-categorized
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {currentLang === 'hi' ? 'फोटो अपलोड करके एआई स्कैन दबाएं' : 'Upload photo to auto-detect scrap category'}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Material Category Selection */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#059669', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  1
                </span>
                <span>{currentLang === 'hi' ? 'सामग्री श्रेणी चुनें' : 'Select Material Category'}</span>
              </label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: '999px' }}>
                ₹{baseRate} / kg Base
              </span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              {currentLang === 'hi'
                ? 'अपनी स्क्रैप श्रेणी चुनें जिससे सटीक सरकारी ई-कचरा मूल्य लागू हो सके।'
                : 'Choose the scrap category to lock in the official CPCB circular economy pricing.'}
            </p>

            <div
              className="category-chip-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {materials.map((m) => {
                const isSelected = newLotMaterialId === m.id;
                const details = getMaterialDetails(m.name);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setNewLotMaterialId(m.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 10px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      color: isSelected ? '#065f46' : '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? '0 6px 16px rgba(5, 150, 105, 0.15)' : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: details.bg,
                        color: details.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                      }}
                    >
                      {details.icon}
                    </span>
                    <strong style={{ fontSize: '13px', textAlign: 'center' }}>{m.name}</strong>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                      ₹{details.defaultRate}/kg
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: '#059669',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 800,
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

          {/* Card 3: Declared Weight in kg */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#059669', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  2
                </span>
                <span>{I18N[currentLang].approxWeightLabel}</span>
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Certified Digital Scale Handover</span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              {currentLang === 'hi'
                ? 'अनुमानित वज़न दर्ज करें। पिकअप के समय डिजिटल कांटे पर अंतिम वज़न रिकॉर्ड होगा।'
                : 'Enter estimated weight in kilograms. Digital scales lock verified weight at handover.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Stepper Control Box */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '2px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleStepWeight(-1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '18px',
                    fontWeight: 800,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newLotQuantity}
                    onChange={(e) => setNewLotQuantity(e.target.value)}
                    style={{
                      width: '90px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#0f172a',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#64748b', marginLeft: '4px' }}>
                    kg
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepWeight(1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#ffffff',
                    color: '#059669',
                    fontSize: '18px',
                    fontWeight: 800,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              {/* Quick Helper Chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 5, 10, 25, 50].map((step) => (
                  <button
                    key={step}
                    type="button"
                    className="quick-helper-btn"
                    onClick={() => handleStepWeight(step)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                    }}
                  >
                    +{step} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Physical Condition Cards */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#059669', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  3
                </span>
                <span>{I18N[currentLang].conditionLabel}</span>
              </label>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: '999px' }}>
                Recovery Multiplier: {Math.round(multiplier * 100)}%
              </span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              {currentLang === 'hi'
                ? 'स्क्रैप की वर्तमान भौतिक स्थिति चुनें जिससे पारदर्शी मूल्य तय हो सके।'
                : 'Physical condition determines recycling recovery yield and fair payout multiplier.'}
            </p>

            <div
              className="condition-selector-group"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'good' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('good')}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: selectedScrapCondition === 'good' ? '2px solid #059669' : '1.5px solid #e2e8f0',
                  background: selectedScrapCondition === 'good' ? '#f0fdf4' : '#ffffff',
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>💎</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{I18N[currentLang].condGood}</strong>
                <small style={{ color: '#059669', fontWeight: 800, fontSize: '11px', marginTop: '2px' }}>
                  100% Rate
                </small>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Intact / Complete</span>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'mixed' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('mixed')}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: selectedScrapCondition === 'mixed' ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                  background: selectedScrapCondition === 'mixed' ? '#fffbeb' : '#ffffff',
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>📦</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{I18N[currentLang].condMixed}</strong>
                <small style={{ color: '#d97706', fontWeight: 800, fontSize: '11px', marginTop: '2px' }}>
                  90% Rate
                </small>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Partially sorted</span>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'damaged' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('damaged')}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: selectedScrapCondition === 'damaged' ? '2px solid #ea580c' : '1.5px solid #e2e8f0',
                  background: selectedScrapCondition === 'damaged' ? '#fff7ed' : '#ffffff',
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>🔨</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{I18N[currentLang].condDamaged}</strong>
                <small style={{ color: '#ea580c', fontWeight: 800, fontSize: '11px', marginTop: '2px' }}>
                  75% Rate
                </small>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Broken / Stripped</span>
              </button>

              <button
                type="button"
                className={`condition-pill ${selectedScrapCondition === 'unknown' ? 'active' : ''}`}
                onClick={() => setSelectedScrapCondition('unknown')}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: selectedScrapCondition === 'unknown' ? '2px solid #64748b' : '1.5px solid #e2e8f0',
                  background: selectedScrapCondition === 'unknown' ? '#f8fafc' : '#ffffff',
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>❓</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{I18N[currentLang].condUnknown}</strong>
                <small style={{ color: '#64748b', fontWeight: 800, fontSize: '11px', marginTop: '2px' }}>
                  85% Rate
                </small>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Raw / Unchecked</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN: Sticky Valuation, CPCB Buyers & ESG Credits
            =================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'sticky', top: '24px' }}>
          {/* Hero Valuation Banner */}
          <div
            className="estimate-preview-banner"
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(4, 120, 87, 0.3)',
            }}
          >
            {/* Radial decorative glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#a7f3d0',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {I18N[currentLang].estimatedValuationLabel}
                </span>
                <span style={{ fontSize: '32px' }}>🪙</span>
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: '38px',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: '#ffffff',
                  margin: '4px 0',
                }}
              >
                ₹ {totalVal.toLocaleString('en-IN')}
              </strong>

              <div style={{ fontSize: '13px', color: '#d1fae5', fontWeight: 600, marginTop: '4px' }}>
                ₹ {effectiveRate} / kg × {currentWeight} kg declared
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  marginTop: '16px',
                  fontWeight: 700,
                  color: '#ffffff',
                  width: 'fit-content',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span>🛡️</span>
                <span>Guaranteed Fair Minimum Floor Price</span>
              </div>
            </div>
          </div>

          {/* AI Matched CPCB Recyclers */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🤝</span>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {currentLang === 'hi' ? 'अनुशंसित अधिकृत खरीदार' : 'Recommended CPCB Buyers'}
                </h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  background: '#ecfdf5',
                  color: '#047857',
                  padding: '3px 8px',
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
                      padding: '14px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(5, 150, 105, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #059669' : '2px solid #cbd5e1',
                            background: '#ffffff',
                            display: 'inline-block',
                          }}
                        />
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{b.recycler_name}</strong>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#047857',
                          background: '#d1fae5',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        ★ {b.score}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b', marginLeft: '28px' }}>
                      <span>📍 {b.location}</span>
                      <span>·</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {b.pickup_availability.toLowerCase() === 'yes' ? '🚚 Pickup Available' : 'Drop-off'}
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
                          gap: '6px',
                          marginLeft: '28px',
                        }}
                      >
                        <span>✓</span>
                        <span>Preferred buyer locked for lot handover</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ESG Environmental Impact Box */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>🌱</span>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {currentLang === 'hi' ? 'पर्यावरणीय प्रभाव क्रेडिट' : 'ESG & Circular Credits'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <small style={{ color: '#166534', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {I18N[currentLang].co2Saved}
                </small>
                <strong style={{ fontSize: '20px', color: '#065f46', display: 'block', marginTop: '4px', fontWeight: 900 }}>
                  {co2} kg
                </strong>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <small style={{ color: '#166534', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {I18N[currentLang].toxicDiverted}
                </small>
                <strong style={{ fontSize: '20px', color: '#065f46', display: 'block', marginTop: '4px', fontWeight: 900 }}>
                  {toxic} kg
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <span>📜</span>
              <span>QR Traceability Passport certified under CPCB E-Waste Rules 2022.</span>
            </div>
          </div>

          {/* High-Contrast Submission Action Button */}
          <button
            type="button"
            className="wizard-btn-primary"
            onClick={onCreateLot}
            style={{
              padding: '18px',
              fontSize: '16px',
              fontWeight: 800,
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <span>🚀</span>
            <span>{I18N[currentLang].submitLotBtn}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
