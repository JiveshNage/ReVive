# ReVive — Smart India Hackathon 2026 Master Pitch & Demonstration Guide

> **Problem Statement ID:** 26229  
> **Problem Statement Title:** Kabadiwala Connect — Digital Platform for Informal E-Waste Integration  
> **Category:** Software / Clean & Green Technology  
> **Team Name:** ReVive  
> **Tagline:** Giving E-Waste a Second Life

---

## 1. The 15-Minute Pitch Narrative

### Slide 1: The Invisible Crisis (Problem Context)
- India is the **3rd largest producer of e-waste** globally (generating > 3.2 million tonnes annually).
- **95% of e-waste is channeled through informal kabadiwalas**, who dismantle components using primitive, hazardous methods (open-air cable burning, cyanide/acid stripping, battery prying).
- Kabadiwalas are severely exploited: middlemen pay **₹ 25–35/kg flat rate** for scrap containing high-grade circuit boards worth **₹ 400–550/kg**.
- Formal CPCB-authorized recyclers operate at **less than 30% capacity** due to a broken collection supply chain.

### Slide 2: The ReVive Solution
ReVive is an **AI-powered, offline-first, vernacular e-waste marketplace, digital passport, and traceability platform** that directly links informal kabadiwalas with verified, authorized recyclers.

```text
[Informal Collector]                                  [Verified CPCB Recycler]
    │                                                            │
    ├── 1. AI Scrap Scan & Instant Grade Identification          │
    ├── 2. Transparent Regional Price Benchmark Discovery        │
    ├── 3. Match Nearest Authorized Recyclers ───────────────────┤
    │                                                            ├── 4. Place Competitive Bid
    ├── 5. Accept Fair Offer ────────────────────────────────────┤
    │                                                            ├── 6. Verified Scale Handover
    ├── 7. Instant Recorded Payout & QR Recycling Passport ◄─────┤
```

### Slide 3: Technical Innovations
1. **Assistive Edge AI Vision**: PyTorch deep learning classifier (`ewaste_classifier.pt`) with tiered confidence recommendations (`strong_suggestion`, `confirm_manually`, `manual_required`).
2. **India Regional Price Discovery**: Dynamic median valuation engine indexed across Indian industrial locations (`dataset/price_dataset_india_locations.csv`).
3. **Statutory Recycler Governance**: Strict administrative CPCB authorization registry with compliance anomaly detection (`/api/admin/anomalies`).
4. **Verifiable Recycling Passport**: Tamper-evident 64-character SHA-256 digital certificate with pure SVG QR matrix and ESG impact calculation ($1.44\text{ kg CO}_2$ abated & $0.12\text{ kg}$ toxic metals diverted per kg).
5. **Full Offline Resilience**: Two-tier mutation queue (mobile local store + web localStorage) that ensures zero data loss during network drops.
6. **Trilingual Vernacular Accessibility**: Complete Hindi, Marathi, and English interface with high-impact vernacular safety slogans (*"तार मत जलाओ"*).

---

## 2. Competitive Differentiation Matrix

| Capability | Unorganized Scrap Dealers | Existing Apps (Kabadiwala.com / ScrapUncle) | ReVive Solution |
|---|---|---|---|
| **E-Waste Specificity** | None (General junk) | Low (Focus on home appliances & paper) | **Specialized in high-value electronic scrap & PCBs** |
| **Price Transparency** | Zero (Arbitrary rates) | Static list prices | **Dynamic regional median benchmark engine** |
| **Formal Recycler Link** | None (Black market) | Proprietary warehouse | **Direct CPCB/SPCB authorized recycler marketplace** |
| **AI Scrap Identification** | None | None | **PyTorch SmallCNN image classification with top predictions** |
| **Offline Operation** | Manual notebook | Online-only (Fails in slums) | **Offline-first local store with automatic batch sync** |
| **Traceability & Auditing** | None | Basic paper invoice | **Tamper-evident SHA-256 certificate & QR Recycling Passport** |
| **Vernacular & Safety** | None | English / Hindi text only | **Contextual Hindi/Marathi hazard advisories & Do's/Don'ts** |
| **Regulatory Compliance**| Non-compliant | Partial | **Built-in compliance with CPCB E-Waste Rules 2022** |

