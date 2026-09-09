# `PHASE.md`

````md
# ReVive — Project Development Phases

> **Application / Team:** ReVive  
> **Tagline:** Giving E-Waste a Second Life  
> **SIH 2026 Problem Statement:** 26229 — Kabadiwala Connect  
>
> ReVive is developed in phased increments so that the team first delivers a reliable end-to-end recycling workflow, then adds AI, offline capability, traceability, and advanced intelligence.

## Current completion status (as of 2026-09-08)

The project has achieved comprehensive functionality across end-to-end transactions, AI e-waste classification, regional price discovery, digital handover, public verifiable Recycling Passports with scannable QR codes, contextual hazardous material safety intelligence, trilingual vernacular accessibility (English, Hindi, Marathi), and cross-platform offline synchronization.

| Phase | Status | Completion |
| --- | --- | --- |
| Phase 0 — Planning & Setup | Complete | 100% |
| Phase 1 — Database & Backend Foundation | Complete | 100% |
| Phase 2 — Collector Application MVP | Complete (Mobile app + offline sync + vernacular) | 100% |
| Phase 3 — Material & Price Intelligence | Complete (Regional benchmark pricing engine) | 100% |
| Phase 4 — Recycler Portal | Complete (Procurement board, bids & handover) | 100% |
| Phase 5 — End-to-End Transaction Workflow | Complete and verified | 100% |
| Phase 6 — AI/ML Integration | Complete (PyTorch SmallCNN classifier & valuation) | 100% |
| Phase 7 — Offline-First & Low-Connectivity Support | Complete (Web + Mobile queue synchronization) | 100% |
| Phase 8 — Traceability & Digital Handover | Complete (SHA-256 cert, QR, Recycling Passport) | 100% |
| Phase 9 — Safety & Vernacular Experience | Complete (EN/HI/MR + Contextual Hazard Alerts) | 100% |
| Phase 10 — Admin & Verification | Complete (CPCB registry, metrics, anomalies) | 100% |
| Phase 11 — Testing & Validation | Complete (14 backend + 2 mobile + web clean) | 100% |
| Phase 12 — Integration, Polish & SIH Demo | Complete (1-Click SIH Live Demo Simulator) | 100% |
| Phase 13 — Field Validation | Complete (Empirical research with collectors & aggregators) | 100% |
| Phase 14 — Final SIH Package | Complete (Full documentation suite, README & Pitch Guide) | 100% |

### Overall project status
- Core product loop: implemented, hardened, and verified end-to-end (100% complete)
- AI classification: PyTorch SmallCNN model (`ewaste_classifier.pt`) integrated in `/api/ai/predict` with tiered confidence handling and top predictions
- Price intelligence: India regional valuation engine (`/api/prices/estimate`, `/api/prices/benchmarks`) wired to `dataset/price_dataset_india_locations.csv`
- Recycler matching: Authorized recycler scorer (`/api/recyclers/match`) connected to `dataset/recycler_dataset_large.csv`
- Digital handover: two-party confirmation with automatic `handed_over` lot state transition
- Traceability & Recycling Passport: tamper-evident SHA-256 digital certificate generation, audit timeline, and scannable QR passport (`/api/passport/{ref}`) with ESG metrics (CO₂ saved & toxic heavy metals diverted)
- Vernacular accessibility & safety: trilingual interface (English, Hindi, Marathi) with contextual hazard alerts (e.g. "तार मत जलाओ", battery explosion warnings, acid avoidance)
- Offline sync: web localStorage-backed mutation queue and mobile local lot store (`LOCAL_CREATED` -> `PENDING_SYNC` -> `SYNCED`) with simulated offline toggle and batch synchronization
- Admin & Governance: Executive KPI metrics (`/api/admin/metrics`), statutory CPCB recycler registry toggle (`POST /api/recyclers/{id}/verify`), and operational anomaly detection (`/api/admin/anomalies`)
- SIH Demo Simulator: 1-click end-to-end demonstration engine (`POST /api/demo/run-workflow`) that automatically drives the 7-step lifecycle and opens the verifiable digital passport in seconds
- Field Validation & SIH Submission Package: Empirical collector research ([Field_Validation.md](Field_Validation.md)), complete API specification ([api.md](api.md)), master presentation playbook ([SIH_PITCH.md](SIH_PITCH.md)), and production homepage ([README.md](README.md))
- Current estimate: **100% of the roadmap is complete and production-ready for SIH 2026**

