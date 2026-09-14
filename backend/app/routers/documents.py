from datetime import datetime, timezone, timedelta
import os
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_role
from app.config import settings
from app.database import get_db
from app.file_security import sanitize_and_save_document
from app.models import DocumentAuditLog, DocumentType, OrganizationDocument, Recycler, User
from app.schemas import (
    DocumentAuditLogOut,
    DocumentTypeCreate,
    DocumentTypeOut,
    OrganizationDocumentOut,
    VerificationSummaryOut,
)

router = APIRouter(prefix=f"{settings.api_v1_prefix}/documents", tags=["Organization Documents"])


def is_date_expiring_soon(date_str: str | None, days: int = 30) -> bool:
    """Checks if a date string (YYYY-MM-DD) expires within the given number of days."""
    if not date_str:
        return False
    try:
        exp_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        return today <= exp_date <= (today + timedelta(days=days))
    except Exception:
        return False


def is_date_expired(date_str: str | None) -> bool:
    """Checks if a date string (YYYY-MM-DD) is in the past."""
    if not date_str:
        return False
    try:
        exp_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        return exp_date < today
    except Exception:
        return False


def recalculate_organization_status(org: User, db: Session) -> str:
    """
    Recalculates an organization's overall verification state based on their documents.
    Possible states:
    - NOT_SUBMITTED
    - DOCUMENTS_PENDING
    - UNDER_REVIEW
    - PARTIALLY_VERIFIED
    - VERIFIED
    - REJECTED
    - EXPIRED
    """
    types_query = select(DocumentType).where(DocumentType.active == True)
    all_types = db.execute(types_query).scalars().all()
    required_types = [dt for dt in all_types if dt.required]

    docs = db.execute(
        select(OrganizationDocument).where(OrganizationDocument.organization_id == org.id)
    ).scalars().all()

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Transition expired documents
    has_expired_doc = False
    for doc in docs:
        if doc.expiry_date and doc.expiry_date < today_str and doc.status in ("APPROVED", "PENDING"):
            doc.status = "EXPIRED"
            db.add(doc)
            has_expired_doc = True

    if has_expired_doc:
        db.commit()

    if not docs:
        new_status = "NOT_SUBMITTED"
    else:
        # Group by document_type_id, keeping the highest version
        latest_docs_by_type: dict[int, OrganizationDocument] = {}
        for doc in docs:
            existing = latest_docs_by_type.get(doc.document_type_id)
            if not existing or doc.version > existing.version:
                latest_docs_by_type[doc.document_type_id] = doc

        missing_required = False
        all_required_approved = True
        any_rejected = False
        any_pending = False
        any_expired = False
        approved_count = 0

        for req in required_types:
            doc = latest_docs_by_type.get(req.id)
            if not doc:
                missing_required = True
                all_required_approved = False
            else:
                if doc.status == "REJECTED":
                    any_rejected = True
                    all_required_approved = False
                elif doc.status == "EXPIRED":
                    any_expired = True
                    all_required_approved = False
                elif doc.status in ("PENDING", "DRAFT"):
                    any_pending = True
                    all_required_approved = False
                elif doc.status == "APPROVED":
                    approved_count += 1

        if any_expired:
            new_status = "EXPIRED"
        elif any_rejected:
            new_status = "REJECTED"
        elif all_required_approved and len(required_types) > 0:
            new_status = "VERIFIED"
        elif any_pending and not missing_required and approved_count == 0:
            new_status = "UNDER_REVIEW"
        elif approved_count > 0 and (missing_required or any_pending):
            new_status = "PARTIALLY_VERIFIED"
        elif any_pending or len(latest_docs_by_type) > 0:
            new_status = "DOCUMENTS_PENDING"
        else:
            new_status = "NOT_SUBMITTED"

    old_status = org.verification_status
    org.verification_status = new_status

    # Synchronize Recycler table entry if role is recycler
    if org.role == "recycler":
        recycler = db.execute(
            select(Recycler).where(
                (Recycler.contact_phone == org.phone)
                | (Recycler.name == org.company_name)
                | (Recycler.name == org.name)
            )
        ).scalars().first()
        if recycler:
            recycler.verified = (new_status == "VERIFIED")
            db.add(recycler)

    if old_status != new_status:
        audit = DocumentAuditLog(
            organization_id=org.id,
            actor_id=org.id,
            action="STATUS_CHANGED",
            details=f"Organization verification status changed from {old_status} to {new_status}",
        )
        db.add(audit)

    db.add(org)
    db.commit()
    return new_status


