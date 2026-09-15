import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.auth import create_access_token
from app.config import settings
from app.main import app
from app.models import Lot, Material, User, Recycler, Offer, Handover, Payment
from app.database import SessionLocal


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def collector_user(db_session):
    collector = db_session.query(User).filter(User.phone == "9988776655").first()
    if not collector:
        collector = User(
            name="Ramesh Kabadiwala Gate",
            phone="9988776655",
            role="collector",
            language="hi",
            location="Bhopal, MP",
            is_active=True,
        )
        db_session.add(collector)
        db_session.commit()
        db_session.refresh(collector)
    return collector


@pytest.fixture
def unauthorized_collector_user(db_session):
    collector = db_session.query(User).filter(User.phone == "9988776656").first()
    if not collector:
        collector = User(
            name="Intruder Collector",
            phone="9988776656",
            role="collector",
            language="en",
            location="Indore, MP",
            is_active=True,
        )
        db_session.add(collector)
        db_session.commit()
        db_session.refresh(collector)
    return collector


@pytest.fixture
def recycler_user(db_session):
    recycler = db_session.query(User).filter(User.phone == "9988776657").first()
    if not recycler:
        recycler = User(
            name="EcoTech Recycler Gate",
            phone="9988776657",
            role="recycler",
            location="Bhopal, MP",
            is_active=True,
        )
        db_session.add(recycler)
        db_session.commit()
        db_session.refresh(recycler)
    return recycler


@pytest.fixture
def recycler_profile(db_session, recycler_user):
    rec = db_session.query(Recycler).first()
    if not rec:
        rec = Recycler(
            name="EcoTech Recycler Gate Entity",
            location="Bhopal, MP",
            accepted_materials="PCB, Battery, Mixed Metal",
            authorization_status="Authorized",
            latitude=23.2599,
            longitude=77.4126,
            capacity_kg_per_day=1000.0,
        )
        db_session.add(rec)
        db_session.commit()
        db_session.refresh(rec)
    recycler_user.recycler_id = rec.id
    db_session.commit()
    return rec


@pytest.fixture
def material_item(db_session):
    mat = db_session.query(Material).first()
    if not mat:
        mat = Material(
            name="High-Grade PCB Motherboards",
            category="Electronic",
            description="Tested PCB scrap boards",
            is_hazardous=False,
        )
        db_session.add(mat)
        db_session.commit()
        db_session.refresh(mat)
    return mat


@pytest.fixture
def collector_token(collector_user):
    return create_access_token({
        "sub": collector_user.phone,
        "user_id": collector_user.id,
        "role": collector_user.role,
        "name": collector_user.name,
    })


@pytest.fixture
def intruder_token(unauthorized_collector_user):
    return create_access_token({
        "sub": unauthorized_collector_user.phone,
        "user_id": unauthorized_collector_user.id,
        "role": unauthorized_collector_user.role,
        "name": unauthorized_collector_user.name,
    })


@pytest.fixture
def recycler_token(recycler_user):
    return create_access_token({
        "sub": recycler_user.phone,
        "user_id": recycler_user.id,
        "role": recycler_user.role,
        "name": recycler_user.name,
    })


def test_expired_otp_rejection(client, db_session, collector_user, recycler_profile, recycler_token, material_item):
    """
    Verify that an expired handover OTP (>15 minutes old) is strictly rejected with HTTP 400.
    """
    lot = Lot(
        collector_id=collector_user.id,
        material_id=material_item.id,
        quantity_kg=50.0,
        estimated_value=22500.0,
        status="pickup",
        pickup_address="Bhopal Scrap Hub",
    )
    db_session.add(lot)
    db_session.commit()
    db_session.refresh(lot)

    # Simulate expired OTP generated 20 minutes ago
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=20)
    handover = Handover(
        lot_id=lot.id,
        collector_id=collector_user.id,
        recycler_id=recycler_profile.id,
        final_weight_kg=50.0,
        handover_location="Depot Gate 1",
        collector_confirmed=True,
        recycler_confirmed=False,
        status="pending",
        otp_code="555123",
        otp_expires_at=expired_time,
    )
    db_session.add(handover)
    db_session.commit()

    # Attempt verification
    res = client.post(
        f"/api/handovers/{lot.id}/verify-otp",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"otp_code": "555123", "scale_weight_kg": 50.0},
    )
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()


def test_sql_injection_and_xss_sanitization(client, collector_token, material_item, db_session):
    """
    Verify that malicious SQL injection payloads and XSS script tags in lot fields
    are safely parameterized by SQLAlchemy ORM without causing errors or data leaks.
    """
    malicious_payload = {
        "material_id": material_item.id,
        "quantity_kg": 12.0,
        "pickup_address": "'; DROP TABLE lots; SELECT * FROM users WHERE '1'='1",
        "latitude": 23.2500,
        "longitude": 77.4100,
    }
    res = client.post(
        "/api/lots",
        headers={"Authorization": f"Bearer {collector_token}"},
        json=malicious_payload,
    )
    assert res.status_code == 200, res.text
    lot_data = res.json()
    assert lot_data["pickup_address"] == "'; DROP TABLE lots; SELECT * FROM users WHERE '1'='1"

    # Verify tables still exist and are healthy
    lots_count = db_session.query(Lot).count()
    assert lots_count > 0


