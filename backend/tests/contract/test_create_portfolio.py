import re


def test_create_portfolio_valid(client):
    resp = client.post("/api/portfolios", json={"name": "My Investments", "currency": "INR"})
    assert resp.status_code == 201
    body = resp.json()
    assert re.match(r"^PORT-\d+$", body["portfolioId"])
    assert body["name"] == "My Investments"
    assert body["currency"] == "INR"


def test_create_portfolio_missing_name(client):
    resp = client.post("/api/portfolios", json={"currency": "INR"})
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_create_portfolio_missing_currency(client):
    resp = client.post("/api/portfolios", json={"name": "My Investments"})
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_create_portfolio_unsupported_currency(client):
    resp = client.post(
        "/api/portfolios", json={"name": "My Investments", "currency": "EUR"}
    )
    assert resp.status_code == 400
    assert "error" in resp.json()
