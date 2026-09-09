from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Lot, Offer, Recycler
from app.schemas import OfferCreate, OfferOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Offers"])


@router.post("/offers")
def create_offer(payload: OfferCreate, db: Session = Depends(get_db)):
    lot = db.get(Lot, payload.lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    recycler = db.get(Recycler, payload.recycler_id)
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found")

    offer = Offer(
        lot_id=payload.lot_id,
        recycler_id=payload.recycler_id,
        offer_price=payload.offer_price,
        pickup_available=payload.pickup_available,
        status="pending",
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return {"id": offer.id, "lot_id": offer.lot_id, "offer_price": offer.offer_price, "status": offer.status}


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
def accept_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    db.execute(update(Offer).where(Offer.lot_id == offer.lot_id).values(status="rejected"))
    db.execute(update(Offer).where(Offer.id == offer.id).values(status="accepted"))

    db.execute(
        update(Lot).where(Lot.id == offer.lot_id).values(status="pickup", estimated_value=offer.offer_price)
    )
    db.commit()
    db.refresh(offer)
    return {"id": offer.id, "lot_id": offer.lot_id, "status": offer.status, "offer_price": offer.offer_price}
