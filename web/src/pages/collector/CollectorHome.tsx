import React from 'react';
import { Lang, ActivePage, UserProfile, Lot, Material, Recycler, I18N } from '../../types';

export interface CollectorHomeProps {
  currentLang: Lang;
  currentUser: UserProfile | null;
  lots: Lot[];
  materials: Material[];
  recyclers: Recycler[];
  benchmarks: Array<{
    category: string;
    median_rate_per_kg: number;
    min_rate_per_kg: number;
    max_rate_per_kg: number;
    sample_count: number;
  }>;
  passportLookupRef: string;
  setPassportLookupRef: (r: string) => void;
  onOpenPassport: (ref: string) => void;
  aiImageFile: File | null;
  setAiImageFile: (f: File | null) => void;
  aiLoading: boolean;
  aiResult: {
    category: string;
    confidence: number;
    confidence_tier?: string;
    recommendation?: string;
    location: string;
    weight_kg: number;
    top_predictions: Array<{ category: string; confidence: number }>;
    pricing?: {
      category: string;
      pricing_category: string;
      location: string;
      weight_kg: number;
      price_per_kg_median: number;
      estimated_value: number;
      price_min: number;
      price_max: number;
      samples?: number;
    } | null;
  } | null;
  onPredictMaterialWithAi: () => void;
  onApplyAiPredictionToLot: () => void;
  onNavigatePage: (page: ActivePage) => void;
  getStatusLabel: (status: string) => string;
  onOpenLiveScanner: () => void;
}

