import pytest

from app.services import holding_service, portfolio_service
from app.services.errors import NotFoundError, ValidationError


def _holding(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    return holding_service.add_holding(
        db_session, portfolio.portfolioId, "Name", "SYM", "STOCK"
    )


def test_reject_nonpositive_price(db_session):
    holding = _holding(db_session)
    with pytest.raises(ValidationError):
        holding_service.update_current_price(db_session, holding.holdingId, 0)
    with pytest.raises(ValidationError):
        holding_service.update_current_price(db_session, holding.holdingId, -5)


def test_reject_unknown_holding(db_session):
    with pytest.raises(NotFoundError):
        holding_service.update_current_price(db_session, "HOLD-99999", 100)


def test_valid_update_persists(db_session):
    holding = _holding(db_session)
    updated = holding_service.update_current_price(db_session, holding.holdingId, 550)
    assert float(updated.currentPrice) == 550
