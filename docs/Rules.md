# `RULES.md`

Below is the **engineering rules document** I recommend locking for ReVive. It defines what the team should use, what to avoid, library choices, error handling, AI boundaries, security, data rules, and SIH scope boundaries.

````markdown
# ReVive — Engineering Rules

> **Giving E-Waste a Second Life**

This document defines the development standards, technology boundaries,
AI limitations, error-handling strategy, dependency rules, security
requirements, and implementation principles for the ReVive platform.

---

# 1. Purpose

ReVive is an AI-assisted, offline-first e-waste marketplace and
traceability platform connecting informal collectors with verified
authorized recyclers.

The engineering goal is:

> Build a reliable, simple, explainable and demonstrable SIH prototype
> without unnecessary technical complexity.

---

# 2. Golden Rules

## RULE-01 — Working Product > Complex Architecture

Always prioritize a working end-to-end transaction flow over additional
technology.

Priority:

    Working Feature
        >
    Reliable Feature
        >
    Explainable Feature
        >
    Advanced Feature

Do NOT add technology simply because it sounds impressive.

---

## RULE-02 — SIH Scope Comes First

Every feature must be classified as:

- P0 — Must Have
- P1 — Should Have
- P2 — Advanced

P2 features must never block P0 functionality.

---

## RULE-03 — Keep the Backend Modular

Use a modular monolith for the SIH prototype.

DO:

    FastAPI
      ├── auth
      ├── collectors
      ├── lots
      ├── prices
      ├── recyclers
      ├── offers
      ├── transactions
      ├── handover
      ├── payments
      └── AI

DO NOT create a microservice for every feature.

---

# 3. Approved Technology Stack

## Mobile

Use:

- Flutter
- Dart

Purpose:

- Collector Android application
- Offline operation
- Camera
- GPS
- Localized interface

---

## Backend

Use:

- Python
- FastAPI
- Pydantic
- SQLAlchemy

Purpose:

- REST API
- Business logic
- Validation
- Authentication
- Database access
- AI inference integration

---

## Database

Use:

- PostgreSQL

Purpose:

- Users
- Collectors
- Recyclers
- Lots
- Offers
- Transactions
- Payments
- Traceability
- Price history

---

## Local Mobile Database

Use:

- SQLite

Purpose:

- Offline lots
- Cached data
- Sync queue
- Local application state

---

## Recycler/Admin Web

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router

---

## AI/ML

Use:

- Python
- PyTorch
- Torchvision
- scikit-learn
- NumPy
- Pandas
- Pillow
- OpenCV

---

## Development

Use:

- VS Code
- Git
- GitHub
- Postman
- Swagger/OpenAPI

---

# 4. Approved Python Libraries

## Backend

Preferred:

    fastapi
    uvicorn
    pydantic
    pydantic-settings
    sqlalchemy
    psycopg
    python-jose
    passlib / bcrypt
    python-multipart

---

## Data

Preferred:

    pandas
    numpy

---

## Machine Learning

Preferred:

    torch
    torchvision
    scikit-learn

---

## Image Processing

Preferred:

    pillow
    opencv-python

---

## Testing

Preferred:

    pytest
    httpx

---

# 5. Approved Flutter Packages

Use only packages that directly support a ReVive requirement.

Recommended categories:

    camera
    image_picker
    geolocator
    sqflite
    path_provider
    connectivity_plus
    http / dio
    qr_flutter
    mobile_scanner
    flutter_localizations

Use stable and actively maintained packages.

Before adding a new package, ask:

1. Is it actually required?
2. Can Flutter/Dart already do this?
3. Does it increase APK size significantly?
4. Is it actively maintained?
5. Does it work on Android entry-level devices?
6. Does it support offline operation?

If the answer is no, do not add it.

---

# 6. Approved Frontend Libraries

For React:

    react
    react-router-dom
    axios
    tailwindcss
    recharts

Do not add multiple libraries for the same purpose.

For example:

    ❌ Chart.js + Recharts + ApexCharts

Choose one.

---

# 7. What NOT to Use

The following technologies are outside the SIH MVP unless a clear
requirement appears.

## Avoid

- Blockchain
- Web3
- Cryptocurrency
- Microservices
- Kubernetes
- Kafka
- Redis for unnecessary caching
- GraphQL
- Complex event-driven architecture
- Elasticsearch
- Large-scale distributed systems
- IoT weighing hardware
- Real-time bidding infrastructure
- Complex payment gateways
- Facial recognition
- Generative AI for core decisions

