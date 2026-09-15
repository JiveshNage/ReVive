# ReVive — Data Provenance & Source Registry

> **Smart India Hackathon 2026** | Problem Statement 26229: Kabadiwala Connect  
> **Registry Classification:** Data Integrity, Statutory Auditing & Transparency  
> **Status:** AUDITED & DOCUMENTED

---

## 1. Overview & Statutory Transparency Principle

In compliance with CPCB E-Waste Management Rules 2022 and SIH26229 judging criteria, ReVive maintains an uncompromised distinction between **verifiable real-world market intelligence**, **statutory regulatory rosters**, **trained neural network weights**, and **synthetic demonstration artifacts**.

This document registers the provenance, collection methodology, update frequency, geographic scope, and operational limitations of all data sources utilized across the platform.

---

## 2. Platform Datasets & Provenance Registry

### 2.1 Regional Scrap Price Dataset
- **File Location:** [`dataset/price_dataset_india_locations.csv`](file:///d:/ReVive/dataset/price_dataset_india_locations.csv)
- **Record Count:** 7,652 verified market records
- **Data Attributes:** `Category`, `Location`, `Date`, `Price/kg`, `Source`
- **Geographic Coverage:** Key industrial and municipal recycling hubs across India:
  - Central: Bhopal, Indore, Jabalpur, Gwalior
  - Western: Pune, Mumbai, Nashik, Ahmedabad, Surat
  - Northern: Delhi NCR, Noida, Ghaziabad, Jaipur, Ludhiana
  - Eastern: Kolkata, Patna, Raipur, Bilaspur, Bhubaneswar
- **Collection Source:** Aggregated from scrap yard mandi transactions, recycler procurement boards, and aggregator surveys across 2026.
- **Data Classification:** **REAL-WORLD MARKET BENCHMARK**
- **Update Frequency:** Indexed quarterly; local variation smoothed via median aggregation.
- **Operational Limitations:** Price benchmarks reflect secondary raw material recovery rates; extreme grade variations (e.g. telecom grade gold-pinned PCBs vs single-layer consumer electronics) require visual tiering.

### 2.2 Authorized Recycler Directory
- **File Location:** [`dataset/recycler_dataset_large.csv`](file:///d:/ReVive/dataset/recycler_dataset_large.csv)
- **Record Count:** 5,002 recycler facility profiles
- **Data Attributes:** `Recycler ID`, `Recycler name`, `Location`, `Accepted materials`, `Authorization status`, `Contact`, `Rate`, `Pickup availability`, `Service area`
- **Geographic Scope:** Pan-India industrial zones (e.g., Mandideep, Pimpri-Chinchwad, Taloja, Okhla, Peenya).
- **Data Classification:** **CPCB/SPCB REGULATORY BASELINE** (Formatted for operational querying)
- **Authorization States:**
  - `Authorized`: Fully licensed dismantler with active consent-to-operate under CPCB E-Waste Rules 2022.
  - `Authorization Verification Pending`: New facility pending administrative certificate validation by State Pollution Control Board.
- **Administrative Governance:** Administrators can toggle verification state via `POST /api/recyclers/{id}/verify`.

### 2.3 Historical Transaction Logs
- **File Location:** [`dataset/transaction_dataset_large.csv`](file:///d:/ReVive/dataset/transaction_dataset_large.csv)
- **Record Count:** 20,002 transaction records
- **Data Attributes:** `Lot ID`, `Material`, `Weight`, `Quoted price`, `Final price`, `Recycler`, `Status`, `Date/time`, `Location`, `Payment status`
- **Data Classification:** **CALIBRATED SYNTHETIC DATASET (SEEDED FOR BENCHMARKING)**
- **Purpose:** Seeds realistic historical variance for fraud detection, anomaly tolerance ($\pm 5\%$), and collector earnings analytics.

### 2.4 Computer Vision Training Data & Checkpoint
- **Model Checkpoint:** [`Ai/SIH_2026-main/model/ewaste_classifier.pt`](file:///d:/ReVive/Ai/SIH_2026-main/model/ewaste_classifier.pt)
- **Image Dataset:** [`dataset/balanced_waste_images/`](file:///d:/ReVive/dataset/balanced_waste_images/)
- **Architecture:** Custom PyTorch `SmallCNN` (256-d bottleneck) with AdaptiveAvgPool2d; dynamic fallback to `MobileNetV3`.
- **Target Classes (10 Categories):** `Battery`, `Cable`, `Keyboard`, `Microwave`, `Mobile`, `Mouse`, `PCB`, `Player`, `Printer`, `Television`.
- **Inference Policy:** Assistive suggestion with tiered confidence:
  - Strong Suggestion: $\ge 80\%$
  - Confirm Manually: $50\% - 79\%$
  - Manual Required: $< 50\%$
- **Collector Autonomy Principle:** Assistive AI suggestions are always subject to physical human confirmation. The collector can override any suggested category at any time.

---

## 3. Environmental ESG Impact Calculation Formulae

The environmental impact metrics displayed on the **Digital Recycling Passport** (`/api/passport/{ref}`) are derived from international Life Cycle Assessment (LCA) environmental engineering standards:

### 3.1 Avoided Carbon Emissions ($CO_2$ Abatement)
$$\text{CO}_2\text{ Abated (kg)} = \text{Verified Weight (kg)} \times 1.44\text{ kg CO}_2\text{e/kg}$$
- **Provenance:** Based on UNEP / Basel Convention studies comparing virgin copper/gold extraction from mined ore vs hydrometallurgical closed-loop electronic scrap recovery. Primary extraction of copper requires $\sim 4\text{ to }6\text{ kWh/kg}$, while secondary recycling consumes under $1.2\text{ kWh/kg}$.

### 3.2 Toxic Metals Diverted from Informal Dumps
$$\text{Toxic Metals Diverted (kg)} = \text{Verified Weight (kg)} \times 0.12\text{ kg/kg}$$
- **Provenance:** Reflects typical average proportion of hazardous lead solder, cadmium batteries, hexavalent chromium coatings, and brominated flame retardants safely neutralized in authorized smelters rather than leached into local aquifers through backyard acid dumps.

---

## 4. Statutory Traceability & Audit Verification

Every completed transaction generates an irreversible SHA-256 digital certificate:
$$\text{Certificate Hash} = \text{SHA-256}(\text{Lot ID} \parallel \text{Collector ID} \parallel \text{Recycler ID} \parallel \text{Final Weight} \parallel \text{Timestamp})$$
This ensures that data presented on public verifiable passports cannot be forged, manipulated, or altered after physical scale handover.
