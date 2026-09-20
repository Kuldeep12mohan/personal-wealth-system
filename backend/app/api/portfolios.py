from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.portfolio import CreatePortfolioRequest, Portfolio, PortfolioSummary
from app.schemas.portfolio_history import HistoryPoint
from app.services import history_service, portfolio_service, summary_service
from app.services.errors import NotFoundError, ValidationError

router = APIRouter(tags=["portfolios"])


@router.post("/portfolios", response_model=Portfolio, status_code=201)
def create_portfolio(request: CreatePortfolioRequest, db: Session = Depends(get_db)):
    try:
        portfolio = portfolio_service.create_portfolio(
            db, request.name, request.currency
        )
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return Portfolio(
        portfolioId=portfolio.portfolioId,
        name=portfolio.name,
        currency=portfolio.currency,
    )


@router.get("/portfolios", response_model=list[Portfolio])
def list_portfolios(db: Session = Depends(get_db)):
    portfolios = portfolio_service.list_portfolios(db)
    return [
        Portfolio(
            portfolioId=portfolio.portfolioId,
            name=portfolio.name,
            currency=portfolio.currency,
        )
        for portfolio in portfolios
    ]


@router.get("/portfolios/{portfolioId}/summary", response_model=PortfolioSummary)
def get_portfolio_summary(portfolioId: str, db: Session = Depends(get_db)):
    try:
        summary = summary_service.get_portfolio_summary(db, portfolioId)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return PortfolioSummary(**summary)


@router.get(
    "/portfolios/{portfolioId}/history", response_model=list[HistoryPoint]
)
def get_portfolio_history(portfolioId: str, db: Session = Depends(get_db)):
    try:
        history = history_service.get_portfolio_history(db, portfolioId)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [HistoryPoint(**point) for point in history]