These technologies add complexity without solving the primary problem.

---

# 8. AI Boundary Rules

AI is an assistant.

AI is NOT the authority.

This is one of the most important rules in ReVive.

---

## AI RULE-01 — AI Must Not Make Irreversible Decisions

AI must NOT independently:

- finalize a transaction
- determine the final payable amount
- approve a recycler
- reject a collector
- verify legal authorization
- certify that material is safe
- classify hazardous material with legal certainty
- release payment
- accuse a recycler of fraud

AI outputs must be treated as recommendations or predictions.

---

# 9. Material Classification Boundary

AI may suggest:

    PCB — 91%
    Cable — 5%
    LCD — 2%
    Other — 2%

The user must be able to confirm or correct the result.

Correct flow:

    Image
      ↓
    AI Prediction
      ↓
    Confidence
      ↓
    Collector Confirmation
      ↓
    Final Category

NOT:

    Image
      ↓
    AI
      ↓
    Automatically finalized transaction

---

# 10. AI Confidence Rules

Use confidence thresholds.

Example:

    Confidence >= 80%
        → Show recommendation

    Confidence 50–79%
        → Show recommendation + warning

    Confidence < 50%
        → Ask for manual classification

These thresholds are configurable and must be validated experimentally.

Do not claim that a model is reliable simply because it produces a
confidence score.

---

# 11. AI Explainability

The UI should communicate:

    "AI suggests: PCB"

rather than:

    "This is definitely PCB."

Use terminology such as:

- Suggested
- Estimated
- Predicted
- Recommended
- Confidence

Avoid:

- Guaranteed
- Certified by AI
- Legally verified by AI
- Exact price

---

# 12. AI Dataset Rules

Every ML dataset must document:

- Source
- Number of samples
- Categories
- Collection method
- Labeling method
- Train/test split
- Known limitations
- Data quality
- Class imbalance

Do not claim a model is production-ready if the dataset is only a small
prototype dataset.

---

# 13. AI Image Rules

Images must be:

- resized before inference
- normalized according to model requirements
- validated for format
- checked for corruption
- compressed where appropriate

Do not upload unnecessarily large images.

---

# 14. AI Model Selection

Prefer lightweight models.

Recommended:

    MobileNet
    EfficientNet-Lite
    ResNet18

For the Android use case:

    Accuracy
       +
    Inference Speed
       +
    Model Size
       +
    Memory Usage

must be considered together.

A larger model is NOT automatically better.

---

# 15. Price Estimation Rules

The system must distinguish:

### 1. Market Benchmark

General observed market price.

### 2. Estimated Value

System-generated estimate.

### 3. Recycler Offer

Actual price offered by a recycler.

### 4. Final Transaction Price

Price agreed/verified during the transaction.

These values must never be treated as identical.

---

## Example

    Market Range:
    ₹165–₹195/kg

    Estimated Value:
    ₹1,800

    Recycler Offer:
    ₹190/kg

    Final Price:
    ₹1,880

Each value must have its own field.

---

# 16. Price AI Boundary

The price engine must NOT claim:

    "You will definitely receive ₹1,900."

Instead:

    "Estimated value: ₹1,700–₹1,950."

The final price is determined by the actual transaction.

---

# 17. Recycler Verification Rules

AI cannot verify recycler authorization.

Authorization must be based on:

- submitted information
- appropriate documentation
- administrative verification
- trusted/official sources where available

AI may assist with:

- matching
- ranking
- filtering

AI must not declare:

    "This recycler is legally authorized."

unless the authorization has actually been verified.

---

# 18. Recycler Matching Rules

The matching engine may rank recyclers using:

    Authorization
    Material compatibility
    Location
    Distance
    Offered price
    Pickup availability
    Service area
    Historical reliability

However:

    Ranking ≠ Authorization

and:

    Recommendation ≠ Mandatory Selection

The collector should retain the ability to choose.

---

# 19. Anomaly Detection Rules

Anomaly detection identifies unusual transactions.

Example:

    Normal PCB:
    ₹160–₹200/kg

    New transaction:
    ₹20/kg

    Result:
    ⚠️ Potential anomaly

This must NOT become:

    "Recycler is fraudulent."

Correct:

    "Transaction value is outside the expected range.
     Review recommended."

---

# 20. Error Handling Philosophy

Errors must be:

- predictable
- recoverable
- user-friendly
- logged
- understandable

Never expose raw stack traces to users.

---

