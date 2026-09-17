def test_list_holdings_with_data(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    )
    resp = client.get(f"/api/portfolios/{portfolio_id}/holdings")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    holding = body[0]
    for key in ("quantity", "averagePrice", "currentPrice", "currentValue"):
        assert key in holding


def test_list_holdings_empty(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    resp = client.get(f"/api/portfolios/{portfolio_id}/holdings")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_holdings_unknown_portfolio(client):
    resp = client.get("/api/portfolios/PORT-99999/holdings")
    assert resp.status_code == 404
