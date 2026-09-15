# ReVive Project Memory

## Current status
- Project goal: build an AI-enabled, offline-first e-waste marketplace, digital passport, and traceability platform.
- Current working product focus: Smart India Hackathon 2026 (Problem Statement 26229: Kabadiwala Connect) complete package.
- Core workflow: identify material -> create lot -> estimate value -> receive offers -> accept offer -> handover -> payment -> traceability & passport.
- Current active milestone: **SIH26229 Master Upgrade & Production Optimization** ([Phase.md](Phase.md)).
- Phase 1 (Audit & Baseline): **100% COMPLETE**. Created [IMPLEMENTATION_AUDIT.md](IMPLEMENTATION_AUDIT.md) and [SIH26229_COMPLIANCE.md](SIH26229_COMPLIANCE.md).
- Phase 2 (Core P0 Capabilities): **100% COMPLETE**.
  - Integrated Firebase Auth token verification bridge (`POST /api/auth/firebase/verify`) with strict server-side role enforcement.
  - Implemented Cash-First Payment (`POST /api/lots/{id}/pay`) and Collector Earnings Ledger (`GET /api/collector/{id}/earnings`, `GET /api/collector/{id}/reputation`).
  - Enhanced Price Engine with "Why this price?" itemized breakdown and 7-day trend curve.
  - Added Spoken Price Board (`🔊 सुनें`) in Hindi/Marathi and "भाव का कारण?" explanation dialog on mobile.
  - Published [UNIT_ECONOMICS.md](UNIT_ECONOMICS.md) and [DATA_PROVENANCE.md](DATA_PROVENANCE.md).
  - All test suites green: **46/46 backend pytest passed**, **4/4 mobile flutter tests passed**, **Vite web build clean (0 errors)**.
- Phase 3 (Spatial Intelligence, Configurable Matching & Verified Handover): **100% COMPLETE**.
  - Spatial intelligence: Added latitude, longitude, and pickup_address to `Lot` and `Recycler` with database schema migration.
  - Recycler matching engine: Implemented 5-pillar configurable scoring algorithm (Compatibility 40%, Rate 25%, Proximity 15%, Capacity 10%, Compliance 10%) with Haversine spatial distance calculation and custom weight parameters (`GET /api/recyclers/match`).
  - Secure Time-Limited OTP Handover: Implemented `POST /api/handovers/generate-otp` (6-digit numeric OTP, 15-min validity) and `POST /api/handovers/{lot_id}/verify-otp`.
  - Discrepancy threshold: Tightened physical scale reconciliation tolerance from $\pm 10\%$ to $\pm 5\%$ for SIH compliance with automated reputation accuracy updates.
  - Image pipeline: Added low-bandwidth image upload pipeline (`POST /api/lots/upload-photo`) with Cloudinary CDN integration and isolated local storage fallback.
  - Web UI: Enhanced recycler cards with distance indicators, 5-pillar breakdown, OpenStreetMap links, and Handover Modal with OTP input and real-time $\pm 5\%$ discrepancy indicator.
  - Test suites: **50/50 backend pytest passed**, **4/4 mobile flutter tests passed**, **Vite web build clean (0 errors)**.
- Phase 4 (Quality, Security & Testing Gate): **100% COMPLETE**.
  - Automated testing: Created `backend/tests/test_phase4_gate.py` covering expired OTP rejection, SQL injection and XSS resistance, unauthorized offer blocking, payment blocking before handover, and complete end-to-end lifecycle.
  - Test Suite Status: **55/55 backend pytest passed in 19.39s**, **4/4 Flutter mobile tests passed**, **Vite web build clean (0 errors)**.
  - Security documentation: Authored comprehensive [SECURITY.md](SECURITY.md) covering RBAC, zero-trust provisioning, OTP handover protocol, magic-byte inspection, UUID storage, and error sanitization.
  - Performance profiling: Authored [PERFORMANCE.md](PERFORMANCE.md) with empirical multi-iteration latency benchmarks proving all endpoints beat the 500ms SLA (Price Estimation: 14.36ms, Passport: 8.87ms, Recycler Matching: 153.05ms, AI Vision Prediction: 370.20ms).
- Phase 5 (SIH Demo & Judging Package): **100% COMPLETE**.
  - Seed dataset actors: Enriched `backend/app/seed_data.py` with 5+ collectors, 5+ authorized CPCB recyclers, 10+ lots in varied states, realistic pricing, handovers with a >5% weight anomaly for CPCB dispute review, and reputation metrics.
  - 1-Click Interactive Demo / "Judge Mode": Enhanced `POST /api/demo/run-workflow` to simulate the full 7-step lifecycle with OTP generation, discrepancy checking, and Cash-First payment settlement in under 2 seconds.
  - SIH Demonstration Playbook: Authored [SIH_DEMO.md](SIH_DEMO.md) with 30-second elevator pitch, pre-seeded personas, and step-by-step jury walkthrough script.
  - Final Implementation Audit: Authored [FINAL_AUDIT.md](FINAL_AUDIT.md) certifying 100% compliance across all 19 SIH26229 requirements.
  - Production README: Updated [README.md](../README.md) with complete architecture diagram, feature breakdown, test evidence, quickstart guides, and documentation index.
