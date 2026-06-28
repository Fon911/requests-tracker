from httpx import AsyncClient

from tests.conftest import create_ticket, set_status


async def test_filter_by_status(client: AsyncClient) -> None:
    await create_ticket(client, title="Still new")
    in_progress = await create_ticket(client, title="Working on it")
    await set_status(client, in_progress["id"], "in_progress")

    response = await client.get("/api/tickets", params={"status": "in_progress"})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Working on it"


async def test_filter_by_priority(client: AsyncClient) -> None:
    await create_ticket(client, title="Low one", priority="low")
    await create_ticket(client, title="High one", priority="high")

    response = await client.get("/api/tickets", params={"priority": "high"})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "High one"


async def test_search_matches_title_case_insensitive(client: AsyncClient) -> None:
    await create_ticket(client, title="Printer broken")
    await create_ticket(client, title="printer toner low")
    await create_ticket(client, title="Network down")

    response = await client.get("/api/tickets", params={"q": "printer"})
    body = response.json()
    assert body["total"] == 2
    titles = {item["title"] for item in body["items"]}
    assert titles == {"Printer broken", "printer toner low"}


async def test_search_is_case_insensitive_for_cyrillic(client: AsyncClient) -> None:
    await create_ticket(client, title="Принтер не печатает")
    await create_ticket(client, title="Сеть недоступна")

    response = await client.get("/api/tickets", params={"q": "принтер"})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Принтер не печатает"


async def test_search_treats_wildcards_as_literals(client: AsyncClient) -> None:
    await create_ticket(client, title="Скидка 50% на тонер")
    await create_ticket(client, title="Обычная заявка без процентов")

    match = await client.get("/api/tickets", params={"q": "50%"})
    assert match.json()["total"] == 1
    assert match.json()["items"][0]["title"] == "Скидка 50% на тонер"

    underscore = await client.get("/api/tickets", params={"q": "%"})
    assert underscore.json()["total"] == 1


async def test_whitespace_only_search_is_noop(client: AsyncClient) -> None:
    await create_ticket(client, title="Alpha ticket")
    await create_ticket(client, title="Beta ticket")

    response = await client.get("/api/tickets", params={"q": "   "})
    assert response.json()["total"] == 2


async def test_search_matches_description(client: AsyncClient) -> None:
    await create_ticket(client, title="Ticket one", description="server room AC failing")
    await create_ticket(client, title="Ticket two", description="coffee machine empty")

    response = await client.get("/api/tickets", params={"q": "coffee"})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Ticket two"


async def test_sort_by_priority(client: AsyncClient) -> None:
    await create_ticket(client, title="Normal", priority="normal")
    await create_ticket(client, title="High", priority="high")
    await create_ticket(client, title="Low", priority="low")

    desc = await client.get("/api/tickets", params={"sort_by": "priority", "order": "desc"})
    assert [item["priority"] for item in desc.json()["items"]] == ["high", "normal", "low"]

    asc = await client.get("/api/tickets", params={"sort_by": "priority", "order": "asc"})
    assert [item["priority"] for item in asc.json()["items"]] == ["low", "normal", "high"]


async def test_sort_by_created_at(client: AsyncClient) -> None:
    first = await create_ticket(client, title="First")
    second = await create_ticket(client, title="Second")
    third = await create_ticket(client, title="Third")

    desc = await client.get("/api/tickets", params={"sort_by": "created_at", "order": "desc"})
    assert [item["id"] for item in desc.json()["items"]] == [third["id"], second["id"], first["id"]]

    asc = await client.get("/api/tickets", params={"sort_by": "created_at", "order": "asc"})
    assert [item["id"] for item in asc.json()["items"]] == [first["id"], second["id"], third["id"]]


async def test_pagination(client: AsyncClient) -> None:
    for index in range(5):
        await create_ticket(client, title=f"Ticket {index}")

    page_one = await client.get("/api/tickets", params={"page": 1, "page_size": 2})
    body = page_one.json()
    assert len(body["items"]) == 2
    assert body == {**body, "total": 5, "page": 1, "page_size": 2, "pages": 3}

    last_page = await client.get("/api/tickets", params={"page": 3, "page_size": 2})
    assert len(last_page.json()["items"]) == 1


async def test_page_size_is_clamped_to_max(client: AsyncClient) -> None:
    response = await client.get("/api/tickets", params={"page_size": 5000})
    assert response.json()["page_size"] == 100


async def test_combined_filter_search_sort(client: AsyncClient) -> None:
    await create_ticket(client, title="Server outage alpha", priority="high")
    await create_ticket(client, title="Server outage beta", priority="low")
    await create_ticket(client, title="Unrelated", priority="high")

    response = await client.get(
        "/api/tickets",
        params={"q": "server outage", "sort_by": "priority", "order": "desc"},
    )
    body = response.json()
    assert body["total"] == 2
    assert [item["priority"] for item in body["items"]] == ["high", "low"]
