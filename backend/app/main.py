from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.bootstrap import init_models, seed_admin
from app.core.config import get_settings
from app.core.exceptions import (
    DomainError,
    domain_error_handler,
    validation_error_handler,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not get_settings().is_production:
        await init_models()
    await seed_admin()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Internal Requests Tracker", version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.include_router(api_router, prefix="/api")

    @app.get("/api/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
