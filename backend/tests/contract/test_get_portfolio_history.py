def test_get_history_empty_for_new_portfolio(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]

    resp = client.get(f"/api/portfolios/{portfolio_id}/history")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_history_ordered_oldest_to_newest(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    holding_id = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    ).json()["holdingId"]

    client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "BUY", "quantity": 10, "price": 500, "transactionDate": "2026-09-01"},
    )
    client.put(f"/api/holdings/{holding_id}/price", json={"currentPrice": 550})

    resp = client.get(f"/api/portfolios/{portfolio_id}/history")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2

    first, second = body
    assert first["totalInvested"] == 5000
    assert first["currentValue"] == 0
    assert second["totalInvested"] == 5000
    assert second["currentValue"] == 5500
    assert second["profitLoss"] == 500
    assert second["profitLossPercentage"] == 10
    assert first["recordedAt"] <= second["recordedAt"]


def test_get_history_unknown_portfolio(client):
    resp = client.get("/api/portfolios/PORT-99999/history")
    assert resp.status_code == 404
