# ReVive — Complete REST API Specification

> **Base URL (Local Development):** `http://127.0.0.1:8001/api` (or `http://localhost:8000/api`)  
> **Interactive Swagger UI:** `http://127.0.0.1:8001/docs`  
> **OpenAPI Schema:** `http://127.0.0.1:8001/openapi.json`  
> **Standard:** RESTful JSON with multipart support for image uploads  
> **Authentication:** Standard JWT Bearer Tokens (`Authorization: Bearer <token>`)

*Note: Environment variables for SMTP and AI services should be configured via `.env` (refer to `.env.example`).*

---

## 1. System & Health

### `GET /api/health`
Returns backend service operational status.
- **Response (200 OK):**
```json
{
  "status": "ok",
  "app": "ReVive",
  "environment": "development"
}
```

---

## 2. Artificial Intelligence & Computer Vision

### `POST /api/ai/predict`
Accepts a scrap photograph and estimates material category using the PyTorch deep learning classifier (`ewaste_classifier.pt`), returning tiered confidence recommendations, top predictions, regional valuation, and authorized recycler matches.
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Image file (`image/jpeg`, `image/png`, etc.)
  - `location`: City name (default: `"Bhopal"`)
  - `weight_kg`: Quantity in kilograms (default: `1.0`)
- **Response (200 OK):**
```json
{
  "category": "PCB",
  "confidence": 0.88,
  "confidence_tier": "high",
  "recommendation": "strong_suggestion",
  "location": "Bhopal",
  "weight_kg": 5.0,
  "top_predictions": [
    { "category": "PCB", "confidence": 0.88 },
    { "category": "Mobile", "confidence": 0.08 },
    { "category": "Keyboard", "confidence": 0.04 }
  ],
  "pricing": {
    "category": "PCB",
    "pricing_category": "PCB",
    "location": "Bhopal",
    "weight_kg": 5.0,
    "price_per_kg_median": 403.0,
    "estimated_value": 2015.0,
    "price_min": 1750.0,
    "price_max": 2250.0,
    "samples": 30
  },
  "recycler_matches": [
    {
      "recycler_id": 1,
      "recycler_name": "EcoCycle Bhopal Services",
      "location": "Bhopal",
      "accepted_materials": "PCB, Metal, Glass",
      "authorization_status": "Authorized",
      "pickup_availability": "Yes",
      "service_area": "Bhopal, Vidisha",
      "score": 5
    }
  ]
}
```

---

## 3. Pricing Intelligence & Regional Benchmarks

### `GET /api/prices/estimate`
Calculates regional valuation based on real market datasets.
- **Query Params:** `category=PCB&location=Bhopal&weight_kg=10`
- **Response (200 OK):**
```json
{
  "category": "PCB",
  "pricing_category": "PCB",
  "location": "Bhopal",
  "weight_kg": 10.0,
  "price_per_kg_median": 403.0,
  "estimated_value": 4030.0,
  "price_min": 3500.0,
  "price_max": 4500.0,
  "samples": 30
}
```

### `GET /api/prices/benchmarks`
Retrieves live benchmark median, min, and max rates per kg across material categories.
- **Response (200 OK):** Array of `BenchmarkCategoryRate` objects.

---

## 4. Recycler Discovery & Matching

### `GET /api/recyclers/match`
Finds nearest authorized recyclers based on material capability, geographic service area, and pickup availability.
- **Query Params:** `category=PCB&location=Bhopal&limit=5`
- **Response (200 OK):** Array of ranked `RecyclerMatchOut` objects.

### `GET /api/recyclers`
Lists registered recyclers.

### `POST /api/recyclers/{recycler_id}/verify`
Administrative verification toggle for CPCB statutory authorization.
- **Request Body:**
```json
{
  "verified": true,
  "cpcb_license": "CPCB-EW-001-REG",
  "notes": "Annual consent verified"
}
```

---

## 5. End-to-End Lot Transactions

### `POST /api/lots`
Registers a new e-waste lot.
- **Request Body:**
```json
{
  "collector_id": 1,
  "material_id": 2,
  "quantity_kg": 8.5,
  "photo_url": "https://example.com/scrap.jpg"
}
```

### `GET /api/lots` and `GET /api/lots/{lot_id}`
Fetches all lots or a single lot by ID with current lifecycle status (`created`, `offers`, `pickup`, `handed_over`, `payment_completed`).

### `POST /api/offers`
Recycler places a competitive bid on a lot.
- **Request Body:**
```json
{
  "lot_id": 101,
  "recycler_id": 1,
  "offer_price": 3400.0,
  "pickup_available": true
}
```

### `POST /api/offers/{offer_id}/accept`
Collector accepts an offer, transitioning the lot status to `pickup`.

### `POST /api/handover`
Executes two-party verified physical digital handover.
- **Request Body:**
```json
{
  "lot_id": 101,
  "collector_id": 1,
  "recycler_id": 1,
  "final_weight_kg": 8.4,
  "handover_location": "Govindpura Yard, Bhopal",
  "collector_confirmed": true,
  "recycler_confirmed": true,
  "signature": "SIG-REV-101-AUTH"
}
```

### `POST /api/lots/{lot_id}/payment`
Records settlement completion, moving status to `payment_completed`.

---

## 6. Verifiable Recycling Passport & Traceability