# 21. API Error Format

All backend errors should follow a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "LOT_NOT_FOUND",
    "message": "The requested lot could not be found."
  }
}
````

---

# 22. Error Codes

Use meaningful error codes.

Examples:

```
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
LOT_NOT_FOUND
LOT_INVALID_STATE
MATERIAL_INVALID
IMAGE_UPLOAD_FAILED
AI_INFERENCE_FAILED
PRICE_DATA_UNAVAILABLE
RECYCLER_NOT_FOUND
RECYCLER_NOT_VERIFIED
OFFER_EXPIRED
OFFER_ALREADY_ACCEPTED
HANDOVER_INVALID
PAYMENT_FAILED
SYNC_FAILED
NETWORK_UNAVAILABLE
```

---

# 23. Never Swallow Exceptions

Bad:

```python
try:
    process_transaction()
except:
    pass
```

Never silently ignore errors.

Correct:

```python
try:
    process_transaction()
except TransactionError as exc:
    logger.error(
        "Transaction processing failed",
        exc_info=exc
    )
    raise
```

---

# 24. User-Facing Errors

Technical:

```
HTTP 500
Database connection refused
```

User-facing:

```
"Something went wrong.
 Please try again."
```

For offline situations:

```
"Internet connection unavailable.
 Your lot has been saved and will sync later."
```

---

# 25. Offline Error Handling

Offline operation must never silently lose user data.

Example:

```text
Collector creates lot
       ↓
Internet unavailable
       ↓
Save to SQLite
       ↓
Add to Sync Queue
       ↓
Show:
"Saved offline"
       ↓
Internet returns
       ↓
Sync
       ↓
Server confirms
       ↓
Mark SYNCED
```

---

# 26. Sync Retry Rules

Failed synchronization should use controlled retries.

Example:

```
Attempt 1
   ↓
Failed
   ↓
Retry
   ↓
Failed
   ↓
Retry later
```

Do not continuously retry in a tight loop.

After repeated failures:

```
SYNC_FAILED
```

and show the user that the item is still stored locally.

---

# 27. Data Validation

Validate data at both:

### Client

For better user experience.

### Server

For security and data integrity.

Never trust client-side validation alone.

---

# 28. Required Validation

Examples:

### Weight

```text
weight > 0
```

Reject:

```
-5 kg
0 kg
"ten kilograms"
```

---

### Price

```text
price >= 0
```

---

### Location

Validate:

```text
latitude
longitude
```

within valid geographic ranges.

---

### Material

Material must belong to an approved category.

---

# 29. Database Rules

Use:

* primary keys
* foreign keys
* unique constraints
* indexes
* NOT NULL where appropriate
* CHECK constraints where appropriate
* transactions for multi-step operations

Do not rely exclusively on application code for data integrity.

---

# 30. ID Rules

Every important entity must have a unique identifier.

Examples:

```text
Collector:
COL-000184

Lot:
RV-2026-000184

Transaction:
TXN-2026-000184

Handover:
HO-2026-000184

Recycler:
REC-000042
```

IDs must not contain unnecessary personal information.

---

# 31. Transaction Rules

A transaction must follow a controlled state machine.

Allowed:

```
CREATED
  ↓
OFFERED
  ↓
ACCEPTED
  ↓
HANDOVER
  ↓
CONFIRMED
  ↓
PAYMENT_COMPLETED
  ↓
RECYCLED
```

Do NOT allow arbitrary state changes.

Example:

```
CREATED → RECYCLED
```

must be rejected.

---

# 32. Payment Boundary

For the SIH MVP, ReVive records payments.

It does NOT need to become a banking platform.

Supported:

```
Cash
UPI reference
Manual payment confirmation
```

Avoid building a full payment gateway unless specifically required.

---

# 33. Security Rules

Never:

* hard-code secrets
* commit API keys
* commit passwords
* commit JWT secrets
* commit database credentials

Use:

```
.env
```

and environment variables.

---

# 34. Git Rules

Never commit:

```text
.env
*.key
*.pem
password files
database credentials
private documents
large raw datasets
model checkpoints unnecessarily
```

Use:

```text
.gitignore
```

---

# 35. Authentication Rules

Use:

* JWT
* secure password hashing
* token expiry
* role-based authorization

Every protected API must verify authentication.

Authentication:

```
Who are you?
```

Authorization:

```
What are you allowed to do?
```

These are different concepts.

---

# 36. Authorization Rules

Collector:

```
Can access own data.
```

Recycler:

