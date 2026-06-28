from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_JWT_SECRET = "dev-only-insecure-secret-change-me-in-production"
DEFAULT_ADMIN_PASSWORD = "admin"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    environment: str = "dev"

    database_url: str = "sqlite+aiosqlite:///./app.db"

    jwt_secret: str = DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 60

    admin_username: str = "admin"
    admin_password: str = DEFAULT_ADMIN_PASSWORD

    cors_origins: list[str] = ["http://localhost:5173"]

    default_page_size: int = 20
    max_page_size: int = 100

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"prod", "production"}

    @model_validator(mode="after")
    def _forbid_insecure_defaults_in_production(self) -> "Settings":
        if self.is_production:
            if self.jwt_secret == DEFAULT_JWT_SECRET:
                raise ValueError("APP_JWT_SECRET must be overridden in production")
            if self.admin_password == DEFAULT_ADMIN_PASSWORD:
                raise ValueError("APP_ADMIN_PASSWORD must be overridden in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
