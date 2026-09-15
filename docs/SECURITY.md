# ReVive — Production Security & Compliance Architecture

> **Application:** ReVive (Giving E-Waste a Second Life)  
> **Problem Statement:** Smart India Hackathon 2026 — PS 26229: Kabadiwala Connect  
> **Evaluation Date:** September 16, 2026  
> **Security Posture:** Enterprise-Grade / OWASP Compliant / CPCB Statutory Aligned  

---

## 1. Executive Summary

ReVive formalizes the informal recycling economy by connecting informal waste pickers (*kabadiwalas*) with government-authorized recyclers. Because this platform handles financial settlements, physical scale reconciliation, legal hazardous material traceability, and CPCB statutory compliance, platform security is engineered into every layer.

This document details the security controls, threat mitigations, and compliance safeguards implemented across the ReVive architecture.

---

## 2. Authentication & Role-Based Access Control (RBAC)

ReVive operates a strict 3-tier Role-Based Access Control model:

| Role | Permitted Actions | Prohibited Actions |
|---|---|---|
| **Collector (Kabadiwala)** | Create scrap lots, view price benchmarks, accept/reject offers, generate handover OTP, view earnings & reputation | Verify CPCB licenses, resolve administrative anomalies, modify statutory registries |
| **Authorized Recycler** | Browse available lots, submit procurement bids/offers, verify physical scale weight with OTP, settle cash/digital payments | Impersonate collectors, alter historical lot valuations, self-verify CPCB compliance |
| **Admin / Regulator (CPCB)** | Review & approve recycler licenses, toggle statutory verification status, inspect anomalies, view macro ESG analytics | Act as counterparty in scrap offers, alter finalized SHA-256 certificate hashes |

### 2.1 Firebase & Local JWT Token Verification
- **Dual Authentication Modes:** Supports phone OTP login via native JWT issuance as well as Firebase Auth ID Token exchange (`POST /api/auth/firebase/verify`).
- **Zero Client Trust on Provisioning:** When a new user authenticates via Firebase ID token, server-side provisioning strictly enforces the `collector` role by default, completely ignoring any malicious role claims sent by client headers or request bodies (`test_firebase_auth_verify_and_role_safety`).
- **Cryptographic Signing:** Session tokens are signed using HMAC-SHA256 (`HS256`) with a cryptographically secure `SECRET_KEY` and explicit expiration windows (`ACCESS_TOKEN_EXPIRE_MINUTES`).

---

## 3. Verified Physical Handover & Anti-Fraud Protocol

The handover between an informal collector and a formal recycler is the most critical fraud surface in waste management. ReVive secures this physical exchange with three interlocking mechanisms:

### 3.1 Time-Limited 6-Digit Handover OTP
1. When a collector accepts a recycler's offer, the collector generates a single-use, 6-digit numeric OTP via `POST /api/handovers/generate-otp`.
2. The OTP is cryptographically bounded to a **15-minute expiration window** (`otp_expires_at`).
3. Attempts to verify an expired OTP are rejected with HTTP 400 Bad Request (`test_expired_otp_rejection`).
4. The recycler must physically enter this OTP at the scale to unlock the lot handover record.

### 3.2 Tightened $\pm 5\%$ Physical Scale Weight Reconciliation
- To prevent scale tampering or dishonest grading, the recycler must input the physical scale weight (`scale_weight_kg`).
- ReVive calculates the percentage discrepancy against the cataloged lot weight:
  $$\text{Discrepancy \%} = \frac{|\text{Estimated Wt} - \text{Scale Wt}|}{\text{Estimated Wt}} \times 100$$
- If discrepancy exceeds **$5.0\%$**, the platform flags the transaction as an operational anomaly, logs the event for CPCB review, and records the variance on the collector's and recycler's accuracy reputation profile.

### 3.3 State Machine Immutability
- A lot cannot transition to `payment_completed` without first undergoing verified handover (`test_payment_blocked_before_handover`).
- Offers cannot be accepted by third parties; strict ownership verification guarantees only the lot owner can accept an offer (`test_unauthorized_offer_acceptance_blocked`).

