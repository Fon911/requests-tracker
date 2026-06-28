from fastapi import APIRouter, status

from app.api.deps import CurrentAdminDep, ListParamsDep, TicketServiceDep
from app.schemas.common import Page
from app.schemas.ticket import TicketCreate, TicketRead, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=Page[TicketRead])
async def list_tickets(params: ListParamsDep, service: TicketServiceDep) -> Page[TicketRead]:
    items, total = await service.list(params)
    return Page.build(
        [TicketRead.model_validate(item) for item in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
async def create_ticket(data: TicketCreate, service: TicketServiceDep) -> TicketRead:
    return await service.create(data)


@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(ticket_id: int, service: TicketServiceDep) -> TicketRead:
    return await service.get(ticket_id)


@router.patch("/{ticket_id}", response_model=TicketRead)
async def update_ticket(
    ticket_id: int, data: TicketUpdate, service: TicketServiceDep
) -> TicketRead:
    return await service.update(ticket_id, data)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: int, service: TicketServiceDep, _admin: CurrentAdminDep) -> None:
    await service.delete(ticket_id)
