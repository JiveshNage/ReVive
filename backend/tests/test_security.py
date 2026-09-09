import io
import os
import unittest
from pathlib import Path
from PIL import Image

from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.main import app
from app.config import settings
from app.email_service import send_email
from app.file_security import sanitize_and_save_upload, validate_image_upload

client = TestClient(app)


def create_sample_image_bytes(format="JPEG", size=(50, 50), color="blue") -> bytes:
    """Helper to generate valid image bytes in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()


class TestSecurityHardening(unittest.TestCase):
    # -------------------------------------------------------------------------
    # 1. File Upload Security
    # -------------------------------------------------------------------------
    def test_valid_image_upload_passes(self):
        jpeg_bytes = create_sample_image_bytes(format="JPEG")
        is_valid, err, fmt = validate_image_upload(jpeg_bytes, "image/jpeg")
        self.assertTrue(is_valid)
        self.assertEqual(err, "")
        self.assertEqual(fmt, "JPEG")

        png_bytes = create_sample_image_bytes(format="PNG")
        is_valid, err, fmt = validate_image_upload(png_bytes, "image/png")
        self.assertTrue(is_valid)
        self.assertEqual(fmt, "PNG")

    def test_spoofed_file_upload_rejected(self):
        # Malicious payload (e.g. PHP/Python script masquerading as image)
        malicious_bytes = b"<?php echo system($_GET['cmd']); ?>"
        is_valid, err, _ = validate_image_upload(malicious_bytes, "image/jpeg")
        self.assertFalse(is_valid)
        self.assertIn("not a valid", err.lower())

    def test_empty_file_upload_rejected(self):
        is_valid, err, _ = validate_image_upload(b"", "image/jpeg")
        self.assertFalse(is_valid)
        self.assertIn("empty", err.lower())

    def test_oversized_file_upload_rejected(self):
        # Create bytes larger than max limit (e.g. limit to 1MB for test)
        oversized = b"0" * (2 * 1024 * 1024)
        is_valid, err, _ = validate_image_upload(oversized, "image/jpeg", max_size_mb=1)
        self.assertFalse(is_valid)
        self.assertIn("exceeds the maximum allowed limit", err)

    def test_secure_filename_and_path_traversal_prevention(self):
        jpeg_bytes = create_sample_image_bytes(format="JPEG")
        temp_dir = Path(__file__).resolve().parent / "temp_uploads"
        try:
            saved_path = sanitize_and_save_upload(
                jpeg_bytes,
                original_filename="../../../etc/evil.sh",
                target_dir=temp_dir,
            )
            # Must have a random UUID filename ending with .jpg
            self.assertTrue(saved_path.exists())
            self.assertTrue(saved_path.suffix.lower() in [".jpg", ".jpeg"])
            self.assertTrue(str(saved_path).startswith(str(temp_dir.resolve())))
            # Original malicious path should NOT be present in saved filename
            self.assertNotIn("evil", saved_path.name)
            self.assertNotIn("..", saved_path.name)
        finally:
            if temp_dir.exists():
                for f in temp_dir.glob("*"):
                    f.unlink()
                temp_dir.rmdir()

    def test_predict_endpoint_rejects_spoofed_file(self):
        fake_file = io.BytesIO(b"Fake malicious binary payload")
        res = client.post(
            "/api/ai/predict",
            files={"file": ("malicious.jpg", fake_file, "image/jpeg")},
            params={"location": "Bhopal", "weight_kg": 1.0},
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("detail", res.json())
        self.assertIn("not a valid", res.json()["detail"].lower())

    # -------------------------------------------------------------------------
    # 2. Error Handling & Information Leakage Prevention
    # -------------------------------------------------------------------------
    def test_validation_error_leakage_prevention(self):
        # Sending invalid payload structure to trigger validation error
        res = client.post("/api/auth/send-otp", json={"invalid_field": "123"})
        self.assertEqual(res.status_code, 422)
        body = res.json()
        self.assertIn("detail", body)
        self.assertIn("errors", body)
        # Verify no server file paths or Python object addresses leaked
        raw_text = res.text
        self.assertNotIn("Traceback", raw_text)
        self.assertNotIn("File \"", raw_text)
        self.assertNotIn(".py\", line", raw_text)

    def test_unhandled_exception_leakage_prevention(self):
        # Register a temporary test route that raises an unhandled exception
        @app.get("/api/test-security/crash-unhandled")
        def crash_route():
            raise RuntimeError("Secret internal server state or DB password in traceback")

        safe_client = TestClient(app, raise_server_exceptions=False)
        res = safe_client.get("/api/test-security/crash-unhandled")
        self.assertEqual(res.status_code, 500)
        data = res.json()
        self.assertEqual(data["detail"], "An internal server error occurred. Please try again later.")
        # Ensure raw exception message and stack trace are NOT leaked to the response
        self.assertNotIn("Secret internal server state", res.text)
        self.assertNotIn("Traceback", res.text)
        self.assertNotIn(".py", res.text)

    def test_database_exception_leakage_prevention(self):
        # Register a temporary test route that simulates a raw database failure
        @app.get("/api/test-security/crash-db")
        def crash_db_route():
            raise OperationalError(
                statement="SELECT secret_columns FROM internal_db_table WHERE id = 1",
                params={},
                orig=Exception("SQLite syntax error /path/to/internal/revive.db is locked"),
            )

        safe_client = TestClient(app, raise_server_exceptions=False)
        res = safe_client.get("/api/test-security/crash-db")
        self.assertEqual(res.status_code, 500)
        data = res.json()
        self.assertEqual(data["detail"], "A database error occurred. Please try again later.")
        # Ensure SQL query and file paths are NOT leaked to the response
        self.assertNotIn("secret_columns", res.text)
        self.assertNotIn("internal_db_table", res.text)
        self.assertNotIn("revive.db", res.text)

    # -------------------------------------------------------------------------
    # 3. Secrets Sanitization
    # -------------------------------------------------------------------------
    def test_secrets_sanitized_in_config(self):
        # Verify default password in settings is empty or placeholder, not a hardcoded secret
        self.assertNotIn("xsmtpsib", settings.smtp_password)
        from app.config import Settings
        fresh_settings = Settings(_env_file=None)
        self.assertEqual(fresh_settings.openrouter_api_key, "")

    def test_send_email_gracefully_handles_empty_credentials(self):
        # With empty SMTP credentials, send_email should return False gracefully without throwing an exception
        result = send_email("test@example.com", "Subject", "<p>Test</p>")
        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()
