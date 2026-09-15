# ReVive — SIH 2026 Live Demonstration & Judging Script

> **Smart India Hackathon 2026** | Problem Statement 26229: Kabadiwala Connect  
> **Target Audience:** Hackathon Jury, Evaluators & CPCB Stakeholders  
> **Demonstration Duration:** 3 to 5 Minutes  
> **Key Message:** ReVive formalizes informal kabadiwalas without forcing corporate complexity onto them.

---

## 1. The 30-Second Opening Pitch

> *"Judges, India generates 1.7 million tonnes of e-waste annually, but over 95% is handled by informal kabadiwalas who burn cables over open stoves and leach circuit boards in acid, destroying their lungs and toxifying our groundwater.*
> 
> *Previous apps tried to replace kabadiwalas with Uber-style pickups. They failed because waste pickers need immediate cash and cannot read complex English dashboards.*
> 
> *ReVive does not replace the kabadiwala. **ReVive empowers them.** We provide trilingual voice price intelligence, assistive AI material grading, cash-first ledger tracking, and an authorized CPCB recycler matching network backed by tamper-evident digital passports."*

---

## 2. Pre-Seeded Demonstration Personas

| Role | Name | Phone Number | Location | Key Characteristics |
|---|---|---|---|---|
| **Informal Collector** | Ramesh Yadav | `9876543210` | Bhopal, MP | Speaks Hindi; illiterate-friendly UI with spoken audio rates |
| **Authorized Recycler** | Rajesh Sharma (EcoCycle) | `9123456780` | Pune / MP Hub | CPCB Authorized (`CPCB/EW/2024/0981`); bulk procurement |
| **National Regulator** | CPCB Central Directorate | `9998887770` | New Delhi | Statutory licensing registry, anomaly alerts, ESG impact KPIs |

---

## 3. Step-by-Step Live Judging Walkthrough

```text
Step 1 (Voice Price Check) ──> Step 2 (AI Vision & Breakdown) ──> Step 3 (Spatial Matching)
                                                                            │
Step 6 (OTP Scale Handover) <── Step 5 (OTP Generated) <── Step 4 (Recycler Bids)
         │
         ▼
Step 7 (Cash Settlement & Digital Passport) ──> Step 8 (CPCB Governance & Anomaly Flagging)
```

---

### Step 1: Low-Literacy Vernacular Experience & Voice Price Board
- **Action:** Open the mobile app or web portal and switch language to **Hindi (हिंदी)** or **Marathi (मराठी)**.
- **Narrative:** *"Many waste pickers cannot read English market charts. ReVive gives them instant audio empowerment."*
- **Click:** Click the **`🔊 भाव सुनें`** button on the Price Board.
- **Outcome:** The app vocalizes live scrap market rates in clear vernacular speech (*"सर्किट बोर्ड ₹403 प्रति किलो"*), grounded in 7,652 regional market data points.

---

### Step 2: Assistive Edge AI Vision & "Why This Price?"
- **Action:** Navigate to **Scan / Predict** and upload a photo of a circuit board (or use the sample PCB).
- **Narrative:** *"A kabadiwala may not know whether a green board is low-grade consumer electronics or high-yield telecommunication scrap."*
- **Outcome:**
  - PyTorch `SmallCNN` deep learning model classifies material as **`PCB (Printed Circuit Board)`** with confidence score (e.g. 88%).
  - Trilingual Safety Banner appears: *"तेजाब से सोना मत निकालो! गैस फेफड़ों को जलाती है"* (Do not acid leach).
  - Displays **"भाव का कारण? (Why this price?)"** transparent breakdown showing base price (₹380/kg), regional demand premium (+₹23/kg in Bhopal), and 7-day upward price momentum.

---

