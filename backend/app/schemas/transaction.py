import datetime

from pydantic import BaseModel


class RecordTransactionRequest(BaseModel):
    type: str | None = None
    quantity: float | None = None
    price: float | None = None
    transactionDate: datetime.date | None = None


class Transaction(BaseModel):
    transactionId: str
    holdingId: str
    type: str
    quantity: float
    price: float
    value: float