---

## 3. SIH Live Demo Script (Step-by-Step for Judges)

### Option A: The 1-Click Automated Simulator (Recommended for Speed)
1. In the Web Portal, switch the topbar role to **Admin & Governance (प्रशासन व अनुपालन)**.
2. Click the amber **⚡ Run Live SIH Demo (लाइव SIH डेमो चलाएं)** button.
3. Observe the automated 7-step execution card appear:
   - *Step 1:* 14.5 kg high-grade PCB registered.
   - *Step 2:* Regional price benchmark computed (₹ 403/kg).
   - *Step 3:* CPCB authorized recycler matched with competitive offer (₹ 5,900).
   - *Step 4:* Collector acceptance logged.
   - *Step 5:* Two-party digital handover verified (14.2 kg scale weight) with signed custody.
   - *Step 6:* Instant payment settled.
   - *Step 7:* Tamper-evident Recycling Passport sealed with SHA-256 hash.
4. The system automatically pops open the **Recycling Passport & QR modal**:
   - Point out the **scannable SVG QR code**.
   - Show the **SHA-256 Certificate Hash** (64 hex characters).
   - Show the live **ESG Impact metrics**: $20.88\text{ kg CO}_2$ emissions avoided and $1.74\text{ kg}$ toxic heavy metals diverted.

### Option B: The Interactive Manual Demonstration
1. **Collector Persona (`web/` or `mobile/`)**:
   - Select Hindi language from the header picker.
   - Upload or snap a photo of a circuit board.
   - Click **Scan with AI (AI से स्कैन करें)** → View predicted class (`PCB`), confidence score ($88\%$), and live market benchmark.
   - Click **Use in New Lot →** → Enter weight (e.g. 8.5 kg) → Submit lot.
2. **Recycler Persona**:
   - Switch to **Verified Recycler (प्रमाणित रीसाइक्लर)** mode in the topbar.
   - View the active lot on the procurement board → Place competitive bid.
3. **Acceptance & Digital Handover**:
   - Switch to Collector → Accept bid.
   - Click **Handover** → Enter verified scale weight (e.g. 8.4 kg) → Confirm two-party digital handover.
   - Click **Mark Paid**.
4. **Passport Inspection**:
   - Click **Passport & QR** on the paid lot → Demonstrate the immutable digital chain of custody.

---

## 4. Unit Economics & Environmental Math

### Economic Value Proposition for Collectors
- Informal Middleman Payout: $15\text{ kg PCB} \times ₹ 30/\text{kg} = ₹ 450$
- ReVive Direct Recycler Payout: $15\text{ kg PCB} \times ₹ 403/\text{kg} = ₹ 6,045$
- **Net Collector Income Gain: $+1,243\%$** on high-grade electronic components.

### Environmental Impact Formulas
$$\text{CO}_2\text{ Abated (kg)} = \text{Lot Quantity (kg)} \times 1.44$$
$$\text{Toxic Heavy Metals Diverted (kg)} = \text{Lot Quantity (kg)} \times (0.12\text{ if Hazardous else }0.03)$$

---

## 5. Frequently Asked Questions by Judges

### Q1: "Why would an illiterate kabadiwala use a smartphone app?"
**Answer:** Our field validation in Bhopal and Pune confirmed that almost all informal collectors own affordable Android smartphones (e.g. Redmi 9A) for WhatsApp and YouTube. ReVive eliminates language and literacy barriers with audio prompts, high-contrast visual cards, and native Hindi/Marathi vernacular slogans rather than complex forms.

### Q2: "What if there is no internet in scrap yards?"
**Answer:** ReVive is architected **offline-first**. Both the Flutter mobile app and React web portal support full offline local lot creation, image attachment, and queue management (`LOCAL_CREATED` -> `PENDING_SYNC` -> `SYNCED`). Data is batched and synchronized automatically the moment connectivity is restored.

### Q3: "Can the AI model hallucinate and approve fake recyclers?"
**Answer:** No. As mandated by our core engineering rule (*AI Suggestion ≠ Legal Verification*), AI is assistive only for visual scrap grading and price estimation. Recycler verification and authorization are strictly controlled via administrative statutory CPCB registry records (`/api/recyclers/{id}/verify`).
