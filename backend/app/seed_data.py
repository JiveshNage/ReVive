import csv
import re
from pathlib import Path
from sqlalchemy.orm import Session

from app.models import DocumentType, Material, Recycler, User

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
                    )
                )
        if recycler_records:
            db.bulk_save_objects(recycler_records)
            db.commit()
    elif db.query(Recycler).count() == 0:
        db.add_all([
            Recycler(id=1, name="EcoCycle Pune", verified=True, location="Pune, Maharashtra", contact_phone="9876540001"),
            Recycler(id=2, name="GreenLoop Nashik", verified=True, location="Nashik, Maharashtra", contact_phone="9876540002"),
        ])
        db.commit()

    # Ensure all 3 persona accounts exist with statutory unique IDs
    collector = db.query(User).filter(User.phone == "9876543210").first()
    if not collector:
        db.add(User(name="Asha Collector / Ram Yadav", phone="9876543210", role="collector", language="hi", location="Bhopal, MP", email="collector@revive-ewaste.gov.in", custom_user_id="REV-COL-2026-1024"))
    elif not collector.custom_user_id:
        collector.custom_user_id = "REV-COL-2026-1024"

    recycler = db.query(User).filter(User.phone == "9123456780").first()
    if not recycler:
        db.add(User(
            name="Raj Recycler",
            phone="9123456780",
            role="recycler",
            language="en",
            location="Pune, Maharashtra",
            company_name="EcoCycle Pune Authorized Facility",
            license_no="CPCB/EW/2024/0981",
            service_area="Maharashtra & Central India",
            email="recycler@revive-ewaste.gov.in",
            custom_user_id="REV-REC-2026-0812",
            verification_status="VERIFIED",
            recycler_id=1,
        ))
    else:
        if not recycler.custom_user_id:
            recycler.custom_user_id = "REV-REC-2026-0812"
        if not recycler.verification_status:
            recycler.verification_status = "VERIFIED"
        if not recycler.recycler_id:
            recycler.recycler_id = 1

    admin = db.query(User).filter(User.phone == "9998887770").first()
    if not admin:
        db.add(User(name="CPCB National Regulator", phone="9998887770", role="admin", language="en", location="New Delhi", email="admin@revive-ewaste.gov.in", custom_user_id="CPCB-GOV-2026-0001"))
    elif not admin.custom_user_id:
        admin.custom_user_id = "CPCB-GOV-2026-0001"

    if db.query(Material).count() == 0:
        db.add_all([
            Material(name="Copper Wire", category="Metal", description="Recovered copper wire", is_hazardous=False),
            Material(name="PCB", category="Electronic", description="Printed circuit board", is_hazardous=True),
            Material(name="Laptop Battery", category="Battery", description="Used battery pack", is_hazardous=True),
            Material(name="Mobile Phone", category="Device", description="Used handset", is_hazardous=False),
        ])

    # Seed Configurable Document Types if none exist
    if db.query(DocumentType).count() == 0:
        db.add_all([
            DocumentType(
                code="cpcb_auth",
                name="CPCB Extended Producer Responsibility Authorization",
                description="Statutory authorization certificate issued under CPCB E-Waste Management Rules.",
                required=True,
                active=True,
                applicable_to="recycler,enterprise",
                validity_required=True,
            ),
            DocumentType(
                code="spcb_consent",
                name="State Pollution Control Board Consent to Operate (CTO)",
                description="Valid SPCB Consent to Operate under Water and Air Acts for recycling operations.",
                required=True,
                active=True,
                applicable_to="recycler",
                validity_required=True,
            ),
            DocumentType(
                code="gst_cert",
                name="Goods and Services Tax (GST) Certificate",
                description="Valid GSTIN registration certificate for the legal business entity.",
                required=True,
                active=True,
                applicable_to="recycler,enterprise",
                validity_required=False,
            ),
            DocumentType(
                code="company_reg",
                name="Enterprise / Incorporation Registration",
                description="Certificate of Incorporation, Udyam MSME certificate, or Partnership registration.",
                required=True,
                active=True,
                applicable_to="recycler,enterprise",
                validity_required=False,
            ),
            DocumentType(
                code="pan_card",
                name="Organization PAN Card",
                description="Permanent Account Number card of the enterprise or registered entity.",
                required=True,
                active=True,
                applicable_to="recycler,enterprise",
                validity_required=False,
            ),
            DocumentType(
                code="iso_cert",
                name="ISO 14001 / R2 Recycling Compliance Certification",
                description="Optional standard certification for environmental management systems.",
                required=False,
                active=True,
                applicable_to="recycler",
                validity_required=True,
            ),
        ])

    db.commit()

