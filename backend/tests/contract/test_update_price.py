def _create_holding(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    return client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    ).json()["holdingId"]


def test_update_price_valid(client):
    holding_id = _create_holding(client)
    resp = client.put(f"/api/holdings/{holding_id}/price", json={"currentPrice": 550})
    assert resp.status_code == 200
    assert resp.json()["currentPrice"] == 550


def test_update_price_nonpositive(client):
    holding_id = _create_holding(client)
    resp = client.put(f"/api/holdings/{holding_id}/price", json={"currentPrice": 0})
    assert resp.status_code == 400


def test_update_price_unknown_holding(client):
    resp = client.put("/api/holdings/HOLD-99999/price", json={"currentPrice": 100})
    assert resp.status_code == 404
