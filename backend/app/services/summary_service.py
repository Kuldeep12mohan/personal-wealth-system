"""Portfolio summary calculation (FR-017, FR-018)."""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.services import holding_calculations
from app.services.errors import NotFoundError
from app.services.rounding import round_money


def get_portfolio_summary(db: Session, portfolio_id: str) -> dict:
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

    total_invested = round_money(total_invested)
    current_value = round_money(current_value)
    profit_loss = round_money(current_value - total_invested)

    if total_invested == 0:
        profit_loss_percentage = Decimal("0")
    else:
        profit_loss_percentage = round_money(
            (profit_loss / total_invested) * Decimal("100")
        )

    return {
        "portfolioId": portfolio_id,
        "totalInvested": float(total_invested),
        "currentValue": float(current_value),
        "profitLoss": float(profit_loss),
        "profitLossPercentage": float(profit_loss_percentage),
    }