### `GET /api/passport/{reference_or_id}`
Public verification endpoint accepting numeric ID (e.g. `101`) or formatted reference (`REV-2026-LOT-0101`). Returns cryptographic SHA-256 certificate hash, environmental ESG metrics, QR code payload, and full audit chronology.
- **Response (200 OK):**
```json
{
  "passport_id": "REV-2026-LOT-0101",
  "lot_id": 101,
  "material_name": "PCB",
  "material_category": "Electronic",
  "is_hazardous": true,
  "initial_weight_kg": 8.5,
  "verified_weight_kg": 8.4,
  "collector_alias": "Collector #1 (Verified Kabadiwala)",
  "recycler_name": "EcoCycle Bhopal Services",
  "recycler_authorization": "CPCB/SPCB Authorized E-Waste Recycler",
  "status": "payment_completed",
  "certificate_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "co2_saved_kg": 12.24,
  "toxic_diverted_kg": 1.02,
  "qr_data": "REVIVE-PASSPORT|ID:REV-2026-LOT-0101|LOT:101|HASH:e3b0c44298fc1c14|STATUS:payment_completed",
  "timeline": [
    { "step": 1, "title": "Lot Catalogued", "completed": true },
    { "step": 2, "title": "Valuation & Matching", "completed": true },
    { "step": 3, "title": "Offer Acceptance", "completed": true },
    { "step": 4, "title": "Digital Handover", "completed": true },
    { "step": 5, "title": "Settlement & Recycling", "completed": true }
  ]
}
```

---

## 7. Occupational Safety Intelligence

### `GET /api/safety/guidance`
Returns trilingual contextual safety advisories, high-impact vernacular hazard slogans (*"तार मत जलाओ"*, explosion warnings), and actionable Do's and Don'ts.
- **Query Params (Optional):** `category=cable` or `category=battery`

---

## 8. Admin Governance & Statutory Compliance

### `GET /api/admin/metrics`
Aggregates live platform throughput, ESG environmental metrics, and CPCB recycler compliance ratios.
- **Response (200 OK):**
```json
{
  "total_lots": 14,
  "active_lots": 4,
  "completed_lots": 10,
  "total_weight_kg": 142.5,
  "total_turnover_inr": 48950.0,
  "co2_saved_kg": 182.88,
  "toxic_metals_diverted_kg": 15.24,
  "total_recyclers": 4,
  "verified_recyclers": 3,
  "recycler_verification_ratio": 0.75,
  "flagged_anomalies_count": 1
}
```

### `GET /api/admin/anomalies`
Inspects operational records for weight discrepancies ($>10\%$), pricing outliers, and unverified actors.

### `POST /api/admin/anomalies/{anomaly_id}/resolve`
Acknowledges and marks an operational anomaly as resolved.

---

## 9. SIH Live Demo Simulator

### `POST /api/demo/run-workflow`
Drives the full 7-step transaction loop in a single atomic operation, generating an active demonstration lot and verified Recycling Passport for live SIH judging.
- **Response (200 OK):**
```json
{
  "success": true,
  "lot_id": 105,
  "passport_id": "REV-2026-LOT-0105",
  "steps_completed": [
    "1. Material Catalogued & Scaled (14.5 kg Motherboard & Server PCB)",
    "2. Regional AI Price Benchmark Calculated (₹ 403/kg)",
    "3. Authorized CPCB Recycler Matched (EcoCycle India) with Offer of ₹ 6132.0",
    "4. Collector Accepted Competitive Recycler Offer",
    "5. Two-Party Digital Handover Verified (14.2 kg) with Signed Custody",
    "6. Instant Direct Payment Settled (₹ 6132.0)",
    "7. Tamper-Evident Recycling Passport & QR Code Generated (REV-2026-LOT-0105)"
  ],
  "certificate_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "qr_data": "REVIVE-PASSPORT|ID:REV-2026-LOT-0105|LOT:105|HASH:a591a6d40bf42040|STATUS:payment_completed"
}
```

---

## 10. Authentication & JWT Tokens

### `POST /api/auth/signup`
Registers a new user account with optional password, creates a unique statutory identifier (`REV-COL-2026-xxxx`, `REV-REC-2026-xxxx`, or `CPCB-GOV-2026-xxxx`), logs audit trail, and issues signed HS256 JWT access token.
- **Payload:**
```json
{
  "name": "Vikram Patel",
  "phone": "9876543210",
  "password": "SecurePassword123",
  "role": "recycler",
  "language": "en",
  "location": "Indore, MP",
  "company_name": "Patel Green Tech Pvt Ltd",
  "license_no": "CPCB/MP/2026/0091"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "custom_user_id": "REV-REC-2026-0001",
    "name": "Vikram Patel",
    "phone": "9876543210",
    "role": "recycler",
    "language": "en",
    "location": "Indore, MP",
    "company_name": "Patel Green Tech Pvt Ltd",
    "license_no": "CPCB/MP/2026/0091"
  },
  "is_new_user": false
}
```

### `POST /api/auth/login`
Authenticates registered user via mobile number or email + password, logs login audit, and issues signed JWT access token.
- **Payload:**
```json
{
  "phone_or_email": "9876543210",
  "password": "SecurePassword123"
}
```
- **Response (200 OK):** `TokenResponse` with JWT `access_token` and `user` profile.

### `POST /api/auth/send-otp`
Dispatches a 6-digit OTP to Indian mobile numbers (+91) or email addresses via Brevo SMTP.

### `POST /api/auth/verify-otp`
Verifies OTP code and returns signed JWT `access_token`, user status (`is_new_user`), and user profile.

### `GET /api/auth/me`
Retrieves currently authenticated user profile from `Authorization: Bearer <jwt_token>` header.
- **Header:** `Authorization: Bearer <token>`
- **Response (200 OK):** `UserProfileOut`
- **Error (401 Unauthorized):** When token is missing, expired, or invalid.

