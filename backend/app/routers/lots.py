import hashlib
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_optional_current_user
from app.config import settings
from app.database import get_db
from app.dependencies import verify_owner_or_admin
from app.models import Handover, Lot, Material, Offer, Recycler, User
from app.passport_service import (
    format_passport_id,
    generate_lot_certificate_hash,
    generate_lot_reference,
)
from app.schemas import (
    HandoverOut,
    LotCreate,
    LotOut,
    MaterialOut,
    OfferOut,
    RecyclerOut,
    RecyclingPassportOut,
    TimelineEvent,
    TraceabilityOut,
)

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Lots & Traceability"])


def parse_lot_id(ref: str) -> int | None:
    ref_clean = ref.strip()
    if ref_clean.isdigit():
        return int(ref_clean)
    match = re.search(r"(\d+)$", ref_clean)
    if match:
        return int(match.group(1))
    return None


@router.post("/lots", response_model=LotOut)
def create_lot(
    payload: LotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.quantity_kg <= 0 or payload.quantity_kg > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0 kg and within realistic limits (<= 50,000 kg).",
        )

    material = db.get(Material, payload.material_id)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    base_price_by_category = {
        "Battery": 65.0,
        "Metal": 90.0,
        "Electronic": 120.0,
        "Device": 110.0,
        "Plastic": 40.0,
    }
    material_category = str(material.category)
    estimated = round(payload.quantity_kg * base_price_by_category.get(material_category, 75.0), 2)

    # Secure collector identity: if collector, always use their authenticated ID
    if current_user.role == "collector":
        collector_id = current_user.id
    elif current_user.role == "admin":
        collector_id = payload.collector_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only collectors or administrators can create scrap lots.",
        )

    lot = Lot(
        collector_id=collector_id,
        material_id=payload.material_id,
        photo_url=payload.photo_url,
        quantity_kg=payload.quantity_kg,
        estimated_value=estimated,
        status="created",
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)

    lot.lot_reference = generate_lot_reference(lot.id)
    db.commit()
    db.refresh(lot)
    return lot


@router.get("/lots", response_model=list[LotOut])
def list_lots(
    collector_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Lot)
    if current_user.role == "collector":
        # Collector is strictly scoped to their own catalog of lots
        stmt = stmt.where(Lot.collector_id == current_user.id)
    elif current_user.role == "recycler":
        if collector_id is not None:
            stmt = stmt.where(Lot.collector_id == collector_id)
    elif current_user.role == "admin":
        if collector_id is not None:
            stmt = stmt.where(Lot.collector_id == collector_id)

    lots = db.execute(stmt).scalars().all()
    return lots


@router.get("/lots/{lot_id}", response_model=LotOut)
def get_lot(lot_id: int, db: Session = Depends(get_db)):
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    return lot


@router.get("/lots/{lot_id}/offers", response_model=list[OfferOut])
def get_lot_offers(lot_id: int, db: Session = Depends(get_db)):
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    offers = db.execute(select(Offer).where(Offer.lot_id == lot_id)).scalars().all()
    return offers


@router.get("/lots/{lot_id}/handover")
def get_lot_handover(lot_id: int, db: Session = Depends(get_db)):
    handover = db.execute(select(Handover).where(Handover.lot_id == lot_id)).scalar_one_or_none()
    if not handover:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No handover record found for this lot")
    return {
        "id": handover.id,
        "lot_id": handover.lot_id,
        "collector_id": handover.collector_id,
        "recycler_id": handover.recycler_id,
        "final_weight_kg": handover.final_weight_kg,
        "handover_location": handover.handover_location,
        "collector_confirmed": handover.collector_confirmed,
        "recycler_confirmed": handover.recycler_confirmed,
        "signature": handover.signature,
        "status": handover.status,
    }


