import pytest

from app.services import portfolio_service
from app.services.errors import ValidationError


def test_reject_blank_name(db_session):
    with pytest.raises(ValidationError):
        portfolio_service.create_portfolio(db_session, "", "INR")


def test_reject_blank_currency(db_session):
    with pytest.raises(ValidationError):
        portfolio_service.create_portfolio(db_session, "My Portfolio", "")


def test_reject_unsupported_currency(db_session):
    with pytest.raises(ValidationError):
        portfolio_service.create_portfolio(db_session, "My Portfolio", "EUR")


def test_no_partial_record_persisted_on_failure(db_session):
    with pytest.raises(ValidationError):
        portfolio_service.create_portfolio(db_session, "", "EUR")
    from app.models.portfolio import Portfolio

    assert db_session.query(Portfolio).count() == 0


def test_valid_creation(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "My Portfolio", "INR")
    assert portfolio.portfolioId.startswith("PORT-")
