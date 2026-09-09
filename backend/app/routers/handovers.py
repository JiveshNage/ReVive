from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Handover, Lot
from app.schemas import HandoverCreate, HandoverOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Handovers"])


@router.post("/handover", response_model=HandoverOut)
def create_handover(payload: HandoverCreate, db: Session = Depends(get_db)):
    lot = db.get(Lot, payload.lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    if payload.collector_id != lot.collector_id:
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

    status_value = "confirmed" if payload.collector_confirmed and payload.recycler_confirmed else "pending"
    handover = Handover(
        lot_id=payload.lot_id,
        collector_id=payload.collector_id,
        recycler_id=payload.recycler_id,
        final_weight_kg=payload.final_weight_kg,
        handover_location=payload.handover_location,
        collector_confirmed=payload.collector_confirmed,
        recycler_confirmed=payload.recycler_confirmed,
        signature=payload.signature,
        status=status_value,
    )
    db.add(handover)
    if status_value == "confirmed":
        db.execute(update(Lot).where(Lot.id == payload.lot_id).values(status="handed_over"))
    db.commit()
    db.refresh(handover)
    return handover


@router.get("/handover")
def list_handover(db: Session = Depends(get_db)):
    handovers = db.execute(select(Handover)).scalars().all()
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
