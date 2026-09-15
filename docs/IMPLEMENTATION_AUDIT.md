# ReVive — Full Repository & Implementation Audit (SIH26229 Baseline)

> **Repository:** [https://github.com/JiveshNage/ReVive](https://github.com/JiveshNage/ReVive)  
> **Problem Statement:** Smart India Hackathon — SIH26229 (Kabadiwala Connect)  
> **Date of Audit:** September 16, 2026  
> **Audited By:** Lead Software & Systems Architect  
> **Status:** AUDIT COMPLETE — BASELINE ESTABLISHED

---

## 1. Executive Summary

ReVive is an operational, full-stack platform designed to formalize the informal e-waste economy by directly connecting informal waste collectors (*kabadiwalas*) with authorized recyclers through assistive AI material identification, transparent price discovery, geo-ranked matching, verified handover, cash-first payments, and tamper-evident digital passports.

Prior to making any modifications to the repository, this audit was conducted to inspect all backend, web, mobile, AI, and dataset assets. The repository is already in an advanced working state with 43 passing backend pytest cases, 4 passing Flutter mobile tests, and a clean Vite production build. However, critical gaps exist between the current codebase and the full SIH26229 production specifications (such as Firebase Auth token exchange, PostGIS spatial queries, secure OTP verification for handovers, dual-mode cash/digital earnings ledgers, spoken TTS, and Drift SQLite offline stores).

---

## 2. Existing Architecture & Technology Stack

### Component Overview
| Layer | Existing Technology | Observed Configuration | Health / Test Status |
|---|---|---|---|
| **Backend Core** | FastAPI (Python 3.12) | Modular routers (`auth`, `lots`, `offers`, `handovers`, `ai`, `documents`, `admin`) | **43/43 tests passing** (`pytest backend/tests`) |
| **Database** | PostgreSQL / SQLite | Resilient dual-driver: `postgresql+psycopg` with automatic local SQLite fallback (`revive.db`) | Operational & tested |
| **AI Vision** | PyTorch (CPU/CUDA) | SmallCNN / MobileNet dynamic loader (`Ai/SIH_2026-main/model/ewaste_classifier.pt`) | Tested & active (`/api/ai/predict`) |
| **Pricing Engine** | Pandas + In-memory | Indexed queries against `dataset/price_dataset_india_locations.csv` (7,652 records) | Operational (`/api/prices/estimate`) |
| **Recycler Matching** | Pandas + In-memory | Querying `dataset/recycler_dataset_large.csv` (5,002 records) with heuristic ranking | Operational (`/api/recyclers/match`) |
| **Web Frontend** | React 18 + TypeScript + Vite | Tri-role dashboard (Collector, Recycler, Admin) + Dark Landing Page | **Vite build succeeds in 1.8s** (0 errors) |
| **Mobile App** | Flutter 3 (Dart) | Multi-tab vernacular interface (HI, MR, EN) with in-memory & shared_preferences state | **4/4 flutter tests passing** |
| **Containerization** | Docker + Compose | `docker-compose.yml` with backend, web, postgres:16-alpine, redis:7-alpine, pgadmin | Configured |

---

## 3. Detailed Audit of Repository Assets

### 3.1 Datasets (`dataset/`)
1. **`dataset/price_dataset_india_locations.csv`** (7,652 rows):
   - **Columns:** `Category`, `Location`, `Date`, `Price/kg`, `Source`.
   - **Coverage:** Cities including Bhopal, Pune, Indore, Delhi, Mumbai, Raipur, Nagpur, Bilaspur, etc.
   - **Utility:** Provides realistic median, minimum, and maximum rates for 15+ scrap categories (PCB, Battery, Mobile, Cables, CRT, Motors).
   - **Integration Status:** Integrated in `backend/app/ai_service.py`.
2. **`dataset/recycler_dataset_large.csv`** (5,002 rows):
   - **Columns:** `Recycler ID`, `Recycler name`, `Location`, `Accepted materials`, `Authorization status`, `Contact`, `Rate`, `Pickup availability`, `Service area`.
   - **Utility:** Provides real-style CPCB/SPCB authorized recycler entries across Indian industrial clusters.
   - **Integration Status:** Integrated in `backend/app/ai_service.py`.
3. **`dataset/transaction_dataset_large.csv`** (20,002 rows):
   - **Columns:** `Lot ID`, `Material`, `Weight`, `Quoted price`, `Final price`, `Recycler`, `Status`, `Date/time`, `Location`, `Payment status`.
   - **Utility:** Contains thousands of completed transactions with realistic weights, price variances, and payment statuses. Can seed analytics, transaction ledgers, and fraud detection.
   - **Integration Status:** Not yet ingested into the database models; currently static.
4. **`dataset/balanced_waste_images/`**:
   - Contains classified reference images for training/testing computer vision models.

### 3.2 AI Service (`backend/app/ai_service.py` & `Ai/`)
- **PyTorch Model:** `Ai/SIH_2026-main/model/ewaste_classifier.pt` contains a trained `SmallCNN` (256-d bottleneck with AdaptiveAvgPool2d) for multi-class e-waste identification.
- **Inference Pipeline:** Accepts image bytes, runs validation via `file_security.py`, computes softmax probabilities, and classifies into confidence tiers (`high` $\ge 80\%$, `medium` $\ge 50\%$, `low` $< 50\%$).
- **Working Status:** Completely functional, tested in `test_lot_flow.py`.

### 3.3 Database & Models (`backend/app/models.py`)
- **Existing Tables:**
  - `users`: Collector, Recycler, Admin accounts.
  - `login_audits`: Authentication attempt logging.
  - `materials`: Master catalog of scrap categories and hazard flags.
  - `lots`: Scrap lots with quantity, estimated value, status (`created`, `offers`, `pickup`, `handed_over`, `payment_completed`).
  - `recyclers`: Recycler directory and authorization status.
  - `offers`: Recycler offers submitted to collector lots.
  - `handover_records`: Handover record with final weight, signatures, lat/long, and status.
  - `resolved_anomalies`: Anomaly resolution tracker.
  - `document_types`, `organization_documents`, `document_audit_logs`: CPCB compliance document management.
- **Gaps Identified:**
  - Lacks dedicated `Payment` and `EarningsLedger` models (payments are currently implicit in lot/handover status).
  - Lacks `CollectorReputation` table (reputation is currently calculated on-the-fly from handovers).
  - Lacks `OTP` validation columns / table on `handover_records`.
  - Lacks spatial PostGIS geometry columns (currently uses separate float `latitude`/`longitude`).

---

## 4. Feature Assessment Matrix

### 4.1 Working Features
1. **AI Material Classification:** PyTorch inference with top predictions and tiered confidence (`/api/ai/predict`).
2. **Regional Price Valuation:** Dynamic lookup of median/min/max prices across Indian cities (`/api/prices/estimate`, `/api/prices/benchmarks`).
3. **Recycler Matching:** Ranked list of authorized recyclers based on material, location, pickup, and authorization.
4. **End-to-End Lot Lifecycle:** Lot creation -> Recycler offer -> Offer acceptance -> Handover confirmation.
5. **Verifiable Recycling Passport:** SHA-256 certificate hashing, ESG calculations ($1.44\text{ kg CO}_2$ saved/kg, $0.12\text{ kg}$ toxic heavy metals diverted), and pure SVG QR generation (`/api/passport/{ref}`).
6. **Statutory CPCB Document Portal:** Multi-tier document upload with magic byte inspection, virus scanning heuristics, and admin verification workflow (`/api/documents/`).
7. **Admin Dashboard:** Platform metrics, anomaly detection (weight discrepancies $> 10\%$, price deviations), and CPCB authorization toggling (`/api/admin/metrics`, `/api/admin/anomalies`).
8. **1-Click SIH Live Demo Simulator:** Orchestrates an automated 7-step transaction generating a live verifiable passport in seconds (`/api/demo/run-workflow`).
9. **Vernacular Safety Guidance:** Trilingual contextual hazard advisories in English, Hindi, and Marathi with Do's and Don'ts (`/api/safety/guidance`).

### 4.2 Partial Features
1. **Authentication:** Currently uses local JWT + bcrypt + phone OTP in-memory store. Needs official Firebase Authentication ID token verification bridge.
2. **Payment Tracking:** Payment completion transitions lot status to `payment_completed`, but lacks an explicit cash-first payment record, physical cash receipt acknowledgment, and breakdown of cash vs UPI payments.
3. **Earnings Ledger:** Mobile app has an earnings screen, but backend lacks a dedicated `/api/collector/{id}/earnings` ledger aggregating daily/weekly/monthly earnings and pending dues.
4. **Handover Verification:** Handover stores weights and signatures, but lacks a secure time-limited 6-digit OTP generated for the collector and entered by the recycler at physical scale time.
5. **Offline Synchronization:** Web frontend has localStorage mutation queue; Mobile has `LOCAL_CREATED` -> `PENDING_SYNC` -> `SYNCED` state in Flutter, but mobile lacks Drift SQLite persistence.
6. **Price Explanation ("Why this price?"):** Backend calculates median, min, max, but does not provide an itemized mathematical breakdown (base median + demand adjustment + regional adjustment).

### 4.3 Missing Features (SIH26229 Requirements)
1. **Spoken Price Board (TTS):** Spoken audio in Hindi and Marathi using Flutter TTS for low-literacy collectors.
2. **Interactive Map Display:** Integration with Leaflet (web) and flutter_map (mobile) showing collector and recycler coordinates with OSRM routing.
3. **Collector Reputation Passport:** Separate formalization score profile displaying weight accuracy %, on-time handovers %, total kg formalized, and recycler star rating.
4. **Cloudinary Image Upload Pipeline:** Camera -> resize -> compress -> Cloudinary CDN with fallback to local secure storage.
5. **PostGIS Spatial Queries:** PostgreSQL ST_DWithin and ST_Distance queries for geographic matching within radius (e.g. 20 km).
6. **Firebase Cloud Messaging (FCM):** Push notification hooks for new offers, accepted bids, and verified handovers.

---

## 5. Security & Technical Debt Audit

### 5.1 Security Audit Findings
- **Strengths:**
  - `file_security.py` enforces strict magic bytes detection, filename sanitization, double-extension blocking, and SVG XML bomb prevention.
  - Security headers middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS, Referrer-Policy) is active in `main.py`.
  - Rate limiting is present on authentication endpoints.
  - Passwords hashed with bcrypt and bounded to 72 bytes.
