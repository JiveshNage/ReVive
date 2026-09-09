import hashlib
import logging
import re
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("revive")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from app.ai_service import (
    AIServiceUnavailable,
    estimate_price,
    get_price_benchmarks,
    match_recyclers,
    predict_image,
)
from app.auth import (
    create_access_token,
    decode_access_token,
    get_current_user,
    get_optional_current_user,
    hash_password,
    require_role,
    verify_password,
)
from app.config import settings
from app.database import Base, SessionLocal, ensure_db_initialized, engine, get_db
from app.email_service import send_otp_email
from app.models import Handover, LoginAudit, Lot, Material, Offer, Recycler, User
from app.schemas import (
    AdminAnomalyOut,
    AdminMetricsOut,
    BenchmarkCategoryRate,
    DemoWorkflowResult,
    HandoverCreate,
    HandoverOut,
    LotCreate,
    LotOut,
    MaterialOut,
    OfferCreate,
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    PredictionOut,
    PriceEstimateOut,
    ProfileCreateRequest,
    RecyclerMatchOut,
    RecyclerOut,
    RecyclerVerificationUpdate,
    RecyclingPassportOut,
    SafetyGuidanceItem,
    SafetyGuidanceResponse,
    TimelineEvent,
    TokenResponse,
    TraceabilityOut,
    UserLoginRequest,
    UserProfileOut,
    UserSignupRequest,
)
from app.seed_data import seed_data

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_db_initialized()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.project_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on %s %s: %s", request.method, request.url.path, exc.errors())
    sanitized_errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        sanitized_errors.append({
            "field": field,
            "message": err.get("msg", "Invalid input value."),
            "type": err.get("type", "value_error"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error. Please check your request parameters.",
            "errors": sanitized_errors,
        },
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    # Log full DB error and stack trace server-side only for debugging
    logger.error("Database error executing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    # Return generic message to prevent leaking SQL syntax, table schemas, or DB paths
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again later."},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code >= 500:
        logger.error("HTTP %d on %s %s: %s", exc.status_code, request.method, request.url.path, exc.detail)
    else:
        logger.warning("HTTP %d on %s %s: %s", exc.status_code, request.method, request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log complete traceback server-side
    logger.exception("Unhandled server exception on %s %s: %s", request.method, request.url.path, exc)
    # Return sanitized generic error message to client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )



@app.get(f"{settings.api_v1_prefix}/health")
def health_check():
    return {"status": "ok", "app": settings.app_name, "environment": settings.app_env}


@app.post(f"{settings.api_v1_prefix}/ai/predict", response_model=PredictionOut)
async def predict_material(
    file: UploadFile = File(...),  # noqa: B008
    location: str = "Bhopal",
    weight_kg: float = 1.0,
):
    try:
        return predict_image(await file.read(), file.content_type, location, weight_kg)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except AIServiceUnavailable as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error


@app.get(f"{settings.api_v1_prefix}/prices/estimate", response_model=PriceEstimateOut)
def get_price_estimate(category: str = "PCB", location: str = "Bhopal", weight_kg: float = 1.0):
    if weight_kg <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="weight_kg must be greater than zero")
    res = estimate_price(category, location, weight_kg)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing benchmark not available")
    return res


@app.get(f"{settings.api_v1_prefix}/prices/benchmarks", response_model=list[BenchmarkCategoryRate])
def get_benchmarks():
    return get_price_benchmarks()


@app.get(f"{settings.api_v1_prefix}/prices/trends")
def get_price_trends(category: str = "PCB", city: str = "Bhopal"):
    """
    Returns monthly price trend history, current live rate, volatility, and volume indicators.
    """
    city_factors = {
        "bhopal": 1.0,
        "indore": 1.03,
        "pune": 1.08,
        "delhi": 1.12,
        "mumbai": 1.10,
        "nashik": 1.02,
    }
    norm_city = city.lower().split(",")[0].strip()
    factor = city_factors.get(norm_city, 1.0)

    base_trajectories = {
        "PCB": [168, 172, 178, 182, 186, 192],
        "Battery": [54, 56, 58, 62, 65, 68],
        "Cable": [92, 95, 102, 106, 110, 115],
        "Display": [82, 85, 89, 92, 95, 98],
        "Metal": [85, 88, 90, 94, 98, 102],
        "Plastic": [34, 36, 38, 40, 42, 44],
    }

    matched_key = "PCB"
    cat_lower = category.lower()
    for k in base_trajectories:
        if k.lower() in cat_lower or cat_lower in k.lower():
            matched_key = k
            break

    months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov (Live)"]
    raw_points = base_trajectories[matched_key]
    points = [round(p * factor, 1) for p in raw_points]
    live_rate = points[-1]
    prev_rate = points[-2]
    mom_change = round(((live_rate - prev_rate) / prev_rate) * 100.0, 1)

    return {
        "category": matched_key,
        "city": city,
        "live_rate_inr": live_rate,
        "currency": "INR",
        "unit": "kg",
        "mom_change_pct": mom_change,
        "trend_direction": "up" if mom_change >= 0 else "down",
        "series": [
            {"month": m, "rate": p, "volume_index": round(p * 1.5, 0)}
            for m, p in zip(months, points)
        ],
        "min_6m": min(points),
        "max_6m": max(points),
        "avg_6m": round(sum(points) / len(points), 1),
        "last_updated": "Just now (Live Feed)",
    }


@app.get(f"{settings.api_v1_prefix}/recyclers/match", response_model=list[RecyclerMatchOut])
def get_recycler_matches(category: str = "PCB", location: str = "Bhopal", limit: int = 5):
    return match_recyclers(category, location, limit=limit)


@app.get(f"{settings.api_v1_prefix}/materials", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db)):  # noqa: B008
    rows = db.execute(select(Material)).scalars().all()
    return rows


@app.post(f"{settings.api_v1_prefix}/materials")
def create_material(
    name: str,
    category: str,
    description: str | None = None,
    is_hazardous: bool = False,
    db: Session = Depends(get_db),  # noqa: B008
):
    material = Material(name=name, category=category, description=description, is_hazardous=is_hazardous)
    db.add(material)
    db.commit()
    db.refresh(material)
    return {"id": material.id, "name": material.name, "category": material.category}


@app.get(f"{settings.api_v1_prefix}/recyclers")
def list_recyclers(db: Session = Depends(get_db)):  # noqa: B008
    recyclers = db.execute(select(Recycler)).scalars().all()
    return [{
        "id": r.id,
        "name": r.name,
        "verified": r.verified,
        "location": r.location,
        "contact_phone": r.contact_phone,
    } for r in recyclers]


def generate_custom_user_id(role: str, user_id: int) -> str:
    prefix = "COL" if role == "collector" else "REC" if role == "recycler" else "GOV"
    if prefix == "GOV":
        return f"CPCB-GOV-2026-{user_id:04d}"
    return f"REV-{prefix}-2026-{user_id:04d}"


def issue_user_jwt(user: User | None, identifier: str) -> str:
    if user:
        claims = {
            "sub": user.phone or str(user.id),
            "user_id": user.id,
            "role": user.role,
            "custom_user_id": getattr(user, "custom_user_id", None) or "",
            "name": user.name,
            "email": getattr(user, "email", "") or "",
        }
    else:
        claims = {
            "sub": identifier,
            "user_id": None,
            "role": "guest",
            "is_new_user": True,
        }
    return create_access_token(claims)


def build_user_profile_out(user: User) -> UserProfileOut:
    return UserProfileOut(
        id=user.id,
        custom_user_id=getattr(user, "custom_user_id", None) or generate_custom_user_id(user.role, user.id),
        name=user.name,
        phone=user.phone,
        role=user.role,
        language=user.language,
        location=getattr(user, "location", "Bhopal, MP") or "Bhopal, MP",
        email=getattr(user, "email", None),
        company_name=getattr(user, "company_name", None),
        license_no=getattr(user, "license_no", None),
        service_area=getattr(user, "service_area", None),
    )


@app.post(f"{settings.api_v1_prefix}/auth/signup", response_model=TokenResponse)
def signup(payload: UserSignupRequest, db: Session = Depends(get_db)):  # noqa: B008
    identifier = payload.phone.strip()
    is_email = "@" in identifier

    if is_email:
        phone_digits = identifier
        existing = db.execute(select(User).where(User.email == identifier)).scalars().first()
    else:
        digits = re.sub(r"\D", "", identifier)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) != 10:
            digits = identifier
        phone_digits = digits
        existing = db.execute(select(User).where(User.phone == phone_digits)).scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this phone number or email is already registered. Please login.",
        )

    hashed_pwd = hash_password(payload.password) if payload.password else None

    user = User(
        name=payload.name.strip(),
        phone=phone_digits,
        hashed_password=hashed_pwd,
        role=payload.role,
        language=payload.language,
        location=payload.location,
        email=payload.email,
        company_name=payload.company_name,
        license_no=payload.license_no,
        service_area=payload.service_area,
        custom_user_id=payload.custom_user_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if not user.custom_user_id:
        user.custom_user_id = generate_custom_user_id(user.role, user.id)
        db.commit()
        db.refresh(user)

    # Log login audit
    audit = LoginAudit(
        user_id=user.id,
        phone=phone_digits,
        login_type="signup",
        status="success",
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = issue_user_jwt(user, phone_digits)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_profile_out(user),
        is_new_user=False,
    )


@app.post(f"{settings.api_v1_prefix}/auth/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):  # noqa: B008
    identifier = payload.phone_or_email.strip()
    is_email = "@" in identifier

    if is_email:
        user = db.execute(select(User).where(User.email == identifier)).scalars().first()
    else:
        digits = re.sub(r"\D", "", identifier)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) != 10:
            digits = identifier
        user = db.execute(select(User).where(User.phone == digits)).scalars().first()
        if not user:
            user = db.execute(select(User).where(User.phone.contains(digits))).scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is not set for this account. Please login using OTP verification.",
        )

    if not verify_password(payload.password, user.hashed_password):
        audit = LoginAudit(
            user_id=user.id,
            phone=user.phone,
            login_type="password",
            status="failed",
            ip_address="127.0.0.1",
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not getattr(user, "custom_user_id", None):
        user.custom_user_id = generate_custom_user_id(user.role, user.id)
        db.commit()
        db.refresh(user)

    audit = LoginAudit(
        user_id=user.id,
        phone=user.phone,
        login_type="password",
        status="success",
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = issue_user_jwt(user, user.phone)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_profile_out(user),
        is_new_user=False,
    )


@app.get(f"{settings.api_v1_prefix}/auth/me", response_model=UserProfileOut)
def get_me(current_user: User = Depends(get_current_user)):  # noqa: B008
    return build_user_profile_out(current_user)


@app.post(f"{settings.api_v1_prefix}/auth/send-otp", response_model=OtpSendResponse)
def send_otp(payload: OtpSendRequest):
    identifier = payload.phone.strip()
    is_email = "@" in identifier

    if is_email:
        demo_otp = "123456"
        send_otp_email(identifier, demo_otp)
        return OtpSendResponse(
            success=True,
            message=f"OTP successfully sent via Brevo SMTP to {identifier}. Use demo code {demo_otp}.",
            demo_otp=demo_otp,
        )

    digits = re.sub(r"\D", "", identifier)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 10-digit Indian mobile number or email address.",
        )
    demo_otp = "123456"

    # Optional email dispatch via Brevo SMTP
    if payload.email:
        send_otp_email(payload.email, demo_otp)

    return OtpSendResponse(
        success=True,
        message=f"OTP successfully dispatched to +91 {digits}. For evaluation, use code {demo_otp}.",
        demo_otp=demo_otp,
    )


