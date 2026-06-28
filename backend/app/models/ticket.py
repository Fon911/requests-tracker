from datetime import UTC, datetime

from sqlalchemy import Enum, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.db_types import UtcDateTime
from app.models.enums import Priority, Status


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (Index("ix_tickets_created_at_id", "created_at", "id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[Status] = mapped_column(
        Enum(Status, native_enum=False, values_callable=lambda e: [m.value for m in e]),
        default=Status.NEW,
        nullable=False,
        index=True,
    )
    priority: Mapped[Priority] = mapped_column(
        Enum(Priority, native_enum=False, values_callable=lambda e: [m.value for m in e]),
        default=Priority.NORMAL,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(UtcDateTime, default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        UtcDateTime, default=_utcnow, onupdate=_utcnow, nullable=False
    )
