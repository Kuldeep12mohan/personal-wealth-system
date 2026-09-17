import datetime

from app.services import holding_service, portfolio_service, summary_service, transaction_service


def test_summary_across_multiple_holdings(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    h1 = holding_service.add_holding(
        db_session, portfolio.portfolioId, "A", "A", "STOCK"
    )
    h2 = holding_service.add_holding(
        db_session, portfolio.portfolioId, "B", "B", "ETF"
    )
    transaction_service.record_transaction(
        db_session, h1.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )
    transaction_service.record_transaction(
        db_session, h2.holdingId, "BUY", 5, 100, datetime.date(2026, 9, 1)
    )
    transaction_service.record_transaction(
        db_session, h2.holdingId, "SELL", 2, 120, datetime.date(2026, 9, 2)
    )
    holding_service.update_current_price(db_session, h1.holdingId, 550)
    holding_service.update_current_price(db_session, h2.holdingId, 110)

    summary = summary_service.get_portfolio_summary(db_session, portfolio.portfolioId)

    # totalInvested = (10*500) + (5*100) - (2*120) = 5000 + 500 - 240 = 5260
    assert summary["totalInvested"] == 5260.0
    # currentValue = 10*550 + 3*110 = 5500 + 330 = 5830
    assert summary["currentValue"] == 5830.0
    assert summary["profitLoss"] == 570.0
    assert round(summary["profitLossPercentage"], 2) == round((570 / 5260) * 100, 2)


def test_summary_zero_invested_gives_zero_percentage(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    summary = summary_service.get_portfolio_summary(db_session, portfolio.portfolioId)
    assert summary["totalInvested"] == 0
    assert summary["profitLossPercentage"] == 0