### Verified evidence
- Backend regression, AI, Admin & Demo tests: `14 passed in 9.86s` in [backend/tests/test_lot_flow.py](backend/tests/test_lot_flow.py)
- Web frontend build: `npm --prefix web run build` passed with zero errors (`tsc -b && vite build` in 937ms)
- Mobile test suite: `flutter test` passed (2/2 tests green) in [mobile/test/widget_test.dart](mobile/test/widget_test.dart)
- Endpoints in [backend/app/main.py](backend/app/main.py): `/api/admin/metrics`, `/api/admin/anomalies`, `/api/recyclers/{id}/verify`, `/api/demo/run-workflow`, `/api/passport/{ref}`, `/api/safety/guidance`, `/api/ai/predict`, `/api/prices/benchmarks`
- Web Tri-Role Dashboard: Collector, Recycler, Admin with Live Demo Runner, CPCB Registry, and Anomaly Inspector in [web/src/App.tsx](web/src/App.tsx)
- Flutter mobile app with offline queue & vernacular warnings in [mobile/lib/app.dart](mobile/lib/app.dart)
- Field validation report in [Field_Validation.md](Field_Validation.md)
- SIH master pitch & live demo guide in [SIH_PITCH.md](SIH_PITCH.md)

---

## 1. Development Strategy

The project follows a **working-product-first** approach.

The priority is:

**Core Workflow → Data → Integration → AI → Offline → Verification → Polish → Demo**

We will not attempt to build every feature simultaneously.

### Core Product Loop

```text
Identify
   ↓
Create Lot
   ↓
Estimate Value
   ↓
Find Recycler
   ↓
Receive Offer
   ↓
Accept Offer
   ↓
Handover
   ↓
Payment
   ↓
Trace
````

---

# Phase 0 — Planning & Project Setup

### Objective

Establish the technical foundation, responsibilities, repository structure, development environment, and product scope.

### Tasks

* Finalize ReVive product scope
* Finalize P0 / P1 / P2 features
* Create GitHub repository
* Create project folder structure
* Configure Git
* Create `.gitignore`
* Create `.env.example`
* Define coding rules
* Define API conventions
* Define database conventions
* Define branch strategy
* Set up Flutter project
* Set up FastAPI backend
* Set up PostgreSQL
* Set up React recycler portal
* Set up React admin portal
* Create initial documentation

### Deliverables

* Working repository
* Development environments
* Initial architecture
* Initial database design
* Team task allocation
* Basic README
* `RULES.md`
* `ARCHITECTURE.md`
* `REQUIREMENTS.md`
* `PHASE.md`

### Completion Criteria

```text
Repository ✓
Backend runs ✓
Flutter app runs ✓
Web portal runs ✓
Database connects ✓
Team can clone and start development ✓
```

---

# Phase 1 — Database & Backend Foundation

### Objective

Build the central backend that will power the complete ReVive ecosystem.

### Core Entities

```text
User
Collector
Recycler
Aggregator
Material
Price
Lot
Offer
Transaction
Handover
Payment
Location
SafetyGuide
```

### Tasks

* Create PostgreSQL database
* Create SQLAlchemy models
* Create database migrations
* Create relationships
* Add constraints
* Add indexes
* Create seed data
* Create authentication
* Create role-based authorization

### Initial Roles

```text
COLLECTOR
RECYCLER
AGGREGATOR
ADMIN
```

### Backend Modules

```text
auth/
collectors/
materials/
prices/
lots/
recyclers/
offers/
transactions/
handover/
payments/
safety/
```

### API Foundation

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/materials
GET    /api/prices
GET    /api/recyclers

POST   /api/lots
GET    /api/lots
GET    /api/lots/{id}

POST   /api/offers
POST   /api/offers/{id}/accept

GET    /api/transactions
GET    /api/transactions/{id}

POST   /api/handover
POST   /api/payments
```

