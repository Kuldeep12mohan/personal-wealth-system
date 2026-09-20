"""Portfolio creation rules (FR-001, FR-002, FR-003)."""
from sqlalchemy.orm import Session

from app.models.portfolio import SUPPORTED_CURRENCIES, Portfolio
from app.services import ids
from app.services.errors import ValidationError


def create_portfolio(db: Session, name: str | None, currency: str | None) -> Portfolio:
    if not name or not name.strip():
        raise ValidationError("Portfolio name is required")
    if not currency or currency not in SUPPORTED_CURRENCIES:
        raise ValidationError(
            f"Currency must be one of {', '.join(SUPPORTED_CURRENCIES)}"
        )

    portfolio_id = ids.generate_portfolio_id(db)
    portfolio = Portfolio(portfolioId=portfolio_id, name=name, currency=currency)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def list_portfolios(db: Session) -> list[Portfolio]:
    return db.query(Portfolio).order_by(Portfolio.createdAt).all()


def get_portfolio(db: Session, portfolio_id: str) -> Portfolio:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        from app.services.errors import NotFoundError

        raise NotFoundError(f"Portfolio {portfolio_id} not found")
    return portfolio
