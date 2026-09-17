import pytest

from app.services import holding_service, portfolio_service
from app.services.errors import NotFoundError, ValidationError


def _portfolio(db_session):
    return portfolio_service.create_portfolio(db_session, "P1", "INR")


def test_reject_blank_name(db_session):
    portfolio = _portfolio(db_session)
    with pytest.raises(ValidationError):
        holding_service.add_holding(db_session, portfolio.portfolioId, "", "SYM", "STOCK")


def test_reject_blank_symbol(db_session):
    portfolio = _portfolio(db_session)
    with pytest.raises(ValidationError):
        holding_service.add_holding(db_session, portfolio.portfolioId, "Name", "", "STOCK")


def test_reject_unsupported_type(db_session):
    portfolio = _portfolio(db_session)
    with pytest.raises(ValidationError):
        holding_service.add_holding(
            db_session, portfolio.portfolioId, "Name", "SYM", "CRYPTO"
        )


def test_reject_unknown_portfolio(db_session):
    with pytest.raises(NotFoundError):
        holding_service.add_holding(db_session, "PORT-99999", "Name", "SYM", "STOCK")


def test_new_holding_starts_at_zero_current_price(db_session):
    portfolio = _portfolio(db_session)
    holding = holding_service.add_holding(
        db_session, portfolio.portfolioId, "Name", "SYM", "STOCK"
    )
    assert holding.currentPrice == 0


def test_duplicate_symbol_creates_second_holding(db_session):
    portfolio = _portfolio(db_session)
    h1 = holding_service.add_holding(
        db_session, portfolio.portfolioId, "Name", "SYM", "STOCK"
    )
    h2 = holding_service.add_holding(
        db_session, portfolio.portfolioId, "Name2", "SYM", "STOCK"
    )
    assert h1.holdingId != h2.holdingId
