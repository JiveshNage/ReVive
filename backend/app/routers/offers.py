from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_role
from app.config import settings
from app.database import get_db
from app.dependencies import verify_owner_or_admin
from app.models import Lot, Offer, Recycler, User
from app.schemas import OfferCreate, OfferOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Offers"])


@router.post("/offers")
def create_offer(
    payload: OfferCreate,
    current_user: User = Depends(require_role("recycler", "admin")),
    db: Session = Depends(get_db),
):
    if payload.offer_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer price must be greater than zero.",
        )

    lot = db.get(Lot, payload.lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    if lot.status in ("handed_over", "payment_completed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place an offer on a lot that is already handed over or settled.",
        )

    # If role is recycler, force recycler_id to resolve to authenticated recycler's own row
    if current_user.role == "recycler":
        recycler_id = current_user.recycler_id
        if not recycler_id:
            # Fallback lookup by phone or name
            matched_rec = db.execute(
                select(Recycler).where(
                    (Recycler.contact_phone == current_user.phone)
                    | (Recycler.name == (current_user.company_name or current_user.name))
                )
            ).scalars().first()
            if matched_rec:
                recycler_id = matched_rec.id
                current_user.recycler_id = recycler_id
                db.commit()
            else:
                recycler_id = payload.recycler_id
    else:
        # Admin can submit on behalf of any specified recycler
        recycler_id = payload.recycler_id

    recycler = db.get(Recycler, recycler_id)
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found")

    # Verify recycler verification compliance
    if current_user.role == "recycler":
        if current_user.verification_status != "VERIFIED" and not recycler.verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization certificate verification required before submitting scrap offers. Please complete CPCB & regulatory document verification in your Organization Profile.",
            )
    elif not recycler.verified and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recycler organization is not verified. Valid CPCB authorization required before placing offers.",
        )

    offer = Offer(
        lot_id=payload.lot_id,
        recycler_id=recycler_id,
        offer_price=payload.offer_price,
        pickup_available=payload.pickup_available,
        status="pending",
    )
    db.add(offer)
    if lot.status == "created":
        lot.status = "offers"
    db.commit()
    return {
        "id": offer.id,
        "lot_id": offer.lot_id,
        "recycler_id": offer.recycler_id,
        "offer_price": offer.offer_price,
        "pickup_available": offer.pickup_available,
        "status": offer.status,
    }


@router.get("/offers")
def list_offers(db: Session = Depends(get_db)):
    offers = db.execute(select(Offer)).scalars().all()
    return [
        {
            "id": o.id,
            "lot_id": o.lot_id,
            "recycler_id": o.recycler_id,
            "offer_price": o.offer_price,
            "pickup_available": o.pickup_available,
            "status": o.status,
        }
        for o in offers
    ]


@router.post("/offers/{offer_id}/accept")
def accept_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    lot = db.get(Lot, offer.lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    verify_owner_or_admin(
        lot.collector_id,
        current_user,
        detail="You can only accept offers for lots that you own.",
    )

    if lot.status in ("handed_over", "payment_completed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot accept offer on already completed or settled lot.",
        )

    db.execute(update(Offer).where(Offer.lot_id == offer.lot_id).values(status="rejected"))
    db.execute(update(Offer).where(Offer.id == offer.id).values(status="accepted"))

    db.execute(
        update(Lot).where(Lot.id == offer.lot_id).values(status="pickup", estimated_value=offer.offer_price)
    )
    db.commit()
    db.refresh(offer)
    return {"id": offer.id, "lot_id": offer.lot_id, "status": offer.status, "offer_price": offer.offer_price}
