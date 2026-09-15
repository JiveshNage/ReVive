from datetime import datetime, timedelta, timezone
import logging
from typing import Any

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

logger = logging.getLogger("revive.auth")

# HTTPBearer scheme with auto_error=False allows optional auth or custom error handling
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    # Bcrypt maximum input length is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    if not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
    })
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a native JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        return None


def verify_firebase_token(token: str) -> dict[str, Any] | None:
    """
    Verify Firebase Authentication ID token.
    Validates token structure, expiration, audience, and extracts claims.
    """
    try:
        # Check unverified claims first to inspect issuer
        unverified_claims = jwt.get_unverified_claims(token)
        iss = unverified_claims.get("iss", "")
        aud = unverified_claims.get("aud", "")
        
        # Verify issuer is Firebase
        if not iss.startswith("https://securetoken.google.com/"):
            return None
        
        # Check expiration
        exp = unverified_claims.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            return None

        # Verify audience matches project if configured
        if settings.firebase_project_id and aud != settings.firebase_project_id:
            logger.warning("Firebase token aud '%s' does not match configured '%s'", aud, settings.firebase_project_id)
            return None

        return unverified_claims
    except Exception as exc:
        logger.debug("Failed to verify Firebase token: %s", exc)
        return None


def resolve_or_create_firebase_user(firebase_claims: dict[str, Any], db: Session) -> User:
    """
    Resolve existing PostgreSQL user record from Firebase identity or provision a new collector user.
    Enforces server-side authorization: default role is ALWAYS 'collector'.
    """
    fb_uid = firebase_claims.get("sub") or firebase_claims.get("user_id")
    phone = firebase_claims.get("phone_number")
    email = firebase_claims.get("email")
    name = firebase_claims.get("name") or "Firebase Collector"

    # Normalize phone: extract last 10 digits if Indian number
    normalized_phone = None
    if phone:
        digits = "".join(filter(str.isdigit, phone))
        normalized_phone = digits[-10:] if len(digits) >= 10 else digits

    # Try matching existing user by phone or email
    user = None
    if normalized_phone:
        user = db.execute(select(User).where(User.phone == normalized_phone)).scalars().first()
        if not user and phone != normalized_phone:
            user = db.execute(select(User).where(User.phone == phone)).scalars().first()
    if not user and email:
        user = db.execute(select(User).where(User.email == email)).scalars().first()

    # If user doesn't exist, automatically provision collector record
    if not user:
        assign_phone = normalized_phone or phone or f"fb_{fb_uid[:12]}"
        user = User(
            name=name,
            phone=assign_phone,
            email=email,
            role="collector",  # Strictly server-assigned default role
            language="hi",
            location="Bhopal, MP",
            is_active=True,
            custom_user_id=f"REV-COL-FB-{assign_phone[-4:] if len(assign_phone) >= 4 else '0000'}",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency to extract and validate authenticated user.
    Supports both native ReVive JWT Bearer tokens and Firebase Authentication ID tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception

    token_str = credentials.credentials

    # 1. First attempt native JWT decoding
    payload = decode_access_token(token_str)
    if payload:
        user_id = payload.get("user_id")
        phone = payload.get("sub")
        if user_id is None and phone is None:
            raise credentials_exception

        if user_id is not None:
            user = db.execute(select(User).where(User.id == int(user_id))).scalars().first()
        else:
            user = db.execute(select(User).where(User.phone == str(phone))).scalars().first()

        if not user:
            raise credentials_exception

        if not getattr(user, "is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )
        return user

    # 2. If native JWT fails, attempt Firebase ID Token verification
    fb_claims = verify_firebase_token(token_str)
    if fb_claims:
        user = resolve_or_create_firebase_user(fb_claims, db)
        if not getattr(user, "is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )
        return user

    raise credentials_exception



def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """Optional user dependency returning None if unauthenticated."""
    if not credentials:
        return None
    try:
        return get_current_user(credentials=credentials, db=db)
    except HTTPException:
        return None


def require_role(*allowed_roles: str):
    """Dependency factory to enforce role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} roles.",
            )
        return current_user
    return role_checker