def build_document_out(doc: OrganizationDocument) -> OrganizationDocumentOut:
    return OrganizationDocumentOut(
        id=doc.id,
        organization_id=doc.organization_id,
        organization_name=doc.organization.company_name or doc.organization.name if doc.organization else None,
        document_type_id=doc.document_type_id,
        document_type_code=doc.document_type.code if doc.document_type else None,
        document_type_name=doc.document_type.name if doc.document_type else None,
        document_number=doc.document_number,
        file_name=doc.file_name,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        issued_date=doc.issued_date,
        expiry_date=doc.expiry_date,
        status=doc.status,
        rejection_reason=doc.rejection_reason,
        submitted_at=doc.submitted_at.isoformat() if doc.submitted_at else None,
        reviewed_at=doc.reviewed_at.isoformat() if doc.reviewed_at else None,
        reviewed_by=doc.reviewed_by,
        reviewer_name=doc.reviewer.name if doc.reviewer else None,
        version=doc.version,
        is_expiring_soon=is_date_expiring_soon(doc.expiry_date),
        is_expired=is_date_expired(doc.expiry_date),
        download_url=f"{settings.api_v1_prefix}/documents/{doc.id}/file",
    )


@router.get("/types", response_model=list[DocumentTypeOut])
def get_document_types(db: Session = Depends(get_db)):
    """Retrieves all active configurable organization document types."""
    types = db.execute(
        select(DocumentType).where(DocumentType.active == True).order_by(DocumentType.required.desc(), DocumentType.id.asc())
    ).scalars().all()
    return [
        DocumentTypeOut(
            id=dt.id,
            code=dt.code,
            name=dt.name,
            description=dt.description,
            required=dt.required,
            active=dt.active,
            applicable_to=dt.applicable_to,
            validity_required=dt.validity_required,
            created_at=dt.created_at.isoformat() if dt.created_at else None,
            updated_at=dt.updated_at.isoformat() if dt.updated_at else None,
        )
        for dt in types
    ]


