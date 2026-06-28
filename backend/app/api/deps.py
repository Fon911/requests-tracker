from typing import Annotated

import jwt
from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.exceptions import NotAuthenticatedError
from app.core.security import decode_access_token
from app.models.enums import Priority, Status
from app.models.user import User
from app.schemas.ticket import SortField, SortOrder, TicketListParams
from app.services.auth import AuthService
from app.services.ticket import TicketService

SessionDep = Annotated[AsyncSession, Depends(get_session)]

_bearer = HTTPBearer(auto_error=False)


def get_ticket_service(session: SessionDep) -> TicketService:
    return TicketService(session)


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


def list_params(
    status: Status | None = None,
    priority: Priority | None = None,
    q: str | None = Query(default=None, max_length=120),
    sort_by: SortField = SortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    page: int = Query(default=1, ge=1),
    page_size: int | None = Query(default=None, ge=1),
) -> TicketListParams:
    settings = get_settings()
    effective_size = page_size or settings.default_page_size
    effective_size = min(effective_size, settings.max_page_size)
    return TicketListParams(
        status=status,
        priority=priority,
        q=q,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=effective_size,
    )


async def get_current_admin(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)] = None,
) -> User:
    if credentials is None:
        raise NotAuthenticatedError()
    try:
        username = decode_access_token(credentials.credentials)
    except (jwt.PyJWTError, KeyError) as exc:
        raise NotAuthenticatedError() from exc
    user = await session.scalar(select(User).where(User.username == username))
    if user is None or not user.is_admin:
        raise NotAuthenticatedError()
    return user


TicketServiceDep = Annotated[TicketService, Depends(get_ticket_service)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
ListParamsDep = Annotated[TicketListParams, Depends(list_params)]
CurrentAdminDep = Annotated[User, Depends(get_current_admin)]