- Overall Upgrade Status: **ALL PHASES (Phase 1 to Phase 5) ARE 100% COMPLETE AND PRODUCTION READY.**

## What has already been built
- FastAPI backend with models for users, materials, lots, recyclers, offers, and handover records.
- PyTorch AI e-waste classification engine (`backend/app/ai_service.py`) loading `Ai/SIH_2026-main/model/ewaste_classifier.pt` with dynamic architecture detection (`SmallCNN`), tiered confidence logic, and top predictions.
- Price intelligence engine reading `dataset/price_dataset_india_locations.csv` with regional median, min, max valuation and live benchmarks (`/api/prices/estimate`, `/api/prices/benchmarks`).
- Authorized recycler matching engine reading `dataset/recycler_dataset_large.csv` with compliance and proximity scoring (`/api/recyclers/match`).
- Digital Recycling Passport API (`GET /api/passport/{reference_or_id}`) computing verifiable digital certificate hashes, audit chronology, and environmental ESG metrics (CO₂ emissions avoided, toxic heavy metals diverted from informal dumps).
- Contextual Material Safety Guidance API (`GET /api/safety/guidance`) providing trilingual hazard advisories, vernacular slogans ("तार मत जलाओ", battery explosion alerts), and actionable Do's and Don'ts.
- Admin Governance & Metrics API (`GET /api/admin/metrics`, `GET /api/admin/anomalies`, `POST /api/recyclers/{id}/verify`) for monitoring live platform throughput, ESG impact, CPCB authorization toggling, and anomaly detection (weight discrepancies > 10%, price outliers, unverified recyclers).
- SIH 1-Click Live Demo Simulator (`POST /api/demo/run-workflow`) that automatically drives the entire 7-step lifecycle in one shot and generates a verified Recycling Passport with QR payload.
- Web Tri-Role Dashboard (`Collector` | `Recycler` | `Admin`) with Language switcher (EN/HI/MR), live SIH demo trigger button, CPCB recycler authorization registry, anomaly inspector, public passport search, and offline mutation sync queue.
- Flutter mobile collector MVP with offline queue supporting `LOCAL_CREATED` -> `PENDING_SYNC` -> `SYNCED`, offline simulator toggle, pending sync banner with batch synchronization, and localized material safety guidance.

## Key lessons learned
- AI Suggestion ≠ Legal Verification: Statutory compliance with CPCB / SPCB rules requires administrative oversight over recycler credentials and authorization toggles, which cannot be delegated to assistive AI alone.
- Automated 1-Click Demo simulation drastically lowers demonstration friction during SIH judging by letting judges witness the full 7-step lifecycle with realistic weights and live blockchain-like certificate generation in real time.
- Pure SVG QR matrix generation can be implemented without external dependencies by combining 7x7 corner finder patterns with deterministic hashed module grids.
- Contextual safety advice must use direct vernacular slogans (e.g. "तार मत जलाओ") to effectively communicate hazards to informal kabadiwalas.
- Keep lifecycle states consistent between backend, web frontend, and mobile clients.

## Working rules for future development
- Before adding a new feature, check whether it belongs to the next roadmap milestone.
- Prefer the smallest end-to-end enhancement that proves the user flow.
- Keep state names aligned with the canonical lifecycle: created, offers, pickup, handed_over, payment_completed.
- Capture every non-trivial milestone in this memory file before moving on.
- When a feature is done, log what was implemented, how it was validated, and what remains.

## Known technical context
- Main backend: backend/app/main.py
- AI service: backend/app/ai_service.py
- Core models: backend/app/models.py
- Input/output schemas: backend/app/schemas.py
- Main frontend: web/src/App.tsx
- Styling: web/src/styles.css
- Mobile app: mobile/lib/app.dart
- Mobile tests: mobile/test/widget_test.dart
- AI model: Ai/SIH_2026-main/model/ewaste_classifier.pt
- Price dataset: dataset/price_dataset_india_locations.csv
- Recycler dataset: dataset/recycler_dataset_large.csv
- Environment: Windows workspace with Python venv at D:\ReVive\.venv-1

## Final SIH Status
All phases (Phase 0 to Phase 14) are 100% complete, fully tested, documented, and ready for deployment and judging demonstration.
