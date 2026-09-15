from fastapi.testclient import TestClient

from app.auth import create_access_token
from app.main import app

client = TestClient(app)


def get_auth_headers(role: str = "collector", user_id: int | None = None, phone: str = "9876543210"):
    from app.database import SessionLocal
    from app.models import User
    db = SessionLocal()
    user = db.query(User).filter(User.phone == phone).first()
    resolved_id = user.id if user else (user_id or 1)
    db.close()
    token = create_access_token({
        "sub": phone,
        "user_id": resolved_id,
        "role": role,
        "custom_user_id": f"TEST-{role.upper()}-{resolved_id}",
        "name": f"Test {role.capitalize()}",
    })
    return {"Authorization": f"Bearer {token}"}


collector_headers = get_auth_headers("collector", 1, "9876543210")
recycler_headers = get_auth_headers("recycler", 2, "9123456780")
admin_headers = get_auth_headers("admin", 4, "9998887770")


def test_lot_can_be_created_and_fetched_by_id():
    response = client.post(
        "/api/lots",
        json={
            "collector_id": 1,
            "material_id": 1,
            "quantity_kg": 8.5,
            "photo_url": "https://example.com/pcb.jpg",
        },
        headers=collector_headers,
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    lot_id = payload["id"]
    assert lot_id > 0
    assert payload.get("lot_reference") is not None

    fetch_response = client.get(f"/api/lots/{lot_id}")
    assert fetch_response.status_code == 200, fetch_response.text
    body = fetch_response.json()
    assert body["id"] == lot_id
    assert body["status"] == "created"
    assert body["quantity_kg"] == 8.5


def test_lot_payment_can_be_marked_complete():
    response = client.post(
        "/api/lots",
        json={
            "collector_id": 1,
            "material_id": 2,
            "quantity_kg": 4.5,
            "photo_url": "https://example.com/copper.jpg",
        },
        headers=collector_headers,
    )
    assert response.status_code == 200, response.text
    lot_id = response.json()["id"]

    offer_response = client.post(
        "/api/offers",
        json={
            "lot_id": lot_id,
            "recycler_id": 1,
            "offer_price": 450,
            "pickup_available": True,
        },
        headers=recycler_headers,
    )
    assert offer_response.status_code == 200, offer_response.text

    accept_response = client.post(
        f"/api/offers/{offer_response.json()['id']}/accept",
        headers=collector_headers,
    )
    assert accept_response.status_code == 200, accept_response.text

    payment_response = client.post(
        f"/api/lots/{lot_id}/payment",
        headers=collector_headers,
    )
    assert payment_response.status_code == 200, payment_response.text
    assert payment_response.json()["status"] == "payment_completed"


def test_handover_record_is_created_and_traceable():
    response = client.post(
        "/api/lots",
        json={
            "collector_id": 1,
            "material_id": 3,
            "quantity_kg": 6.2,
            "photo_url": "https://example.com/battery.jpg",
        },
        headers=collector_headers,
    )
    assert response.status_code == 200, response.text
    lot_id = response.json()["id"]

    offer_response = client.post(
        "/api/offers",
        json={
            "lot_id": lot_id,
            "recycler_id": 1,
            "offer_price": 680,
            "pickup_available": True,
        },
        headers=recycler_headers,
    )
    assert offer_response.status_code == 200, offer_response.text

    accept_response = client.post(
        f"/api/offers/{offer_response.json()['id']}/accept",
        headers=collector_headers,
    )
    assert accept_response.status_code == 200, accept_response.text

    handover_response = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 5.9,
            "handover_location": "Bhopal",
            "collector_confirmed": True,
            "recycler_confirmed": True,
            "signature": "sig-battery-5",
            "latitude": 23.2599,
            "longitude": 77.4126,
        },
        headers=collector_headers,
    )
    assert handover_response.status_code == 200, handover_response.text
    handover = handover_response.json()
    assert handover["lot_id"] == lot_id
    assert handover["status"] == "confirmed"
    assert handover["final_weight_kg"] == 5.9
    assert handover["handover_reference"] is not None

    fetch_response = client.get(f"/api/handover/{handover['id']}")
    assert fetch_response.status_code == 200, fetch_response.text
    assert fetch_response.json()["lot_id"] == lot_id

    # Verify lot status transitioned to handed_over
    lot_check = client.get(f"/api/lots/{lot_id}")
    assert lot_check.status_code == 200
    assert lot_check.json()["status"] == "handed_over"


