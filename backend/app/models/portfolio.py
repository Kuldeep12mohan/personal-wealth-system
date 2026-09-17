from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship

from app.db import Base

SUPPORTED_CURRENCIES = ("INR", "USD")


class Portfolio(Base):
    __tablename__ = "portfolios"

    portfolioId = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    createdAt = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    holdings = relationship(
        "Holding", back_populates="portfolio", cascade="all, delete-orphan"
    )
