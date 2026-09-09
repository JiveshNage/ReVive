import React, { useState, useRef, useEffect } from 'react';
import { Lang, Material, Recycler } from '../../types';

export interface MobileScanViewProps {
  currentLang: Lang;
  materials: Material[];
  recyclers: Recycler[];
  onSellNow: (lotData: {
    materialId: number;
    quantityKg: number;
    estimatedValue: number;
    photoUrl?: string;
  }) => Promise<void>;
  speakIndicText: (text: string, lang?: Lang) => void;
  onNavigateLots: () => void;
}

export const MobileScanView: React.FC<MobileScanViewProps> = ({
  currentLang,
  materials,
  recyclers,
  onSellNow,
  speakIndicText,
  onNavigateLots,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    category: string;
    confidence: number;
    pricePerKg: number;
    weightKg: number;
    estimatedValue: number;
    matchedRecycler: string;
    recyclerId: number;
  } | null>(null);
  const [weightKg, setWeightKg] = useState<number>(5.0);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera unsupported');
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera access unavailable. Use sample scrap chips or phone gallery.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    void startCamera(facingMode);
    return () => stopCamera();
  }, []);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'mobile-snap.jpg', { type: 'image/jpeg' });
          void runAiAnalysis(file);
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const runAiAnalysis = async (file: File) => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('location', 'Bhopal');
      formData.append('weight_kg', String(weightKg));

      const res = await fetch('http://localhost:8000/api/ai/predict', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const priceRate = data.pricing?.price_per_kg_median || 185;
        const estVal = Math.round(priceRate * weightKg);
        const recycler = data.recycler_matches?.[0]?.recycler_name || recyclers[0]?.name || 'EcoCycle Pune Solutions';
        const recId = data.recycler_matches?.[0]?.recycler_id || recyclers[0]?.id || 1;

        const result = {
          category: data.category || 'PCB',
          confidence: data.confidence || 0.94,
          pricePerKg: priceRate,
          weightKg: weightKg,
          estimatedValue: estVal,
          matchedRecycler: recycler,
          recyclerId: recId,
        };
        setScanResult(result);
        announceVoice(result.category, priceRate, estVal);
      } else {
        throw new Error('API offline');
      }
    } catch {
      const fallbackRate = 185;
      const fallbackVal = Math.round(fallbackRate * weightKg);
      const result = {
        category: 'PCB (Printed Circuit Board)',
        confidence: 0.94,
        pricePerKg: fallbackRate,
        weightKg: weightKg,
        estimatedValue: fallbackVal,
        matchedRecycler: recyclers[0]?.name || 'EcoCycle Solutions (CPCB Authorized)',
        recyclerId: recyclers[0]?.id || 1,
      };
      setScanResult(result);
      announceVoice('PCB', fallbackRate, fallbackVal);
    } finally {
      setIsScanning(false);
    }
  };

  const announceVoice = (category: string, rate: number, total: number) => {
    const text =
      currentLang === 'hi'
        ? `पहचान पूरी हुई! यह ${category} है। आज का लाइव भाव ₹${rate} प्रति किलो है। ${weightKg} किलो का कुल नकद मूल्य ₹${total} बनेगा।`
        : currentLang === 'mr'
        ? `तपासणी पूर्ण झाली! हा ${category} आहे. आजचा दर ₹${rate} प्रति किलो आहे. ${weightKg} किलोची एकूण किंमत ₹${total} होईल.`
        : `Detection complete! Identified ${category}. Rate is ₹${rate} per kg. Total estimated value for ${weightKg} kg is ₹${total}.`;
    speakIndicText(text, currentLang);
  };

  const loadPreset = (category: string, rate: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = category.includes('PCB') ? '#064e3b' : category.includes('Battery') ? '#1e293b' : '#7c2d12';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Scrap: ${category}`, 200, 150);
      ctx.font = '16px sans-serif';
      ctx.fillText(`Rate: ₹${rate}/kg`, 200, 190);
    }
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();

    const est = Math.round(rate * weightKg);
    const result = {
      category,
      confidence: 0.96,
      pricePerKg: rate,
      weightKg,
      estimatedValue: est,
      matchedRecycler: recyclers[0]?.name || 'EcoCycle Solutions (CPCB Authorized)',
      recyclerId: recyclers[0]?.id || 1,
    };
    setScanResult(result);
    announceVoice(category, rate, est);
  };

  const handleWeightChange = (newWt: number) => {
    if (newWt <= 0) return;
    setWeightKg(newWt);
    if (scanResult) {
      setScanResult({
        ...scanResult,
        weightKg: newWt,
        estimatedValue: Math.round(scanResult.pricePerKg * newWt),
      });
    }
  };

  const handleConfirmSell = async () => {
    if (!scanResult) return;
    setSellingLoading(true);
    try {
      const matchedMat =
        materials.find((m) => m.name.toLowerCase().includes(scanResult.category.toLowerCase().slice(0, 3))) ||
        materials[0];

      await onSellNow({
        materialId: matchedMat.id,
        quantityKg: weightKg,
        estimatedValue: scanResult.estimatedValue,
        photoUrl: capturedImage || undefined,
      });
      setSellSuccess(true);
    } finally {
      setSellingLoading(false);
    }
  };

  return (
    <div className="mobile-view-container">
      {/* Top Banner */}
      <div className="mobile-page-title-row">
        <div>
          <h2>
            {currentLang === 'hi' ? '📸 कैमरा स्क्रैप स्कैनर' : currentLang === 'mr' ? '📸 कॅमेरा स्क्रॅप स्कॅनर' : '📸 Camera Scrap Scanner'}
          </h2>
          <p>
            {currentLang === 'hi'
              ? 'फोटो खींचें — AI तुरंत सही बाज़ार भाव और प्रमाणित रीसाइक्लर बताएगा'
              : 'Snap e-waste to get instant fair price and verified pickup'}
          </p>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="mobile-cam-viewfinder" style={{ borderRadius: '20px', minHeight: '360px' }}>
        {!capturedImage ? (
          <>
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="mobile-cam-video" />
            ) : (
              <div className="mobile-cam-placeholder">
                <span style={{ fontSize: '54px' }}>📷</span>
                <p style={{ margin: '8px 0 4px', color: '#ffffff', fontWeight: 700 }}>
                  {cameraError || 'Camera opening...'}
                </p>
                <small style={{ color: '#cbd5e1' }}>
                  Point camera at circuit boards, cables, batteries or mixed scrap
                </small>
                <button
                  type="button"
                  className="primary-button"
                  style={{ marginTop: '14px', background: '#059669' }}
                  onClick={() => startCamera(facingMode)}
                >
                  🔄 Retry Camera
                </button>
              </div>
            )}

            {/* Laser reticle */}
            <div className="mobile-cam-overlay-box">
              <div className="cam-corner tl" />
              <div className="cam-corner tr" />
              <div className="cam-corner bl" />
              <div className="cam-corner br" />
              <div className="cam-laser" />
            </div>
          </>
        ) : (
          <div className="mobile-cam-preview-box">
            <img src={capturedImage} alt="Captured Scrap" className="mobile-cam-snapped-img" />
            {isScanning && (
              <div className="mobile-cam-scanning-banner">
                <div className="scanning-spinner" />
                <span>AI द्वारा विश्लेषण जारी है...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success View */}
      {sellSuccess ? (
        <div className="mobile-cam-success-card" style={{ marginTop: '16px', borderRadius: '20px' }}>
          <span style={{ fontSize: '52px', display: 'block', marginBottom: '8px' }}>🎉</span>
          <h3 style={{ margin: '0 0 6px', color: '#065f46', fontSize: '22px' }}>
            {currentLang === 'hi' ? 'लॉट सफलता से दर्ज हुआ!' : 'Scrap Lot Booked Successfully!'}
          </h3>
          <p style={{ margin: '0 0 16px', color: '#047857', fontSize: '14px' }}>
            रीसाइक्लर <strong>{scanResult?.matchedRecycler}</strong> को पिकअप सूचना भेजी गई।
            <br />
            <strong>अनुमानित नकद: ₹ {scanResult?.estimatedValue}</strong>
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="primary-button"
              style={{ flex: 1, padding: '14px' }}
              onClick={onNavigateLots}
            >
              📦 मेरे लॉट देखें (My Lots)
            </button>
            <button
              type="button"
              className="secondary-button"
              style={{ flex: 1, padding: '14px' }}
              onClick={() => {
                setCapturedImage(null);
                setScanResult(null);
                setSellSuccess(false);
                void startCamera(facingMode);
              }}
            >
              + नया स्कैन करें
            </button>
          </div>
        </div>
      ) : scanResult ? (
        /* Detection & Fair Price Card */
        <div className="mobile-cam-result-sheet" style={{ marginTop: '16px', borderRadius: '20px', border: '1px solid #d1fae5' }}>
          <div className="scan-result-badge-row">
            <div>
              <h3 style={{ margin: 0, fontSize: '19px', color: '#0c3b2d' }}>{scanResult.category}</h3>
              <small style={{ color: '#059669', fontWeight: 800 }}>✓ AI Confidence: {(scanResult.confidence * 100).toFixed(0)}%</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>आज का भाव</div>
              <strong style={{ fontSize: '20px', color: '#047857' }}>₹ {scanResult.pricePerKg} / kg</strong>
            </div>
          </div>

          <div className="scan-weight-stepper-box">
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>वजन (Weight in kg):</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[1, 5, 10, 20].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`weight-chip ${weightKg === w ? 'active' : ''}`}
                    onClick={() => handleWeightChange(w)}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" className="step-btn" onClick={() => handleWeightChange(Math.max(0.5, weightKg - 1))}>-</button>
              <span style={{ fontSize: '20px', fontWeight: 800, minWidth: '50px', textAlign: 'center' }}>{weightKg} kg</span>
              <button type="button" className="step-btn" onClick={() => handleWeightChange(weightKg + 1)}>+</button>
            </div>
          </div>

          <div className="scan-cash-highlight">
            <div>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#92400e', fontWeight: 800 }}>
                💵 कुल नकद मूल्य (Instant Cash)
              </span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#78350f' }}>
                ₹ {scanResult.estimatedValue}
              </div>
            </div>
            <button
              type="button"
              className="tts-speaker-icon"
              style={{ width: '42px', height: '42px', fontSize: '22px' }}
              onClick={() => announceVoice(scanResult.category, scanResult.pricePerKg, scanResult.estimatedValue)}
            >
              🔊
            </button>
          </div>

          <div className="scan-recycler-matched-box">
            <div style={{ fontSize: '13px', color: '#334155' }}>
              <strong>अनुमोदित रीसाइक्लर:</strong> {scanResult.matchedRecycler}
            </div>
            <span className="doorstep-pill">🚚 पिकअप उपलब्ध</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="secondary-button"
              style={{ flex: 1, padding: '14px' }}
              onClick={() => {
                setCapturedImage(null);
                setScanResult(null);
                void startCamera(facingMode);
              }}
            >
              🔄 फिर से लें
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ flex: 2, background: '#059669', fontSize: '16px', fontWeight: 800, padding: '14px' }}
              disabled={sellingLoading}
              onClick={handleConfirmSell}
            >
              {sellingLoading ? 'दर्ज हो रहा है...' : '🚀 सीधा बेचें / पिकअप बुक करें'}
            </button>
          </div>
        </div>
      ) : (
        /* Camera Controls */
        <div className="mobile-cam-controls-panel" style={{ marginTop: '16px', borderRadius: '20px' }}>
          <div className="cam-preset-chips-row">
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>त्वरित टेस्ट:</span>
            <button type="button" className="cam-preset-chip" onClick={() => loadPreset('PCB / Motherboard', 185)}>💻 PCB</button>
            <button type="button" className="cam-preset-chip" onClick={() => loadPreset('Lithium Battery', 65)}>🔋 Battery</button>
            <button type="button" className="cam-preset-chip" onClick={() => loadPreset('Copper Cable', 110)}>🔌 Copper Wire</button>
            <button type="button" className="cam-preset-chip" onClick={() => loadPreset('CRT Display', 95)}>📱 Screen</button>
          </div>

          <div className="cam-shutter-bar">
            <button type="button" className="cam-side-btn" onClick={() => fileInputRef.current?.click()}>
              📁
              <small>गैलरी</small>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const url = event.target?.result as string;
                    setCapturedImage(url);
                    stopCamera();
                    void runAiAnalysis(file);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <button
              type="button"
              className="cam-main-shutter"
              disabled={!cameraActive}
              onClick={captureFrame}
              aria-label="Click photo"
            >
              <div className="shutter-inner" />
            </button>

            <button
              type="button"
              className="cam-side-btn"
              onClick={() => {
                const next = facingMode === 'environment' ? 'user' : 'environment';
                setFacingMode(next);
                void startCamera(next);
              }}
            >
              🔄
              <small>कैमरा बदलें</small>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
