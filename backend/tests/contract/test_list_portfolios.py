def test_list_portfolios_empty(client):
    resp = client.get("/api/portfolios")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_portfolios_returns_created_portfolios(client):
    first = client.post(
        "/api/portfolios", json={"name": "Retirement", "currency": "INR"}
    ).json()
    second = client.post(
        "/api/portfolios", json={"name": "Growth", "currency": "USD"}
    ).json()

    resp = client.get("/api/portfolios")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2
    assert body[0] == {
        "portfolioId": first["portfolioId"],
        "name": "Retirement",
        "currency": "INR",
    }
    assert body[1] == {
        "portfolioId": second["portfolioId"],
        "name": "Growth",
        "currency": "USD",
    }