@router.post("/types", response_model=DocumentTypeOut)
def create_document_type(
    payload: DocumentTypeCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Allows an administrator to configure a new document type."""
    existing = db.execute(select(DocumentType).where(DocumentType.code == payload.code)).scalars().first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Document type '{payload.code}' already exists.")

    new_type = DocumentType(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        required=payload.required,
        active=payload.active,
        applicable_to=payload.applicable_to,
        validity_required=payload.validity_required,
    )
    db.add(new_type)
    db.commit()
    db.refresh(new_type)
    return DocumentTypeOut(
        id=new_type.id,
        code=new_type.code,
        name=new_type.name,
        description=new_type.description,
        required=new_type.required,
        active=new_type.active,
        applicable_to=new_type.applicable_to,
        validity_required=new_type.validity_required,
        created_at=new_type.created_at.isoformat() if new_type.created_at else None,
        updated_at=new_type.updated_at.isoformat() if new_type.updated_at else None,
    )


@router.get("/my", response_model=VerificationSummaryOut)
def get_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves document checklist, verification summary, and expiry alerts for authenticated user."""
    verification_status = recalculate_organization_status(current_user, db)

    docs = db.execute(
        select(OrganizationDocument)
        .where(OrganizationDocument.organization_id == current_user.id)
        .order_by(OrganizationDocument.id.desc())
    ).scalars().all()

    req_types = db.execute(select(DocumentType).where(DocumentType.required == True, DocumentType.active == True)).scalars().all()
    total_required = len(req_types)

    approved = [d for d in docs if d.status == "APPROVED"]
    pending = [d for d in docs if d.status == "PENDING"]
    rejected = [d for d in docs if d.status == "REJECTED"]
    expired = [d for d in docs if d.status == "EXPIRED" or is_date_expired(d.expiry_date)]
    expiring = [d for d in docs if is_date_expiring_soon(d.expiry_date)]

    status_messages = {
        "VERIFIED": "Your organization is verified with compliant CPCB & regulatory documentation.",
        "UNDER_REVIEW": "All required documents submitted and currently under regulatory compliance review.",
        "PARTIALLY_VERIFIED": "Some documents approved, but additional required documents must be submitted.",
        "DOCUMENTS_PENDING": "Required compliance certificates pending upload.",
        "REJECTED": "One or more documents were rejected. Please review feedback and re-upload.",
        "EXPIRED": "One or more required compliance certificates have expired. Upload updated versions.",
        "NOT_SUBMITTED": "No organization verification documents submitted yet.",
    }

    return VerificationSummaryOut(
        verification_status=verification_status,
        total_required=total_required,
        total_uploaded=len(docs),
        total_approved=len(approved),
        total_pending=len(pending),
        total_rejected=len(rejected),
        total_expired=len(expired),
        expiring_within_30_days=len(expiring),
        can_transact=(verification_status == "VERIFIED"),
        message=status_messages.get(verification_status, "Verification in progress"),
        documents=[build_document_out(d) for d in docs],
    )


@router.post("/upload", response_model=OrganizationDocumentOut)
def upload_document(
    document_type_id: int = Form(...),
    document_number: str | None = Form(None),
    issued_date: str | None = Form(None),
    expiry_date: str | None = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Uploads an organization certificate or compliance document:
    - Enforces magic bytes verification (PDF, PNG, JPG, WEBP).
    - Stores file in isolated directory with randomized UUID.
    - Updates organization status to UNDER_REVIEW or DOCUMENTS_PENDING.
    - Emits DocumentAuditLog record.
    """
    doc_type = db.get(DocumentType, document_type_id)
    if not doc_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document type not found.")

    file_bytes = file.file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        saved_path, safe_filename, detected_mime, file_size = sanitize_and_save_document(
            file_bytes=file_bytes,
            original_filename=file.filename,
            content_type=file.content_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Check for existing document of this type for this org
    existing_doc = db.execute(
        select(OrganizationDocument)
        .where(
            OrganizationDocument.organization_id == current_user.id,
            OrganizationDocument.document_type_id == document_type_id,
        )
        .order_by(OrganizationDocument.version.desc())
    ).scalars().first()

    version = 1
    if existing_doc:
        version = existing_doc.version + 1

    new_doc = OrganizationDocument(
        organization_id=current_user.id,
        document_type_id=document_type_id,
        document_number=document_number.strip() if document_number else None,
        file_path=str(saved_path),
        file_name=safe_filename,
        original_filename=file.filename or safe_filename,
        file_type=detected_mime,
        file_size=file_size,
        issued_date=issued_date.strip() if issued_date else None,
        expiry_date=expiry_date.strip() if expiry_date else None,
        status="PENDING",
        version=version,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Log audit event
    audit = DocumentAuditLog(
        document_id=new_doc.id,
        organization_id=current_user.id,
        actor_id=current_user.id,
        action="SUBMITTED",
        details=f"Uploaded version {version} of '{doc_type.name}' ({safe_filename})",
    )
    db.add(audit)
    db.commit()

    recalculate_organization_status(current_user, db)
    db.refresh(new_doc)
    return build_document_out(new_doc)


@router.put("/{document_id}", response_model=OrganizationDocumentOut)
def replace_document(
    document_id: int,
    document_number: str | None = Form(None),
    issued_date: str | None = Form(None),
    expiry_date: str | None = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Replaces an existing rejected or expired document with a newer version.
    """
    doc = db.get(OrganizationDocument, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if doc.organization_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    file_bytes = file.file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        saved_path, safe_filename, detected_mime, file_size = sanitize_and_save_document(
            file_bytes=file_bytes,
            original_filename=file.filename,
            content_type=file.content_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    doc.file_path = str(saved_path)
    doc.file_name = safe_filename
    doc.original_filename = file.filename or safe_filename
    doc.file_type = detected_mime
    doc.file_size = file_size
    if document_number:
        doc.document_number = document_number.strip()
    if issued_date:
        doc.issued_date = issued_date.strip()
    if expiry_date:
        doc.expiry_date = expiry_date.strip()
    doc.status = "PENDING"
    doc.rejection_reason = None
    doc.version += 1
    doc.submitted_at = datetime.now(timezone.utc)

    db.add(doc)
    db.commit()

    audit = DocumentAuditLog(
        document_id=doc.id,
        organization_id=doc.organization_id,
        actor_id=current_user.id,
        action="REPLACED",
        details=f"Replaced document with version {doc.version}",
    )
    db.add(audit)
    db.commit()

    recalculate_organization_status(doc.organization, db)
    db.refresh(doc)
    return build_document_out(doc)


@router.get("/{document_id}/file")
def stream_document_file(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Secure authenticated streaming endpoint:
    - Verifies IDOR: only document owner or admin can access.
    - Serves file with proper Content-Type and safe inline headers.
    """
    doc = db.get(OrganizationDocument, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if doc.organization_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view documents from another organization.",
        )

    file_path = Path(doc.file_path)
    if not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File content not found on storage server.")

    return FileResponse(
        path=str(file_path),
        media_type=doc.file_type,
        filename=doc.original_filename,
        content_disposition_type="inline",
    )


@router.get("/organization/{org_id}", response_model=VerificationSummaryOut)
def get_organization_documents(
    org_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admin endpoint (or self) to inspect an organization's documents."""
    if current_user.id != org_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    org = db.get(User, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    recalculate_organization_status(org, db)

    docs = db.execute(
        select(OrganizationDocument)
        .where(OrganizationDocument.organization_id == org.id)
        .order_by(OrganizationDocument.id.desc())
    ).scalars().all()

    req_types = db.execute(select(DocumentType).where(DocumentType.required == True, DocumentType.active == True)).scalars().all()
    approved = [d for d in docs if d.status == "APPROVED"]
    pending = [d for d in docs if d.status == "PENDING"]
    rejected = [d for d in docs if d.status == "REJECTED"]
    expired = [d for d in docs if d.status == "EXPIRED" or is_date_expired(d.expiry_date)]
    expiring = [d for d in docs if is_date_expiring_soon(d.expiry_date)]

    return VerificationSummaryOut(
        verification_status=org.verification_status,
        total_required=len(req_types),
        total_uploaded=len(docs),
        total_approved=len(approved),
        total_pending=len(pending),
        total_rejected=len(rejected),
        total_expired=len(expired),
        expiring_within_30_days=len(expiring),
        can_transact=(org.verification_status == "VERIFIED"),
        message=f"Verification status: {org.verification_status}",
        documents=[build_document_out(d) for d in docs],
    )


@router.get("/audit-logs", response_model=list[DocumentAuditLogOut])
def get_document_audit_logs(
    org_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves document audit trail."""
    query = select(DocumentAuditLog)
    if current_user.role != "admin":
        query = query.where(DocumentAuditLog.organization_id == current_user.id)
    elif org_id is not None:
        query = query.where(DocumentAuditLog.organization_id == org_id)

    logs = db.execute(query.order_by(DocumentAuditLog.id.desc()).limit(100)).scalars().all()
    return [
        DocumentAuditLogOut(
            id=log.id,
            document_id=log.document_id,
            organization_id=log.organization_id,
            actor_id=log.actor_id,
            actor_name=log.actor.name if log.actor else None,
            action=log.action,
            details=log.details,
            rejection_reason=log.rejection_reason,
            created_at=log.created_at.isoformat() if log.created_at else None,
        )
        for log in logs
    ]
