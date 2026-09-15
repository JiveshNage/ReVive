import csv
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from sqlalchemy.orm import Session

from app.models import (
    CollectorReputation,
    DocumentType,
    Handover,
    Lot,
    Material,
    Offer,
    Payment,
    Recycler,
    User,
)

DATASET_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "dataset" / "recycler_dataset_large.csv"


def seed_data(db: Session):
    # 1. Seed Recycler Dataset from CSV if not already populated
    if db.query(Recycler).count() < 100 and DATASET_CSV_PATH.exists():
        recycler_records = []
        with open(DATASET_CSV_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rec_id_raw = row.get("Recycler ID", "")
                num_match = re.search(r"\d+", rec_id_raw)
                rec_id = int(num_match.group(0)) if num_match else None
                auth_status = row.get("Authorization status", "Authorized")
                is_verified = "authorized" in auth_status.lower()
                recycler_records.append(
                    Recycler(
                        id=rec_id,
                        name=row.get("Recycler name", f"Recycler {rec_id}"),
                        verified=is_verified,
                        location=row.get("Location", "India"),
                        contact_phone=row.get("Contact", ""),
                        accepted_materials=row.get("Accepted materials", ""),
                        authorization_status=auth_status,
                        offered_rate=row.get("Rate", ""),
                        pickup_availability=row.get("Pickup availability", "Yes"),
                        service_area=row.get("Service area", ""),
                        latitude=23.2599 if "bhopal" in row.get("Location", "").lower() else 18.5204,
                        longitude=77.4126 if "bhopal" in row.get("Location", "").lower() else 73.8567,
                        capacity_kg_per_day=1500.0,
                    )
                )
        if recycler_records:
            db.bulk_save_objects(recycler_records)
            db.commit()
    elif db.query(Recycler).count() == 0:
        db.add_all([
            Recycler(id=1, name="EcoCycle Pune Authorized Facility", verified=True, location="Pune, Maharashtra", contact_phone="9876540001", latitude=18.5204, longitude=73.8567),
            Recycler(id=2, name="CleanEarth Central MP Recyclers", verified=True, location="Bhopal, MP", contact_phone="9876540002", latitude=23.2599, longitude=77.4126),
            Recycler(id=3, name="GreenLoop E-Waste Solutions", verified=True, location="Indore, MP", contact_phone="9876540003", latitude=22.7196, longitude=75.8577),
            Recycler(id=4, name="EcoReclaim Maharashtra Hub", verified=True, location="Mumbai, Maharashtra", contact_phone="9876540004", latitude=19.0760, longitude=72.8777),
            Recycler(id=5, name="Bharat Recyclers Pvt Ltd", verified=True, location="Nagpur, Maharashtra", contact_phone="9876540005", latitude=21.1458, longitude=79.0882),
        ])
        db.commit()

    # 2. Seed 5+ Realistic Informal Collectors
    collectors_data = [
        {"name": "Ramesh Yadav", "phone": "9876543210", "role": "collector", "language": "hi", "location": "Bhopal, MP", "custom_user_id": "REV-COL-2026-1024"},
        {"name": "Santosh Kumar", "phone": "9876543211", "role": "collector", "language": "hi", "location": "Indore, MP", "custom_user_id": "REV-COL-2026-1025"},
        {"name": "Salim Khan", "phone": "9876543212", "role": "collector", "language": "hi", "location": "Jabalpur, MP", "custom_user_id": "REV-COL-2026-1026"},
        {"name": "Anita Devi", "phone": "9876543213", "role": "collector", "language": "mr", "location": "Nagpur, Maharashtra", "custom_user_id": "REV-COL-2026-1027"},
        {"name": "Raju Sonkar", "phone": "9876543214", "role": "collector", "language": "mr", "location": "Pune, Maharashtra", "custom_user_id": "REV-COL-2026-1028"},
    ]
    for c in collectors_data:
        existing = db.query(User).filter(User.phone == c["phone"]).first()
        if not existing:
            db.add(User(**c, is_active=True))
    db.commit()

    # 3. Seed 5+ Authorized Recycler User Profiles
    recyclers_data = [
        {"name": "Rajesh Sharma", "phone": "9123456780", "role": "recycler", "location": "Pune, Maharashtra", "company_name": "EcoCycle Pune Authorized Facility", "license_no": "CPCB/EW/2024/0981", "custom_user_id": "REV-REC-2026-0812", "recycler_id": 1},
        {"name": "Vikram Sethi", "phone": "9876540002", "role": "recycler", "location": "Bhopal, MP", "company_name": "CleanEarth Central MP Recyclers", "license_no": "CPCB/EW/2023/1102", "custom_user_id": "REV-REC-2026-0813", "recycler_id": 2},
        {"name": "Anil Deshmukh", "phone": "9876540003", "role": "recycler", "location": "Indore, MP", "company_name": "GreenLoop E-Waste Solutions", "license_no": "CPCB/EW/2024/0419", "custom_user_id": "REV-REC-2026-0814", "recycler_id": 3},
        {"name": "Farhan Qureshi", "phone": "9876540004", "role": "recycler", "location": "Mumbai, Maharashtra", "company_name": "EcoReclaim Maharashtra Hub", "license_no": "CPCB/EW/2023/0754", "custom_user_id": "REV-REC-2026-0815", "recycler_id": 4},
        {"name": "Sunil Agrawal", "phone": "9876540005", "role": "recycler", "location": "Nagpur, Maharashtra", "company_name": "Bharat Recyclers Pvt Ltd", "license_no": "CPCB/EW/2024/1820", "custom_user_id": "REV-REC-2026-0816", "recycler_id": 5},
    ]
    for r in recyclers_data:
        existing = db.query(User).filter(User.phone == r["phone"]).first()
        if not existing:
            db.add(User(**r, is_active=True, verification_status="VERIFIED"))
    db.commit()

    # Admin Account
    admin = db.query(User).filter(User.phone == "9998887770").first()
    if not admin:
        db.add(User(name="CPCB National Regulator", phone="9998887770", role="admin", language="en", location="New Delhi", email="admin@revive-ewaste.gov.in", custom_user_id="CPCB-GOV-2026-0001", is_active=True))
        db.commit()

    # 4. Materials
    if db.query(Material).count() == 0:
        db.add_all([
            Material(name="Copper Wire", category="Metal", description="Recovered insulated & bare copper wire", is_hazardous=False),
            Material(name="PCB", category="Electronic", description="Printed circuit board motherboard scrap", is_hazardous=True),
            Material(name="Laptop Battery", category="Battery", description="Used Li-ion secondary battery pack", is_hazardous=True),
            Material(name="Mobile Phone", category="Device", description="Used handheld communication device", is_hazardous=False),
            Material(name="CRT Monitor", category="Display", description="Cathode ray tube glass display unit", is_hazardous=True),
            Material(name="Mixed Electronic Scrap", category="Mixed", description="Assorted consumer electronics", is_hazardous=False),
        ])
        db.commit()

    # 5. Seed 10+ Past Lots in Diverse Lifecycle States with Handovers & Anomaly
    if db.query(Lot).count() < 10:
        c1 = db.query(User).filter(User.phone == "9876543210").first()
        c2 = db.query(User).filter(User.phone == "9876543211").first()
        c3 = db.query(User).filter(User.phone == "9876543212").first()
        c4 = db.query(User).filter(User.phone == "9876543213").first()
        c5 = db.query(User).filter(User.phone == "9876543214").first()

        m_pcb = db.query(Material).filter(Material.name == "PCB").first()
        m_cu = db.query(Material).filter(Material.name == "Copper Wire").first()
        m_bat = db.query(Material).filter(Material.name == "Laptop Battery").first()
        m_mob = db.query(Material).filter(Material.name == "Mobile Phone").first()

        c1_id = c1.id if c1 else 1
        c2_id = c2.id if c2 else 1
        c3_id = c3.id if c3 else 1
        c4_id = c4.id if c4 else 1
        c5_id = c5.id if c5 else 1

        mpcb_id = m_pcb.id if m_pcb else 1
        mcu_id = m_cu.id if m_cu else 1
        mbat_id = m_bat.id if m_bat else 1
        mmob_id = m_mob.id if m_mob else 1

        # Lot 1: Payment Complete (clean handover, <5% diff)
        l1 = Lot(collector_id=c1_id, material_id=mpcb_id, quantity_kg=45.0, estimated_value=20250.0, status="payment_completed", pickup_address="Shop 4, Zone 1, Bhopal", latitude=23.2599, longitude=77.4126)
        # Lot 2: Payment Complete (clean handover, <5% diff)
        l2 = Lot(collector_id=c2_id, material_id=mcu_id, quantity_kg=30.0, estimated_value=27000.0, status="payment_completed", pickup_address="Kothari Market, Indore", latitude=22.7196, longitude=75.8577)
        # Lot 3: Handed Over (>5% anomaly lot: 80.0 kg vs 71.0 kg -> 11.25% discrepancy flagged for CPCB)
        l3 = Lot(collector_id=c3_id, material_id=mbat_id, quantity_kg=80.0, estimated_value=5200.0, status="handed_over", pickup_address="Transport Nagar, Jabalpur", latitude=23.1815, longitude=79.9864)
        # Lot 4: Pickup State (Offer Accepted, waiting for physical scale)
        l4 = Lot(collector_id=c4_id, material_id=mpcb_id, quantity_kg=25.0, estimated_value=11250.0, status="pickup", pickup_address="Sitabuldi, Nagpur", latitude=21.1458, longitude=79.0882)
        # Lot 5: Offers Received (Pending Acceptance)
        l5 = Lot(collector_id=c5_id, material_id=mmob_id, quantity_kg=15.0, estimated_value=6000.0, status="created", pickup_address="Pimpri, Pune", latitude=18.6279, longitude=73.8009)
        # Lot 6: Newly Created Lot
        l6 = Lot(collector_id=c1_id, material_id=mbat_id, quantity_kg=50.0, estimated_value=3250.0, status="created", pickup_address="MP Nagar, Bhopal", latitude=23.2333, longitude=77.4344)
        # Lot 7: Newly Created Lot
        l7 = Lot(collector_id=c2_id, material_id=mpcb_id, quantity_kg=35.0, estimated_value=15750.0, status="created", pickup_address="Palasia, Indore", latitude=22.7244, longitude=75.8839)
        # Lot 8: Payment Complete
        l8 = Lot(collector_id=c4_id, material_id=mcu_id, quantity_kg=20.0, estimated_value=18000.0, status="payment_completed", pickup_address="Dharampeth, Nagpur", latitude=21.1400, longitude=79.0600)
        # Lot 9: Offers Received
        l9 = Lot(collector_id=c5_id, material_id=mbat_id, quantity_kg=40.0, estimated_value=2600.0, status="created", pickup_address="Hadapsar, Pune", latitude=18.5089, longitude=73.9260)
        # Lot 10: Pickup State
        l10 = Lot(collector_id=c3_id, material_id=mmob_id, quantity_kg=18.0, estimated_value=7200.0, status="pickup", pickup_address="Civic Center, Jabalpur", latitude=23.1667, longitude=79.9500)

        demo_lots = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10]
        db.add_all(demo_lots)
        db.commit()
        for dl in demo_lots:
            db.refresh(dl)

        # Seed Offers for lots
        db.add_all([
            Offer(lot_id=l1.id, recycler_id=2, offer_price=20500.0, pickup_available=True, status="accepted"),
            Offer(lot_id=l2.id, recycler_id=3, offer_price=27500.0, pickup_available=True, status="accepted"),
            Offer(lot_id=l3.id, recycler_id=2, offer_price=5400.0, pickup_available=True, status="accepted"),
            Offer(lot_id=l4.id, recycler_id=5, offer_price=11500.0, pickup_available=True, status="accepted"),
            Offer(lot_id=l5.id, recycler_id=1, offer_price=6200.0, pickup_available=True, status="pending"),
            Offer(lot_id=l9.id, recycler_id=1, offer_price=2700.0, pickup_available=True, status="pending"),
            Offer(lot_id=l10.id, recycler_id=2, offer_price=7400.0, pickup_available=True, status="accepted"),
        ])
        db.commit()

        # Seed Handovers:
        # Handover 1: Clean (45.0 vs 44.2 -> 1.8% discrepancy)
        h1 = Handover(
            handover_reference=f"REV-HO-2026-{l1.id:04d}",
            lot_id=l1.id,
            collector_id=c1_id,
            recycler_id=2,
            final_weight_kg=44.2,
            handover_location="CleanEarth Bhopal Depot",
            collector_confirmed=True,
            recycler_confirmed=True,
            status="confirmed",
        )
        # Handover 2: Clean (30.0 vs 29.5 -> 1.7% discrepancy)
        h2 = Handover(
            handover_reference=f"REV-HO-2026-{l2.id:04d}",
            lot_id=l2.id,
            collector_id=c2_id,
            recycler_id=3,
            final_weight_kg=29.5,
            handover_location="GreenLoop Indore Yard",
            collector_confirmed=True,
            recycler_confirmed=True,
            status="confirmed",
        )
        # Handover 3: >5% ANOMALY (80.0 vs 71.0 -> 11.25% discrepancy flagged for CPCB review!)
        h3 = Handover(
            handover_reference=f"REV-HO-2026-{l3.id:04d}",
            lot_id=l3.id,
            collector_id=c3_id,
            recycler_id=2,
            final_weight_kg=71.0,
            handover_location="CleanEarth Weighbridge",
            collector_confirmed=True,
            recycler_confirmed=True,
            status="confirmed",
        )
        db.add_all([h1, h2, h3])
        db.commit()

        # Seed Payments
        db.add_all([
            Payment(payment_reference=f"REV-PAY-2026-{l1.id:04d}-CASH", lot_id=l1.id, collector_id=c1_id, recycler_id=2, amount=20500.0, payment_method="CASH", payment_status="COMPLETED", cash_received_confirmed=True, notes="Cash paid at weighbridge"),
            Payment(payment_reference=f"REV-PAY-2026-{l2.id:04d}-CASH", lot_id=l2.id, collector_id=c2_id, recycler_id=3, amount=27500.0, payment_method="CASH", payment_status="COMPLETED", cash_received_confirmed=True, notes="Cash paid at depot"),
        ])
        db.commit()

        # Seed Collector Reputation
        for cid in [c1_id, c2_id, c3_id, c4_id, c5_id]:
            rep = db.query(CollectorReputation).filter(CollectorReputation.collector_id == cid).first()
            if not rep:
                db.add(CollectorReputation(
                    collector_id=cid,
                    total_lots_formalized=8,
                    total_weight_kg=350.0,
                    completed_handovers=8,
                    weight_accuracy_pct=98.2 if cid != c3_id else 89.5,
                    on_time_handover_pct=100.0,
                    formalization_tier="GOLD" if cid != c3_id else "SILVER",
                    avg_recycler_rating=4.9 if cid != c3_id else 4.2,
                ))
        db.commit()

    # 6. Document Types
    if db.query(DocumentType).count() == 0:
        db.add_all([
            DocumentType(code="cpcb_auth", name="CPCB Extended Producer Responsibility Authorization", description="Statutory authorization certificate issued under CPCB E-Waste Management Rules.", required=True, active=True, applicable_to="recycler,enterprise", validity_required=True),
            DocumentType(code="spcb_consent", name="State Pollution Control Board Consent to Operate (CTO)", description="Valid SPCB Consent to Operate under Water and Air Acts for recycling operations.", required=True, active=True, applicable_to="recycler", validity_required=True),
            DocumentType(code="gst_cert", name="Goods and Services Tax (GST) Certificate", description="Valid GSTIN registration certificate for the legal business entity.", required=True, active=True, applicable_to="recycler,enterprise", validity_required=False),
            DocumentType(code="company_reg", name="Enterprise / Incorporation Registration", description="Certificate of Incorporation, Udyam MSME certificate, or Partnership registration.", required=True, active=True, applicable_to="recycler,enterprise", validity_required=False),
            DocumentType(code="pan_card", name="Organization PAN Card", description="Permanent Account Number card of the enterprise or registered entity.", required=True, active=True, applicable_to="recycler,enterprise", validity_required=False),
            DocumentType(code="iso_cert", name="ISO 14001 / R2 Recycling Compliance Certification", description="Optional standard certification for environmental management systems.", required=False, active=True, applicable_to="recycler", validity_required=True),
        ])
        db.commit()
