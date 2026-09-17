def _create_holding(client):
    portfolio_id = client.post(
        "/api/portfolios", json={"name": "P1", "currency": "INR"}
    ).json()["portfolioId"]
    holding_id = client.post(
        f"/api/portfolios/{portfolio_id}/holdings",
        json={"name": "ABC Bank", "symbol": "ABCBANK", "type": "STOCK"},
    ).json()["holdingId"]
    return holding_id


def test_record_buy_transaction_valid(client):
    holding_id = _create_holding(client)
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={
            "type": "BUY",
            "quantity": 10,
            "price": 500,
            "transactionDate": "2026-09-01",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["value"] == 5000


def test_record_sell_transaction_valid(client):
    holding_id = _create_holding(client)
    client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "BUY", "quantity": 10, "price": 500, "transactionDate": "2026-09-01"},
    )
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "SELL", "quantity": 5, "price": 550, "transactionDate": "2026-09-02"},
    )
    assert resp.status_code == 201
    assert resp.json()["value"] == 2750


def test_record_transaction_nonpositive_quantity(client):
    holding_id = _create_holding(client)
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "BUY", "quantity": 0, "price": 500, "transactionDate": "2026-09-01"},
    )
    assert resp.status_code == 400


def test_record_transaction_nonpositive_price(client):
    holding_id = _create_holding(client)
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "BUY", "quantity": 10, "price": 0, "transactionDate": "2026-09-01"},
    )
    assert resp.status_code == 400


def test_record_transaction_unsupported_type(client):
    holding_id = _create_holding(client)
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "HOLD", "quantity": 10, "price": 500, "transactionDate": "2026-09-01"},
    )
    assert resp.status_code == 400


def test_record_sell_exceeding_held_quantity(client):
    holding_id = _create_holding(client)
    client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "BUY", "quantity": 10, "price": 500, "transactionDate": "2026-09-01"},
    )
    resp = client.post(
        f"/api/holdings/{holding_id}/transactions",
        json={"type": "SELL", "quantity": 15, "price": 500, "transactionDate": "2026-09-02"},
    )
    assert resp.status_code == 400
    assert "exceed" in resp.json()["error"].lower()


def test_record_transaction_unknown_holding(client):
    resp = client.post(
        "/api/holdings/HOLD-99999/transactions",
        json={"type": "BUY", "quantity": 10, "price": 500, "transactionDate": "2026-09-01"},
    )
    assert resp.status_code == 404
