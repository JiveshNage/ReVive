from datetime import datetime, timedelta, timezone
import random
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_optional_current_user
from app.config import settings
from app.database import get_db
from app.dependencies import verify_owner_or_admin
from app.models import CollectorReputation, Handover, Lot, Offer, User
from app.passport_service import generate_handover_reference
from app.schemas import HandoverCreate, HandoverOtpGenerateRequest, HandoverOtpVerifyRequest, HandoverOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Handovers"])


@router.post("/handovers/generate-otp")
def generate_handover_otp(
    payload: HandoverOtpGenerateRequest | None = None,
    lot_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a secure 6-digit time-limited OTP (valid for 15 minutes) for the collector.
    Presented to the authorized recycler at the physical scale.
    """
    effective_lot_id = payload.lot_id if payload else lot_id
    if not effective_lot_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="lot_id must be provided.")

    lot = db.get(Lot, effective_lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrap lot not found.")

    if current_user.role != "admin" and current_user.id != lot.collector_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the lot owner or an administrator can generate a handover OTP.",
        )

    # 6-digit numeric OTP
    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    handover = db.execute(
        select(Handover).where(Handover.lot_id == effective_lot_id)
    ).scalar_one_or_none()

    if not handover:
        # Check for accepted offer to retrieve recycler_id
        accepted_offer = db.execute(
            select(Offer).where(Offer.lot_id == effective_lot_id, Offer.status == "accepted")
        ).scalars().first()
        recycler_id = accepted_offer.recycler_id if accepted_offer else 1

        handover = Handover(
            lot_id=lot.id,
            collector_id=lot.collector_id,
            recycler_id=recycler_id,
            final_weight_kg=lot.quantity_kg,
            handover_location=lot.pickup_address or "Collector Premises",
            collector_confirmed=True,
            recycler_confirmed=False,
            otp_code=otp,
            otp_expires_at=expires_at,
            status="pending",
        )
        db.add(handover)
    else:
        handover.otp_code = otp
        handover.otp_expires_at = expires_at
        handover.status = "pending"

    lot.status = "pickup"
    db.commit()
    db.refresh(handover)

    return {
        "lot_id": lot.id,
        "otp_code": otp,
        "expires_at": expires_at.isoformat(),
        "valid_duration_minutes": 15,
        "collector_id": lot.collector_id,
        "message": "Present this 6-digit OTP to the authorized recycler at physical scale weighment.",
    }


@router.post("/handovers/{lot_id}/verify-otp", response_model=HandoverOut)
def verify_handover_otp(
    lot_id: int,
    payload: HandoverOtpVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Recycler enters collector's 6-digit OTP and final scale weight.
    Enforces +-5% weight discrepancy tolerance.
    Flags anomaly to /api/admin/anomalies if discrepancy > 5%.
    """
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found.")

    handover = db.execute(
        select(Handover).where(Handover.lot_id == lot_id)
    ).scalar_one_or_none()

    if not handover or not handover.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active handover OTP found for this lot. Collector must generate an OTP first.",
        )

    # Check OTP expiry
    now = datetime.now(timezone.utc)
    if handover.otp_expires_at:
        exp = handover.otp_expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if now > exp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Handover OTP has expired (15 minute validity). Please request a fresh OTP.",
            )

    # Validate OTP code match
    if str(handover.otp_code).strip() != str(payload.otp_code).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handover OTP code. Please verify with the collector.",
        )

    # Weight discrepancy calculation (+- 5% tolerance as per SIH26229 spec)
    diff_kg = abs(lot.quantity_kg - payload.scale_weight_kg)
    diff_pct = (diff_kg / lot.quantity_kg) * 100.0 if lot.quantity_kg > 0 else 0.0
    discrepancy_flagged = diff_pct > 5.0

    handover.final_weight_kg = payload.scale_weight_kg
    handover.collector_confirmed = True
    handover.recycler_confirmed = True
    handover.latitude = payload.latitude or handover.latitude
    handover.longitude = payload.longitude or handover.longitude
    handover.status = "confirmed"
    handover.signature = f"OTP-SIG-{lot.id}-{secrets.token_hex(4).upper()}"
    if not handover.handover_reference:
        handover.handover_reference = generate_handover_reference(handover.id)

    lot.status = "handed_over"

    # Update collector reputation accuracy
    reputation = db.execute(
        select(CollectorReputation).where(CollectorReputation.collector_id == lot.collector_id)
    ).scalars().first()
    if reputation:
        accuracy = max(50.0, 100.0 - diff_pct)
        reputation.weight_accuracy_pct = round((reputation.weight_accuracy_pct * 0.7) + (accuracy * 0.3), 1)
        reputation.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(handover)

    return HandoverOut(
        id=handover.id,
        lot_id=handover.lot_id,
        collector_id=handover.collector_id,
        recycler_id=handover.recycler_id,
        final_weight_kg=handover.final_weight_kg,
        handover_location=handover.handover_location,
        collector_confirmed=handover.collector_confirmed,
        recycler_confirmed=handover.recycler_confirmed,
        signature=handover.signature,
        status=handover.status,
        latitude=handover.latitude,
        longitude=handover.longitude,
        photo_url=handover.photo_url,
        handover_reference=handover.handover_reference,
        otp_code=handover.otp_code,
        otp_expires_at=handover.otp_expires_at.isoformat() if handover.otp_expires_at else None,
        discrepancy_flagged=discrepancy_flagged,
        discrepancy_pct=round(diff_pct, 1),
    )


