from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "revive.db"


class Settings(BaseSettings):
    app_name: str = "ReVive"
    app_env: str = "development"
    app_debug: bool = True
    api_v1_prefix: str = "/api"
    project_name: str = "ReVive"
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    redis_url: str = "redis://localhost:6379/0"

    # Brevo SMTP Configuration (loaded from environment / .env)
    smtp_server: str = "smtp-relay.brevo.com"
    smtp_port: int = 587
    smtp_login: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@revive.gov.in"
    smtp_from_name: str = "ReVive National E-Waste Portal"

    # OpenRouter API Key for AI assistance
    openrouter_api_key: str = ""

    # Firebase Authentication Configuration
    firebase_project_id: str = ""
    firebase_credentials_path: str = ""

    # CORS Origins (comma-separated list for production)
    cors_origins: str = ""

    # File Upload Security Settings
    max_upload_size_mb: int = 10
    upload_dir: str = str(BASE_DIR / "uploads")

    # Cloudinary Image Pipeline Configuration (Optional for cloud CDN)
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), str(BASE_DIR.parent / ".env")),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.app_env.lower() in ("production", "prod") and s.secret_key == "change-me-in-production":
        raise RuntimeError(
            "CRITICAL SECURITY VIOLATION: secret_key must be configured and cannot use "
            "the default 'change-me-in-production' in a production environment!"
        )
    return s


settings = get_settings()
