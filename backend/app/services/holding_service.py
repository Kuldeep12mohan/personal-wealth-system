"""Holding creation, listing, and price-update rules
(FR-004–FR-007, FR-006a, FR-013–FR-016)."""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.holding import SUPPORTED_TYPES, Holding
from app.models.portfolio import Portfolio
from app.services import history_service, holding_calculations, ids
from app.services.errors import NotFoundError, ValidationError
from app.services.rounding import round_money


def add_holding(
    db: Session,
    portfolio_id: str,
    name: str | None,
    symbol: str | None,
    type_: str | None,
) -> Holding:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise NotFoundError(f"Portfolio {portfolio_id} not found")
    if not name or not name.strip():
        raise ValidationError("Investment name is required")
    if not symbol or not symbol.strip():
        raise ValidationError("Symbol is required")
    if type_ not in SUPPORTED_TYPES:
        raise ValidationError(f"Type must be one of {', '.join(SUPPORTED_TYPES)}")

    holding_id = ids.generate_holding_id(db)
    holding = Holding(
        holdingId=holding_id,
        portfolioId=portfolio_id,
        name=name,
        symbol=symbol,
        type=type_,
        currentPrice=Decimal("0"),
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


def get_holding(db: Session, holding_id: str) -> Holding:
    holding = db.get(Holding, holding_id)
    if holding is None:
        raise NotFoundError(f"Holding {holding_id} not found")
    return holding


def list_holdings(db: Session, portfolio_id: str) -> list[dict]:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise NotFoundError(f"Portfolio {portfolio_id} not found")

    views = []
    for holding in portfolio.holdings:
        quantity = holding_calculations.held_quantity(holding)
        avg_price = holding_calculations.average_purchase_price(holding)
        current_price = round_money(holding.currentPrice)
        current_value = round_money(quantity * current_price)
        views.append(
            {
                "holdingId": holding.holdingId,
                "portfolioId": holding.portfolioId,
                "name": holding.name,
                "symbol": holding.symbol,
                "type": holding.type,
                "currentPrice": float(current_price),
                "quantity": float(quantity),
                "averagePrice": float(avg_price),
                "currentValue": float(current_value),
            }
        )
    return views


def update_current_price(db: Session, holding_id: str, current_price) -> Holding:
    holding = db.get(Holding, holding_id)
    if holding is None:
        raise NotFoundError(f"Holding {holding_id} not found")
    if current_price is None or Decimal(str(current_price)) <= 0:
        raise ValidationError("currentPrice must be greater than zero")

    holding.currentPrice = round_money(current_price)
    history_service.record_history_point(db, holding.portfolioId)
    db.commit()
    db.refresh(holding)
    return holding
