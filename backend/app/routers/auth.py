import logging
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.email_service import send_otp_email
from app.models import LoginAudit, User
from app.schemas import (
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    ProfileCreateRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfileOut,
    UserSignupRequest,
)

logger = logging.getLogger("revive.auth")
router = APIRouter(prefix=f"{settings.api_v1_prefix}/auth", tags=["Auth"])

# In-memory OTP store with expiration timestamp: {identifier: (otp_code, expiry_time)}
# Can easily be swapped with Redis in production
OTP_STORE: dict[str, tuple[str, datetime]] = {}
OTP_VALIDITY_MINUTES = 5


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
        is_active=getattr(user, "is_active", True),
        created_at=user.created_at.isoformat() if getattr(user, "created_at", None) else None,
    )


@router.post("/signup", response_model=TokenResponse)
def signup_user(payload: UserSignupRequest, db: Session = Depends(get_db)):
    clean_phone = payload.phone.strip()
    existing_phone = db.execute(select(User).where(User.phone == clean_phone)).scalars().first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this phone number already exists.",
        )

    clean_email = payload.email.strip() if payload.email else None
    if clean_email:
        existing_email = db.execute(select(User).where(User.email == clean_email)).scalars().first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

    hashed_pwd = hash_password(payload.password) if payload.password else None

    new_user = User(
        name=payload.name.strip(),
        phone=clean_phone,
        role=payload.role,
        language=payload.language,
        location=payload.location or "Bhopal, MP",
        email=clean_email,
        company_name=payload.company_name,
        license_no=payload.license_no,
        service_area=payload.service_area,
        hashed_password=hashed_pwd,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_user.custom_user_id = generate_custom_user_id(new_user.role, new_user.id)
    db.commit()
    db.refresh(new_user)

    audit = LoginAudit(
        user_id=new_user.id,
        phone=new_user.phone,
        login_type="signup",
        status="success",
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = issue_user_jwt(new_user, new_user.phone)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_profile_out(new_user),
        is_new_user=False,
    )


@router.post("/login", response_model=TokenResponse)
def login_with_password(payload: UserLoginRequest, db: Session = Depends(get_db)):
    identifier = payload.phone_or_email.strip()

    if "@" in identifier:
        user = db.execute(select(User).where(User.email == identifier)).scalars().first()
    else:
        user = db.execute(select(User).where(User.phone == identifier)).scalars().first()

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


@router.get("/me", response_model=UserProfileOut)
def get_me(current_user: User = Depends(get_current_user)):
    return build_user_profile_out(current_user)


@router.post("/send-otp", response_model=OtpSendResponse)
def send_otp(payload: OtpSendRequest):
    identifier = (payload.phone or payload.email or "").strip()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 10-digit mobile number or email address.",
        )
    is_email = "@" in identifier

    # Generate OTP (deterministic "123456" for dev/testing, random 6-digit for production)
    is_dev = settings.app_env.lower() in ("development", "dev", "test")
    generated_otp = "123456" if is_dev else f"{secrets.randbelow(900000) + 100000}"

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_VALIDITY_MINUTES)
    OTP_STORE[identifier] = (generated_otp, expires_at)

    if is_email:
        send_otp_email(identifier, generated_otp)
        return OtpSendResponse(
            success=True,
            message=f"OTP successfully sent via Brevo SMTP to {identifier}.",
            demo_otp=generated_otp if is_dev else None,
        )

    digits = re.sub(r"\D", "", identifier)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 10-digit Indian mobile number or email address.",
        )

    # Store normalized digits as well
    OTP_STORE[digits] = (generated_otp, expires_at)

    if payload.email and payload.email != identifier:
        send_otp_email(payload.email, generated_otp)

    return OtpSendResponse(
        success=True,
        message=f"OTP successfully dispatched to +91 {digits}.",
        demo_otp=generated_otp if is_dev else None,
    )


@router.post("/verify-otp", response_model=OtpVerifyResponse)
def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)):
    identifier = (payload.phone or payload.email or "").strip()
    if not identifier:
        identifier = "9876543210"

    is_email = "@" in identifier
    is_dev = settings.app_env.lower() in ("development", "dev", "test")

    # Check OTP store first
    stored_entry = OTP_STORE.get(identifier)
    digits = identifier
    if not is_email:
        digits = re.sub(r"\D", "", identifier)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if not stored_entry:
            stored_entry = OTP_STORE.get(digits)

    # Verification logic: match stored OTP and check expiration, or allow fallback demo code in dev
    is_valid = False
    if stored_entry:
        code, expiry = stored_entry
        if datetime.now(timezone.utc) <= expiry and payload.otp == code:
            is_valid = True
            OTP_STORE.pop(identifier, None)
            OTP_STORE.pop(digits, None)

    if not is_valid and is_dev and payload.otp == "123456":
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code.",
        )

    if is_email:
        user = db.execute(select(User).where(User.email == identifier)).scalars().first()
    else:
        user = db.execute(select(User).where(User.phone == digits)).scalars().first()

    # If user not found, auto-provision user so demo and new users instantly enter the portal!
    is_new = False
    if not user:
        is_new = True
        user_role = payload.role if payload.role in ("collector", "recycler", "admin") else "collector"
        user_name = f"Registered {user_role.capitalize()}" if is_dev else "New User"
        phone_num = digits if not is_email and len(digits) == 10 else f"98765{secrets.randbelow(90000) + 10000}"
        user = User(
            name=user_name,
            phone=phone_num,
            email=identifier if is_email else None,
            role=user_role,
            language="en",
            location="Bhopal, MP",
            hashed_password=hash_password("DemoPassword123!"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not getattr(user, "custom_user_id", None):
        user.custom_user_id = generate_custom_user_id(user.role, user.id)
        db.commit()
        db.refresh(user)

    audit = LoginAudit(
        user_id=user.id,
        phone=user.phone,
        login_type="otp",
        status="success",
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = issue_user_jwt(user, user.phone)
    return OtpVerifyResponse(
        verified=True,
        token=token,
        access_token=token,
        token_type="bearer",
        user=build_user_profile_out(user),
        is_new_user=is_new,
    )


@router.post("/profile", response_model=UserProfileOut)
def setup_or_update_profile(payload: ProfileCreateRequest, db: Session = Depends(get_db)):
    clean_phone = payload.phone.strip()
    digits = re.sub(r"\D", "", clean_phone)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]

    user = db.execute(select(User).where(User.phone == digits)).scalars().first()
    if not user and payload.email:
        user = db.execute(select(User).where(User.email == payload.email)).scalars().first()

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


@router.post(f"{settings.api_v1_prefix}/users")
def legacy_create_user(
    name: str,
    phone: str,
    role: str = "collector",
    language: str = "hi",
    db: Session = Depends(get_db),
):
    user = User(name=name, phone=phone, role=role, language=language)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "phone": user.phone, "role": user.role}
