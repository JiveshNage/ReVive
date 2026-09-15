from datetime import datetime, timedelta, timezone
import hashlib
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_optional_current_user
from app.config import settings
from app.database import get_db
from app.dependencies import verify_owner_or_admin
from app.models import CollectorReputation, Handover, Lot, Material, Offer, Payment, Recycler, User
from app.passport_service import (
    format_passport_id,
    generate_lot_certificate_hash,
    generate_lot_reference,
)
from app.schemas import (
    CollectorEarningsSummary,
    CollectorEarningsTransaction,
    CollectorReputationOut,
    HandoverOut,
    LotCreate,
    LotOut,
    MaterialOut,
    OfferOut,
    PaymentCreate,
    PaymentOut,
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


@router.post("/lots/{lot_id}/pay", response_model=PaymentOut)
def process_lot_payment(
    lot_id: int,
    payload: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Finalize lot settlement with cash-first or digital payment.
    Cash is a first-class payment method. Digital references are optional.
    Updates lot lifecycle to 'payment_completed' and increments collector reputation.
    """
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrap lot not found.")

    # Authorization: Collector, Recycler, or Admin
    if current_user.role not in ("admin", "recycler", "collector"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to process payment.")

    # Find associated accepted offer or handover
    accepted_offer = db.execute(
        select(Offer).where(Offer.lot_id == lot.id, Offer.status == "accepted")
    ).scalars().first()
    handover = db.execute(
        select(Handover).where(Handover.lot_id == lot.id)
    ).scalars().first()

    recycler_id = accepted_offer.recycler_id if accepted_offer else (handover.recycler_id if handover else 1)

    method_normalized = payload.payment_method.strip().upper()
    if method_normalized not in ("CASH", "UPI", "BANK_TRANSFER"):
        method_normalized = "CASH"

    payment_ref = f"REV-PAY-2026-{lot.id:04d}-{uuid.uuid4().hex[:6].upper()}"
    payment = Payment(
        payment_reference=payment_ref,
        lot_id=lot.id,
        handover_id=handover.id if handover else None,
        collector_id=lot.collector_id,
        recycler_id=recycler_id,
        amount=payload.amount,
        payment_method=method_normalized,
        payment_status="COMPLETED",
        reference_id=payload.reference_id or (f"CASH-REC-{lot.id:04d}" if method_normalized == "CASH" else None),
        cash_received_confirmed=True,
        notes=payload.notes,
    )
    db.add(payment)

    # Transition lot status
    lot.status = "payment_completed"

    # If handover exists and is pending, confirm it
    if handover and handover.status != "confirmed":
        handover.status = "confirmed"

    # Update or initialize CollectorReputation
    reputation = db.execute(
        select(CollectorReputation).where(CollectorReputation.collector_id == lot.collector_id)
    ).scalars().first()
    if not reputation:
        reputation = CollectorReputation(
            collector_id=lot.collector_id,
            total_transactions=1,
            formalized_kg=lot.quantity_kg,
            total_earnings_inr=payload.amount,
            weight_accuracy_pct=96.5,
            on_time_handover_pct=95.0,
            recycler_rating=4.9,
            reputation_tier="VERIFIED_COLLECTOR",
        )
        db.add(reputation)
    else:
        reputation.total_transactions += 1
        reputation.formalized_kg += lot.quantity_kg
        reputation.total_earnings_inr += payload.amount
        reputation.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(payment)

    return PaymentOut(
        id=payment.id,
        payment_reference=payment.payment_reference,
        lot_id=payment.lot_id,
        collector_id=payment.collector_id,
        recycler_id=payment.recycler_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_status=payment.payment_status,
        reference_id=payment.reference_id,
        cash_received_confirmed=payment.cash_received_confirmed,
        notes=payment.notes,
        created_at=payment.created_at.isoformat() if payment.created_at else None,
    )


@router.get("/collector/{collector_id}/earnings", response_model=CollectorEarningsSummary)
def get_collector_earnings(
    collector_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve real-time Collector Earnings Ledger:
    Today's earnings, weekly, monthly, pending dues, cash received vs digital payments.
    """
    collector = db.get(User, collector_id)
    if not collector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collector not found.")

    # Security check: caller must be collector themselves or admin
    if current_user.role != "admin" and current_user.id != collector_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to collector ledger.")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # Fetch all payments for this collector
    payments = db.execute(
        select(Payment).where(Payment.collector_id == collector_id).order_by(Payment.created_at.desc())
    ).scalars().all()

    today_earnings = 0.0
    weekly_earnings = 0.0
    monthly_earnings = 0.0
    completed_cash = 0.0
    completed_digital = 0.0
    total_lifetime = 0.0

    for p in payments:
        amt = float(p.amount)
        total_lifetime += amt
        if p.payment_method == "CASH":
            completed_cash += amt
        else:
            completed_digital += amt

        # Time aggregations
        p_time = p.created_at if p.created_at else now
        if p_time.tzinfo is None:
            p_time = p_time.replace(tzinfo=timezone.utc)

        if p_time >= today_start:
            today_earnings += amt
        if p_time >= seven_days_ago:
            weekly_earnings += amt
        if p_time >= thirty_days_ago:
            monthly_earnings += amt

    # Fetch lots for pending dues calculation and transactions list
    lots = db.execute(
        select(Lot).where(Lot.collector_id == collector_id).order_by(Lot.created_at.desc())
    ).scalars().all()

    pending_dues = 0.0
    completed_count = 0
    pending_count = 0
    transactions: list[CollectorEarningsTransaction] = []

    for l in lots:
        mat_name = l.material.name if l.material else "E-Waste Scrap"
        mat_cat = l.material.category if l.material else "General"
        lot_ref = l.lot_reference or f"LOT-{l.id:04d}"

        # Find if paid
        matched_payment = next((p for p in payments if p.lot_id == l.id), None)
        if matched_payment:
            completed_count += 1
            transactions.append(CollectorEarningsTransaction(
                lot_id=l.id,
                lot_reference=lot_ref,
                material_name=mat_name,
                material_category=mat_cat,
                quantity_kg=l.quantity_kg,
                final_amount=float(matched_payment.amount),
                payment_method=matched_payment.payment_method,
                status="PAID",
                date=matched_payment.created_at.strftime("%Y-%m-%d %H:%M") if matched_payment.created_at else "Today",
            ))
        elif l.status == "payment_completed":
            completed_count += 1
            transactions.append(CollectorEarningsTransaction(
                lot_id=l.id,
                lot_reference=lot_ref,
                material_name=mat_name,
                material_category=mat_cat,
                quantity_kg=l.quantity_kg,
                final_amount=float(l.estimated_value),
                payment_method="CASH",
                status="PAID",
                date=l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else "Today",
            ))
        else:
            pending_count += 1
            pending_dues += float(l.estimated_value)
            transactions.append(CollectorEarningsTransaction(
                lot_id=l.id,
                lot_reference=lot_ref,
                material_name=mat_name,
                material_category=mat_cat,
                quantity_kg=l.quantity_kg,
                final_amount=float(l.estimated_value),
                payment_method="CASH",
                status="PENDING",
                date=l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else "Recent",
            ))

    return CollectorEarningsSummary(
        collector_id=collector.id,
        collector_name=collector.name,
        today_earnings=round(today_earnings, 2),
        weekly_earnings=round(weekly_earnings, 2),
        monthly_earnings=round(monthly_earnings, 2),
        pending_dues=round(pending_dues, 2),
        completed_cash_amount=round(completed_cash, 2),
        completed_digital_amount=round(completed_digital, 2),
        total_lifetime_earnings=round(total_lifetime, 2),
        total_completed_lots=completed_count,
        total_pending_lots=pending_count,
        transactions=transactions[:20],
    )


@router.get("/collector/{collector_id}/reputation", response_model=CollectorReputationOut)
def get_collector_reputation(
    collector_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve formalization reputation passport for an informal waste collector.
    Exposes weight accuracy, on-time rate, formal volume, and recycler ratings.
    """
    collector = db.get(User, collector_id)
    if not collector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collector not found.")

    reputation = db.execute(
        select(CollectorReputation).where(CollectorReputation.collector_id == collector_id)
    ).scalars().first()

    if not reputation:
        # Compute on the fly from lots
        lots = db.execute(select(Lot).where(Lot.collector_id == collector_id)).scalars().all()
        total_kg = sum(l.quantity_kg for l in lots)
        total_val = sum(l.estimated_value for l in lots)
        return CollectorReputationOut(
            collector_id=collector.id,
            custom_user_id=collector.custom_user_id or f"REV-COL-2026-{collector.id:04d}",
            collector_name=collector.name,
            reputation_tier="VERIFIED_COLLECTOR",
            total_transactions=len(lots),
            weight_accuracy_pct=96.4,
            on_time_handover_pct=95.2,
            recycler_rating=4.9,
            formalized_kg=round(total_kg, 2),
            total_earnings_inr=round(total_val, 2),
        )

    return CollectorReputationOut(
        collector_id=collector.id,
        custom_user_id=collector.custom_user_id or f"REV-COL-2026-{collector.id:04d}",
        collector_name=collector.name,
        reputation_tier=reputation.reputation_tier,
        total_transactions=reputation.total_transactions,
        weight_accuracy_pct=round(reputation.weight_accuracy_pct, 1),
        on_time_handover_pct=round(reputation.on_time_handover_pct, 1),
        recycler_rating=round(reputation.recycler_rating, 1),
        formalized_kg=round(reputation.formalized_kg, 2),
        total_earnings_inr=round(reputation.total_earnings_inr, 2),
    )

