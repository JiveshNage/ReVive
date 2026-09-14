from datetime import datetime, timezone
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai_service import estimate_price
from app.auth import get_optional_current_user
from app.config import settings
from app.database import get_db
from app.models import DocumentAuditLog, DocumentType, Handover, Lot, Material, Offer, OrganizationDocument, Recycler, ResolvedAnomaly, User
from app.schemas import (
    AdminAnomalyOut,
    AdminMetricsOut,
    DemoWorkflowResult,
    DocumentAuditLogOut,
    DocumentReviewRequest,
    OrganizationDocumentOut,
    RecyclerOut,
    RecyclerVerificationUpdate,
)

router = APIRouter(prefix=settings.api_v1_prefix, tags=["Admin & Governance"])


def enforce_admin_access(current_user: User | None):
    """Enforces that only administrators can access admin governance endpoints."""
    is_dev = settings.app_env.lower() in ("development", "dev", "test")
    if current_user:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: requires CPCB Admin privileges.",
            )
    elif not is_dev:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for administrative endpoints.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def compute_admin_anomalies(db: Session) -> list[AdminAnomalyOut]:
    anomalies: list[AdminAnomalyOut] = []

    # Get persisted resolved anomaly IDs
    resolved_ids = set(db.execute(select(ResolvedAnomaly.id)).scalars().all())

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
                status_str = "resolved" if aid in resolved_ids else "open"
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
                    status_str = "resolved" if aid in resolved_ids else "open"
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
                status_str = "resolved" if aid in resolved_ids else "open"
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


@router.get("/admin/metrics", response_model=AdminMetricsOut)
def get_admin_metrics(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    enforce_admin_access(current_user)
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


@router.get("/admin/anomalies", response_model=list[AdminAnomalyOut])
def get_admin_anomalies(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    enforce_admin_access(current_user)
    return compute_admin_anomalies(db)


@router.post("/admin/anomalies/{anomaly_id}/resolve")
def resolve_admin_anomaly(
    anomaly_id: str,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    enforce_admin_access(current_user)
    existing = db.get(ResolvedAnomaly, anomaly_id)
    if not existing:
        resolved = ResolvedAnomaly(id=anomaly_id, notes="Anomaly acknowledged and resolved")
        db.add(resolved)
        db.commit()
    return {"id": anomaly_id, "status": "resolved", "message": "Anomaly acknowledged and resolved"}


@router.post("/recyclers/{recycler_id}/verify", response_model=RecyclerOut)
def verify_recycler(
    recycler_id: int,
    payload: RecyclerVerificationUpdate,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    enforce_admin_access(current_user)
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


@router.get("/admin/documents", response_model=list[OrganizationDocumentOut])
def list_admin_documents(
    status_filter: str | None = None,
    org_id: int | None = None,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Lists submitted organization documents for admin review and compliance verification."""
    enforce_admin_access(current_user)
    from app.routers.documents import build_document_out

    query = select(OrganizationDocument).order_by(OrganizationDocument.id.desc())
    if status_filter:
        query = query.where(OrganizationDocument.status == status_filter.upper())
    if org_id:
        query = query.where(OrganizationDocument.organization_id == org_id)

    docs = db.execute(query).scalars().all()
    return [build_document_out(d) for d in docs]


@router.post("/admin/documents/{document_id}/review", response_model=OrganizationDocumentOut)
def review_organization_document(
    document_id: int,
    payload: DocumentReviewRequest,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Approves or rejects an organization compliance document.
    When rejecting, a clear rejection reason is strictly required.
    Triggers recalculation of the organization's verification status and audit logging.
    """
    enforce_admin_access(current_user)
    from app.routers.documents import build_document_out, recalculate_organization_status

    doc = db.get(OrganizationDocument, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    reviewer_id = current_user.id if current_user else None

    doc.status = payload.status
    doc.reviewed_at = datetime.now(timezone.utc)
    doc.reviewed_by = reviewer_id

    if payload.status == "REJECTED":
        doc.rejection_reason = payload.rejection_reason.strip()
    else:
        doc.rejection_reason = None

    db.add(doc)
    db.commit()

    # Log audit event
    action_type = "APPROVED" if payload.status == "APPROVED" else "REJECTED"
    audit = DocumentAuditLog(
        document_id=doc.id,
        organization_id=doc.organization_id,
        actor_id=reviewer_id,
        action=action_type,
        details=f"Document {action_type.lower()} by administrator",
        rejection_reason=doc.rejection_reason,
    )
    db.add(audit)
    db.commit()

    # Recalculate organization's verification status
    recalculate_organization_status(doc.organization, db)
    db.refresh(doc)
    return build_document_out(doc)


@router.get("/admin/document-audit-logs", response_model=list[DocumentAuditLogOut])
def list_admin_document_audit_logs(
    org_id: int | None = None,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Lists compliance audit trail events for administrators."""
    enforce_admin_access(current_user)

    query = select(DocumentAuditLog).order_by(DocumentAuditLog.id.desc()).limit(200)
    if org_id:
        query = query.where(DocumentAuditLog.organization_id == org_id)

    logs = db.execute(query).scalars().all()
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



@router.post("/demo/run-workflow", response_model=DemoWorkflowResult)
def run_demo_workflow(db: Session = Depends(get_db)):
    material = db.execute(select(Material).where(Material.category == "Electronic")).scalars().first()
    if not material:
        material = Material(
            name="Motherboard & Server PCB",
            category="Electronic",
            description="High-yield e-waste circuit boards",
            is_hazardous=True,
        )
        db.add(material)
        db.commit()
        db.refresh(material)

    recycler = db.execute(select(Recycler).where(Recycler.verified == True)).scalars().first()
    if not recycler:
        recycler = Recycler(
            name="EcoCycle India Authorized Recyclers",
            verified=True,
            location="Bhopal, MP",
            contact_phone="9876543210",
        )
        db.add(recycler)
        db.commit()
        db.refresh(recycler)

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

    lot.status = "payment_completed"
    db.commit()
    db.refresh(lot)

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
        f"7. Tamper-Evident Recycling Passport & QR Code Generated ({passport_id})",
    ]

    return DemoWorkflowResult(
        success=True,
        lot_id=lot.id,
        passport_id=passport_id,
        steps_completed=steps,
        certificate_hash=cert_hash,
        qr_data=qr_data,
    )
