from datetime import datetime

from pydantic import BaseModel


class HistoryPoint(BaseModel):
    recordedAt: datetime
    totalInvested: float
    currentValue: float
    profitLoss: float
    profitLossPercentage: float
