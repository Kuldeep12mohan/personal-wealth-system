from pydantic import BaseModel


class CreatePortfolioRequest(BaseModel):
    name: str | None = None
    currency: str | None = None


class Portfolio(BaseModel):
    portfolioId: str
    name: str
    currency: str


class PortfolioSummary(BaseModel):
    portfolioId: str
    totalInvested: float
    currentValue: float
    profitLoss: float
    profitLossPercentage: float
