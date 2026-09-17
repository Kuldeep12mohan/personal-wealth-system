import datetime
from decimal import Decimal

import pytest

from app.services import (
    holding_calculations,
    holding_service,
    portfolio_service,
    transaction_service,
)
from app.services.errors import ValidationError


def _holding(db_session):
    portfolio = portfolio_service.create_portfolio(db_session, "P1", "INR")
    return holding_service.add_holding(
        db_session, portfolio.portfolioId, "Name", "SYM", "STOCK"
    )


def test_held_quantity_is_buy_minus_sell(db_session):
    holding = _holding(db_session)
    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )
    transaction_service.record_transaction(
        db_session, holding.holdingId, "SELL", 4, 550, datetime.date(2026, 9, 2)
    )
    assert holding_calculations.held_quantity(holding) == Decimal("6.0000")


def test_average_purchase_price_unaffected_by_sell(db_session):
    holding = _holding(db_session)
    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )
    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 600, datetime.date(2026, 9, 2)
    )
    transaction_service.record_transaction(
        db_session, holding.holdingId, "SELL", 5, 700, datetime.date(2026, 9, 3)
    )
    # weighted avg = (10*500 + 10*600) / 20 = 550, unaffected by the SELL at 700
    assert holding_calculations.average_purchase_price(holding) == Decimal("550.00")


def test_oversell_rejected_and_quantity_unchanged(db_session):
    holding = _holding(db_session)
    transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 10, 500, datetime.date(2026, 9, 1)
    )
    with pytest.raises(ValidationError, match="Sell quantity exceeds available holding quantity"):
        transaction_service.record_transaction(
            db_session, holding.holdingId, "SELL", 15, 500, datetime.date(2026, 9, 2)
        )
    assert holding_calculations.held_quantity(holding) == Decimal("10.0000")


def test_transaction_value_rounded(db_session):
    holding = _holding(db_session)
    # price 33.333 rounds to 33.33 (2dp) before being persisted/multiplied
    txn = transaction_service.record_transaction(
        db_session, holding.holdingId, "BUY", 3, 33.333, datetime.date(2026, 9, 1)
    )
    value = transaction_service.transaction_value(txn)
    assert value == Decimal("99.99")