---

## 4. Cryptographic Traceability & Tamper-Evident Passports

Every finalized recycling transaction generates a public **Digital Recycling Passport** (`GET /api/passport/{reference_or_id}`):

```text
Collector (Lot Catalogued)
          ↓
Authorized Recycler (Offer Accepted)
          ↓
Physical Scale (OTP Verified, Discrepancy <= 5%)
          ↓
Settlement (Cash-First Payment Logged)
          ↓
SHA-256 Digital Certificate Sealed
          ↓
Public Verifiable QR Code (Pure SVG)
```

- **Certificate Integrity:** The certificate hash is derived from SHA-256 hashing the immutable tuple: `(lot_id, collector_id, recycler_id, final_weight_kg, timestamp, material_category)`.
- **Pure SVG Rendering:** QR codes are generated dynamically as pure mathematical SVG elements, eliminating external QR generation service dependencies and preventing tracking or injection attacks.

---

## 5. File Upload & Binary Payload Security

Scrap lot photographs and statutory CPCB recycler licenses undergo deep content inspection in `backend/app/file_security.py`:

1. **Magic-Byte Inspection:** Files are not validated by file extension alone. Raw binary headers are inspected using Python Pillow (`Image.open`) and validated against permitted MIME types (`image/jpeg`, `image/png`, `image/webp`).
2. **Re-Encoding Sanitization:** Uploaded images are re-opened and validated to strip embedded EXIF metadata, malicious script polyglots, and steganographic payloads.
3. **Cryptographic UUID Storage:** Files are saved using random UUID hex filenames outside the web root (`Path(settings.upload_dir).resolve() / f"{uuid.uuid4().hex}{extension}"`). Original user-provided filenames containing path traversal characters (`../../../etc/evil.sh`) are discarded (`test_secure_filename_and_path_traversal_prevention`).
4. **Cloudinary CDN Isolation:** When configured, images are uploaded directly to Cloudinary with secure delivery URLs, keeping local storage completely isolated from user traffic.

---

## 6. Injection Defense & Data Protection

### 6.1 SQL Injection Prevention
- All database queries are constructed through SQLAlchemy ORM with fully parameterized statements (`select(Model).where(...)`).
- Raw string concatenation in SQL queries is prohibited across the codebase. Malicious SQL injections (`'; DROP TABLE lots; --`) are stored strictly as inert string literals (`test_sql_injection_and_xss_sanitization`).

### 6.2 Error Sanitization & Information Leakage Prevention
- Production exception handlers intercept all unhandled `Exception` and `OperationalError` events.
- Raw stack traces, Python file paths, server directory trees, and database connection strings are never returned to clients (`test_unhandled_exception_leakage_prevention`, `test_database_exception_leakage_prevention`).
- Validation errors are sanitized to return user-friendly field descriptions without leaking server internals (`test_validation_error_leakage_prevention`).

---

## 7. Automated Security Verification (55/55 Passing)

All security controls are verified by continuous automated regression tests in `backend/tests`:
- `test_security.py`: File upload validation, path traversal prevention, error sanitization, and secret leak prevention (11 tests).
- `test_auth_enforcement.py`: RBAC enforcement and route protection (5 tests).
- `test_auth.py`: JWT token signing, verification, and expiration (5 tests).
- `test_documents.py`: Statutory CPCB document uploads and administrative review logging (8 tests).
- `test_phase2_p0.py`: Firebase ID token exchange and role safety (3 tests).
- `test_phase3_p1.py`: Handover OTP generation, 5% weight discrepancy, and photo upload (4 tests).
- `test_phase4_gate.py`: Expired OTP rejection, SQL injection resistance, unauthorized offer blocking, and full transaction lifecycle (5 tests).
- `test_lot_flow.py`: Complete end-to-end lot lifecycle (14 tests).

**Total Test Suite Status:** **55 passed in 19.39s (100% green).**