@router.post("/lots/{lot_id}/payment", response_model=LotOut)
def mark_lot_payment_complete(
    lot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    if lot.status == "payment_completed":
        # Idempotent response if already marked completed
        return lot

    # Handover verification: prevent skipping handover process
    handover = db.execute(select(Handover).where(Handover.lot_id == lot_id)).scalar_one_or_none()
    if not handover and lot.status not in ("handed_over", "pickup"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete payment before physical handover verification.",
        )

    accepted_offer = db.execute(
        select(Offer).where(Offer.lot_id == lot_id, Offer.status == "accepted")
    ).scalar_one_or_none()

    # Verify actor authorization: lot owner, transaction recycler, or admin
    is_collector_owner = current_user.id == lot.collector_id
    is_accepted_recycler = (
        current_user.role == "recycler"
        and accepted_offer is not None
        and (
            current_user.recycler_id == accepted_offer.recycler_id
            or current_user.id == accepted_offer.recycler_id
        )
    )
    is_admin = current_user.role == "admin"

    if not (is_collector_owner or is_accepted_recycler or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the lot owner, the transaction recycler, or an administrator can mark payment complete.",
        )

    lot.status = "payment_completed"
    if handover and handover.status != "confirmed":
        handover.status = "confirmed"
    db.commit()
    db.refresh(lot)
    return lot


@router.get("/lots/{lot_id}/traceability", response_model=TraceabilityOut)
def get_lot_traceability(lot_id: int, db: Session = Depends(get_db)):
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    material = db.get(Material, lot.material_id)
    accepted_offer = db.execute(
        select(Offer).where(Offer.lot_id == lot_id, Offer.status == "accepted")
    ).scalar_one_or_none()

    recycler = None
    if accepted_offer:
        recycler = db.get(Recycler, accepted_offer.recycler_id)

    handover = db.execute(select(Handover).where(Handover.lot_id == lot_id)).scalar_one_or_none()
    if not recycler and handover:
        recycler = db.get(Recycler, handover.recycler_id)

    final_weight = handover.final_weight_kg if handover else None
    discrepancy = round(lot.quantity_kg - final_weight, 2) if final_weight is not None else None
    final_price = accepted_offer.offer_price if accepted_offer else None

    # Generate tamper-evident SHA-256 digital certificate hash via shared service
    certificate_hash = generate_lot_certificate_hash(
        lot_id=lot.id,
        collector_id=lot.collector_id,
        material_name=material.name if material else None,
        quantity_kg=lot.quantity_kg,
        final_weight_kg=final_weight,
        final_price=final_price,
        recycler_id=recycler.id if recycler else None,
        signature=handover.signature if handover else None,
        status=lot.status,
    )
    created_at_str = lot.created_at.isoformat() if lot.created_at else None

    timeline = [
        TimelineEvent(
            step=1,
            title="Lot Catalogued",
            description=f"{lot.quantity_kg} kg of {material.name if material else 'e-waste'} recorded in system.",
            timestamp=created_at_str,
            completed=True,
        ),
        TimelineEvent(
            step=2,
            title="Valuation & Matching",
            description=f"Estimated lot valuation: ₹ {lot.estimated_value}.",
            timestamp=created_at_str,
            completed=True,
        ),
        TimelineEvent(
            step=3,
            title="Offer Acceptance",
            description=(
                f"Accepted offer of ₹ {accepted_offer.offer_price} from {recycler.name if recycler else 'Recycler'}."
                if accepted_offer
                else "Pending recycler bid acceptance."
            ),
            timestamp=accepted_offer.created_at.isoformat() if accepted_offer and accepted_offer.created_at else None,
            completed=accepted_offer is not None,
        ),
        TimelineEvent(
            step=4,
            title="Digital Handover",
            description=(
                f"Verified {handover.final_weight_kg} kg at {handover.handover_location}. Signed: {handover.signature}."
                if handover
                else "Pending collection and physical weight verification."
            ),
            timestamp=handover.created_at.isoformat() if handover and handover.created_at else None,
            completed=handover is not None and handover.status == "confirmed",
        ),
        TimelineEvent(
            step=5,
            title="Settlement & Recycling",
            description=(
                f"Payment finalized for ₹ {final_price}. Formal chain of custody sealed."
                if lot.status == "payment_completed"
                else "Pending payment settlement."
            ),
            timestamp=None,
            completed=lot.status == "payment_completed",
        ),
    ]

    return TraceabilityOut(
        lot_id=lot.id,
        lot_status=lot.status,
        quantity_kg=lot.quantity_kg,
        final_weight_kg=final_weight,
        weight_discrepancy_kg=discrepancy,
        estimated_value=lot.estimated_value,
        final_price=final_price,
        material=MaterialOut(
            id=material.id,
            name=material.name,
            category=material.category,
            description=material.description,
            is_hazardous=material.is_hazardous,
        ) if material else None,
        collector_id=lot.collector_id,
        recycler=RecyclerOut(
            id=recycler.id,
            name=recycler.name,
            verified=recycler.verified,
            location=recycler.location,
            contact_phone=recycler.contact_phone,
        ) if recycler else None,
        handover=HandoverOut(
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
        ) if handover else None,
        certificate_hash=certificate_hash,
        timeline=timeline,
    )


@router.get("/passport/{reference_or_id}", response_model=RecyclingPassportOut)
def get_recycling_passport(reference_or_id: str, db: Session = Depends(get_db)):
    lot_id = parse_lot_id(reference_or_id)
    if lot_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid passport reference format. Expected numeric ID or REV-2026-LOT-XXXX",
        )

    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recycling passport not found for reference '{reference_or_id}'",
        )

    material = db.get(Material, lot.material_id)
    accepted_offer = db.execute(
        select(Offer).where(Offer.lot_id == lot_id, Offer.status == "accepted")
    ).scalar_one_or_none()

    recycler = None
    if accepted_offer:
        recycler = db.get(Recycler, accepted_offer.recycler_id)

    handover = db.execute(select(Handover).where(Handover.lot_id == lot_id)).scalar_one_or_none()
    if not recycler and handover:
        recycler = db.get(Recycler, handover.recycler_id)

    final_weight = handover.final_weight_kg if handover else None
    final_price = accepted_offer.offer_price if accepted_offer else None

    certificate_hash = generate_lot_certificate_hash(
        lot_id=lot.id,
        collector_id=lot.collector_id,
        material_name=material.name if material else None,
        quantity_kg=lot.quantity_kg,
        final_weight_kg=final_weight,
        final_price=final_price,
        recycler_id=recycler.id if recycler else None,
        signature=handover.signature if handover else None,
        status=lot.status,
    )

    passport_id = format_passport_id(lot.id)
    co2_saved = round(lot.quantity_kg * 1.44, 2)
    is_hazardous = material.is_hazardous if material else False
    toxic_diverted = round(lot.quantity_kg * (0.12 if is_hazardous else 0.03), 2)
    qr_data = f"REVIVE-PASSPORT|ID:{passport_id}|LOT:{lot.id}|HASH:{certificate_hash[:16]}|STATUS:{lot.status}"

    recycler_auth = None
    if recycler:
        recycler_auth = "CPCB/SPCB Authorized E-Waste Recycler" if recycler.verified else "Registered Recycler"

    created_at_str = lot.created_at.isoformat() if lot.created_at else None
    timeline = [
        TimelineEvent(
            step=1,
            title="Lot Catalogued",
            description=f"{lot.quantity_kg} kg of {material.name if material else 'e-waste'} recorded in system.",
            timestamp=created_at_str,
            completed=True,
        ),
        TimelineEvent(
            step=2,
            title="Valuation & Matching",
            description=f"Estimated lot valuation: ₹ {lot.estimated_value}.",
            timestamp=created_at_str,
            completed=True,
        ),
        TimelineEvent(
            step=3,
            title="Offer Acceptance",
            description=(
                f"Accepted offer of ₹ {accepted_offer.offer_price} from {recycler.name if recycler else 'Recycler'}."
                if accepted_offer
                else "Pending recycler bid acceptance."
            ),
            timestamp=accepted_offer.created_at.isoformat() if accepted_offer and accepted_offer.created_at else None,
            completed=accepted_offer is not None,
        ),
        TimelineEvent(
            step=4,
            title="Digital Handover",
            description=(
                f"Verified {handover.final_weight_kg} kg at {handover.handover_location}. Signed: {handover.signature}."
                if handover
                else "Pending collection and physical weight verification."
            ),
            timestamp=handover.created_at.isoformat() if handover and handover.created_at else None,
            completed=handover is not None and handover.status == "confirmed",
        ),
        TimelineEvent(
            step=5,
            title="Settlement & Recycling",
            description=(
                f"Payment finalized for ₹ {final_price}. Formal chain of custody sealed."
                if lot.status == "payment_completed"
                else "Pending payment settlement."
            ),
            timestamp=None,
            completed=lot.status == "payment_completed",
        ),
    ]

    return RecyclingPassportOut(
        passport_id=passport_id,
        lot_id=lot.id,
        material_name=material.name if material else "E-Waste Scrap",
        material_category=material.category if material else "General",
        is_hazardous=is_hazardous,
        initial_weight_kg=lot.quantity_kg,
        verified_weight_kg=final_weight,
        collector_alias=f"Collector #{lot.collector_id} (Verified Kabadiwala)",
        recycler_name=recycler.name if recycler else None,
        recycler_authorization=recycler_auth,
        status=lot.status,
        certificate_hash=certificate_hash,
        co2_saved_kg=co2_saved,
        toxic_diverted_kg=toxic_diverted,
        qr_data=qr_data,
        created_at=created_at_str,
        timeline=timeline,
    )