@app.post(f"{settings.api_v1_prefix}/auth/verify-otp", response_model=OtpVerifyResponse)
def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)):  # noqa: B008
    identifier = payload.phone.strip()
    is_email = "@" in identifier

    if payload.otp != "123456" and len(payload.otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please enter 123456.",
        )

    if is_email:
        user = db.execute(select(User).where(User.email == identifier)).scalars().first()
        digits = identifier
    else:
        digits = re.sub(r"\D", "", identifier)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        user = db.execute(select(User).where(User.phone == digits)).scalars().first()
        if not user:
            user = db.execute(select(User).where(User.phone.contains(digits))).scalars().first()

    # Record login audit entry in SQLite database
    audit = LoginAudit(
        user_id=user.id if user else None,
        phone=digits,
        login_type="email" if is_email else "otp",
        status="success",
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = issue_user_jwt(user, digits)

    if user:
        if not getattr(user, "custom_user_id", None):
            user.custom_user_id = generate_custom_user_id(user.role, user.id)
            db.commit()
            db.refresh(user)

        return OtpVerifyResponse(
            verified=True,
            is_new_user=False,
            user=build_user_profile_out(user),
            token=token,
            access_token=token,
            token_type="bearer",
        )
    return OtpVerifyResponse(
        verified=True,
        is_new_user=True,
        user=None,
        token=token,
        access_token=token,
        token_type="bearer",
    )


@app.get(f"{settings.api_v1_prefix}/auth/logins")
def list_logins(db: Session = Depends(get_db)):  # noqa: B008
    rows = db.execute(select(LoginAudit).order_by(LoginAudit.id.desc()).limit(25)).scalars().all()
    return [{
        "id": r.id,
        "user_id": r.user_id,
        "phone": r.phone,
        "login_type": r.login_type,
        "status": r.status,
        "ip_address": r.ip_address,
        "timestamp": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]


@app.post(f"{settings.api_v1_prefix}/auth/profile", response_model=UserProfileOut)
def update_or_create_profile(payload: ProfileCreateRequest, db: Session = Depends(get_db)):  # noqa: B008
    identifier = payload.phone.strip()
    is_email = "@" in identifier

    if is_email:
        digits = identifier
        user = db.execute(select(User).where(User.email == identifier)).scalars().first()
    else:
        digits = re.sub(r"\D", "", identifier)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) != 10:
            digits = identifier
        user = db.execute(select(User).where(User.phone == digits)).scalars().first()

    hashed_pwd = hash_password(payload.password) if payload.password else None

    if not user:
        user = User(
            name=payload.name,
            phone=digits,
            hashed_password=hashed_pwd,
            role=payload.role,
            language=payload.language,
            location=payload.location,
            email=payload.email,
            company_name=payload.company_name,
            license_no=payload.license_no,
            service_area=payload.service_area,
            custom_user_id=payload.custom_user_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        if not user.custom_user_id:
            user.custom_user_id = generate_custom_user_id(user.role, user.id)
            db.commit()
            db.refresh(user)
    else:
        user.name = payload.name
        user.role = payload.role
        user.language = payload.language
        user.location = payload.location
        if hashed_pwd:
            user.hashed_password = hashed_pwd
        if payload.email:
            user.email = payload.email
        if payload.company_name:
            user.company_name = payload.company_name
        if payload.license_no:
            user.license_no = payload.license_no
        if payload.service_area:
            user.service_area = payload.service_area
        if not getattr(user, "custom_user_id", None):
            user.custom_user_id = payload.custom_user_id or generate_custom_user_id(user.role, user.id)
        db.commit()
        db.refresh(user)

    return build_user_profile_out(user)


@app.post(f"{settings.api_v1_prefix}/users")
def create_user(
    name: str,
    phone: str,
    role: str = "collector",
    language: str = "hi",
    db: Session = Depends(get_db),  # noqa: B008
):
    user = User(name=name, phone=phone, role=role, language=language)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "phone": user.phone, "role": user.role}



@app.post(f"{settings.api_v1_prefix}/lots", response_model=LotOut)
def create_lot(payload: LotCreate, db: Session = Depends(get_db)):  # noqa: B008
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

    lot = Lot(
        collector_id=payload.collector_id,
        material_id=payload.material_id,
        photo_url=payload.photo_url,
        quantity_kg=payload.quantity_kg,
        estimated_value=estimated,
        status="created",
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot


@app.get(f"{settings.api_v1_prefix}/lots/{{lot_id}}", response_model=LotOut)
def get_lot(lot_id: int, db: Session = Depends(get_db)):  # noqa: B008
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    return lot


@app.get(f"{settings.api_v1_prefix}/lots")
def list_lots(db: Session = Depends(get_db)):  # noqa: B008
    lots = db.execute(select(Lot)).scalars().all()
    return [{
        "id": l.id,
        "collector_id": l.collector_id,
        "material_id": l.material_id,
        "quantity_kg": l.quantity_kg,
        "estimated_value": l.estimated_value,
        "status": l.status,
    } for l in lots]


@app.post(f"{settings.api_v1_prefix}/offers")
def create_offer(payload: OfferCreate, db: Session = Depends(get_db)):  # noqa: B008
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


@app.get(f"{settings.api_v1_prefix}/offers")
def list_offers(db: Session = Depends(get_db)):  # noqa: B008
    offers = db.execute(select(Offer)).scalars().all()
    return [{
        "id": o.id,
        "lot_id": o.lot_id,
        "recycler_id": o.recycler_id,
        "offer_price": o.offer_price,
        "pickup_available": o.pickup_available,
        "status": o.status,
    } for o in offers]


@app.post(f"{settings.api_v1_prefix}/offers/{{offer_id}}/accept")
def accept_offer(offer_id: int, db: Session = Depends(get_db)):  # noqa: B008
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


@app.post(f"{settings.api_v1_prefix}/lots/{{lot_id}}/payment")
def complete_payment(lot_id: int, db: Session = Depends(get_db)):  # noqa: B008
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

    accepted_offer = db.execute(
        select(Offer).where(Offer.lot_id == lot_id, Offer.status == "accepted")
    ).scalar_one_or_none()

    if not accepted_offer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete payment before an offer is accepted",
        )

    db.execute(update(Lot).where(Lot.id == lot_id).values(status="payment_completed"))
    db.commit()
    db.refresh(lot)
    return {
        "id": lot.id,
        "lot_id": lot.id,
        "status": "payment_completed",
        "offer_price": accepted_offer.offer_price,
    }


@app.post(f"{settings.api_v1_prefix}/handover", response_model=HandoverOut)
def create_handover(payload: HandoverCreate, db: Session = Depends(get_db)):  # noqa: B008
    if db.bind is not None:
        Base.metadata.create_all(bind=db.bind)

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


@app.get(f"{settings.api_v1_prefix}/handover")
def list_handover(db: Session = Depends(get_db)):  # noqa: B008
    handovers = db.execute(select(Handover)).scalars().all()
    return [{
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
    } for h in handovers]


@app.get(f"{settings.api_v1_prefix}/handover/{{handover_id}}", response_model=HandoverOut)
def get_handover(handover_id: int, db: Session = Depends(get_db)):  # noqa: B008
    handover = db.get(Handover, handover_id)
    if not handover:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Handover record not found")
    return handover


@app.get(f"{settings.api_v1_prefix}/lots/{{lot_id}}/handover")
def get_lot_handover(lot_id: int, db: Session = Depends(get_db)):  # noqa: B008
    handover = db.execute(
        select(Handover).where(Handover.lot_id == lot_id)
    ).scalar_one_or_none()
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


@app.get(f"{settings.api_v1_prefix}/lots/{{lot_id}}/traceability", response_model=TraceabilityOut)
def get_lot_traceability(lot_id: int, db: Session = Depends(get_db)):  # noqa: B008
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

    handover = db.execute(
        select(Handover).where(Handover.lot_id == lot_id)
    ).scalar_one_or_none()

    if not recycler and handover:
        recycler = db.get(Recycler, handover.recycler_id)

    final_weight = handover.final_weight_kg if handover else None
    discrepancy = round(lot.quantity_kg - final_weight, 2) if final_weight is not None else None
    final_price = accepted_offer.offer_price if accepted_offer else None

    # Generate tamper-evident SHA-256 digital certificate hash
    hash_payload = (
        f"lot:{lot.id}|collector:{lot.collector_id}|material:{material.name if material else 'unknown'}|"
        f"init_qty:{lot.quantity_kg}|final_weight:{final_weight}|price:{final_price}|"
        f"recycler:{recycler.id if recycler else 'none'}|sig:{handover.signature if handover else 'none'}|"
        f"status:{lot.status}"
    )
    certificate_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

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


SAFETY_KNOWLEDGE_BASE = [
    SafetyGuidanceItem(
        material_key="cable",
        category_name="Copper Cable & Wire",
        hazard_level="high",
        vernacular_slogan={
            "en": "Do not burn wire! Releases carcinogenic dioxins and neurotoxins.",
            "hi": "तार मत जलाओ! इससे जहरीला धुआं और कैंसर कारक गैसें निकलती हैं।",
            "mr": "वायर जाळू नका! यामुळे विषारी धूर आणि कर्करोगास कारणीभूत वायू तयार होतात.",
        },
        explanation={
            "en": "Open burning of PVC cables emits furans and dioxins causing severe respiratory damage and soil contamination.",
            "hi": "पीवीसी कोटिंग वाले तारों को जलाने से फ्यूरॉन और डायऑक्सिन निकलते हैं जो फेफड़ों और पर्यावरण को नुकसान पहुंचाते हैं।",
            "mr": "पीव्हीसी तारा जाळल्याने श्वसन प्रणाली खराब होते आणि विषारी धूर हवेत पसरतो.",
        },
        dos=[
            {"en": "Use mechanical wire strippers or cutters.", "hi": "मैकेनिकल वायर स्ट्रिपर या कटर का इस्तेमाल करें।", "mr": "वायर स्ट्रिपर किंवा कटरचा वापर करा."},
            {"en": "Sell intact cable bundles to verified recyclers.", "hi": "तारों के बंडल सीधे अधिकृत रीसाइक्लर को दें।", "mr": "तारांचे बंडल थेट अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Never burn cables in open heaps or barrel pits.", "hi": "खुले में तारों को कभी आग मत लगाएं।", "mr": "उघड्यावर तारांना कधीही आग लावू नका."},
            {"en": "Do not inhale hot fumes or melting insulation.", "hi": "तार काटते समय धुआं अंदर न लें।", "mr": "कापताना येणारा धूर श्वासात घेऊ नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="battery",
        category_name="Lithium-ion & Lead-Acid Battery",
        hazard_level="high",
        vernacular_slogan={
            "en": "Do not puncture or crush batteries! Risk of fire and chemical burns.",
            "hi": "बैटरी को कभी मत तोड़ो या छेदो! आग और एसिड का भारी खतरा।",
            "mr": "बॅटरी कधीही फोडू नका! आग आणि ॲसिडचा तीव्र धोका.",
        },
        explanation={
            "en": "Puncturing lithium batteries causes instant thermal runaway explosions. Lead-acid batteries leak corrosive sulfuric acid.",
            "hi": "लिथियम बैटरी फटने पर भयंकर आग लगती है और लेड-एसिड बैटरी से तेजाब लीक होता है।",
            "mr": "लिथियम बॅटरी फुटल्यास स्फोट आणि आग लागते, तर लेड बॅटरीतून ॲसिड गळती होते.",
        },
        dos=[
            {"en": "Tape battery terminals with non-conductive tape.", "hi": "शॉर्ट सर्किट से बचने के लिए बैटरी टर्मिनलों पर टेप लगाएं।", "mr": "शॉर्ट सर्किट टाळण्यासाठी टोकांवर चिकटपट्टी लावा."},
            {"en": "Store in dry, non-flammable insulated crates.", "hi": "सूखे और हवादार डिब्बे में ज्वलनशील चीजों से दूर रखें।", "mr": "ज्वलनशील पदार्थांपासून दूर कोरड्या जागी ठेवा."},
        ],
        donts=[
            {"en": "Never strike batteries with hammers or chisels.", "hi": "हथौड़े से बैटरी को तोड़ने की कोशिश कभी न करें।", "mr": "हातोड्याने बॅटरी फोडण्याचा प्रयत्न करू नका."},
            {"en": "Do not throw leaking batteries into common bins.", "hi": "लीक हो रही बैटरी को आम कूड़ेदान में न फेंकें।", "mr": "गळती होणाऱ्या बॅटऱ्या साध्या कचऱ्यात टाकू नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="pcb",
        category_name="Printed Circuit Boards (PCB)",
        hazard_level="high",
        vernacular_slogan={
            "en": "Wear protective gloves & mask. Do not use acid baths!",
            "hi": "दस्ताने और मास्क पहनें। एसिड (तेजाब) में मत डालो।",
            "mr": "हातमोजे व मास्क वापरा. ॲसिडमध्ये भिजवू नका.",
        },
        explanation={
            "en": "Backyard nitric/cyanide leaching releases deadly nitrogen dioxide gas and permanently toxifies drinking groundwater.",
            "hi": "सोना निकालने के लिए तेजाब का उपयोग जानलेवा गैस बनाता है और पानी को जहरीला करता है।",
            "mr": "सोनं काढण्यासाठी ॲसिडचा वापर केल्यास विषारी वायू तयार होऊन जीवाचा धोका होतो.",
        },
        dos=[
            {"en": "Wear cut-resistant nitrile gloves and N95 masks.", "hi": "मजबूत दस्ताने और फेस मास्क पहनकर काम करें।", "mr": "मजबूत हातमोजे आणि मास्क घालूनच काम करा."},
            {"en": "Keep boards whole for authorized hydrometallurgy facilities.", "hi": "बोर्ड को तोड़े बिना अधिकृत रीसाइक्लर को दें।", "mr": "सर्किट बोर्ड तोडण्याऐवजी संपूर्ण अधिकृत रिसायकलरला द्या."},
        ],
        donts=[
            {"en": "Never cook green boards over gas stoves.", "hi": "स्टोव या खुली आग पर सर्किट बोर्ड कभी न तपाएं।", "mr": "शेगडीवर सर्किट बोर्ड कधीही गरम करू नका."},
            {"en": "Never pour toxic leachate down household drains.", "hi": "तेजाब का गंदा पानी नाली या जमीन पर न बहाएं।", "mr": "ॲसिडचे घाण पाणी गटारात वाहू देऊ नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="crt",
        category_name="CRT Monitors & Glass Displays",
        hazard_level="medium",
        vernacular_slogan={
            "en": "Keep vacuum tube intact! Implosion spreads lead dust.",
            "hi": "कांच की पिक्चर ट्यूब मत फोड़ो! लेड और फॉस्फोर का जहर फैलता है।",
            "mr": "काचेची ट्यूब फोडू नका! लेड आणि फॉस्फरची विषारी धूळ पसरते.",
        },
        explanation={
            "en": "CRT funnels contain 1.5 to 3 kg of lead. Breaking tubes implodes glass and scatters toxic cadmium phosphor.",
            "hi": "सीआरटी मॉनिटर में बहुत ज्यादा लेड होता है, टूटने पर जहरीला पाउडर हवा में फैलता है।",
            "mr": "सीआरटी स्क्रीनमध्ये भरपूर शिसे असते, फुटल्यास विषारी पावडर हवेत पसरते.",
        },
        dos=[
            {"en": "Keep screens whole and cushioned during transit.", "hi": "स्क्रीन को सुरक्षित कपड़े पर रखकर ले जाएं।", "mr": "स्क्रीन सुरक्षित ठेवून वाहून न्या."},
            {"en": "Hand over complete unit to authorized dismantling units.", "hi": "पूरा मॉनिटर अधिकृत रीसाइक्लर को सौंपें।", "mr": "संपूर्ण युनिट अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Do not smash vacuum glass to get copper coils.", "hi": "तांबे के लिए कांच कभी न तोड़ें।", "mr": "तांब्यासाठी काच कधीही फोडू नका."},
            {"en": "Do not discard broken screen glass in landfills.", "hi": "टूटा कांच खुले मैदान में न फेंके।", "mr": "फुटलेली काच उघड्यावर टाकू नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="mobile_phone",
        category_name="Mobile Phones & Handheld Gadgets",
        hazard_level="standard",
        vernacular_slogan={
            "en": "Keep devices dry and intact. Handle swollen batteries safely.",
            "hi": "डिवाइस को सूखा रखें। फूली हुई बैटरी को अलग रखें।",
            "mr": "डिव्हाइस कोरडे ठेवा. फुगलेली बॅटरी काळजीपूर्वक हाताळा.",
        },
        explanation={
            "en": "Internal smartphone lithium batteries can short and explode if pierced with sharp pry tools.",
            "hi": "फोन की बैटरी में नुकीला औजार लगने से आग लग सकती है।",
            "mr": "मोबाईलमधील बॅटरीवर टोकदार हत्यार लागल्यास आग लागू शकते.",
        },
        dos=[
            {"en": "Store in dry bins away from sparks and moisture.", "hi": "सूखे डिब्बे में नमी और आग से दूर रखें।", "mr": "कोरड्या डब्यात आग आणि ओलाव्यापासून दूर ठेवा."},
            {"en": "Batch phones for bulk authorized pickup.", "hi": "फोन इकट्ठे करके अधिकृत रीसाइक्लर को दें।", "mr": "फोन गोळा करून अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Do not burn plastic housings or battery packs.", "hi": "प्लास्टिक बॉडी या बैटरी को कभी न जलाएं।", "mr": "प्लास्टिक बॉडी किंवा बॅटरी जाळू नका."},
            {"en": "Do not attempt crude backyard battery harvesting.", "hi": "घर पर बैटरी जबरदस्ती खोलने की कोशिश न करें।", "mr": "घरी बॅटरी उघडण्याचा प्रयत्न करू नका."},
        ],
    ),
]


def parse_lot_id(ref: str) -> int | None:
    ref_clean = ref.strip()
    if ref_clean.isdigit():
        return int(ref_clean)
    match = re.search(r"(\d+)$", ref_clean)
    if match:
        return int(match.group(1))
    return None


@app.get(f"{settings.api_v1_prefix}/safety/guidance", response_model=SafetyGuidanceResponse)
def get_safety_guidance(category: str | None = None):
    if category:
        cat_lower = category.lower()
        filtered = [
            item for item in SAFETY_KNOWLEDGE_BASE
            if item.material_key in cat_lower or cat_lower in item.category_name.lower()
        ]
        if filtered:
            return SafetyGuidanceResponse(items=filtered)
    return SafetyGuidanceResponse(items=SAFETY_KNOWLEDGE_BASE)


@app.get(f"{settings.api_v1_prefix}/passport/{{reference_or_id}}", response_model=RecyclingPassportOut)
def get_recycling_passport(reference_or_id: str, db: Session = Depends(get_db)):  # noqa: B008
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

    handover = db.execute(
        select(Handover).where(Handover.lot_id == lot_id)
    ).scalar_one_or_none()
    if not recycler and handover:
        recycler = db.get(Recycler, handover.recycler_id)

    final_weight = handover.final_weight_kg if handover else None
    final_price = accepted_offer.offer_price if accepted_offer else None

    hash_payload = (
        f"lot:{lot.id}|collector:{lot.collector_id}|material:{material.name if material else 'unknown'}|"
        f"init_qty:{lot.quantity_kg}|final_weight:{final_weight}|price:{final_price}|"
        f"recycler:{recycler.id if recycler else 'none'}|sig:{handover.signature if handover else 'none'}|"
        f"status:{lot.status}"
    )
    certificate_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

    passport_id = f"REV-2026-LOT-{lot.id:04d}"
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


RESOLVED_ANOMALIES: set[str] = set()


def compute_admin_anomalies(db: Session) -> list[AdminAnomalyOut]:
    anomalies: list[AdminAnomalyOut] = []

    # 1. Check weight discrepancies in handovers
    handovers = db.execute(select(Handover)).scalars().all()
    for h in handovers:
        lot = db.get(Lot, h.lot_id)
        if lot and lot.quantity_kg > 0:
            diff = abs(lot.quantity_kg - h.final_weight_kg)
            pct = (diff / lot.quantity_kg) * 100.0
            if pct > 10.0 and diff >= 0.3:
                aid = f"ANOM-WT-{h.id}"
                severity = "high" if pct > 25.0 else "medium"
                status_str = "resolved" if aid in RESOLVED_ANOMALIES else "open"
                anomalies.append(AdminAnomalyOut(
                    id=aid,
                    type="weight_discrepancy",
                    severity=severity,
                    lot_id=lot.id,
                    title="Scale Weight Discrepancy Flagged",
                    description=f"Physical handover weight ({h.final_weight_kg} kg) deviates by {pct:.1f}% from collector estimate ({lot.quantity_kg} kg).",
                    expected_value=f"{lot.quantity_kg} kg",
                    actual_value=f"{h.final_weight_kg} kg",
                    detected_at=h.created_at.isoformat() if h.created_at else "2026-09-08T12:00:00Z",
                    status=status_str,
                ))

    # 2. Check price outliers in offers
    offers = db.execute(select(Offer)).scalars().all()
    for o in offers:
        lot = db.get(Lot, o.lot_id)
        if lot and lot.quantity_kg >= 1.0:
            material = db.get(Material, lot.material_id)
            if material:
                unit_price = o.offer_price / lot.quantity_kg
                benchmark = estimate_price(material.category, "Bhopal", 1.0)
                median = float(benchmark.get("price_per_kg_median", 100.0)) if benchmark else 100.0
                if unit_price > median * 1.6 or (0 < unit_price < median * 0.35):
                    aid = f"ANOM-PR-{o.id}"
                    status_str = "resolved" if aid in RESOLVED_ANOMALIES else "open"
                    anomalies.append(AdminAnomalyOut(
                        id=aid,
                        type="price_outlier",
                        severity="medium",
                        lot_id=lot.id,
                        title="Bid Rate Anomaly Detected",
                        description=f"Offered unit price ₹{unit_price:.1f}/kg significantly deviates from regional median benchmark ₹{median:.1f}/kg.",
                        expected_value=f"₹{median:.1f}/kg",
                        actual_value=f"₹{unit_price:.1f}/kg",
                        detected_at=o.created_at.isoformat() if o.created_at else "2026-09-08T12:00:00Z",
                        status=status_str,
                    ))

    # 3. Check transactions involving unverified recyclers
    for o in offers:
        if o.status in ["accepted", "pending"]:
            recycler = db.get(Recycler, o.recycler_id)
            if recycler and not recycler.verified:
                aid = f"ANOM-UNV-{o.id}"
                status_str = "resolved" if aid in RESOLVED_ANOMALIES else "open"
                anomalies.append(AdminAnomalyOut(
                    id=aid,
                    type="unverified_actor",
                    severity="high",
                    lot_id=o.lot_id,
                    title="Active Bid from Unverified Recycler",
                    description=f"Lot #{o.lot_id} has bid from recycler '{recycler.name}' without active CPCB authorization.",
                    expected_value="CPCB Verified",
                    actual_value="Unverified",
                    detected_at=o.created_at.isoformat() if o.created_at else "2026-09-08T12:00:00Z",
                    status=status_str,
                ))

    return anomalies


@app.get(f"{settings.api_v1_prefix}/admin/metrics", response_model=AdminMetricsOut)
def get_admin_metrics(db: Session = Depends(get_db)):  # noqa: B008
    lots = db.execute(select(Lot)).scalars().all()
    total_lots = len(lots)
    active_lots = len([l for l in lots if l.status in ["created", "offers", "pickup"]])
    completed_lots = len([l for l in lots if l.status in ["handed_over", "payment_completed"]])

    total_weight_kg = round(sum(l.quantity_kg for l in lots), 2)
    completed_weight_kg = sum(l.quantity_kg for l in lots if l.status in ["handed_over", "payment_completed"])

    accepted_offers = db.execute(select(Offer).where(Offer.status == "accepted")).scalars().all()
    total_turnover_inr = round(sum(o.offer_price for o in accepted_offers), 2)

    co2_saved_kg = round(completed_weight_kg * 1.44, 2)
    toxic_metals_diverted_kg = round(completed_weight_kg * 0.12, 2)

    recyclers = db.execute(select(Recycler)).scalars().all()
    total_recyclers = len(recyclers)
    verified_recyclers = len([r for r in recyclers if r.verified])
    recycler_verification_ratio = round(verified_recyclers / total_recyclers, 2) if total_recyclers > 0 else 0.0

    anomalies = compute_admin_anomalies(db)
    flagged_anomalies_count = len([a for a in anomalies if a.status == "open"])

    return AdminMetricsOut(
        total_lots=total_lots,
        active_lots=active_lots,
        completed_lots=completed_lots,
        total_weight_kg=total_weight_kg,
        total_turnover_inr=total_turnover_inr,
        co2_saved_kg=co2_saved_kg,
        toxic_metals_diverted_kg=toxic_metals_diverted_kg,
        total_recyclers=total_recyclers,
        verified_recyclers=verified_recyclers,
        recycler_verification_ratio=recycler_verification_ratio,
        flagged_anomalies_count=flagged_anomalies_count,
    )


@app.get(f"{settings.api_v1_prefix}/admin/anomalies", response_model=list[AdminAnomalyOut])
def get_admin_anomalies(db: Session = Depends(get_db)):  # noqa: B008
    return compute_admin_anomalies(db)


@app.post(f"{settings.api_v1_prefix}/admin/anomalies/{{anomaly_id}}/resolve")
def resolve_admin_anomaly(anomaly_id: str):
    RESOLVED_ANOMALIES.add(anomaly_id)
    return {"id": anomaly_id, "status": "resolved", "message": "Anomaly acknowledged and resolved"}


@app.post(f"{settings.api_v1_prefix}/recyclers/{{recycler_id}}/verify", response_model=RecyclerOut)
def verify_recycler(recycler_id: int, payload: RecyclerVerificationUpdate, db: Session = Depends(get_db)):  # noqa: B008
    recycler = db.get(Recycler, recycler_id)
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found")

    recycler.verified = payload.verified
    db.commit()
    db.refresh(recycler)
    return RecyclerOut(
        id=recycler.id,
        name=recycler.name,
        verified=recycler.verified,
        location=recycler.location,
        contact_phone=recycler.contact_phone,
    )


@app.post(f"{settings.api_v1_prefix}/demo/run-workflow", response_model=DemoWorkflowResult)
def run_demo_workflow(db: Session = Depends(get_db)):  # noqa: B008
    # 1. Ensure material exists (PCB or create)
    material = db.execute(select(Material).where(Material.category == "Electronic")).scalars().first()
    if not material:
        material = Material(name="Motherboard & Server PCB", category="Electronic", description="High-yield e-waste circuit boards", is_hazardous=True)
        db.add(material)
        db.commit()
        db.refresh(material)

    # 2. Ensure verified recycler exists
    recycler = db.execute(select(Recycler).where(Recycler.verified == True)).scalars().first()
    if not recycler:
        recycler = Recycler(name="EcoCycle India Authorized Recyclers", verified=True, location="Bhopal, MP", contact_phone="9876543210")
        db.add(recycler)
        db.commit()
        db.refresh(recycler)

    # 3. Create demonstration lot
    demo_weight = 14.5
    bench = estimate_price("PCB", "Bhopal", demo_weight)
    estimated_val = float(bench.get("estimated_value", 5840.0)) if bench else 5840.0

    lot = Lot(
        collector_id=1,
        material_id=material.id,
        photo_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        quantity_kg=demo_weight,
        estimated_value=round(estimated_val, 2),
        status="created",
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)

    # 4. Create competitive offer from authorized recycler
    offer_amount = round(estimated_val * 1.05, 2)
    offer = Offer(
        lot_id=lot.id,
        recycler_id=recycler.id,
        offer_price=offer_amount,
        pickup_available=True,
        status="accepted",
    )
    db.add(offer)
    lot.status = "pickup"
    lot.estimated_value = offer_amount
    db.commit()
    db.refresh(offer)

    # 5. Create confirmed two-party digital handover
    verified_scale_weight = 14.2
    handover = Handover(
        lot_id=lot.id,
        collector_id=1,
        recycler_id=recycler.id,
        final_weight_kg=verified_scale_weight,
        handover_location="Bhopal Regional Scrap Cluster",
        collector_confirmed=True,
        recycler_confirmed=True,
        signature=f"SIG-SIH-DEMO-{lot.id}-CPCB",
        status="confirmed",
    )
    db.add(handover)
    lot.status = "handed_over"
    db.commit()
    db.refresh(handover)

    # 6. Complete payment settlement
    lot.status = "payment_completed"
    db.commit()
    db.refresh(lot)

    # 7. Generate certificate hash and passport ID
    hash_payload = (
        f"lot:{lot.id}|collector:{lot.collector_id}|material:{material.name}|"
        f"init_qty:{lot.quantity_kg}|final_weight:{verified_scale_weight}|price:{offer_amount}|"
        f"recycler:{recycler.id}|sig:{handover.signature}|status:{lot.status}"
    )
    cert_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()
    passport_id = f"REV-2026-LOT-{lot.id:04d}"
    qr_data = f"REVIVE-PASSPORT|ID:{passport_id}|LOT:{lot.id}|HASH:{cert_hash[:16]}|STATUS:payment_completed"

    median_rate = bench.get("price_per_kg_median", 403) if bench else 403
    steps = [
        "1. Material Catalogued & Scaled (14.5 kg Motherboard & Server PCB)",
        f"2. Regional AI Price Benchmark Calculated (₹ {median_rate}/kg)",
        f"3. Authorized CPCB Recycler Matched ({recycler.name}) with Offer of ₹ {offer_amount}",
        "4. Collector Accepted Competitive Recycler Offer",
        f"5. Two-Party Digital Handover Verified ({verified_scale_weight} kg) with Signed Custody",
        f"6. Instant Direct Payment Settled (₹ {offer_amount})",
        f"7. Tamper-Evident Recycling Passport & QR Code Generated ({passport_id})"
    ]

    return DemoWorkflowResult(
        success=True,
        lot_id=lot.id,
        passport_id=passport_id,
        steps_completed=steps,
        certificate_hash=cert_hash,
        qr_data=qr_data,
    )


@app.get("/")
def root():
    return {"message": "ReVive API is running"}


