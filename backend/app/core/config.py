from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./legal_metrix.db"
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File Storage
    upload_dir: str = str(BACKEND_DIR / "uploads")
    max_file_size: int = 10485760
    
    # OCR
    ocr_engine: str = "paddle"
    
    # Rules
    rules_config_path: str = str(BACKEND_DIR / "app" / "services" / "rules_config.yaml")
    
    # Redis (optional for now)
    redis_url: str = "redis://localhost:6379"
    
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()
