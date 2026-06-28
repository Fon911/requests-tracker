from httpx import AsyncClient

from tests.conftest import create_ticket, set_status


async def test_login_success(client: AsyncClient) -> None:
    response = await client.post("/api/auth/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


async def test_login_wrong_password(client: AsyncClient) -> None:
    response = await client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_credentials"


async def test_login_with_long_password_returns_401_not_500(client: AsyncClient) -> None:
    response = await client.post(
        "/api/auth/login", json={"username": "admin", "password": "x" * 100}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_credentials"


async def test_delete_requires_authentication(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Protected ticket")
    response = await client.delete(f"/api/tickets/{ticket['id']}")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"


async def test_delete_rejects_invalid_token(client: AsyncClient) -> None:
    ticket = await create_ticket(client, title="Protected ticket")
    response = await client.delete(
        f"/api/tickets/{ticket['id']}", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401


async def test_admin_can_delete_ticket(client: AsyncClient, admin_headers: dict) -> None:
    ticket = await create_ticket(client, title="Delete me")
    response = await client.delete(f"/api/tickets/{ticket['id']}", headers=admin_headers)
    assert response.status_code == 204

    missing = await client.get(f"/api/tickets/{ticket['id']}")
    assert missing.status_code == 404


async def test_admin_delete_missing_ticket_returns_404(
    client: AsyncClient, admin_headers: dict
) -> None:
    response = await client.delete("/api/tickets/999999", headers=admin_headers)
    assert response.status_code == 404


async def test_admin_cannot_delete_done_ticket(client: AsyncClient, admin_headers: dict) -> None:
    ticket = await create_ticket(client, title="Done and protected")
    await set_status(client, ticket["id"], "done")

    response = await client.delete(f"/api/tickets/{ticket['id']}", headers=admin_headers)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ticket_done_immutable"
