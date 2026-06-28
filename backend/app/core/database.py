from collections.abc import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _py_lower(value: str | None) -> str | None:
    return value.lower() if isinstance(value, str) else value


def install_sqlite_functions(async_engine: AsyncEngine) -> None:
    @event.listens_for(async_engine.sync_engine, "connect")
    def _register(dbapi_connection, _record):
        dbapi_connection.create_function("py_lower", 1, _py_lower, deterministic=True)


_settings = get_settings()

engine = create_async_engine(_settings.database_url, future=True)
install_sqlite_functions(engine)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionFactory() as session:
        yield session
