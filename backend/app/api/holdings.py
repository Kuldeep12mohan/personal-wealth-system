from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.holding import (
    AddHoldingRequest,
    Holding,
    HoldingView,
    PriceUpdateResult,
    UpdatePriceRequest,
)
from app.services import holding_service
from app.services.errors import NotFoundError, ValidationError

router = APIRouter(tags=["holdings"])


@router.post(
    "/portfolios/{portfolioId}/holdings", response_model=Holding, status_code=201
)
def add_holding(
    portfolioId: str, request: AddHoldingRequest, db: Session = Depends(get_db)
):
    try:
        holding = holding_service.add_holding(
            db, portfolioId, request.name, request.symbol, request.type
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return Holding(
        holdingId=holding.holdingId,
        portfolioId=holding.portfolioId,
        name=holding.name,
        symbol=holding.symbol,
        type=holding.type,
        currentPrice=float(holding.currentPrice),
    )


@router.get(
    "/portfolios/{portfolioId}/holdings", response_model=list[HoldingView]
)
def list_holdings(portfolioId: str, db: Session = Depends(get_db)):
    try:
        views = holding_service.list_holdings(db, portfolioId)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return views


@router.put("/holdings/{holdingId}/price", response_model=PriceUpdateResult)
def update_current_price(
    holdingId: str, request: UpdatePriceRequest, db: Session = Depends(get_db)
):
    try:
        holding = holding_service.update_current_price(
            db, holdingId, request.currentPrice
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PriceUpdateResult(
        holdingId=holding.holdingId, currentPrice=float(holding.currentPrice)
    )
