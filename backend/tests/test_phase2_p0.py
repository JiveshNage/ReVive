import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from jose import jwt

from app.auth import create_access_token
from app.config import settings
from app.main import app
from app.models import Lot, Material, User, Recycler
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
            name="Test Collector",
            phone="9999900001",
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
def collector_token(test_collector):
    claims = {
        "sub": test_collector.phone,
        "user_id": test_collector.id,
        "role": test_collector.role,
        "name": test_collector.name,
    }
    return create_access_token(claims)


def test_firebase_auth_verify_and_role_safety(client, db_session):
    """
    Verify that Firebase ID token exchange works and ALWAYS enforces 'collector' role
    on newly provisioned users regardless of client claims.
    """
    # Craft a synthetic Firebase token with proper issuer and expiry
    now_ts = int(datetime.now(timezone.utc).timestamp())
    fb_claims = {
        "iss": f"https://securetoken.google.com/{settings.firebase_project_id or 'revive-sih2026'}",
        "aud": settings.firebase_project_id or "revive-sih2026",
        "sub": "firebase_uid_987654",
        "phone_number": "+919876549999",
        "name": "Firebase Verified Collector",
        "role": "admin",  # Malicious attempt: client claims to be admin!
        "exp": now_ts + 3600,
        "iat": now_ts,
    }
    # Encode with any key (simulating RSA or bearer claims)
    synthetic_token = jwt.encode(fb_claims, "secret-test-key", algorithm="HS256")

    response = client.post(
        "/api/auth/firebase/verify",
        json={"id_token": synthetic_token},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    # CRITICAL: Role must NOT be admin; must be collector!
    assert data["user"]["role"] == "collector"
    assert data["user"]["name"] == "Firebase Verified Collector"


def test_explainable_pricing_breakdown(client):
    """
    Verify that /api/prices/estimate returns the 'why_this_price' itemized breakdown
    and historical 7-day trend curve.
    """
    response = client.get("/api/prices/estimate?category=PCB&location=Bhopal&weight_kg=12.5")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "PCB"
    assert data["weight_kg"] == 12.5
    assert data["price_per_kg_median"] > 0
    assert data["suggested_rate_per_kg"] >= data["price_per_kg_median"]

    # Verify 'why_this_price' breakdown
    why = data.get("why_this_price", [])
    assert len(why) >= 3
    factors = [item["factor"] for item in why]
    assert "Regional Median Base" in factors
    assert "Recommended Fair Rate" in factors

    # Verify 7-day trend
    history = data.get("historical_7d", [])
    assert len(history) == 7
    assert history[-1]["day"] == "Today"
    assert data.get("trend_pct_7d") is not None


def test_cash_first_payment_and_earnings_ledger(client, test_collector, collector_token, db_session):
    """
    Verify complete Cash-first settlement flow:
    1. Create a scrap lot
    2. Process CASH payment
    3. Verify Payment record created with cash confirmation
    4. Query Collector Earnings Ledger and verify today's earnings and transaction history
    5. Query Collector Reputation
    """
    material = db_session.query(Material).first()
    assert material is not None

    headers = {"Authorization": f"Bearer {collector_token}"}

    # 1. Create a lot
    lot_resp = client.post(
        "/api/lots",
        headers=headers,
        json={
            "collector_id": test_collector.id,
            "material_id": material.id,
            "quantity_kg": 15.0,
        },
    )
    assert lot_resp.status_code == 200
    lot_data = lot_resp.json()
    lot_id = lot_data["id"]

    # 2. Process Cash Payment
    pay_resp = client.post(
        f"/api/lots/{lot_id}/pay",
        headers=headers,
        json={
            "lot_id": lot_id,
            "amount": 2250.0,
            "payment_method": "CASH",
            "notes": "Cash handed over directly at physical scales",
        },
    )
    assert pay_resp.status_code == 200, pay_resp.text
    pay_data = pay_resp.json()
    assert pay_data["payment_method"] == "CASH"
    assert pay_data["amount"] == 2250.0
    assert pay_data["cash_received_confirmed"] is True
    assert pay_data["payment_status"] == "COMPLETED"
    assert "REV-PAY-2026-" in pay_data["payment_reference"]

    # 3. Query Collector Earnings Ledger
    earnings_resp = client.get(
        f"/api/collector/{test_collector.id}/earnings",
        headers=headers,
    )
    assert earnings_resp.status_code == 200
    earnings_data = earnings_resp.json()
    assert earnings_data["collector_id"] == test_collector.id
    assert earnings_data["today_earnings"] >= 2250.0
    assert earnings_data["completed_cash_amount"] >= 2250.0
    assert len(earnings_data["transactions"]) >= 1

    # Check transaction entry
    recent_tx = earnings_data["transactions"][0]
    assert recent_tx["payment_method"] == "CASH"
    assert recent_tx["status"] == "PAID"

    # 4. Query Collector Formalization Reputation
    rep_resp = client.get(
        f"/api/collector/{test_collector.id}/reputation",
        headers=headers,
    )
    assert rep_resp.status_code == 200
    rep_data = rep_resp.json()
    assert rep_data["collector_id"] == test_collector.id
    assert rep_data["total_transactions"] >= 1
    assert rep_data["formalized_kg"] >= 15.0
    assert rep_data["reputation_tier"] == "VERIFIED_COLLECTOR"
