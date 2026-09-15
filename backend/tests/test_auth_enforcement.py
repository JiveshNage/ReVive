from fastapi.testclient import TestClient
from app.auth import create_access_token
from app.main import app
from app.database import SessionLocal
from app.models import Lot, Recycler, User

client = TestClient(app)


def get_token(role: str, user_id: int, phone: str) -> str:
    return create_access_token({
        "sub": phone,
        "user_id": user_id,
        "role": role,
        "custom_user_id": f"TEST-{role.upper()}-{user_id}",
        "name": f"Test {role.capitalize()}",
    })


def test_unauthenticated_recycler_verify_returns_401():
    """Unauthenticated POST /api/recyclers/{id}/verify must return 401."""
    res = client.post("/api/recyclers/1/verify", json={"verified": True})
    assert res.status_code in (401, 403), f"Expected 401/403, got {res.status_code}: {res.text}"


def test_non_admin_recycler_verify_returns_403():
    """Collector attempting to verify a recycler must return 403."""
    token = get_token("collector", 1, "9876543210")
    res = client.post(
        "/api/recyclers/1/verify",
        json={"verified": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}: {res.text}"


def test_collector_cannot_fetch_other_collectors_lots():
    """Collector A's JWT cannot fetch Collector B's lots via GET /api/lots."""
    # Ensure Collector A (user 1) and Collector B (user 3) exist
    token_a = get_token("collector", 1, "9876543210")
    token_b = get_token("collector", 3, "9988776655")

    # Collector A creates a lot
    create_res = client.post(
        "/api/lots",
        json={"collector_id": 1, "material_id": 1, "quantity_kg": 15.0},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert create_res.status_code == 200, create_res.text
    lot_a_id = create_res.json()["id"]

    # Collector B lists lots - should NOT see lot_a_id
    list_res = client.get("/api/lots", headers={"Authorization": f"Bearer {token_b}"})
    assert list_res.status_code == 200
    b_lots = list_res.json()
    b_lot_ids = [lot["id"] for lot in b_lots]
    assert lot_a_id not in b_lot_ids, f"Collector B should not see Collector A's lot {lot_a_id}"


def test_recycler_match_and_offer_creation_no_404():
    """Recycler match returned by /api/recyclers/match can be used to successfully POST /api/offers without 404."""
    # 1. Get recycler matches
    match_res = client.get("/api/recyclers/match?category=PCB&location=Pune&limit=5")
    assert match_res.status_code == 200, match_res.text
    matches = match_res.json()
    assert len(matches) > 0, "Expected at least one matched recycler"

    matched = matches[0]
    rec_id = matched["recycler_id"]
    assert rec_id > 0

    # 2. Collector creates a lot
    token_col = get_token("collector", 1, "9876543210")
    lot_res = client.post(
        "/api/lots",
        json={"collector_id": 1, "material_id": 1, "quantity_kg": 25.0},
        headers={"Authorization": f"Bearer {token_col}"},
    )
    assert lot_res.status_code == 200
    lot_id = lot_res.json()["id"]

    # 3. Admin or matched recycler makes an offer with this recycler_id
    token_admin = get_token("admin", 4, "9998887770")
    offer_res = client.post(
        "/api/offers",
        json={
            "lot_id": lot_id,
            "recycler_id": rec_id,
            "offer_price": 500.0,
        },
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert offer_res.status_code == 200, f"Expected 200, got {offer_res.status_code}: {offer_res.text}"
    offer_data = offer_res.json()
    assert offer_data["recycler_id"] == rec_id
    assert offer_data["lot_id"] == lot_id


def test_discrepancy_flagged_on_handover_weight_variance():
    """Handover with > 10% weight discrepancy flags discrepancy_flagged = True."""
    token_col = get_token("collector", 1, "9876543210")
    lot_res = client.post(
        "/api/lots",
        json={"collector_id": 1, "material_id": 1, "quantity_kg": 100.0},
        headers={"Authorization": f"Bearer {token_col}"},
    )
    assert lot_res.status_code == 200
    lot_id = lot_res.json()["id"]

    # Handover with 80kg instead of 100kg (20% discrepancy)
    handover_res = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 80.0,
            "handover_location": "Bhopal Center",
            "collector_confirmed": True,
            "recycler_confirmed": True,
        },
        headers={"Authorization": f"Bearer {token_col}"},
    )
    assert handover_res.status_code == 200, handover_res.text
    data = handover_res.json()
    assert data["discrepancy_flagged"] is True
    assert data["handover_reference"] is not None