```
Can access own profile,
assigned/available marketplace data,
own offers,
own transactions.
```

Admin:

```
Can access administrative resources.
```

Never trust a client-provided:

```
user_id
recycler_id
collector_id
```

without verifying ownership/permissions on the server.

---

# 37. Privacy Rules

Collect the minimum necessary personal data.

Avoid collecting unnecessary:

* Aadhaar numbers
* PAN numbers
* bank credentials
* sensitive personal information
* exact home addresses

unless a genuine requirement exists.

---

# 38. Logging Rules

Log:

* errors
* important state changes
* synchronization failures
* authentication failures
* administrative actions

Do NOT log:

* passwords
* authentication tokens
* sensitive payment credentials
* unnecessary personal information

---

# 39. API Design Rules

Use consistent REST conventions.

Example:

```
GET    /api/lots
POST   /api/lots
GET    /api/lots/{id}
PATCH  /api/lots/{id}
```

Avoid inconsistent endpoints such as:

```
/getAllLotsNow
/createNewLotData
/doOfferThing
```

---

# 40. API Versioning

Use:

```
/api/v1/
```

Example:

```
/api/v1/lots
/api/v1/recyclers
/api/v1/transactions
```

This allows future API evolution.

---

# 41. Frontend Rules

Prefer:

* reusable components
* clear navigation
* simple state management
* centralized API handling
* consistent error messages

Avoid:

* duplicated UI code
* deeply nested widgets/components
* unnecessary animations
* excessive dependencies

---

# 42. Collector UX Rules

The collector experience is the highest priority.

Always prefer:

```
One clear action
```

over:

```
Multiple technical choices
```

Example:

Good:

```
📷 Sell Scrap
```

Bad:

```
Create Material Classification Lot
```

---

# 43. Low-Literacy Rules

Use:

* icons
* large buttons
* simple language
* Hindi
* Marathi
* audio
* visual confirmation

Avoid:

* technical terminology
* long paragraphs
* complicated forms
* tiny buttons
* unnecessary dropdowns

---

# 44. Language Rules

Do not hard-code user-facing strings.

Bad:

```dart
Text("Add Scrap")
```

Preferred:

```dart
Text(AppLocalizations.of(context)!.addScrap)
```

All supported languages should use localization resources.

---

# 45. UI Rules for Entry-Level Android

Avoid:

* heavy animations
* video backgrounds
* unnecessary gradients
* huge images
* excessive shadows
* memory-heavy widgets

Prioritize:

* fast startup
* responsive buttons
* small image sizes
* low memory usage
* simple navigation

---

# 46. Image Upload Rules

Before uploading:

1. Validate image.
2. Resize.
3. Compress.
4. Generate local reference.
5. Store offline if necessary.
6. Upload when connectivity exists.

Never upload the original full-resolution image unless required.

---

# 47. Dependency Rules

Before adding a library:

```text
Need?
  ↓
Existing library?
  ↓
Flutter/Python native solution?
  ↓
Maintenance status?
  ↓
Security?
  ↓
APK/server impact?
  ↓
Approved
```

Every dependency has a maintenance cost.

---

# 48. Dependency Restrictions

Do not add a library merely because:

* it is popular
* someone used it in another project
* it has many GitHub stars
* it makes the README look impressive

A dependency must solve a real ReVive requirement.

---

# 49. Testing Rules

Minimum testing levels:

### Unit Tests

Test:

* price calculations
* matching score
* transaction state changes
* validation
* sync logic

### API Tests

Test:

* authentication
* lot creation
* offers
* transactions
* handover
* payments

### Manual Mobile Tests

Test:

* camera
* GPS
* offline mode
* Hindi
* Marathi
* low-end Android
* synchronization

---

# 50. AI Testing Rules

Measure at minimum:

* Accuracy
* Precision
* Recall
* F1-score
* Confusion matrix

For classification, report performance per class where possible.

Do not report only:

```
"AI Accuracy = 95%"
```

without explaining:

* dataset size
* test set
* classes
* evaluation method

---

# 51. AI Failure Handling

If AI inference fails:

```text
AI unavailable
       ↓
Manual material selection
       ↓
Continue transaction
```

AI failure must not stop the marketplace.

---

# 52. Database Failure Handling

If the backend cannot reach PostgreSQL:

Return:

```text
DATABASE_UNAVAILABLE
```

Do not expose:

* SQL queries
* database host
* stack traces
* internal credentials

---

# 53. Network Failure Handling

