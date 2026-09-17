from pydantic import BaseModel


class AddHoldingRequest(BaseModel):
    name: str | None = None
    symbol: str | None = None
    type: str | None = None


class Holding(BaseModel):
    holdingId: str
    portfolioId: str
    name: str
    symbol: str
    type: str
    currentPrice: float


class HoldingView(BaseModel):
    holdingId: str
    portfolioId: str
    name: str
    symbol: str
    type: str
    currentPrice: float
    quantity: float
    averagePrice: float
    currentValue: float


class UpdatePriceRequest(BaseModel):
    currentPrice: float | None = None


class PriceUpdateResult(BaseModel):
    holdingId: str
    currentPrice: float
