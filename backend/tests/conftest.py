from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_session, install_sqlite_functions
from app.core.security import hash_password
from app.main import create_app
from app.models.user import User


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    install_sqlite_functions(engine)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        session.add(User(username="admin", password_hash=hash_password("admin"), is_admin=True))
        await session.commit()

    async def override_get_session() -> AsyncGenerator:
        async with session_factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as test_client:
        yield test_client

    await engine.dispose()


@pytest_asyncio.fixture
async def admin_headers(client: AsyncClient) -> dict[str, str]:
    response = await client.post("/api/auth/login", json={"username": "admin", "password": "admin"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def create_ticket(client: AsyncClient, **overrides: object) -> dict:
    payload = {"title": "Default ticket", "priority": "normal"}
    payload.update(overrides)
    payload = {key: value for key, value in payload.items() if value is not None}
    response = await client.post("/api/tickets", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


async def set_status(client: AsyncClient, ticket_id: int, status: str) -> dict:
    response = await client.patch(f"/api/tickets/{ticket_id}", json={"status": status})
    assert response.status_code == 200, response.text
    return response.json()
