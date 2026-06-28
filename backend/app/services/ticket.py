from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    IllegalStatusTransitionError,
    TicketDoneImmutableError,
    TicketNotFoundError,
)
from app.models.enums import Status
from app.models.ticket import Ticket
from app.repositories.ticket import TicketRepository
from app.schemas.ticket import TicketCreate, TicketListParams, TicketUpdate


class TicketService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = TicketRepository(session)

    async def list(self, params: TicketListParams) -> tuple[list[Ticket], int]:
        return await self.repo.list(params)

    async def get(self, ticket_id: int) -> Ticket:
        ticket = await self.repo.get(ticket_id)
        if ticket is None:
            raise TicketNotFoundError()
        return ticket

    async def create(self, data: TicketCreate) -> Ticket:
        now = datetime.now(UTC)
        ticket = Ticket(
            title=data.title,
            description=data.description,
            priority=data.priority,
            status=Status.NEW,
            created_at=now,
            updated_at=now,
        )
        await self.repo.add(ticket)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def update(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        ticket = await self.get(ticket_id)
        requested = data.model_dump(exclude_unset=True)
        changes = {
            field: value for field, value in requested.items() if getattr(ticket, field) != value
        }
        if not changes:
            return ticket

        self._guard_mutation(ticket, changes)

        for field, value in changes.items():
            setattr(ticket, field, value)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def delete(self, ticket_id: int) -> None:
        ticket = await self.get(ticket_id)
        if ticket.status == Status.DONE:
            raise TicketDoneImmutableError()
        await self.repo.delete(ticket)
        await self.session.commit()

    @staticmethod
    def _guard_mutation(ticket: Ticket, changes: dict[str, object]) -> None:
        if ticket.status != Status.DONE:
            return
        if "status" in changes:
            raise IllegalStatusTransitionError()
        raise TicketDoneImmutableError()
