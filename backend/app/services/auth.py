from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidCredentialsError
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def login(self, username: str, password: str) -> TokenResponse:
        user = await self.session.scalar(select(User).where(User.username == username))
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()
        return TokenResponse(access_token=create_access_token(user.username))
