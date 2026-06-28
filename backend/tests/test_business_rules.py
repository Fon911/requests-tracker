from httpx import AsyncClient

from tests.conftest import create_ticket, set_status


async def test_status_progresses_new_to_in_progress_to_done(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Lifecycle ticket")
    assert ticket["status"] == "new"

    in_progress = await set_status(client, ticket["id"], "in_progress")
    assert in_progress["status"] == "in_progress"

    done = await set_status(client, ticket["id"], "done")
    assert done["status"] == "done"


async def test_done_ticket_cannot_be_edited(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Will be done")
    await set_status(client, ticket["id"], "done")

    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"title": "New title"})
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ticket_done_immutable"


async def test_done_ticket_cannot_change_priority(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Frozen priority")
    await set_status(client, ticket["id"], "done")

    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"priority": "high"})
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ticket_done_immutable"


async def test_done_ticket_cannot_move_back(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="No going back")
    await set_status(client, ticket["id"], "done")

    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"status": "in_progress"})
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "illegal_status_transition"


async def test_setting_done_to_done_is_noop(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Idempotent done")
    await set_status(client, ticket["id"], "done")

    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["status"] == "done"


async def test_update_missing_ticket_returns_404(client: AsyncClient) -> None:
    response = await client.patch("/api/tickets/999999", json={"status": "done"})
    assert response.status_code == 404


async def test_status_can_move_back_from_in_progress_to_new(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Reopen ticket")
    await set_status(client, ticket["id"], "in_progress")
    reopened = await set_status(client, ticket["id"], "new")
    assert reopened["status"] == "new"


async def test_updated_at_changes_on_edit(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Track updated_at")
    assert ticket["created_at"] == ticket["updated_at"]

    edited = await set_status(client, ticket["id"], "in_progress")
    assert edited["updated_at"] >= ticket["updated_at"]
    assert edited["created_at"] == ticket["created_at"]


async def test_noop_update_does_not_change_updated_at(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="No-op update")
    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"status": "new"})
    assert response.status_code == 200
    assert response.json()["updated_at"] == ticket["updated_at"]


async def test_done_to_done_does_not_touch_timestamp(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Frozen done")
    done = await set_status(client, ticket["id"], "done")
    response = await client.patch(f"/api/tickets/{ticket['id']}", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["updated_at"] == done["updated_at"]


async def test_edit_open_ticket_updates_fields(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Editable", description="old")
    response = await client.patch(
        f"/api/tickets/{ticket['id']}",
        json={"title": "Edited title", "description": "new", "priority": "low"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Edited title"
    assert body["description"] == "new"
    assert body["priority"] == "low"
