from sqlalchemy import Select, asc, case, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PRIORITY_ORDER, Priority
from app.models.ticket import Ticket
from app.schemas.ticket import SortField, SortOrder, TicketListParams

_PRIORITY_RANK = case(
    {priority.value: rank for priority, rank in PRIORITY_ORDER.items()},
    value=Ticket.priority,
    else_=PRIORITY_ORDER[Priority.NORMAL],
)


class TicketRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, ticket: Ticket) -> Ticket:
        self.session.add(ticket)
        await self.session.flush()
        return ticket

    async def get(self, ticket_id: int) -> Ticket | None:
        return await self.session.get(Ticket, ticket_id)

    async def delete(self, ticket: Ticket) -> None:
        await self.session.delete(ticket)
        await self.session.flush()

    async def list(self, params: TicketListParams) -> tuple[list[Ticket], int]:
        stmt = self._apply_filters(select(Ticket), params)
        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = self._apply_sorting(stmt, params)
        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        rows = (await self.session.scalars(stmt)).all()
        return list(rows), int(total or 0)

    @staticmethod
    def _apply_filters(stmt: Select, params: TicketListParams) -> Select:
        if params.status is not None:
            stmt = stmt.where(Ticket.status == params.status)
        if params.priority is not None:
            stmt = stmt.where(Ticket.priority == params.priority)
        if params.q and params.q.strip():
            term = params.q.strip().lower()
            escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            pattern = f"%{escaped}%"
            stmt = stmt.where(
                or_(
                    func.py_lower(Ticket.title).like(pattern, escape="\\"),
                    func.py_lower(Ticket.description).like(pattern, escape="\\"),
                )
            )
        return stmt

    @staticmethod
    def _apply_sorting(stmt: Select, params: TicketListParams) -> Select:
        direction = asc if params.order == SortOrder.ASC else desc
        if params.sort_by == SortField.PRIORITY:
            return stmt.order_by(
                direction(_PRIORITY_RANK),
                direction(Ticket.created_at),
                direction(Ticket.id),
            )
        return stmt.order_by(direction(Ticket.created_at), direction(Ticket.id))