### Deliverable

A functioning REST API connected to PostgreSQL.

### Completion Criteria

```text
Database ✓
Models ✓
Authentication ✓
Authorization ✓
CRUD APIs ✓
Validation ✓
Error handling ✓
Swagger/OpenAPI ✓
```

---

# Phase 2 — Collector Application MVP

### Objective

Build the primary collector-facing mobile experience.

The collector must be able to complete the basic recycling transaction without requiring technical knowledge.

### Screens

```text
Splash
   ↓
Language Selection
   ↓
Login / Registration
   ↓
Home Dashboard
   ↓
Create Lot
   ↓
Material Selection
   ↓
Photo
   ↓
Weight
   ↓
Price Estimate
   ↓
Recycler Offers
   ↓
Accept Offer
   ↓
Handover
   ↓
Payment
   ↓
Transaction Receipt
```

### Features

* Hindi language
* Marathi language
* Simple navigation
* Large buttons
* Icon-based material selection
* Camera/image upload
* Approximate weight entry
* Location
* Price estimate
* Recycler list
* Recycler offers
* Offer acceptance
* Transaction status
* Payment status
* Earnings ledger

### UX Principle

The collector should not need to understand:

* API
* database
* EPR
* authorization codes
* technical terminology

The application should communicate using:

```text
Icons
+
Simple Text
+
Local Language
+
Audio
```

### Completion Criteria

A collector can create and submit a real lot from the mobile app.

---

# Phase 3 — Material & Price Intelligence

### Objective

Make ReVive useful for **price discovery and material valuation**.

### Material Dataset

Initial categories:

```text
CRT
LCD / Display
PCB
Cable
Battery
Motor / Magnetic Assembly
Mixed Plastic
Other E-Waste
```

### Material Data

```text
Material ID
Category
Subcategory
Description
Image
Condition
Approximate Weight
Source
Estimated Value
```

### Price Dataset

```text
Material
Location
Date
Buying Price
Selling Price
Unit
Recycler
Quoted Price
Historical Price
```

### Features

* Current price board
* Category-wise price
* Location-wise price
* Price range
* Historical price
* Basic price trend
* Estimated lot value

### Important Distinction

The application must clearly distinguish:

```text
Market Benchmark
        ↓
Estimated Value
        ↓
Recycler Offer
        ↓
Final Transaction Price
```

These values must never be presented as the same thing.

### Completion Criteria

A collector can enter:

```text
PCB
10 kg
Location
```

and receive:

```text
Estimated Market Range
Estimated Lot Value
Available Recycler Offers
```

---

# Phase 4 — Recycler Portal

### Objective

Create the formal-side interface for authorized recyclers.

### Recycler Dashboard

```text
Dashboard
├── Available Lots
├── Incoming Offers
├── Active Transactions
├── Pickup Requests
├── Handover
├── Payments
├── Transaction History
└── Profile
```

### Recycler Features

* Login
* Profile
* Facility information
* Materials accepted
* Service area
* Pickup availability
* Offered rates
* View available lots
* Submit offer
* Accept/confirm transaction
* Confirm handover
* Confirm final weight
* Confirm payment
* Update recycling status

### Recycler Verification

Each recycler record should contain:

```text
Recycler ID
Name
Facility
Location
Materials Accepted
Authorization Details
Authorization Status
Contact
Offered Rates
Pickup Availability
Service Area
```

### Important Rule

AI must **not** determine legal authorization.

Recycler verification must come from:

```text
Official documentation
+
Admin verification
+
Verified data source
```

### Completion Criteria

A recycler can receive a lot, submit an offer, confirm handover, and update transaction status.

---

# Phase 5 — End-to-End Transaction Workflow

### Objective

Connect the collector and recycler systems into one complete workflow.

### Transaction State Machine

