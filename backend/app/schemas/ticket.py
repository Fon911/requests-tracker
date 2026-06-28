from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import Priority, Status


class SortField(StrEnum):
    CREATED_AT = "created_at"
    PRIORITY = "priority"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


def _normalize_title(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    if len(stripped) < 3:
        raise ValueError("title must contain at least 3 non-space characters")
    return stripped


class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    priority: Priority = Priority.NORMAL

    _strip_title = field_validator("title")(_normalize_title)


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    status: Status | None = None
    priority: Priority | None = None

    _strip_title = field_validator("title")(_normalize_title)


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: Status
    priority: Priority
    created_at: datetime
    updated_at: datetime


class TicketListParams(BaseModel):
    status: Status | None = None
    priority: Priority | None = None
    q: str | None = None
    sort_by: SortField = SortField.CREATED_AT
    order: SortOrder = SortOrder.DESC
    page: int = 1
    page_size: int = 20
