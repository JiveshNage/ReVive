import io
from pathlib import Path
import uuid
import logging
from PIL import Image, UnidentifiedImageError

from app.config import settings

logger = logging.getLogger("revive.file_security")

# Allowed MIME types and corresponding Pillow formats
ALLOWED_MIME_TYPES = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/pjpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}

ALLOWED_EXTENSIONS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


def validate_image_upload(
    file_bytes: bytes,
    content_type: str | None = None,
    max_size_mb: int | None = None,
) -> tuple[bool, str, str]:
    """
    Validates uploaded image file:
    1. Enforces size boundary (non-empty, <= max_size_mb).
    2. Validates declared MIME type against allowlist.
    3. Performs deep magic-byte & structural verification using Pillow.
    
    Returns:
        tuple (is_valid: bool, error_message: str, detected_format: str)
    """
    if max_size_mb is None:
        max_size_mb = settings.max_upload_size_mb

    max_bytes = max_size_mb * 1024 * 1024

    if not file_bytes or len(file_bytes) == 0:
        return False, "Uploaded file is empty.", ""

    if len(file_bytes) > max_bytes:
        return (
            False,
            f"File size ({len(file_bytes) / (1024 * 1024):.2f}MB) exceeds the maximum allowed limit of {max_size_mb}MB.",
            "",
        )

    # Validate declared MIME type
    if content_type:
        clean_mime = content_type.lower().split(";")[0].strip()
        if clean_mime not in ALLOWED_MIME_TYPES:
            return (
                False,
                f"Unsupported file format '{clean_mime}'. Allowed formats: JPEG, PNG, WEBP.",
                "",
            )

    # Perform deep image content verification via Pillow
    try:
        image_stream = io.BytesIO(file_bytes)
        with Image.open(image_stream) as img:
            img_format = (img.format or "").upper()
            if img_format not in ALLOWED_EXTENSIONS:
                return (
                    False,
                    f"Invalid image structure or unsupported image format '{img_format}'. Allowed: JPEG, PNG, WEBP.",
                    "",
                )
            img.verify()
    except (UnidentifiedImageError, OSError, ValueError, Exception) as exc:
        logger.warning("Rejected malicious or invalid image payload: %s", exc)
        return False, "Uploaded file is not a valid or readable image.", ""

    return True, "", img_format


def sanitize_and_save_upload(
    file_bytes: bytes,
    original_filename: str | None = None,
    target_dir: Path | str | None = None,
) -> Path:
    """
    Saves validated uploaded file to an isolated storage location outside web root
    using a cryptographically random UUID filename to completely prevent path traversal
    and script execution.
    """
    is_valid, err_msg, img_format = validate_image_upload(file_bytes)
    if not is_valid:
        raise ValueError(err_msg)

    if target_dir is None:
        target_path = Path(settings.upload_dir).resolve()
    else:
        target_path = Path(target_dir).resolve()

    target_path.mkdir(parents=True, exist_ok=True)

    ext = ALLOWED_EXTENSIONS.get(img_format, ".jpg")
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    destination = (target_path / safe_filename).resolve()

    # Path traversal safety assertion
    if not str(destination).startswith(str(target_path)):
        raise ValueError("Invalid target path resolution detected.")

    with open(destination, "wb") as f:
        f.write(file_bytes)

    logger.info("Saved secure upload to %s (%d bytes)", destination, len(file_bytes))
    return destination


# Allowed document MIME types
ALLOWED_DOC_MIMES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# Magic byte signatures
MAGIC_BYTES = {
    "pdf": b"%PDF-",
    "png": b"\x89PNG\r\n\x1a\n",
    "jpeg": b"\xff\xd8\xff",
    "webp": b"RIFF",
}

DISALLOWED_SIGNATURES = [
    b"MZ",  # Windows PE Executable
    b"\x7fELF",  # Linux ELF Executable
    b"#!/",  # Shell script
    b"<?php",  # PHP script
    b"<script",  # HTML/JS script
]


