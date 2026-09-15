from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

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
    recycler_id = Column(Integer, ForeignKey("recyclers.id", ondelete="SET NULL"), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    verification_status = Column(String(40), nullable=False, default="NOT_SUBMITTED")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lots = relationship("Lot", back_populates="collector", cascade="all, delete-orphan")
    login_audits = relationship("LoginAudit", back_populates="user", cascade="all, delete-orphan")
    organization_documents = relationship("OrganizationDocument", foreign_keys="OrganizationDocument.organization_id", back_populates="organization", cascade="all, delete-orphan")
    recycler = relationship("Recycler", foreign_keys=[recycler_id])


class LoginAudit(Base):
    __tablename__ = "login_audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    login_type = Column(String(20), default="otp")
    status = Column(String(20), default="success")
    ip_address = Column(String(50), nullable=True, default="127.0.0.1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="login_audits")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    category = Column(String(80), nullable=False)
    description = Column(Text, nullable=True)
    is_hazardous = Column(Boolean, default=False)

    lots = relationship("Lot", back_populates="material")


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    lot_reference = Column(String(50), unique=True, index=True, nullable=True)
    collector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False, index=True)
    photo_url = Column(String(255), nullable=True)
    quantity_kg = Column(Float, nullable=False, default=0.0)
    estimated_value = Column(Float, nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collector = relationship("User", back_populates="lots")
    material = relationship("Material", back_populates="lots")
    offers = relationship("Offer", back_populates="lot", cascade="all, delete-orphan")
    handovers = relationship("Handover", back_populates="lot", cascade="all, delete-orphan")


class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    verified = Column(Boolean, default=False)
    location = Column(String(200), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    accepted_materials = Column(Text, nullable=True)
    authorization_status = Column(String(80), default="Authorized")
    offered_rate = Column(Text, nullable=True)
    pickup_availability = Column(String(20), default="Yes")
    service_area = Column(String(255), nullable=True)

    offers = relationship("Offer", back_populates="recycler", cascade="all, delete-orphan")
    handovers = relationship("Handover", back_populates="recycler", cascade="all, delete-orphan")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id", ondelete="CASCADE"), nullable=False, index=True)
    recycler_id = Column(Integer, ForeignKey("recyclers.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_price = Column(Float, nullable=False, default=0.0)
    pickup_available = Column(Boolean, default=True)
    status = Column(String(30), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lot = relationship("Lot", back_populates="offers")
    recycler = relationship("Recycler", back_populates="offers")


class Handover(Base):
    __tablename__ = "handover_records"

    id = Column(Integer, primary_key=True, index=True)
    handover_reference = Column(String(50), unique=True, index=True, nullable=True)
    lot_id = Column(Integer, ForeignKey("lots.id", ondelete="CASCADE"), nullable=False, index=True)
    collector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recycler_id = Column(Integer, ForeignKey("recyclers.id", ondelete="CASCADE"), nullable=False, index=True)
    final_weight_kg = Column(Float, nullable=False, default=0.0)
    handover_location = Column(String(200), nullable=False)
    collector_confirmed = Column(Boolean, default=False)
    recycler_confirmed = Column(Boolean, default=False)
    signature = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_url = Column(String(255), nullable=True)
    status = Column(String(30), nullable=False, default="confirmed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lot = relationship("Lot", back_populates="handovers")
    collector = relationship("User")
    recycler = relationship("Recycler", back_populates="handovers")


class ResolvedAnomaly(Base):
    __tablename__ = "resolved_anomalies"

    id = Column(String(80), primary_key=True, index=True)
    resolved_by = Column(String(100), nullable=True)
    notes = Column(String(255), nullable=True)
    resolved_at = Column(DateTime(timezone=True), server_default=func.now())


class DocumentType(Base):
    __tablename__ = "document_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=True, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    applicable_to = Column(String(100), default="recycler,enterprise", nullable=False)
    validity_required = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    documents = relationship("OrganizationDocument", back_populates="document_type", cascade="all, delete-orphan")


class OrganizationDocument(Base):
    __tablename__ = "organization_documents"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type_id = Column(Integer, ForeignKey("document_types.id", ondelete="RESTRICT"), nullable=False, index=True)
    document_number = Column(String(100), nullable=True)
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    issued_date = Column(String(30), nullable=True)
    expiry_date = Column(String(30), nullable=True)
    status = Column(String(30), nullable=False, default="PENDING")  # DRAFT, PENDING, APPROVED, REJECTED, EXPIRED
    rejection_reason = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    organization = relationship("User", foreign_keys=[organization_id], back_populates="organization_documents")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    document_type = relationship("DocumentType", back_populates="documents")
    audit_logs = relationship("DocumentAuditLog", back_populates="document", cascade="all, delete-orphan")


class DocumentAuditLog(Base):
    __tablename__ = "document_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("organization_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)  # SUBMITTED, APPROVED, REJECTED, REPLACED, EXPIRED, STATUS_UPDATED
    details = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("OrganizationDocument", back_populates="audit_logs")
    organization = relationship("User", foreign_keys=[organization_id])
    actor = relationship("User", foreign_keys=[actor_id])

