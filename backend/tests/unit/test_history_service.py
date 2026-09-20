import datetime

from app.services import history_service, holding_service, portfolio_service, transaction_service


def _make_portfolio_with_holding(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    holding = holding_service.add_holding(
        db_session, portfolio.portfolioId, "ABC Bank", "ABCBANK", "STOCK"
    )
    return portfolio, holding


def test_price_update_creates_history_point(db_session):
    portfolio, holding = _make_portfolio_with_holding(db_session)
    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )

    history = history_service.get_portfolio_history(db_session, portfolio.portfolioId)
    assert len(history) == 1

    holding_service.update_current_price(db_session, holding.holdingId, 550)

    history = history_service.get_portfolio_history(db_session, portfolio.portfolioId)
    assert len(history) == 2
    assert history[1]["totalInvested"] == 5000.0
    assert history[1]["currentValue"] == 5500.0
    assert history[1]["profitLoss"] == 500.0
    assert history[1]["profitLossPercentage"] == 10.0


def test_transaction_creates_history_point(db_session):
    portfolio, holding = _make_portfolio_with_holding(db_session)

    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )
    first_history = history_service.get_portfolio_history(db_session, portfolio.portfolioId)
    assert len(first_history) == 1
    assert first_history[0]["totalInvested"] == 5000.0

    transaction_service.record_transaction(
        db_session, holding.holdingId, "SELL", 4, 500, datetime.date(2026, 9, 2)
    )

    history = history_service.get_portfolio_history(db_session, portfolio.portfolioId)
    assert len(history) == 2
    # Prior point is preserved unmodified.
    assert history[0]["totalInvested"] == 5000.0
    assert history[1]["totalInvested"] == 3000.0


def test_history_empty_for_new_portfolio(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    assert history_service.get_portfolio_history(db_session, portfolio.portfolioId) == []