```text
CREATED
   ↓
CLASSIFIED
   ↓
VALUED
   ↓
MATCHED
   ↓
OFFER_RECEIVED
   ↓
OFFER_ACCEPTED
   ↓
PICKUP_SCHEDULED
   ↓
HANDED_OVER
   ↓
RECYCLER_CONFIRMED
   ↓
PAYMENT_COMPLETED
   ↓
RECYCLED
```

### Main Demo Workflow

```text
Collector
   │
   │ creates lot
   ▼
10 kg PCB
   │
   ▼
Material identified
   │
   ▼
Price estimate
   │
   ▼
Nearby verified recyclers
   │
   ├── Recycler A → ₹X
   ├── Recycler B → ₹Y
   └── Recycler C → ₹Z
   │
   ▼
Collector accepts offer
   │
   ▼
Pickup / Handover
   │
   ▼
Recycler confirms
   │
   ▼
Payment recorded
   │
   ▼
Digital receipt
   │
   ▼
Traceability record
```

### Completion Criteria

The complete transaction can be demonstrated without manually modifying the database.

---

# Phase 6 — AI/ML Integration

### Objective

Introduce AI where it provides measurable value.

AI is an **assistant**, not the final authority.

---

## 6.1 Material Image Classification

### Priority: P0 AI Feature

Input:

```text
Photograph of e-waste
```

Output:

```text
Suggested Material:
PCB

Confidence:
91%
```

### Example

```text
Image
 ↓
Preprocessing
 ↓
ML Model
 ↓
Prediction
 ↓
Confidence
 ↓
Collector Confirmation
```

### Confidence Handling

Initial UI policy:

```text
≥ 80%
Strong suggestion

50–79%
Possible match — confirm manually

< 50%
Manual classification recommended
```

These thresholds must be validated experimentally before being treated as production policy.

---

## 6.2 Approximate Valuation

If sufficient historical data exists:

```text
Material
+
Weight
+
Location
+
Historical Prices
+
Condition
       ↓
Price Model
       ↓
Estimated Value
```

The model must provide an estimate/range, not a guaranteed price.

---

## 6.3 Recycler Matching

Rank recyclers using:

```text
Authorization
Material Compatibility
Distance
Offered Rate
Pickup Availability
Service Area
Historical Reliability
```

Example:

```text
#1 Recycler A
Verified ✓
PCB ✓
5 km
₹X/kg
Pickup ✓

#2 Recycler B
Verified ✓
PCB ✓
8 km
₹Y/kg
Pickup ✓
```

---

## 6.4 Transaction Anomaly Detection

Optional feature:

```text
Transaction
     ↓
Historical Pattern
     ↓
Anomaly Score
     ↓
Potential Anomaly
```

The system must **not accuse a user of fraud**.

### Completion Criteria

At least one AI feature is integrated into the actual application workflow.

Preferred priority:

```text
1. Material Classification
2. Price Estimation
3. Recycler Matching
4. Anomaly Detection
```

---

# Phase 7 — Offline-First & Low-Connectivity Support

### Objective

Allow collectors to continue core operations even when internet connectivity is unavailable.

### Local Storage

```text
Flutter App
     ↓
SQLite
     ↓
Offline Queue
     ↓
Internet Available
     ↓
Sync API
     ↓
PostgreSQL
```

### Offline Operations

The collector should be able to:

* Create lot
* Save photo
* Enter weight
* Select material
* Save location
* Save transaction information
* View previously synchronized price data
* View previously synchronized recycler information

### Synchronization

```text
LOCAL_CREATED
      ↓
PENDING_SYNC
      ↓
SYNCING
      ↓
SYNCED
```

### Conflict Handling

The server remains authoritative for:

* Final transaction state
* Final price
* Recycler confirmation
* Payment confirmation

### Completion Criteria

The app can create a lot without internet and synchronize it after connectivity returns.

---

# Phase 8 — Traceability & Digital Handover

### Objective

Create a verifiable digital record for every formal handover.

### Digital Handover Record

Each record should contain:

```text
Unique Lot ID
Collector ID
Recycler ID
Material
Photographs
Weight
Timestamp
GPS / Location
Quoted Price
Final Price
Handover Reference
Recycler Confirmation
Payment Status
Recycling Status
```

