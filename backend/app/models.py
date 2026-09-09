from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    role = Column(String(30), nullable=False, default="collector")
    language = Column(String(20), nullable=False, default="hi")
    location = Column(String(120), nullable=True, default="Bhopal, MP")
    email = Column(String(120), nullable=True)
    company_name = Column(String(150), nullable=True)
    license_no = Column(String(80), nullable=True)
    service_area = Column(String(150), nullable=True)
    custom_user_id = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LoginAudit(Base):
    __tablename__ = "login_audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    login_type = Column(String(20), default="otp")
    status = Column(String(20), default="success")
    ip_address = Column(String(50), nullable=True, default="127.0.0.1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    category = Column(String(80), nullable=False)
    description = Column(Text, nullable=True)
    is_hazardous = Column(Boolean, default=False)


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, nullable=False)
    material_id = Column(Integer, nullable=False)
    photo_url = Column(String(255), nullable=True)
    quantity_kg = Column(Float, nullable=False, default=0.0)
    estimated_value = Column(Float, nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    verified = Column(Boolean, default=False)
    location = Column(String(200), nullable=False)
    contact_phone = Column(String(20), nullable=True)


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, nullable=False)
    recycler_id = Column(Integer, nullable=False)
    offer_price = Column(Float, nullable=False, default=0.0)
    pickup_available = Column(Boolean, default=True)
    status = Column(String(30), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Handover(Base):
    __tablename__ = "handover_records"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, nullable=False, index=True)
    collector_id = Column(Integer, nullable=False)
    recycler_id = Column(Integer, nullable=False)
    final_weight_kg = Column(Float, nullable=False, default=0.0)
    handover_location = Column(String(200), nullable=False)
    collector_confirmed = Column(Boolean, default=False)
    recycler_confirmed = Column(Boolean, default=False)
    signature = Column(String(255), nullable=True)
    status = Column(String(30), nullable=False, default="confirmed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