- **Vulnerabilities / Gaps to Address:**
  - OTPs in `backend/app/routers/auth.py` are held in an in-memory dictionary (`OTP_STORE`). In production, Redis or a database table with rate-limiting and expiration must manage OTPs.
  - Firebase token verification needs to be plugged into `get_current_user` so clients can authenticate via Firebase while FastAPI handles role-based authorization.
  - Database fallback to SQLite is convenient for development, but production configuration must enforce PostgreSQL + PostGIS.

### 5.2 Performance & Low-Bandwidth Considerations
- **Bundle Size:** Web bundle builds to 564 kB JS and 148 kB CSS. Code-splitting via dynamic `import()` will optimize low-bandwidth mobile browser delivery.
- **Image Compression:** Collector uploads must be client-side resized and compressed (< 500 KB) before network transmission to save mobile cellular data.

---

## 6. Recommended Phase-Wise Implementation Order

Based on the audit, the optimal implementation roadmap aligns with the master prompt's priorities:

1. **PHASE 1 — Baseline Audit & Compliance Documentation (Current Phase):**
   - Create `docs/IMPLEMENTATION_AUDIT.md`.
   - Create `docs/SIH26229_COMPLIANCE.md`.
   - Update `docs/Phase.md` and `docs/memory.md`.

2. **PHASE 2 — Core P0 Enhancements:**
   - **Firebase Authentication Bridge:** Integrate Firebase ID token verification dependency alongside local JWT fallback in `app/auth.py`.
   - **Cash-First Payment & Earnings Ledger:** Add `Payment` and `EarningsLedger` models, `/api/collector/{id}/earnings` endpoint, and daily/weekly/monthly breakdown.
   - **Explainable Pricing ("Why this price?"):** Expose itemized price factor breakdowns and historical 7-day/30-day trends.
   - **Spoken Price Board:** Implement Flutter TTS with Hindi and Marathi vocalization.
   - **Unit Economics & Provenance:** Create `docs/UNIT_ECONOMICS.md` and `docs/DATA_PROVENANCE.md`.

