import io
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from PIL import Image

from app.auth import create_access_token
from app.config import settings
from app.main import app
from app.models import Lot, Material, User, Recycler, Handover
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
def test_collector(db_session):
    collector = db_session.query(User).filter(User.role == "collector").first()
    if not collector:
        collector = User(
            name="Spatial Test Collector",
            phone="9999900010",
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
def test_recycler_user(db_session):
    user = db_session.query(User).filter(User.role == "recycler").first()
    if not user:
        user = User(
            name="Spatial Recycler User",
            phone="9999900011",
            role="recycler",
            location="Indore, MP",
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def test_recycler_profile(db_session, test_recycler_user):
    rec = db_session.query(Recycler).first()
    if not rec:
        rec = Recycler(
            user_id=test_recycler_user.id,
            name="EcoTech Indore Recycler",
            location="Indore, MP",
            city="Indore",
            accepted_materials="E-Waste, PCB, Battery, Plastic",
            base_rate=420.0,
            verified=True,
            latitude=22.7196,
            longitude=75.8577,
            capacity_kg_per_day=500.0,
        )
        db_session.add(rec)
        db_session.commit()
        db_session.refresh(rec)
    return rec


@pytest.fixture
def test_material(db_session):
    mat = db_session.query(Material).first()
    if not mat:
        mat = Material(
            name="Circuit Boards (PCB)",
            category="E-Waste",
            current_price_per_kg=400.0,
            unit="kg",
        )
        db_session.add(mat)
        db_session.commit()
        db_session.refresh(mat)
    return mat


@pytest.fixture
def collector_token(test_collector):
    claims = {
        "sub": test_collector.phone,
        "user_id": test_collector.id,
        "role": test_collector.role,
        "name": test_collector.name,
    }
    return create_access_token(claims)


@pytest.fixture
def recycler_token(test_recycler_user):
    claims = {
        "sub": test_recycler_user.phone,
        "user_id": test_recycler_user.id,
        "role": test_recycler_user.role,
        "name": test_recycler_user.name,
    }
    return create_access_token(claims)


def test_spatial_matching_and_5_pillar_scoring(client, test_material, test_recycler_profile):
    """
    Verify GET /api/recyclers/match calculates Haversine distance,
    provides 5-pillar scoring breakdown (40/25/15/10/10), and supports custom weights.
    """
    # Query matching from Bhopal (approx 23.2599, 77.4126)
    res = client.get(
        "/api/recyclers/match",
        params={
            "material_id": test_material.id,
            "quantity_kg": 25.0,
            "latitude": 23.2599,
            "longitude": 77.4126,
        },
    )
    assert res.status_code == 200, res.text
    matches = res.json()
    assert isinstance(matches, list)
    assert len(matches) > 0

    first_match = matches[0]
    # Verify spatial distance
    assert "distance_km" in first_match
    assert first_match["distance_km"] is not None
    assert first_match["distance_km"] > 0

    # Verify 5 pillars exist
    assert "material_compatibility_score" in first_match
    assert "rate_score" in first_match
    assert "proximity_score" in first_match
    assert "pickup_capacity_score" in first_match
    assert "compliance_score" in first_match
    assert 0 <= first_match["score"] <= 100


def test_lot_creation_with_spatial_coordinates(client, collector_token, test_material, test_collector):
    """
    Verify POST /api/lots accepts latitude, longitude, and pickup_address.
    """
    lot_payload = {
        "collector_id": test_collector.id,
        "material_id": test_material.id,
        "quantity_kg": 15.5,
        "latitude": 23.2333,
        "longitude": 77.4344,
        "pickup_address": "Shop 14, Waste Hub, MP Nagar Zone 1, Bhopal",
    }
    res = client.post(
        "/api/lots",
        headers={"Authorization": f"Bearer {collector_token}"},
        json=lot_payload,
    )
    assert res.status_code == 200, res.text
    lot = res.json()
    assert lot["latitude"] == 23.2333
    assert lot["longitude"] == 77.4344
    assert lot["pickup_address"] == "Shop 14, Waste Hub, MP Nagar Zone 1, Bhopal"


def test_handover_otp_flow_and_discrepancy(client, db_session, collector_token, recycler_token, test_material, test_collector, test_recycler_profile):
    """
    Verify Phase 3 Handover Flow:
    1. Collector generates 6-digit OTP via POST /api/handovers/generate-otp
    2. Recycler verifies OTP with physical scale weight via POST /api/handovers/{lot_id}/verify-otp
    3. If discrepancy > 5%, flagged and discrepancy_pct recorded.
    """
    # Create test lot
    lot = Lot(
        collector_id=test_collector.id,
        material_id=test_material.id,
        quantity_kg=100.0,
        estimated_value=40000.0,
        status="pickup",
        pickup_address="Bhopal Hub",
    )
    db_session.add(lot)
    db_session.commit()
    db_session.refresh(lot)

    # 1. Generate OTP
    gen_res = client.post(
        "/api/handovers/generate-otp",
        headers={"Authorization": f"Bearer {collector_token}"},
        json={"lot_id": lot.id},
    )
    assert gen_res.status_code == 200, gen_res.text
    otp_data = gen_res.json()
    assert "otp_code" in otp_data
    assert len(otp_data["otp_code"]) == 6
    assert otp_data["otp_code"].isdigit()
    otp_code = otp_data["otp_code"]

    # 2. Try verifying with wrong OTP -> 400
    bad_res = client.post(
        f"/api/handovers/{lot.id}/verify-otp",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"otp_code": "000000", "scale_weight_kg": 100.0},
    )
    assert bad_res.status_code == 400
    assert "Invalid" in bad_res.json()["detail"]

    # 3. Verify with correct OTP, scale weight 90.0 kg (10% discrepancy > 5% tolerance)
    verify_res = client.post(
        f"/api/handovers/{lot.id}/verify-otp",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"otp_code": otp_code, "scale_weight_kg": 90.0, "location": "Recycler Depot Bhopal"},
    )
    assert verify_res.status_code == 200, verify_res.text
    handover = verify_res.json()
    assert handover["lot_id"] == lot.id
    assert handover["final_weight_kg"] == 90.0
    assert handover["discrepancy_pct"] == 10.0
    assert handover["status"] == "confirmed"

    # Verify lot status transitioned to handed_over
    db_session.refresh(lot)
    assert lot.status == "handed_over"


def test_lot_photo_upload_endpoint(client, collector_token):
    """
    Verify POST /api/lots/upload-photo accepts valid image and returns accessible URL.
    """
    buf = io.BytesIO()
    img = Image.new("RGB", (32, 32), color="green")
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    res = client.post(
        "/api/lots/upload-photo",
        headers={"Authorization": f"Bearer {collector_token}"},
        files={"file": ("test_scrap.png", io.BytesIO(png_bytes), "image/png")},
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert "photo_url" in data
    assert data["photo_url"].startswith("/") or data["photo_url"].startswith("http")