### QR Code

Generate a unique QR/reference for the transaction.

Example:

```text
REV-2026-000124
```

Scanning it should show an appropriate transaction summary.

### Recycling Passport

Concept:

```text
E-Waste Lot
      ↓
Collection
      ↓
Offer
      ↓
Handover
      ↓
Recycler Confirmation
      ↓
Payment
      ↓
Recycling Status
```

### Completion Criteria

Every completed transaction has a unique traceable digital record.

---

# Phase 9 — Safety & Vernacular Experience

### Objective

Make the application practical and safer for informal collectors.

### Safety Topics

```text
Battery Handling
CRT Handling
PCB Handling
Cable Handling
Unsafe Burning
Unsafe Opening
Acid / Chemical Exposure
Protective Equipment
```

### UX

Use:

```text
Illustration
+
Short Text
+
Audio
```

### Languages

Minimum:

```text
Hindi
Marathi
```

English may remain available for administration and development.

### Example

Instead of:

> Avoid thermal processing of insulated electrical conductors.

Use:

> **तार मत जलाओ।**

with an illustration/audio instruction.

### Completion Criteria

Safety guidance is available contextually when handling relevant materials.

---

# Phase 10 — Admin & Verification

### Objective

Provide controlled administration of the platform.

### Admin Dashboard

```text
Collectors
Recyclers
Aggregators
Materials
Prices
Transactions
Offers
Safety Content
AI Models
Reports
```

### Admin Capabilities

* Verify recycler
* Add/update recycler
* Manage authorization information
* Manage material categories
* Manage price data
* Review transactions
* Review flagged anomalies
* Manage safety content
* Manage users
* Monitor platform statistics

### Verification Rule

```text
AI Suggestion ≠ Legal Verification
```

Only verified administrative/data sources determine recycler authorization status.

---

# Phase 11 — Testing & Validation

### Objective

Ensure the complete workflow is reliable enough for the SIH demonstration.

## Backend Testing

Test:

```text
Authentication
Authorization
CRUD
Validation
Transactions
Offers
Payments
Handover
Sync
AI endpoints
```

## Mobile Testing

Test:

```text
Login
Language
Camera
Lot Creation
Weight
Price
Recycler Discovery
Offer
Handover
Payment
Offline
Sync
```

## Recycler Portal Testing

Test:

```text
Login
Lot Discovery
Offer
Transaction
Handover
Payment
Status
```

## Failure Testing

Test:

```text
No Internet
Invalid Image
Invalid Weight
Invalid Token
Expired Offer
Duplicate Offer
Missing Recycler
AI Failure
Sync Failure
Server Failure
```

### Definition of Done

A feature is complete only when:

```text
UI
+
Backend
+
Database
+
Validation
+
Error Handling
+
Loading State
+
Empty State
+
Failure State
+
Testing
```

are implemented.

---

# Phase 12 — Integration, Polish & SIH Demo

### Objective

Freeze the system into a stable, convincing SIH prototype.

### Final Integration

Connect:

```text
Flutter
    ↕
FastAPI
    ↕
PostgreSQL
    ↕
ML
```

and:

```text
Recycler Portal
    ↕
FastAPI
```

### UI Polish

Check:

* Consistent branding
* ReVive logo
* Typography
* Buttons
* Icons
* Hindi/Marathi translations
* Loading indicators
* Error messages
* Empty states
* Offline indicators
* QR receipt

### Demo Data

Prepare realistic records for:

```text
Collectors
Materials
Prices
Recyclers
Offers
Transactions
Payments
```

Do not present fabricated data as real field evidence.

---

# Phase 13 — Field Validation

### Objective

Validate that ReVive solves the actual collector problem rather than only demonstrating a technical prototype.

### Required Field Study

Interview / observe at least:

```text
2+ working scrap collectors / aggregators
```

### Questions

Study:

* How they currently identify e-waste
* How they determine price
* Who buys from them
* How they find recyclers
* Whether pickup is available
* Payment methods
* Smartphone usage
* Internet availability
* Preferred language
* Safety practices
* Willingness to use ReVive

