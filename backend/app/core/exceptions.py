from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class DomainError(Exception):
    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "domain_error"
    message: str = "Domain error"

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        if message:
            self.message = message


class TicketNotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "ticket_not_found"
    message = "Заявка не найдена"


class TicketDoneImmutableError(DomainError):
    status_code = status.HTTP_409_CONFLICT
    code = "ticket_done_immutable"
    message = "Заявку в статусе done нельзя редактировать или удалять"


class IllegalStatusTransitionError(DomainError):
    status_code = status.HTTP_409_CONFLICT
    code = "illegal_status_transition"
    message = "Нельзя перевести заявку из done обратно в другой статус"


class InvalidCredentialsError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "invalid_credentials"
    message = "Неверный логин или пароль"


class NotAuthenticatedError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "not_authenticated"
    message = "Требуется авторизация администратора"


async def domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    if errors:
        first = errors[0]
        location = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
        detail = first.get("msg", "Некорректные данные")
        message = f"{location}: {detail}" if location else detail
    else:
        message = "Некорректные данные"
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "validation_error", "message": message}},
    )