3. **PHASE 3 — Spatial, Matching & Handover (P1):**
   - **PostGIS & Maps:** PostGIS spatial coordinates and Leaflet / flutter_map integration with OpenStreetMap.
   - **Recycler Matching Formula:** Configurable weights (Material 40%, Price 25%, Distance 15%, Capacity 10%, Reliability 10%).
   - **Secure OTP Handover & Weight Reconciliation:** 6-digit expiring OTP verification, $\pm 5\%$ tolerance calculation, and audit trail.
   - **Collector Reputation Profile:** Dedicated reputation score card (`REV-COL-XXXX`).
   - **Cloudinary Image Pipeline:** Low-bandwidth image optimization and upload.

4. **PHASE 4 — Quality, Testing & Hardening:**
   - Expanded Pytest suite covering OTP, Earnings, and Payments.
   - Flutter tests covering TTS and offline workflows.
   - Playwright end-to-end transaction test.
   - Performance benchmarks documented in `docs/PERFORMANCE.md`.
   - Security documentation in `docs/SECURITY.md`.

5. **PHASE 5 — SIH Judging Demo & Final Package:**
   - Seed data with 5+ collectors, 5+ recyclers, and synthetic transaction histories.
   - Create `docs/SIH_DEMO.md` and `docs/FINAL_AUDIT.md`.
   - Update `README.md` with complete architecture and demonstration walkthrough.