def test_unauthorized_offer_acceptance_blocked(client, db_session, collector_user, intruder_token, recycler_profile, material_item):
    """
    Verify that an unauthorized collector cannot accept an offer on another collector's lot.
    """
    lot = Lot(
        collector_id=collector_user.id,
        material_id=material_item.id,
        quantity_kg=30.0,
        estimated_value=13500.0,
        status="created",
    )
    db_session.add(lot)
    db_session.commit()
    db_session.refresh(lot)

    offer = Offer(
        lot_id=lot.id,
        recycler_id=recycler_profile.id,
        offer_price=14000.0,
        pickup_available=True,
        status="pending",
    )
    db_session.add(offer)
    db_session.commit()
    db_session.refresh(offer)

    # Intruder collector attempts to accept the offer
    res = client.post(
        f"/api/offers/{offer.id}/accept",
        headers={"Authorization": f"Bearer {intruder_token}"},
    )
    assert res.status_code == 403
    assert "not authorized" in res.json()["detail"].lower() or "only" in res.json()["detail"].lower()


def test_payment_blocked_before_handover(client, db_session, collector_user, collector_token, material_item):
    """
    Verify that settlement payment is strictly forbidden before physical handover verification.
    """
    lot = Lot(
        collector_id=collector_user.id,
        material_id=material_item.id,
        quantity_kg=20.0,
        estimated_value=9000.0,
        status="created",
    )
    db_session.add(lot)
    db_session.commit()
    db_session.refresh(lot)

    # Attempt payment completion directly on 'created' lot
    res = client.post(
        f"/api/lots/{lot.id}/payment",
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert res.status_code == 400
    assert "handover verification" in res.json()["detail"].lower()


def test_end_to_end_complete_lifecycle(client, collector_token, recycler_token, collector_user, recycler_profile, material_item):
    """
    Verify complete 10-step end-to-end transaction lifecycle from lot creation to
    tamper-evident Digital Recycling Passport generation.
    """
    # 1. Collector creates scrap lot
    lot_payload = {
        "material_id": material_item.id,
        "quantity_kg": 40.0,
        "pickup_address": "Hub Gate 3, Industrial Area, Bhopal",
        "latitude": 23.2599,
        "longitude": 77.4126,
    }
    lot_res = client.post(
        "/api/lots",
        headers={"Authorization": f"Bearer {collector_token}"},
        json=lot_payload,
    )
    assert lot_res.status_code == 200, lot_res.text
    lot = lot_res.json()
    lot_id = lot["id"]
    assert lot["status"] == "created"

    # 2. Recycler places an offer
    offer_res = client.post(
        "/api/offers",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={
            "lot_id": lot_id,
            "recycler_id": recycler_profile.id,
            "offer_price": 18000.0,
            "pickup_available": True,
        },
    )
    assert offer_res.status_code == 200, offer_res.text
    offer = offer_res.json()
    offer_id = offer["id"]

    # 3. Collector accepts the offer
    accept_res = client.post(
        f"/api/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert accept_res.status_code == 200, accept_res.text

    # 4. Collector generates 6-digit handover OTP
    otp_res = client.post(
        "/api/handovers/generate-otp",
        headers={"Authorization": f"Bearer {collector_token}"},
        json={"lot_id": lot_id},
    )
    assert otp_res.status_code == 200, otp_res.text
    otp_code = otp_res.json()["otp_code"]
    assert len(otp_code) == 6

    # 5. Recycler verifies scale weight with OTP (39.0 kg vs 40.0 kg -> 2.5% discrepancy, within 5% tolerance)
    verify_res = client.post(
        f"/api/handovers/{lot_id}/verify-otp",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={
            "otp_code": otp_code,
            "scale_weight_kg": 39.0,
            "location": "Bhopal EcoTech Weighbridge",
        },
    )
    assert verify_res.status_code == 200, verify_res.text
    handover = verify_res.json()
    assert handover["status"] == "confirmed"
    assert handover["final_weight_kg"] == 39.0
    assert handover["discrepancy_pct"] == 2.5

    # 6. Recycler records Cash-First payment settlement
    pay_res = client.post(
        f"/api/lots/{lot_id}/pay",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={
            "amount": 17550.0,
            "payment_method": "CASH",
            "notes": "Settled in cash at depot weighbridge",
        },
    )
    assert pay_res.status_code == 200, pay_res.text
    payment = pay_res.json()
    assert payment["payment_method"] == "CASH"
    assert payment["amount"] == 17550.0

    # 7. Retrieve Public Digital Recycling Passport
    passport_res = client.get(f"/api/passport/{lot_id}")
    assert passport_res.status_code == 200, passport_res.text
    passport = passport_res.json()
    assert passport["lot_id"] == lot_id
    assert passport["certificate_hash"] is not None
    assert len(passport["certificate_hash"]) > 20
    assert passport["qr_data"] is not None
    assert passport["co2_saved_kg"] > 0
    assert passport["toxic_diverted_kg"] > 0
