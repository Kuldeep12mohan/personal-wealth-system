from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship

from app.db import Base

SUPPORTED_TYPES = ("STOCK", "MUTUAL_FUND", "ETF")


class Holding(Base):
    __tablename__ = "holdings"

    holdingId = Column(String, primary_key=True)
    portfolioId = Column(
        String, ForeignKey("portfolios.portfolioId"), nullable=False
    )
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    type = Column(String, nullable=False)
    currentPrice = Column(Numeric, nullable=False, default=0)
    createdAt = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    portfolio = relationship("Portfolio", back_populates="holdings")
    transactions = relationship(
        "Transaction", back_populates="holding", cascade="all, delete-orphan"
    )