If network fails:

```text
Network Error
      ↓
Check Offline Capability
      ↓
Save locally where possible
      ↓
Retry later
```

Do not repeatedly show:

```
"Something went wrong."
```

Give actionable information.

---

# 54. Marketplace Boundaries

ReVive is not a general-purpose marketplace.

Primary scope:

```
E-WASTE
```

Initial categories:

```
PCB
Cable
LCD / Display
Battery
CRT
Motor / Magnet Assembly
Mixed Plastic
Other E-Waste
```

Do not expand into every scrap category during the SIH sprint.

---

# 55. Geographic Scope

For the prototype:

Use a limited demonstration geography.

Example:

```
One city
or
One/two pilot regions
```

The architecture should support expansion later.

Do not fabricate nationwide recycler coverage.

---

# 56. Recycler Data Rules

A recycler must have:

* name
* facility location
* materials accepted
* authorization status
* contact information
* offered rates where available
* pickup availability
* service area

Unknown information must be represented as:

```
UNKNOWN
```

not fabricated.

---

# 57. Price Data Rules

Every price record should have:

* material
* location
* date
* price
* unit
* source

Never present old data as current without clearly showing its date.

---

# 58. Demo Data Rules

Seed data may be used for the SIH demonstration.

However:

```
DEMO DATA ≠ REAL-WORLD VERIFIED DATA
```

Clearly label seeded/demo recyclers and transactions where appropriate.

Do not claim a fictional recycler is officially authorized.

---

# 59. No Fake AI

Do not create a UI that says:

```
"AI Prediction: PCB"
```

if the backend is actually returning:

```
category = "PCB"
```

from a hard-coded rule.

If AI is demonstrated, it must actually run a trained model or a
documented prototype inference pipeline.

---

# 60. No Fake Verification

Do not display:

```
✓ Government Verified
```

unless the underlying verification has actually been performed.

For demo data use:

```
✓ Demo Verified
```

or clearly document the verification assumption.

---

# 61. No Fake Pricing

Do not claim:

```
"Live market price"
```

when using static seed data.

Use:

```
"Demo Market Data"
```

or:

```
"Prototype Price Dataset"
```

unless the data is actually refreshed from a valid source.

---

# 62. No Overclaiming

Never claim that ReVive:

* guarantees the highest price
* guarantees recycling
* guarantees recycler legality
* guarantees AI accuracy
* eliminates all intermediaries
* prevents all fraud
* certifies environmental compliance

The platform assists and records the process.

---

# 63. Documentation Rules

Every major module should have:

* purpose
* inputs
* outputs
* dependencies
* error cases
* limitations

AI modules additionally require:

* dataset description
* model architecture
* training method
* evaluation metrics
* limitations

---

# 64. Code Quality Rules

Prefer:

* meaningful names
* small functions
* typed models
* reusable services
* clear modules
* comments only where necessary

Avoid:

* giant functions
* duplicated logic
* magic numbers
* hard-coded credentials
* unexplained global state

---

# 65. Configuration Rules

Do not hard-code:

```text
API URLs
Database URLs
Secrets
Model paths
Storage credentials
```

Use environment configuration.

Example:

```text
DATABASE_URL
JWT_SECRET
API_BASE_URL
STORAGE_BUCKET
MODEL_PATH
```

---

# 66. Environment Separation

Maintain:

```text
Development
Testing
Production
```

At minimum for SIH:

```text
Development
Demo
```

Never use real production secrets in development.

---

# 67. Git Branch Rules

Recommended:

```text
main
develop
feature/*
fix/*
```

Example:

```text
feature/flutter-collector
feature/material-classifier
feature/recycler-portal
fix/offline-sync
```

---

# 68. Commit Rules

Use meaningful commit messages.

Good:

```
feat: add offline lot creation

feat: add recycler matching API

fix: handle failed image upload

ml: add PCB classification model
```

Bad:

```
update

changes

final

final2

final_final
```

---

# 69. Pull Request Rules

Before merging:

* code runs
* tests pass
* no secrets committed
* API still works
* no unnecessary dependencies
* feature documented
* SIH scope respected

---

# 70. Performance Boundaries

The SIH prototype should prioritize:

1. Reliability
2. Startup speed
3. API response time
4. Low memory usage
5. Small image sizes

Do not optimize prematurely.

Measure before introducing complex optimization.

---

# 71. Architecture Boundary

Use:

```text
Flutter
    ↓
FastAPI
    ↓
PostgreSQL
```