export const CollectorHome: React.FC<CollectorHomeProps> = ({
  currentLang,
  currentUser,
  lots,
  materials,
  recyclers,
  benchmarks,
  passportLookupRef,
  setPassportLookupRef,
  onOpenPassport,
  aiImageFile,
  setAiImageFile,
  aiLoading,
  aiResult,
  onPredictMaterialWithAi,
  onApplyAiPredictionToLot,
  onNavigatePage,
  getStatusLabel,
  onOpenLiveScanner,
}) => {
  return (
    <div className="multipage-view">
      {/* 📸 HERO MOBILE CAMERA SCANNER BANNER */}
      <div className="mobile-camera-hero-banner">
        <div className="cam-hero-content">
          <div className="cam-hero-pill">
            <span className="live-dot" /> ⚡ AI Instant Scrap Scanner
          </div>
          <h2>
            {currentLang === 'hi'
              ? 'कैमरा से फोटो खींचो और तुरंत भाव जानो'
              : currentLang === 'mr'
              ? 'कॅमेऱ्याने फोटो काढा आणि लगेच दर जाणा'
              : 'Snap Scrap Photo & Get Instant Fair Price'}
          </h2>
          <p>
            {currentLang === 'hi'
              ? 'सर्किट बोर्ड (PCB), केबल, बैटरी या ई-कचरे का फोटो लें — AI तुरंत सही बाज़ार भाव और प्रमाणित रीसाइक्लर बताएगा।'
              : currentLang === 'mr'
              ? 'सर्किट बोर्ड (PCB), केबल किंवा बॅटरीचा फोटो घ्या — AI लगेच योग्य दर आणि प्रमाणित रिसायकलर सुचवेल.'
              : 'Point camera at PCBs, wires or batteries — AI identifies material, calculates fair value, and finds authorized recyclers.'}
          </p>

          <div className="cam-hero-actions">
            <button
              type="button"
              className="cam-hero-snap-btn"
              onClick={onOpenLiveScanner}
            >
              <span style={{ fontSize: '26px' }}>📸</span>
              <div>
                <strong>
                  {currentLang === 'hi'
                    ? 'लाइव कैमरा खोलें'
                    : currentLang === 'mr'
                    ? 'थेट कॅमेरा उघडा'
                    : 'Open Live Camera'}
                </strong>
                <small>Click & Detect in 1 Second</small>
              </div>
            </button>

            <button
              type="button"
              className="cam-hero-secondary-btn"
              onClick={() => onNavigatePage('price_board')}
            >
              <span>📈</span>
              {currentLang === 'hi' ? 'लाइव भाव सूची' : 'View Price Board'}
            </button>
          </div>
        </div>
      </div>

      <section className="welcome-row">
        <div>
          <p className="eyebrow">Your collection workspace</p>
          <h1>
            {currentLang === 'hi'
              ? `नमस्ते, ${currentUser?.name || 'राम यादव'}!`
              : currentLang === 'mr'
              ? `नमस्कार, ${currentUser?.name || 'राम यादव'}!`
              : `Welcome, ${currentUser?.name || 'Ram Yadav'}!`} <span>👋</span>
          </h1>
          <p>
            {currentLang === 'hi'
              ? 'आज भी स्वच्छ और हरित भारत के लिए आपका योगदान महत्वपूर्ण है।'
              : currentLang === 'mr'
              ? 'आजही स्वच्छ आणि हरित भारतासाठी आपले योगदान महत्त्वाचे आहे.'
              : 'Empowering informal collectors with transparent prices, AI classification, and verified recycling.'}
          </p>
        </div>
        <div className="slogan">
          Kachra nahi,<br />
          <strong>Naya Kal!</strong>
        </div>
      </section>

      <div className="passport-lookup-bar">
        <input
          type="text"
          placeholder={I18N[currentLang].verifyPassport}
          value={passportLookupRef}
          onChange={(e) => setPassportLookupRef(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && passportLookupRef.trim()) {
              void onOpenPassport(passportLookupRef.trim());
            }
          }}
        />
        <button
          onClick={() => {
            if (passportLookupRef.trim()) void onOpenPassport(passportLookupRef.trim());
          }}
        >
          {I18N[currentLang].verifyBtn}
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card tint-green">
          <span className="stat-symbol">⌁</span>
          <div>
            <strong>{lots.length}</strong>
            <span>
              {currentLang === 'hi'
                ? 'कुल कबाड़ बेचा'
                : currentLang === 'mr'
                ? 'एकूण विकलेला कचरा'
                : 'Scrap Lots Sold'}
            </span>
            <small>
              इस महीने <b>↑ 20%</b>
            </small>
          </div>
        </div>
        <div className="stat-card tint-yellow">
          <span className="stat-symbol">₹</span>
          <div>
            <strong>₹ 18,450</strong>
            <span>
              {currentLang === 'hi'
                ? 'कुल कमाई'
                : currentLang === 'mr'
                ? 'एकूण कमाई'
                : 'Total Revenue'}
            </span>
            <small>
              इस महीने <b>↑ 18%</b>
            </small>
          </div>
        </div>
        <div className="stat-card tint-blue">
          <span className="stat-symbol">♧</span>
          <div>
            <strong>{recyclers.length}</strong>
            <span>
              {currentLang === 'hi'
                ? 'रीसाइक्लर्स से जुड़े'
                : currentLang === 'mr'
                ? 'जोडलेले रिसायकलर्स'
                : 'Connected Recyclers'}
            </span>
            <small>
              <b>+2 नए</b>
            </small>
          </div>
        </div>
        <div className="stat-card tint-purple">
          <span className="stat-symbol">♻</span>
          <div>
            <strong>
              {Math.round(lots.reduce((acc, l) => acc + l.quantity_kg, 0) || 48)} kg
            </strong>
            <span>
              {currentLang === 'hi'
                ? 'कचरे को नया जीवन'
                : currentLang === 'mr'
                ? 'कचऱ्याला नवे जीवन'
                : 'E-Waste Diverted'}
            </span>
            <small>CPCB Tracked</small>
          </div>
        </div>
      </section>

      {/* AI SCRAP SCANNER CARD */}
      <section className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <h2>AI scrap scan & market valuation</h2>
          <span>Neural model + Live rate engine</span>
        </div>
        <div className="sync-list">
          <div className="sync-row">
            <div>
              <strong>Upload e-waste photo</strong>
              <small>
                Neural classification with regional price discovery and verified recycler matching.
              </small>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAiImageFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="sync-row">
            <div>
              <strong>{aiImageFile ? aiImageFile.name : 'No image selected'}</strong>
              <small>
                {aiResult
                  ? `Detected: ${aiResult.category} (${(aiResult.confidence * 100).toFixed(1)}%)`
                  : 'Select scrap photo to estimate grade and market value.'}
              </small>
            </div>
            <button
              className="mini-action"
              disabled={!aiImageFile || aiLoading}
              onClick={onPredictMaterialWithAi}
            >
              {aiLoading ? 'Analyzing...' : 'Scan with AI'}
            </button>
          </div>
          {aiResult && (
            <div
              style={{
                padding: '14px',
                background: '#f6fdf8',
                borderRadius: '12px',
                border: '1px solid #c9eed2',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '15px' }}>{aiResult.category}</strong>
                  <span
                    className={`verification-badge ${
                      aiResult.confidence >= 0.8 ? 'verified' : 'pending'
                    }`}
                  >
                    {(aiResult.confidence * 100).toFixed(1)}% ({aiResult.confidence_tier ?? 'classified'})
                  </span>
                </div>
                <button
                  className="mini-action"
                  onClick={() => {
                    onApplyAiPredictionToLot();
                    onNavigatePage('create_lot');
                  }}
                >
                  Use in New Lot Studio →
                </button>
              </div>

              {aiResult.pricing && (
                <div
                  style={{
                    background: '#ffffff',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #dcfce7',
                    fontSize: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <strong>Estimated Market Value: ₹ {aiResult.pricing.estimated_value}</strong>
                  <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>
                    Range: ₹ {aiResult.pricing.price_min} – ₹ {aiResult.pricing.price_max} (Median: ₹{' '}
                    {aiResult.pricing.price_per_kg_median}/kg from regional benchmarks)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section-heading">
        <h2>
          {currentLang === 'hi' ? 'जल्दी शुरू करें' : currentLang === 'mr' ? 'जलद कृती' : 'Quick Actions'}
        </h2>
        <span style={{ fontSize: '11px', color: '#107c41' }}>8 Subpages Live</span>
      </section>
      <section className="quick-actions" id="all-actions">
        <button className="quick-card quick-green" onClick={() => onNavigatePage('create_lot')}>
          <span>⌾</span>
          <strong>{I18N[currentLang].navCreateLot}</strong>
          <small>
            {currentLang === 'hi'
              ? 'फोटो लेकर शुरू करें'
              : currentLang === 'mr'
              ? 'फोटो काढून सुरू करा'
              : 'Camera & AI Assist'}
          </small>
          <b>→</b>
        </button>
        <button className="quick-card quick-blue" onClick={() => onNavigatePage('price_board')}>
          <span>▥</span>
          <strong>{I18N[currentLang].navPriceBoard}</strong>
          <small>
            {currentLang === 'hi'
              ? 'ताज़ा बाज़ार भाव'
              : currentLang === 'mr'
              ? 'थेट बाजार दर'
              : 'Live Benchmarks'}
          </small>
          <b>→</b>
        </button>
        <button className="quick-card quick-orange" onClick={() => onNavigatePage('find_recycler')}>
          <span>⌖</span>
          <strong>{I18N[currentLang].navFindRecycler}</strong>
          <small>
            {currentLang === 'hi'
              ? 'अपने पास के रीसाइक्लर'
              : currentLang === 'mr'
              ? 'जवळचे रिसायकलर्स'
              : 'Verified Facilities'}
          </small>
          <b>→</b>
        </button>
        <button className="quick-card quick-purple" onClick={() => onNavigatePage('earnings')}>
          <span>₹</span>
          <strong>{I18N[currentLang].navEarnings}</strong>
          <small>
            {currentLang === 'hi'
              ? 'अब तक की आय'
              : currentLang === 'mr'
              ? 'आतापर्यंतची कमाई'
              : 'Cash & UPI Ledger'}
          </small>
          <b>→</b>
        </button>
      </section>

      <section className="section-heading">
        <h2>{I18N[currentLang].marketBenchmarks}</h2>
        <a
          href="#prices"
          onClick={(e) => {
            e.preventDefault();
            onNavigatePage('price_board');
          }}
        >
          {currentLang === 'hi'
            ? 'सभी भाव देखें →'
            : currentLang === 'mr'
            ? 'सर्व दर पहा →'
            : 'View Full Board →'}
        </a>
      </section>
      <section className="rate-strip" id="materials">
        {(benchmarks.length > 0
          ? benchmarks.slice(0, 4)
          : [
              { category: 'PCB Electronic', median_rate_per_kg: 185, min_rate_per_kg: 165, max_rate_per_kg: 195, sample_count: 14 },
              { category: 'Copper Cables', median_rate_per_kg: 110, min_rate_per_kg: 90, max_rate_per_kg: 125, sample_count: 18 },
              { category: 'Li-Ion Battery', median_rate_per_kg: 65, min_rate_per_kg: 55, max_rate_per_kg: 75, sample_count: 9 },
              { category: 'LCD Display', median_rate_per_kg: 95, min_rate_per_kg: 70, max_rate_per_kg: 110, sample_count: 12 },
            ]
        ).map((b, index) => (
          <article
            className="rate-card"
            key={b.category}
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigatePage('price_board')}
          >
            <div className={`rate-art art-${index}`}>
              {index === 0 ? '♧' : index === 1 ? '▧' : index === 2 ? '◒' : '▤'}
            </div>
            <div>
              <strong>{b.category}</strong>
              <small>{b.sample_count} regional points</small>
              <b>₹ {b.median_rate_per_kg} / kg</b>
            </div>
            <em>
              Range: ₹{b.min_rate_per_kg}-{b.max_rate_per_kg}
            </em>
          </article>
        ))}
      </section>

      <section className="content-columns" style={{ marginTop: '20px' }}>
        <div>
          <div className="section-heading">
            <h2>
              {currentLang === 'hi'
                ? 'हाल की गतिविधि'
                : currentLang === 'mr'
                ? 'नुकतेच व्यवहार'
                : 'Recent Lots Activity'}
            </h2>
            <a
              href="#transactions"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('transactions');
              }}
            >
              {currentLang === 'hi' ? 'सभी देखें →' : currentLang === 'mr' ? 'सर्व पहा →' : 'View All →'}
            </a>
          </div>
          <section className="panel activity-panel">
            {lots.slice(0, 4).map((lot) => (
              <div
                className="activity-row"
                key={lot.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigatePage('transactions')}
              >
                <span className="activity-icon">▤</span>
                <div>
                  <strong>{materials.find((m) => m.id === lot.material_id)?.name ?? 'Material'}</strong>
                  <small>
                    {lot.quantity_kg} kg · {getStatusLabel(lot.status)}
                  </small>
                </div>
                <b>₹ {lot.estimated_value || '—'}</b>
                <time>REV-LOT-{lot.id}</time>
              </div>
            ))}
          </section>
        </div>

        <aside className="profile-panel">
          <div className="profile-heading">
            <h2>{I18N[currentLang].navProfile}</h2>
            <a
              href="#profile"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('profile');
              }}
            >
              {currentLang === 'hi' ? 'सेटिंग्स →' : currentLang === 'mr' ? 'सेटिंग्ज →' : 'Settings →'}
            </a>
          </div>
          <div className="profile-main">
            <div className="profile-avatar">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'RY'}
            </div>
            <div>
              <strong>{currentUser?.name || 'राम यादव'}</strong>
              <small>Collector ID: REV-COL-1024</small>
              <span className="verified">✓ CPCB Verified</span>
            </div>
          </div>
          <p>⌖ {currentUser?.location || 'Bhopal, MP'}</p>
          <p>⌕ +91 {currentUser?.phone || '9876543210'}</p>
          <p>
            ▣{' '}
            {currentLang === 'hi'
              ? 'भाषा: हिन्दी'
              : currentLang === 'mr'
              ? 'भाषा: मराठी'
              : 'Language: English'}
          </p>
          <div
            className="impact-banner"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigatePage('safety')}
          >
            <span>⌁</span>
            <strong>
              {currentLang === 'hi'
                ? 'सुरक्षा मार्गदर्शिका'
                : currentLang === 'mr'
                ? 'सुरक्षा मार्गदर्शन'
                : 'Safety Guide'}
            </strong>
            <b>→</b>
          </div>
        </aside>
      </section>

      <section className="impact-footer">
        <span>🌍</span>
        <div>
          <strong>
            {currentLang === 'hi'
              ? 'हर छोटा कदम, बड़ा बदलाव!'
              : currentLang === 'mr'
              ? 'प्रत्येक पाऊल, मोठा बदल!'
              : 'Clean Today. Greener Tomorrow.'}
          </strong>
          <small>
            {currentLang === 'hi'
              ? 'कचरे को मौका दें, नई ज़िंदगी पाएं'
              : currentLang === 'mr'
              ? 'कचऱ्याला द्या नवी संधी, नवे जीवन'
              : 'Giving e-waste a traceable second life across India.'}
          </small>
        </div>
        <button onClick={() => onNavigatePage('create_lot')}>
          {I18N[currentLang].createLot} →
        </button>
      </section>
    </div>
  );
};
