from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship

from app.db import Base

SUPPORTED_TYPES = ("BUY", "SELL")


class Transaction(Base):
    __tablename__ = "transactions"

    transactionId = Column(String, primary_key=True)
    holdingId = Column(String, ForeignKey("holdings.holdingId"), nullable=False)
    type = Column(String, nullable=False)
    quantity = Column(Numeric, nullable=False)
    price = Column(Numeric, nullable=False)
    transactionDate = Column(Date, nullable=False)
    createdAt = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    holding = relationship("Holding", back_populates="transactions")