def test_full_traceability_lifecycle_and_certificate():
    # 1. Create Lot
    lot_res = client.post(
        "/api/lots",
        json={
            "collector_id": 1,
            "material_id": 2,
            "quantity_kg": 10.0,
            "photo_url": "https://example.com/pcb-audit.jpg",
        },
        headers=collector_headers,
    )
    assert lot_res.status_code == 200
    lot_id = lot_res.json()["id"]

    # 2. Offer
    offer_res = client.post(
        "/api/offers",
        json={
            "lot_id": lot_id,
            "recycler_id": 1,
            "offer_price": 1500.0,
            "pickup_available": True,
        },
        headers=recycler_headers,
    )
    assert offer_res.status_code == 200
    offer_id = offer_res.json()["id"]

    # 3. Accept Offer
    accept_res = client.post(
        f"/api/offers/{offer_id}/accept",
        headers=collector_headers,
    )
    assert accept_res.status_code == 200

    # 4. Handover
    handover_res = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 9.8,
            "handover_location": "Pune Industrial Area",
            "collector_confirmed": True,
            "recycler_confirmed": True,
            "signature": "SHA256-DIGITAL-SIG-PC10",
        },
        headers=collector_headers,
    )
    assert handover_res.status_code == 200

    # 5. Payment
    payment_res = client.post(
        f"/api/lots/{lot_id}/payment",
        headers=collector_headers,
    )
    assert payment_res.status_code == 200

    # 6. Verify Complete Traceability Chain
    trace_res = client.get(f"/api/lots/{lot_id}/traceability")
    assert trace_res.status_code == 200, trace_res.text
    trace = trace_res.json()

    assert trace["lot_id"] == lot_id
    assert trace["lot_status"] == "payment_completed"
    assert trace["quantity_kg"] == 10.0
    assert trace["final_weight_kg"] == 9.8
    assert trace["weight_discrepancy_kg"] == 0.2
    assert trace["final_price"] == 1500.0
    assert trace["material"]["name"] == "PCB"
    assert trace["recycler"]["id"] == 1
    assert trace["handover"]["status"] == "confirmed"
    assert len(trace["certificate_hash"]) == 64
    assert len(trace["timeline"]) == 5
    assert all(event["completed"] for event in trace["timeline"])


def test_handover_validation_errors():
    lot_res = client.post(
        "/api/lots",
        json={
            "collector_id": 1,
            "material_id": 2,
            "quantity_kg": 3.0,
        },
        headers=collector_headers,
    )
    assert lot_res.status_code == 200
    lot_id = lot_res.json()["id"]

    # Mismatched collector error (admin submitting mismatched collector_id)
    bad_collector = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 99,
            "recycler_id": 1,
            "final_weight_kg": 3.0,
            "handover_location": "Bhopal",
        },
        headers=admin_headers,
    )
    assert bad_collector.status_code == 400
    assert "Collector does not match" in bad_collector.json()["detail"]

    # First valid handover
    good_handover = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 3.0,
            "handover_location": "Bhopal",
        },
        headers=collector_headers,
    )
    assert good_handover.status_code == 200

    # Duplicate handover attempt should conflict (409)
    dup_handover = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 3.0,
            "handover_location": "Bhopal",
        },
        headers=collector_headers,
    )
    assert dup_handover.status_code == 409