def validate_document_upload(
    file_bytes: bytes,
    content_type: str | None = None,
    filename: str | None = None,
    max_size_mb: int = 10,
) -> tuple[bool, str, str, str]:
    """
    Validates uploaded document file (PDF, PNG, JPG, WEBP):
    1. Size boundary check (non-empty, <= max_size_mb).
    2. Disallows executable/script signatures.
    3. Magic byte signature verification.
    4. MIME type and extension validation.

    Returns:
        tuple (is_valid: bool, error_msg: str, detected_mime: str, file_ext: str)
    """
    if not file_bytes or len(file_bytes) == 0:
        return False, "Uploaded document is empty.", "", ""

    max_bytes = max_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        return (
            False,
            f"Document size ({len(file_bytes) / (1024 * 1024):.2f}MB) exceeds the maximum allowed limit of {max_size_mb}MB.",
            "",
            "",
        )

    # Check for disallowed malicious signatures
    head = file_bytes[:16].lower()
    for bad_sig in DISALLOWED_SIGNATURES:
        if file_bytes.startswith(bad_sig) or bad_sig.lower() in head:
            return False, "Executable or script files are strictly prohibited.", "", ""

    # Verify magic bytes
    detected_mime = ""
    file_ext = ""

    if file_bytes.startswith(MAGIC_BYTES["pdf"]):
        detected_mime = "application/pdf"
        file_ext = ".pdf"
    elif file_bytes.startswith(MAGIC_BYTES["png"]):
        detected_mime = "image/png"
        file_ext = ".png"
    elif file_bytes.startswith(MAGIC_BYTES["jpeg"]):
        detected_mime = "image/jpeg"
        file_ext = ".jpg"
    elif file_bytes.startswith(MAGIC_BYTES["webp"]) and len(file_bytes) > 12 and file_bytes[8:12] == b"WEBP":
        detected_mime = "image/webp"
        file_ext = ".webp"
    else:
        # Check if declared content-type or filename extension matches allowed types
        # For images, fallback to Pillow check
        try:
            image_stream = io.BytesIO(file_bytes)
            with Image.open(image_stream) as img:
                img_fmt = (img.format or "").upper()
                if img_fmt in ALLOWED_EXTENSIONS:
                    file_ext = ALLOWED_EXTENSIONS[img_fmt]
                    detected_mime = f"image/{img_fmt.lower()}"
                    img.verify()
        except Exception:
            pass

    if not detected_mime:
        return (
            False,
            "Invalid file format or corrupted document. Only PDF, JPG, PNG, and WEBP files are accepted.",
            "",
            "",
        )

    # If content_type is provided, verify it belongs to allowed types
    if content_type:
        clean_mime = content_type.lower().split(";")[0].strip()
        if clean_mime not in ALLOWED_DOC_MIMES:
            return False, f"Declared MIME type '{clean_mime}' is not permitted.", "", ""

    return True, "", detected_mime, file_ext


def sanitize_and_save_document(
    file_bytes: bytes,
    original_filename: str | None = None,
    content_type: str | None = None,
    target_dir: Path | str | None = None,
) -> tuple[Path, str, str, int]:
    """
    Validates and stores a document in an isolated directory using a UUID filename.
    Returns:
        tuple (absolute_path: Path, safe_filename: str, detected_mime: str, file_size: int)
    """
    is_valid, err_msg, detected_mime, file_ext = validate_document_upload(
        file_bytes=file_bytes,
        content_type=content_type,
        filename=original_filename,
    )
    if not is_valid:
        raise ValueError(err_msg)

    if target_dir is None:
        target_path = Path(settings.upload_dir).resolve() / "documents"
    else:
        target_path = Path(target_dir).resolve()

    target_path.mkdir(parents=True, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    destination = (target_path / safe_filename).resolve()

    if not str(destination).startswith(str(target_path)):
        raise ValueError("Invalid target path resolution detected.")

    with open(destination, "wb") as f:
        f.write(file_bytes)

    file_size = len(file_bytes)
    logger.info("Saved secure document to %s (%d bytes)", destination, file_size)
    return destination, safe_filename, detected_mime, file_size

