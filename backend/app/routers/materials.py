from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Material, Recycler
from app.schemas import MaterialOut

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Materials & Recyclers"])


@router.get("/materials", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db)):
    rows = db.execute(select(Material)).scalars().all()
    return rows


@router.post("/materials")
def create_material(
    name: str,
    category: str,
    description: str | None = None,
    is_hazardous: bool = False,
    db: Session = Depends(get_db),
):
    material = Material(name=name, category=category, description=description, is_hazardous=is_hazardous)
    db.add(material)
    db.commit()
    db.refresh(material)
    return {"id": material.id, "name": material.name, "category": material.category}


@router.get("/recyclers")
def list_recyclers(db: Session = Depends(get_db)):
    recyclers = db.execute(select(Recycler)).scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "verified": r.verified,
            "location": r.location,
            "contact_phone": r.contact_phone,
        }
        for r in recyclers
    ]
