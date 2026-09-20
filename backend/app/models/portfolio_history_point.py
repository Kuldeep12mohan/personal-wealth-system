from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship

from app.db import Base


class PortfolioHistoryPoint(Base):
    __tablename__ = "portfolio_history_points"

    historyPointId = Column(String, primary_key=True)
    portfolioId = Column(
        String, ForeignKey("portfolios.portfolioId"), nullable=False
    )
    totalInvested = Column(Numeric, nullable=False)
    currentValue = Column(Numeric, nullable=False)
    recordedAt = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    portfolio = relationship("Portfolio", back_populates="historyPoints")
