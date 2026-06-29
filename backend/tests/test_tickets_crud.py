from httpx import AsyncClient

from tests.conftest import create_ticket


async def test_health(client: AsyncClient) -> None:
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_create_ticket_returns_defaults(client: AsyncClient) -> None:
    response = await client.post(
        "/api/tickets",
        json={"title": "Broken printer", "description": "3rd floor", "priority": "high"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["id"] > 0
    assert body["title"] == "Broken printer"
    assert body["description"] == "3rd floor"
    assert body["status"] == "new"
    assert body["priority"] == "high"
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_create_ticket_defaults_priority_to_normal(client: AsyncClient) -> None:
    body = await create_ticket(client, title="No priority given", priority=None)
    assert body["priority"] == "normal"


async def test_create_ticket_trims_title(client: AsyncClient) -> None:
    body = await create_ticket(client, title="   Padded title   ")
    assert body["title"] == "Padded title"


async def test_create_ticket_rejects_short_title(client: AsyncClient) -> None:
    response = await client.post("/api/tickets", json={"title": "ab"})
    assert response.status_code == 422


async def test_validation_error_uses_unified_envelope(client: AsyncClient) -> None:
    response = await client.post("/api/tickets", json={"title": "ab"})
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"]


async def test_create_ticket_rejects_blank_title(client: AsyncClient) -> None:
    response = await client.post("/api/tickets", json={"title": "   "})
    assert response.status_code == 422


async def test_create_ticket_rejects_too_long_description(client: AsyncClient) -> None:
    response = await client.post(
        "/api/tickets", json={"title": "Valid title", "description": "x" * 1001}
    )
    assert response.status_code == 422


async def test_create_ticket_accepts_title_length_boundaries(client: AsyncClient) -> None:
    short = await create_ticket(client, title="abc")
    assert short["title"] == "abc"
    long_title = await create_ticket(client, title="x" * 120)
    assert len(long_title["title"]) == 120


async def test_create_ticket_rejects_title_over_max(client: AsyncClient) -> None:
    response = await client.post("/api/tickets", json={"title": "x" * 121})
    assert response.status_code == 422


async def test_create_ticket_accepts_description_at_max(client: AsyncClient) -> None:
    body = await create_ticket(client, title="Max description", description="d" * 1000)
    assert len(body["description"]) == 1000


async def test_get_ticket(client: AsyncClient) -> None:
    created = await create_ticket(client, title="Fetch me")
    response = await client.get(f"/api/tickets/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


async def test_get_missing_ticket_returns_404(client: AsyncClient) -> None:
    response = await client.get("/api/tickets/999999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ticket_not_found"


async def test_list_empty(client: AsyncClient) -> None:
    response = await client.get("/api/tickets")
    assert response.status_code == 200
    body = response.json()
    assert body == {"items": [], "total": 0, "page": 1, "page_size": 20, "pages": 0}
