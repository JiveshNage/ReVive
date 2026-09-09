from sqlalchemy.orm import Session

from app.models import Material, Recycler, User


def seed_data(db: Session):
    # Ensure all 3 persona accounts exist with statutory unique IDs
    collector = db.query(User).filter(User.phone == "9876543210").first()
    if not collector:
        db.add(User(name="Asha Collector / Ram Yadav", phone="9876543210", role="collector", language="hi", location="Bhopal, MP", email="collector@revive-ewaste.gov.in", custom_user_id="REV-COL-2026-1024"))
    elif not collector.custom_user_id:
        collector.custom_user_id = "REV-COL-2026-1024"

    recycler = db.query(User).filter(User.phone == "9123456780").first()
    if not recycler:
        db.add(User(name="Raj Recycler", phone="9123456780", role="recycler", language="en", location="Pune, Maharashtra", company_name="EcoCycle Pune Authorized Facility", license_no="CPCB/EW/2024/0981", service_area="Maharashtra & Central India", email="recycler@revive-ewaste.gov.in", custom_user_id="REV-REC-2026-0812"))
    elif not recycler.custom_user_id:
        recycler.custom_user_id = "REV-REC-2026-0812"

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

    if db.query(Recycler).count() == 0:
        db.add_all([
            Recycler(name="EcoCycle Pune", verified=True, location="Pune, Maharashtra", contact_phone="9876540001"),
            Recycler(name="GreenLoop Nashik", verified=True, location="Nashik, Maharashtra", contact_phone="9876540002"),
        ])

    db.commit()
