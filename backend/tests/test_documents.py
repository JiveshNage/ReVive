import io
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal
from app.main import app
from app.models import DocumentType, OrganizationDocument, Recycler, User
from app.auth import create_access_token

client = TestClient(app)

MINIMAL_VALID_PDF = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
MINIMAL_VALID_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00"
    b"\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


class TestOrganizationDocuments(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()

        # Create Test Recycler Org 1 (unverified)
        cls.org1 = cls.db.execute(select(User).where(User.phone == "9800000001")).scalars().first()
        if not cls.org1:
            cls.org1 = User(
                name="Apex Clean Recyclers",
                phone="9800000001",
                role="recycler",
                company_name="Apex Clean Tech Pvt Ltd",
                verification_status="NOT_SUBMITTED",
            )
            cls.db.add(cls.org1)
            cls.db.commit()
            cls.db.refresh(cls.org1)

        # Create Test Recycler Org 2 (separate org for IDOR testing)
        cls.org2 = cls.db.execute(select(User).where(User.phone == "9800000002")).scalars().first()
        if not cls.org2:
            cls.org2 = User(
                name="BioGreen Solutions",
                phone="9800000002",
                role="recycler",
                company_name="BioGreen Solutions LLP",
                verification_status="NOT_SUBMITTED",
            )
            cls.db.add(cls.org2)
            cls.db.commit()
            cls.db.refresh(cls.org2)

        # Create Admin User
        cls.admin = cls.db.execute(select(User).where(User.phone == "9800000000")).scalars().first()
        if not cls.admin:
            cls.admin = User(
                name="Central CPCB Auditor",
                phone="9800000000",
                role="admin",
            )
            cls.db.add(cls.admin)
            cls.db.commit()
            cls.db.refresh(cls.admin)

        cls.token_org1 = create_access_token({"sub": cls.org1.phone, "user_id": cls.org1.id, "role": cls.org1.role})
        cls.token_org2 = create_access_token({"sub": cls.org2.phone, "user_id": cls.org2.id, "role": cls.org2.role})
        cls.token_admin = create_access_token({"sub": cls.admin.phone, "user_id": cls.admin.id, "role": cls.admin.role})

        # Clean existing test documents for isolated runs
        from app.models import DocumentAuditLog
        cls.db.query(DocumentAuditLog).filter(DocumentAuditLog.organization_id.in_([cls.org1.id, cls.org2.id])).delete()
        cls.db.query(OrganizationDocument).filter(OrganizationDocument.organization_id.in_([cls.org1.id, cls.org2.id])).delete()
        cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_get_document_types(self):
        """Verifies that configurable document types are seeded and publicly queryable."""
        res = client.get("/api/documents/types")
        self.assertEqual(res.status_code, 200)
        types = res.json()
        self.assertGreaterEqual(len(types), 4)
        codes = [t["code"] for t in types]
        self.assertIn("cpcb_auth", codes)
        self.assertIn("gst_cert", codes)
        self.assertIn("company_reg", codes)
        self.assertIn("pan_card", codes)

    def test_02_unauthenticated_access_rejected(self):
        """Verifies that private document endpoints require JWT authentication."""
        res = client.get("/api/documents/my")
        self.assertEqual(res.status_code, 401)

        res_upload = client.post("/api/documents/upload")
        self.assertEqual(res_upload.status_code, 401)

    def test_03_upload_valid_pdf_document(self):
        """Verifies that a valid PDF document with magic-byte header uploads successfully."""
        # Get cpcb_auth document type ID
        res_types = client.get("/api/documents/types")
        cpcb_type = next(t for t in res_types.json() if t["code"] == "cpcb_auth")

        files = {
            "file": ("cpcb_authorization.pdf", io.BytesIO(MINIMAL_VALID_PDF), "application/pdf"),
        }
        data = {
            "document_type_id": cpcb_type["id"],
            "document_number": "CPCB/EW/2026/REG-9012",
            "issued_date": "2024-01-15",
            "expiry_date": "2028-01-15",
        }

        res = client.post(
            "/api/documents/upload",
            data=data,
            files=files,
            headers={"Authorization": f"Bearer {self.token_org1}"},
        )
        self.assertEqual(res.status_code, 200)
        doc = res.json()
        self.assertEqual(doc["status"], "PENDING")
        self.assertEqual(doc["document_type_code"], "cpcb_auth")
        self.assertEqual(doc["document_number"], "CPCB/EW/2026/REG-9012")
        self.assertFalse(doc["is_expired"])
        self.doc1_id = doc["id"]

        # Check my summary
        res_my = client.get("/api/documents/my", headers={"Authorization": f"Bearer {self.token_org1}"})
        self.assertEqual(res_my.status_code, 200)
        summary = res_my.json()
        self.assertIn(summary["verification_status"], ("DOCUMENTS_PENDING", "UNDER_REVIEW"))
        self.assertEqual(summary["total_uploaded"], 1)

    def test_04_spoofed_file_upload_rejected(self):
        """Verifies that disguised executable/invalid file bytes are rejected with 400."""
        res_types = client.get("/api/documents/types")
        gst_type = next(t for t in res_types.json() if t["code"] == "gst_cert")

        fake_pdf = b"MZ\x90\x00\x03\x00\x00\x00This is an executable disguised as PDF"
        files = {
            "file": ("gst_cert.pdf", io.BytesIO(fake_pdf), "application/pdf"),
        }
        data = {
            "document_type_id": gst_type["id"],
            "document_number": "27AAACG1234F1Z5",
        }
        res = client.post(
            "/api/documents/upload",
            data=data,
            files=files,
            headers={"Authorization": f"Bearer {self.token_org1}"},
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("prohibited", res.json()["detail"].lower())

    def test_05_idor_protection_on_document_streaming(self):
        """Verifies that Org 2 cannot view or stream Org 1's uploaded documents."""
        # Find Org 1's doc ID
        res_my = client.get("/api/documents/my", headers={"Authorization": f"Bearer {self.token_org1}"})
        doc_id = res_my.json()["documents"][0]["id"]

        # Org 2 attempts to stream Org 1's file
        res_forbidden = client.get(
            f"/api/documents/{doc_id}/file",
            headers={"Authorization": f"Bearer {self.token_org2}"},
        )
        self.assertEqual(res_forbidden.status_code, 403)
        self.assertIn("forbidden", res_forbidden.json()["detail"].lower())

        # Org 1 streams own file -> 200 OK
        res_owner = client.get(
            f"/api/documents/{doc_id}/file",
            headers={"Authorization": f"Bearer {self.token_org1}"},
        )
        self.assertEqual(res_owner.status_code, 200)

        # Admin streams file -> 200 OK
        res_admin = client.get(
            f"/api/documents/{doc_id}/file",
            headers={"Authorization": f"Bearer {self.token_admin}"},
        )
        self.assertEqual(res_admin.status_code, 200)

    def test_06_admin_review_rejection_requires_reason(self):
        """Verifies that rejection requires a non-empty rejection reason."""
        res_my = client.get("/api/documents/my", headers={"Authorization": f"Bearer {self.token_org1}"})
        doc_id = res_my.json()["documents"][0]["id"]

        # Attempt rejection without reason
        res = client.post(
            f"/api/admin/documents/{doc_id}/review",
            json={"status": "REJECTED", "rejection_reason": ""},
            headers={"Authorization": f"Bearer {self.token_admin}"},
        )
        self.assertEqual(res.status_code, 422)

    def test_07_admin_review_workflow_and_audit(self):
        """Verifies admin approving a document and inspecting audit trail."""
        res_my = client.get("/api/documents/my", headers={"Authorization": f"Bearer {self.token_org1}"})
        doc_id = res_my.json()["documents"][0]["id"]

        # Approve document
        res_approve = client.post(
            f"/api/admin/documents/{doc_id}/review",
            json={"status": "APPROVED"},
            headers={"Authorization": f"Bearer {self.token_admin}"},
        )
        self.assertEqual(res_approve.status_code, 200)
        self.assertEqual(res_approve.json()["status"], "APPROVED")

        # Inspect audit logs
        res_audit = client.get(
            "/api/admin/document-audit-logs",
            headers={"Authorization": f"Bearer {self.token_admin}"},
        )
        self.assertEqual(res_audit.status_code, 200)
        logs = res_audit.json()
        self.assertGreaterEqual(len(logs), 1)
        actions = [l["action"] for l in logs]
        self.assertIn("APPROVED", actions)

    def test_08_unverified_recycler_cannot_place_offer(self):
        """Verifies that unverified recycler cannot submit offers on lots."""
        # Create a fresh active lot
        lot_res = client.post(
            "/api/lots",
            json={
                "collector_id": 1,
                "material_id": 1,
                "quantity_kg": 12.0,
            },
        )
        self.assertEqual(lot_res.status_code, 200)
        fresh_lot_id = lot_res.json()["id"]

        # Ensure a recycler record exists for org2 with verified=False
        recycler = self.db.execute(select(Recycler).where(Recycler.contact_phone == self.org2.phone)).scalars().first()
        if not recycler:
            recycler = Recycler(name=self.org2.name, verified=False, location="Pune", contact_phone=self.org2.phone)
            self.db.add(recycler)
            self.db.commit()
            self.db.refresh(recycler)

        # Unverified org2 attempts to place offer
        res = client.post(
            "/api/offers",
            json={
                "lot_id": fresh_lot_id,
                "recycler_id": recycler.id,
                "offer_price": 5000.0,
            },
            headers={"Authorization": f"Bearer {self.token_org2}"},
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("verification required", res.json()["detail"].lower())

