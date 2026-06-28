import pytest

from app.core.config import DEFAULT_ADMIN_PASSWORD, DEFAULT_JWT_SECRET, Settings


def test_dev_environment_allows_defaults() -> None:
    settings = Settings(environment="dev")
    assert settings.jwt_secret == DEFAULT_JWT_SECRET
    assert not settings.is_production


def test_production_rejects_default_jwt_secret() -> None:
    with pytest.raises(ValueError, match="APP_JWT_SECRET"):
        Settings(
            environment="production",
            jwt_secret=DEFAULT_JWT_SECRET,
            admin_password="a-strong-password",
        )


def test_production_rejects_default_admin_password() -> None:
    with pytest.raises(ValueError, match="APP_ADMIN_PASSWORD"):
        Settings(
            environment="production",
            jwt_secret="a-strong-random-secret-value",
            admin_password=DEFAULT_ADMIN_PASSWORD,
        )


def test_production_accepts_overridden_secrets() -> None:
    settings = Settings(
        environment="production",
        jwt_secret="a-strong-random-secret-value",
        admin_password="a-strong-password",
    )
    assert settings.is_production