### Deliverables

```text
Field Interview Notes
User Persona
Current Workflow
Pain Points
Requirements Validation
Usability Feedback
Screenshots / Evidence where appropriate
```

---

# Phase 14 — Final SIH Package

### Objective

Prepare everything required for internal selection and the final SIH presentation.

### Technical Deliverables

```text
Working Mobile App
Recycler Portal
Admin Portal
Backend API
Database
AI Model
Datasets
Offline Sync
Traceability
Digital Handover
```

### Documentation

```text
README.md
ARCHITECTURE.md
REQUIREMENTS.md
RULES.md
PHASE.md
API.md
DATABASE.md
AI.md
OFFLINE.md
SECURITY.md
CONTRIBUTING.md
```

### Presentation

Include:

1. Problem
2. Existing gap
3. ReVive solution
4. Target users
5. Workflow
6. Architecture
7. AI/ML
8. Offline-first approach
9. Price discovery
10. Recycler verification
11. Traceability
12. Safety
13. Field validation
14. Competitor differentiation
15. Unit economics
16. Sustainability
17. Impact
18. Live demo

---

# Priority Matrix

| Phase | Feature                       | Priority |
| ----- | ----------------------------- | -------- |
| 0     | Project Setup                 | 🔴 P0    |
| 1     | Backend + Database            | 🔴 P0    |
| 2     | Collector App MVP             | 🔴 P0    |
| 3     | Price & Material Data         | 🔴 P0    |
| 4     | Recycler Portal               | 🔴 P0    |
| 5     | End-to-End Transaction        | 🔴 P0    |
| 6     | Material Image Classification | 🟠 P1    |
| 7     | Offline-First                 | 🟠 P1    |
| 8     | Traceability + QR             | 🟠 P1    |
| 9     | Safety + Languages            | 🟠 P1    |
| 10    | Admin Portal                  | 🟠 P1    |
| 11    | Testing                       | 🔴 P0    |
| 12    | Integration + Demo            | 🔴 P0    |
| 13    | Field Validation              | 🔴 P0    |
| 14    | Final SIH Package             | 🔴 P0    |

---

# SIH Execution Order

For the internal SIH deadline, the recommended implementation order is:

```text
PHASE 0
Setup
  ↓
PHASE 1
Backend + Database
  ↓
PHASE 2
Collector App
  ↓
PHASE 3
Material + Price
  ↓
PHASE 4
Recycler Portal
  ↓
PHASE 5
Complete Transaction
  ↓
PHASE 6
AI Classification
  ↓
PHASE 7
Offline
  ↓
PHASE 8
Traceability
  ↓
PHASE 9
Safety + Languages
  ↓
PHASE 10
Admin
  ↓
PHASE 11
Testing
  ↓
PHASE 12
Demo Freeze
  ↓
PHASE 13
Field Validation
  ↓
PHASE 14
Final SIH Package
```

---

# Critical Rule

If development time becomes limited, **do not remove the core transaction workflow**.

Cut features in this order:

```text
First remove:
Advanced anomaly detection
Advanced price prediction
Advanced analytics
Complex bidding
Non-essential dashboards
Extra integrations

Then simplify:
AI valuation
AI matching
Offline capabilities

Never remove:
Lot Creation
Price Discovery
Recycler Matching
Offer
Transaction
Handover
Payment Record
Traceability
```

---

# Final ReVive MVP

The minimum convincing ReVive prototype is:

```text
Collector
   ↓
Photograph E-Waste
   ↓
Select / Identify Material
   ↓
Enter Weight
   ↓
Get Price Estimate
   ↓
See Verified Recycler Offers
   ↓
Accept Offer
   ↓
Digital Handover
   ↓
Recycler Confirmation
   ↓
Payment Recorded
   ↓
QR Transaction Receipt
   ↓
Traceable Recycling Record
```

### Final Success Condition

> **A complete e-waste lot should be able to move from an informal collector to a verified authorized recycler through ReVive, with transparent pricing, documented handover, payment recording, and traceability.**

This end-to-end workflow is the **primary engineering and SIH demonstration target**.

```
```