### Step 3: Lot Creation & 5-Pillar Spatial Recycler Matching
- **Action:** Click **"Create Scrap Lot"** with 25 kg.
- **Narrative:** *"Instead of selling to predatory middlemen for whatever rate they offer, ReVive matches the lot to licensed recyclers using real spatial intelligence."*
- **Outcome:**
  - Recyclers ranked by a 5-pillar composite score:
    1. Material Compatibility (40%)
    2. Quoted Payout Rate (25%)
    3. Haversine Spatial Proximity (15%) with distance in km (e.g., 6.8 km away)
    4. Doorstep Pickup Capacity (10%)
    5. Statutory CPCB Compliance (10%)
  - Links directly to OpenStreetMap directions for depot navigation.

---

### Step 4 & 5: Direct Bidding & Time-Limited Handover OTP
- **Action:** Recycler submits an offer (e.g., ₹10,250 for 25 kg).
- **Action:** Collector accepts the offer and clicks **"Generate Handover OTP"**.
- **Narrative:** *"Informal handovers are vulnerable to theft and dispute. ReVive generates a secure 6-digit numeric OTP valid for 15 minutes."*
- **Outcome:** A 6-digit OTP code (e.g., `849201`) is displayed with an active 15-minute countdown.

---

### Step 6: Physical Scale Verification & $\pm 5\%$ Discrepancy Control
- **Action:** Recycler opens the Handover modal, enters the collector's OTP, and records the physical scale weight (e.g., 24.5 kg).
- **Narrative:** *"What happens if scrap was damp or scale calibrations differ? ReVive automatically checks weight variance."*
- **Outcome:**
  - Weight discrepancy is 2.0% (within the tightened $\pm 5\%$ SIH tolerance threshold).
  - Handover is marked **CONFIRMED** and the lot transitions to `handed_over`.
  - Collector reputation score updates with an on-time, high-accuracy completion.

---

### Step 7: Cash-First Payment Settlement & Digital Recycling Passport
- **Action:** Recycler records payment: selects **`CASH`** and clicks **"Record Cash Payment"**.
- **Narrative:** *"Informal collectors rely on daily cash flow to feed their families. Forcing digital bank transfers creates immediate friction. ReVive treats cash as a first-class citizen."*
- **Outcome:**
  - Cash payment of ₹10,045 is logged with an immutable payment reference.
  - Collector's **Earnings Ledger** immediately updates: *"Today's Cash Earned: ₹10,045"*.
  - A tamper-evident **Digital Recycling Passport** is generated with a permanent SHA-256 certificate hash and a pure SVG scannable QR code showing real ESG impact (**35.2 kg CO₂ saved, 2.9 kg toxic heavy metals diverted**).

---

### Step 8: CPCB Administrative Governance & Weight Anomaly Flagging
- **Action:** Switch to the **Admin / CPCB Regulator** tab.
- **Narrative:** *"Government regulators can oversee formalization across India without slowing down the ground economy."*
- **Outcome:**
  - **Macro ESG Metrics:** Total scrap formalized, active transactions, platform turnover.
  - **Statutory CPCB Registry:** 1-click toggle to verify or suspend recycler licenses.
  - **Anomaly Inspector:** Flags historical Lot #3 where weight discrepancy was **11.25%** (>5% statutory threshold), providing an auditable record for dispute arbitration.

---

## 4. 1-Click "Judge Mode" Simulation

If the presentation is time-constrained, demonstrate the full end-to-end flow with a single click:

1. Click the purple button: **`▶️ Run SIH Live Demo Workflow`** (or trigger `POST /api/demo/run-workflow`).
2. Watch the automated simulator drive all 7 lifecycle steps in **under 2 seconds**:
   - Creates a 14.5 kg PCB lot
   - Computes live Bhopal price benchmark (₹403/kg)
   - Matches authorized CPCB recycler
   - Accepts competitive offer (₹6,132)
   - Verifies physical scale weight (14.2 kg, 2.07% discrepancy) with OTP
   - Settles Cash payment
   - Mints SHA-256 tamper-evident Digital Passport (`REV-2026-LOT-00xx`)
3. The dialog automatically displays the generated Passport QR code and verified audit trail.