def test_price_estimation_and_benchmarks():
    res = client.get("/api/prices/estimate", params={"category": "PCB", "location": "Bhopal", "weight_kg": 4.0})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["category"] == "PCB"
    assert data["weight_kg"] == 4.0
    assert data["price_per_kg_median"] > 0
    assert data["estimated_value"] > 0
    assert data["price_min"] <= data["price_max"]
    assert data["samples"] > 0

    benchmarks_res = client.get("/api/prices/benchmarks")
    assert benchmarks_res.status_code == 200
    benchmarks = benchmarks_res.json()
    assert len(benchmarks) > 0
    assert any(b["category"] == "PCB" for b in benchmarks)


def test_recycler_matching():
    res = client.get("/api/recyclers/match", params={"category": "PCB", "location": "Bhopal", "limit": 3})
    assert res.status_code == 200, res.text
    matches = res.json()
    assert len(matches) > 0
    assert len(matches) <= 3
    assert matches[0]["authorization_status"] == "Authorized"


def test_ai_prediction_endpoint():
    from pathlib import Path
    img_path = Path(__file__).resolve().parents[2] / "Ai" / "SIH_2026-main" / "pcb_test.jpg"
    assert img_path.exists(), f"Image path {img_path} not found"

    with open(img_path, "rb") as f:
        res = client.post(
            "/api/ai/predict",
            params={"location": "Bhopal", "weight_kg": 2.5},
            files={"file": ("pcb_test.jpg", f, "image/jpeg")},
        )
    assert res.status_code in (200, 503), res.text
    if res.status_code == 200:
        pred = res.json()
        assert pred["category"] == "PCB"
        assert pred["confidence"] >= 0.3
        assert pred["confidence_tier"] in ["high", "medium", "low"]
        assert pred["recommendation"] in ["strong_suggestion", "confirm_manually", "manual_required"]
        assert pred["pricing"] is not None
        assert pred["pricing"]["estimated_value"] > 0
        assert len(pred["top_predictions"]) >= 1
        assert len(pred["recycler_matches"]) >= 1


def test_recycling_passport_by_id_and_reference():
    # Create lot
    lot_res = client.post(
        "/api/lots",
        json={"collector_id": 1, "material_id": 2, "quantity_kg": 5.0},
        headers=collector_headers,
    )
    assert lot_res.status_code in [200, 201]
    lot_id = lot_res.json()["id"]

    # 1. Fetch by numeric ID
    res_id = client.get(f"/api/passport/{lot_id}")
    assert res_id.status_code == 200, res_id.text
    passport = res_id.json()
    assert passport["lot_id"] == lot_id
    assert passport["passport_id"] == f"REV-2026-LOT-{lot_id:04d}"
    assert passport["material_name"] == "PCB"
    assert passport["initial_weight_kg"] == 5.0
    assert passport["co2_saved_kg"] == round(5.0 * 1.44, 2)
    assert passport["toxic_diverted_kg"] > 0
    assert len(passport["certificate_hash"]) == 64
    assert "REVIVE-PASSPORT" in passport["qr_data"]
    assert len(passport["timeline"]) == 5

    # 2. Fetch by formatted reference string
    ref_string = f"REV-2026-LOT-{lot_id:04d}"
    res_ref = client.get(f"/api/passport/{ref_string}")
    assert res_ref.status_code == 200
    assert res_ref.json()["passport_id"] == ref_string

    # 3. Not found reference
    res_not_found = client.get("/api/passport/REV-2026-LOT-99999")
    assert res_not_found.status_code == 404


def test_safety_guidance_endpoint():
    res = client.get("/api/safety/guidance")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 4

    cable = next((x for x in items if x["material_key"] == "cable"), None)
    assert cable is not None
    assert "Do not burn wire" in cable["vernacular_slogan"]["en"]
    assert "तार मत जलाओ" in cable["vernacular_slogan"]["hi"]
    assert "वायर जाळू नका" in cable["vernacular_slogan"]["mr"]
    assert len(cable["dos"]) > 0
    assert len(cable["donts"]) > 0

    filter_res = client.get("/api/safety/guidance", params={"category": "battery"})
    assert filter_res.status_code == 200
    filter_items = filter_res.json()["items"]
    assert len(filter_items) >= 1
    assert filter_items[0]["material_key"] == "battery"


