import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_optional_current_user
from app.config import settings
from app.database import get_db
from app.dependencies import verify_owner_or_admin
from app.models import Handover, Lot, User
from app.passport_service import generate_handover_reference
from app.schemas import HandoverCreate, HandoverOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Handovers"])


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

    # Discrepancy detection: > 10% variance between collector initial estimate and physical scale
    discrepancy_flagged = False
    if lot.quantity_kg > 0:
        diff_ratio = abs(lot.quantity_kg - payload.final_weight_kg) / lot.quantity_kg
        if diff_ratio > 0.10:
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
        discrepancy_flagged=discrepancy_flagged,
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
        }
        for h in handovers
    ]


@router.get("/handover/{handover_id}", response_model=HandoverOut)
def get_handover(handover_id: int, db: Session = Depends(get_db)):
    handover = db.get(Handover, handover_id)
    if not handover:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Handover record not found")
    return handover
