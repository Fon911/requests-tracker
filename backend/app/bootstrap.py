from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import Base, SessionFactory, engine
from app.core.security import hash_password
from app.models.user import User


async def init_models() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_admin() -> None:
    settings = get_settings()
    async with SessionFactory() as session:
        existing = await session.scalar(
            select(User).where(User.username == settings.admin_username)
        )
        if existing is None:
            session.add(
                User(
                    username=settings.admin_username,
                    password_hash=hash_password(settings.admin_password),
                    is_admin=True,
                )
            )
            await session.commit()
