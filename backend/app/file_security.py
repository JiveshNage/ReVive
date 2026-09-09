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
