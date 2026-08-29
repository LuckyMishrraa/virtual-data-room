import os
from datetime import UTC, datetime

from pydantic_settings import BaseSettings, SettingsConfigDict


def get_utc_now() -> str:
    """Returns current UTC timestamp formatted as ISO string with Z."""
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Virtual Data Room (VDR) API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # MinIO Storage Settings
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "minio:9000")
    MINIO_PUBLIC_ENDPOINT: str = os.getenv("MINIO_PUBLIC_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "vdr-documents")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "False").lower() in ("true", "1", "yes")

    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vdr.db")

    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend:3000",
        "*"
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