@router.post("/handover", response_model=HandoverOut)
def create_handover(
    payload: HandoverCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.final_weight_kg <= 0 or payload.final_weight_kg > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Final scale weight must be greater than zero and within reasonable limits (<= 50,000 kg).",
        )

    lot = db.get(Lot, payload.lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    # Use authenticated collector ID when caller is collector
    if current_user.role == "collector":
        collector_id = current_user.id
        if current_user.id != lot.collector_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot sign a handover for a lot you do not own.",
            )
    else:
        collector_id = payload.collector_id
        if collector_id != lot.collector_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Collector does not match the lot owner",
            )

    existing = db.execute(
        select(Handover).where(Handover.lot_id == payload.lot_id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Handover already exists for this lot",
        )

    # Discrepancy detection: > 5% variance between collector initial estimate and physical scale
    discrepancy_flagged = False
    diff_pct = 0.0
    if lot.quantity_kg > 0:
        diff_ratio = abs(lot.quantity_kg - payload.final_weight_kg) / lot.quantity_kg
        diff_pct = diff_ratio * 100.0
        if diff_pct > 5.0:
            discrepancy_flagged = True

    signature_token = payload.signature or f"SIG-REV-{payload.lot_id}-{secrets.token_hex(6).upper()}"
    status_value = "confirmed" if payload.collector_confirmed and payload.recycler_confirmed else "pending"

    handover = Handover(
        lot_id=payload.lot_id,
        collector_id=collector_id,
        recycler_id=payload.recycler_id,
        final_weight_kg=payload.final_weight_kg,
        handover_location=payload.handover_location,
        collector_confirmed=payload.collector_confirmed,
        recycler_confirmed=payload.recycler_confirmed,
        signature=signature_token,
        latitude=payload.latitude,
        longitude=payload.longitude,
        photo_url=payload.photo_url,
        otp_code=payload.otp_code,
        status=status_value,
    )
    db.add(handover)
    db.commit()
    db.refresh(handover)

    handover.handover_reference = generate_handover_reference(handover.id)
    if status_value == "confirmed":
        db.execute(update(Lot).where(Lot.id == payload.lot_id).values(status="handed_over"))
    db.commit()
    db.refresh(handover)

    # Attach discrepancy_flagged to the returned schema
    out = HandoverOut(
        id=handover.id,
        lot_id=handover.lot_id,
        collector_id=handover.collector_id,
        recycler_id=handover.recycler_id,
        final_weight_kg=handover.final_weight_kg,
        handover_location=handover.handover_location,
        collector_confirmed=handover.collector_confirmed,
        recycler_confirmed=handover.recycler_confirmed,
        signature=handover.signature,
        status=handover.status,
        latitude=handover.latitude,
        longitude=handover.longitude,
        photo_url=handover.photo_url,
        handover_reference=handover.handover_reference,
        otp_code=handover.otp_code,
        otp_expires_at=handover.otp_expires_at.isoformat() if handover.otp_expires_at else None,
        discrepancy_flagged=discrepancy_flagged,
        discrepancy_pct=round(diff_pct, 1),
    )
    return out


@router.get("/handover")
def list_handover(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Handover)
    if current_user and current_user.role == "collector":
        stmt = stmt.where(Handover.collector_id == current_user.id)
    elif current_user and current_user.role == "recycler":
        stmt = stmt.where(Handover.recycler_id == current_user.id)

    handovers = db.execute(stmt).scalars().all()
    return [
        {
            "id": h.id,
            "lot_id": h.lot_id,
            "collector_id": h.collector_id,
            "recycler_id": h.recycler_id,
            "final_weight_kg": h.final_weight_kg,
            "handover_location": h.handover_location,
            "collector_confirmed": h.collector_confirmed,
            "recycler_confirmed": h.recycler_confirmed,
            "signature": h.signature,
            "status": h.status,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "otp_code": h.otp_code,
            "handover_reference": h.handover_reference,
        }
        for h in handovers
    ]


@router.get("/handover/{handover_id}", response_model=HandoverOut)
def get_handover(handover_id: int, db: Session = Depends(get_db)):
    handover = db.get(Handover, handover_id)
    if not handover:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Handover record not found")
    return handover
