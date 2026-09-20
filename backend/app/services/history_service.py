"""Portfolio history point capture and retrieval (FR-001–FR-004, FR-008).

record_history_point() only calls db.add() — it does not commit. Callers
(holding_service.update_current_price, transaction_service.record_transaction)
add the history point to their own in-progress session and commit once,
so the triggering write and its history point land in a single atomic
transaction (research.md "Capture history as a side effect" decision).
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.models.portfolio_history_point import PortfolioHistoryPoint
from app.services import holding_calculations, ids
from app.services.errors import NotFoundError
from app.services.rounding import round_money


def record_history_point(db: Session, portfolio_id: str) -> PortfolioHistoryPoint:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise NotFoundError(f"Portfolio {portfolio_id} not found")

    total_invested = Decimal("0")
    current_value = Decimal("0")

    for holding in portfolio.holdings:
        for txn in holding.transactions:
            value = Decimal(str(txn.quantity)) * Decimal(str(txn.price))
            if txn.type == "BUY":
                total_invested += value
            elif txn.type == "SELL":
                total_invested -= value

        quantity = holding_calculations.held_quantity(holding)
        current_value += quantity * Decimal(str(holding.currentPrice))

    point = PortfolioHistoryPoint(
        historyPointId=ids.generate_history_point_id(db),
        portfolioId=portfolio_id,
        totalInvested=round_money(total_invested),
        currentValue=round_money(current_value),
    )
    db.add(point)
    return point


def get_portfolio_history(db: Session, portfolio_id: str) -> list[dict]:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise NotFoundError(f"Portfolio {portfolio_id} not found")

    points = sorted(
        portfolio.historyPoints,
        key=lambda p: (p.recordedAt, p.historyPointId),
    )

    results = []
    for point in points:
        total_invested = round_money(point.totalInvested)
        current_value = round_money(point.currentValue)
        profit_loss = round_money(current_value - total_invested)
        if total_invested == 0:
            profit_loss_percentage = Decimal("0")
        else:
            profit_loss_percentage = round_money(
                (profit_loss / total_invested) * Decimal("100")
            )
        results.append(
            {
                "recordedAt": point.recordedAt,
                "totalInvested": float(total_invested),
                "currentValue": float(current_value),
                "profitLoss": float(profit_loss),
                "profitLossPercentage": float(profit_loss_percentage),
            }
        )
    return results