def test_admin_metrics_endpoint():
    res = client.get("/api/admin/metrics", headers=admin_headers)
    assert res.status_code == 200, res.text
    metrics = res.json()
    assert "total_lots" in metrics
    assert metrics["total_lots"] >= 1
    assert "active_lots" in metrics
    assert "completed_lots" in metrics
    assert "total_weight_kg" in metrics
    assert "co2_saved_kg" in metrics
    assert "toxic_metals_diverted_kg" in metrics
    assert metrics["total_recyclers"] >= 1
    assert 0.0 <= metrics["recycler_verification_ratio"] <= 1.0


def test_admin_anomalies_and_resolution():
    # 1. Create a lot with 10 kg
    lot_res = client.post(
        "/api/lots",
        json={"collector_id": 1, "material_id": 1, "quantity_kg": 10.0},
        headers=collector_headers,
    )
    assert lot_res.status_code == 200
    lot_id = lot_res.json()["id"]

    # 2. Create handover with significant discrepancy (4 kg instead of 10 kg -> 60% error)
    handover_res = client.post(
        "/api/handover",
        json={
            "lot_id": lot_id,
            "collector_id": 1,
            "recycler_id": 1,
            "final_weight_kg": 4.0,
            "handover_location": "Bhopal Hub",
            "collector_confirmed": True,
            "recycler_confirmed": True,
        },
        headers=collector_headers,
    )
    assert handover_res.status_code == 200
    # Verify discrepancy_flagged is True
    assert handover_res.json().get("discrepancy_flagged") is True

    # 3. Check anomaly is detected
    anom_res = client.get("/api/admin/anomalies", headers=admin_headers)
    assert anom_res.status_code == 200
    anomalies = anom_res.json()
    wt_anom = next((a for a in anomalies if a["lot_id"] == lot_id and a["type"] == "weight_discrepancy"), None)
    assert wt_anom is not None
    assert wt_anom["severity"] in ["high", "medium"]
    assert wt_anom["status"] == "open"

    # 4. Resolve the anomaly
    resolve_res = client.post(f"/api/admin/anomalies/{wt_anom['id']}/resolve", headers=admin_headers)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

    # 5. Check status is now resolved
    anom_res2 = client.get("/api/admin/anomalies", headers=admin_headers)
    wt_anom2 = next((a for a in anom_res2.json() if a["id"] == wt_anom["id"]), None)
    assert wt_anom2 is not None
    assert wt_anom2["status"] == "resolved"


def test_recycler_verification_toggle():
    # Toggle off
    res_off = client.post("/api/recyclers/1/verify", json={"verified": False}, headers=admin_headers)
    assert res_off.status_code == 200
    assert res_off.json()["verified"] is False

    # Toggle on
    res_on = client.post("/api/recyclers/1/verify", json={"verified": True}, headers=admin_headers)
    assert res_on.status_code == 200
    assert res_on.json()["verified"] is True


def test_sih_demo_workflow_endpoint():
    res = client.post("/api/demo/run-workflow")
    assert res.status_code == 200, res.text
    demo = res.json()
    assert demo["success"] is True
    assert demo["lot_id"] > 0
    assert demo["passport_id"].startswith("REV-2026-LOT-")
    assert len(demo["steps_completed"]) == 7
    assert len(demo["certificate_hash"]) == 64
    assert "REVIVE-PASSPORT" in demo["qr_data"]

    # Verify that the generated lot has a live verifiable passport
    pass_res = client.get(f"/api/passport/{demo['passport_id']}")
    assert pass_res.status_code == 200
    passport = pass_res.json()
    assert passport["status"] == "payment_completed"
    assert passport["lot_id"] == demo["lot_id"]
    assert passport["initial_weight_kg"] == 14.5
    assert passport["verified_weight_kg"] == 14.2
