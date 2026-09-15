# ReVive Methodology and Technology Stack

## 1. Product methodology

ReVive follows a working-product-first delivery model. Instead of trying to build every capability at once, the project advances in stages that reflect real operational value:

1. Define the core workflow
2. Build the backend foundation
3. Validate the collector-to-recycler lifecycle
4. Add price and material intelligence
5. Support recycler operations and verification
6. Enable end-to-end transaction flow
7. Add offline-first resilience
8. Add digital handover and traceability
9. Layer in AI assistance only where it adds measurable value

This approach keeps the product grounded in a usable MVP and reduces the risk of building features without validating user behavior.

## 2. Design and engineering principles

The system is designed around a few practical principles:

- Human-first experience for informal and semi-formal waste collectors
- Clear state transitions across the lot lifecycle
- Strong separation between estimated value, recycler offer, and final transaction value
- Offline tolerance for low-connectivity environments
- Verified recycler onboarding rather than AI-only authorization decisions
- Traceability as a core product requirement, not a later add-on
- Local-language friendly UX with simple, icon-based workflows

## 3. Workflow-first architecture

The project is organized around the actual e-waste transaction lifecycle:

- Identify material
- Create lot
- Estimate value
- Receive offers
- Accept offer
- Handover to recycler
- Complete payment
- Record traceability

This lifecycle drives the API design, database model, and UI flow. The model is intentionally aligned to operational reality rather than abstract software patterns alone.

## 4. Technologies used

### Backend
- FastAPI
- Python
- SQLAlchemy ORM
- SQLite for local/dev iteration
- PostgreSQL for production-style deployment
- Pydantic validation and schemas

### Frontend
- React
- Vite
- TypeScript
- CSS for dashboard styling and responsive UI

### Mobile app
- Flutter
- Dart

### AI and data capabilities
- Python
- OpenCV
- scikit-learn
- NumPy
- Pandas
- Image-based material classification and valuation experiments for future phases

### Infrastructure and tooling
- Docker Compose
- Git version control
- Local environment-based configuration via environment files

## 5. Why these technologies

### FastAPI
FastAPI was chosen for the backend because it offers a fast way to build a clear REST API with typed validation, lightweight setup, and strong compatibility with Python-based ML workloads.

### SQLAlchemy
SQLAlchemy gives the project a clean ORM layer for lifecycle entities such as users, materials, lots, offers, recyclers, and handover records.

### React + Vite
The web workflow dashboard benefits from a simple, fast UI stack that is easy to iterate in a demo-focused environment while still supporting role switching and workflow states.

### Flutter
Flutter is used for the collector-facing mobile experience because it enables a consistent app experience across Android and iOS and supports a simple interface for fieldwork, image capture, and low-connectivity usage.

### Python ML stack
The AI layer is intentionally framed as assistive rather than authoritative. Python-based ML tooling is used where classification, matching, and valuation support the product without replacing human verification.

## 6. Current delivery focus

The current MVP emphasis is on the operational loop that proves value to users:

- create lot
- estimate material value
- receive recycler offers
- accept offer
- confirm handover
- complete payment
- create traceability record
- work reliably offline when network is weak

This is the core product proof for ReVive, and it remains the foundation for future AI or admin-scale features.

## 7. Summary

ReVive combines a workflow-first product strategy with a practical technology stack to solve a real-world problem: making e-waste collection and recycling more transparent, traceable, and efficient. The stack prioritizes speed of delivery, operational clarity, and real-world usability over over-engineering.
