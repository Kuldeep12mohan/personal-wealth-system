import re


def _create_portfolio(client):
    resp = client.post("/api/portfolios", json={"name": "P1", "currency": "INR"})
    return resp.json()["portfolioId"]


def test_add_holding_valid(client):
    portfolio_id = _create_portfolio(client)
    resp = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert re.match(r"^HOLD-\d+$", body["holdingId"])
    assert body["currentPrice"] == 0


def test_add_holding_missing_name(client):
    portfolio_id = _create_portfolio(client)
    resp = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"symbol": "ABCBANK", "type": "STOCK"},
    )
    assert resp.status_code == 400


def test_add_holding_missing_symbol(client):
    portfolio_id = _create_portfolio(client)
    resp = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "type": "STOCK"},
    )
    assert resp.status_code == 400


def test_add_holding_unsupported_type(client):
    portfolio_id = _create_portfolio(client)
    resp = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "CRYPTO"},
    )
    assert resp.status_code == 400


def test_add_holding_unknown_portfolio(client):
    resp = client.post(
        "/api/portfolios/PORT-99999/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    )
    assert resp.status_code == 404


def test_add_holding_duplicate_symbol_creates_second_holding(client):
    portfolio_id = _create_portfolio(client)
    payload = {"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"}
    resp1 = client.post(f"/api/portfolios/{portfolio_id}/holdings", json=payload)
    resp2 = client.post(f"/api/portfolios/{portfolio_id}/holdings", json=payload)
    assert resp1.status_code == 201
    assert resp2.status_code == 201
    assert resp1.json()["holdingId"] != resp2.json()["holdingId"]
