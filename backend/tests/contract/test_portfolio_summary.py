def test_portfolio_summary_calculation(client):
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

    resp = client.get(f"/api/portfolios/{portfolio_id}/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["totalInvested"] == 5000
    assert body["currentValue"] == 5500
    assert body["profitLoss"] == 500
    assert body["profitLossPercentage"] == 10


def test_portfolio_summary_no_transactions(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    resp = client.get(f"/api/portfolios/{portfolio_id}/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["totalInvested"] == 0
    assert body["currentValue"] == 0
    assert body["profitLoss"] == 0
    assert body["profitLossPercentage"] == 0


def test_portfolio_summary_unknown_portfolio(client):
    resp = client.get("/api/portfolios/PORT-99999/summary")
    assert resp.status_code == 404