with:

```text
SQLite
AI/ML
Object Storage
```

around the core.

Do not introduce:

```text
Kafka
Redis
Kubernetes
Microservices
GraphQL
Event Bus
```

unless a genuine requirement emerges.

---

# 72. AI Architecture Boundary

The AI layer should be replaceable.

```text
Application
    │
    ▼
AI Service Interface
    │
    ├── Material Classifier
    ├── Price Estimator
    ├── Recycler Ranker
    └── Anomaly Detector
```

The application must not depend directly on the internal implementation
of the ML model.

---

# 73. AI Model Versioning

Every model should have:

```text
model_name
model_version
training_dataset_version
created_at
evaluation_metrics
```

Example:

```text
MaterialClassifier
v1.0
dataset-v1
F1: 0.89
```

---

# 74. Model Fallback

If the ML model is unavailable:

```text
AI unavailable
       ↓
Manual classification
       ↓
Continue
```

If price prediction is unavailable:

```text
Price model unavailable
       ↓
Historical benchmark
       +
Current recycler offers
       ↓
Continue
```

---

# 75. Human-in-the-Loop Rule

Human confirmation is mandatory for important decisions.

```text
AI
 ↓
Recommendation
 ↓
Human / System Validation
 ↓
Business Action
```

Not:

```text
AI
 ↓
Automatic irreversible action
```

---

# 76. Safety Boundary

ReVive provides informational safety guidance.

It does NOT provide:

* professional hazardous-material certification
* medical advice
* industrial safety certification
* legal certification

Safety content should be conservative and encourage appropriate
authorized handling.

---

# 77. Compliance Boundary

ReVive can record:

* recycler authorization information
* transaction records
* handover records
* traceability information

The platform must not claim that a digital record itself constitutes
legal certification unless legally verified.

---

# 78. Demo Reliability Rule

The SIH demonstration must have a fallback.

If live external services fail:

```text
Live API unavailable
       ↓
Local / seeded demo dataset
       ↓
Continue demonstration
```

The fallback must be clearly documented internally.

---

# 79. SIH Final Demo Rule

The primary demonstration must always be:

```text
Collector
   ↓
Photo
   ↓
AI Classification
   ↓
Weight
   ↓
Price Estimate
   ↓
Recycler Matching
   ↓
Offer
   ↓
Accept
   ↓
Handover
   ↓
Payment
   ↓
Digital Receipt
   ↓
Traceability
```

If time is limited, protect this flow first.

---

# 80. Feature Cut Order

If development time becomes limited, remove features in this order:

### First remove

* advanced analytics
* advanced AI models
* complex notifications
* advanced maps
* sophisticated anomaly detection

### Then simplify

* pickup scheduling
* multilingual audio
* advanced recycler ranking

### Never remove

* lot creation
* price discovery
* recycler matching
* offer
* transaction
* handover
* payment record
* traceability

---

# 81. Definition of Done

A feature is considered complete only when:

* frontend works
* backend works
* database works
* validation exists
* error handling exists
* loading state exists
* empty state exists
* failure state exists
* offline behavior is considered where applicable
* API is documented
* basic testing is completed

---

# 82. Final Engineering Principle

Every ReVive feature should answer:

```
Does this make e-waste collection:

Easier?
More transparent?
Safer?
More traceable?
More accessible?
```

If not, it probably does not belong in the SIH MVP.

---

# 83. Final Rule

> **Build the simplest system that convincingly demonstrates the complete
> formal recycling pathway for an informal e-waste collector.**

ReVive is not an AI project with a marketplace attached.

It is:

```
E-Waste Marketplace
       +
Price Intelligence
       +
Verified Recycler Network
       +
AI Assistance
       +
Offline Accessibility
       +
Digital Traceability
```

AI supports the system.

AI does not control the system.

````

### Recommended repository structure

I would keep these documents at the root:

```text
ReVive/
│
├── README.md
├── REQUIREMENTS.md
├── ARCHITECTURE.md
├── TECH_STACK.md
├── RULES.md              ← this file
│
├── mobile/
├── backend/
├── ml/
├── recycler-portal/
├── admin-portal/
├── database/
├── docs/
└── deployment/
````

**One rule I especially recommend enforcing:** don't let the team turn ReVive into an "AI everything" project. The **marketplace and traceability workflow are the product; AI is an assistive layer with explicit confidence, fallback, and human-confirmation boundaries.** This makes the system both more credible technically and much easier to defend before SIH judges.
