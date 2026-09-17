from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.transaction import RecordTransactionRequest, Transaction
from app.services import transaction_service
from app.services.errors import NotFoundError, ValidationError

router = APIRouter(tags=["transactions"])


@router.post(
    "/holdings/{holdingId}/transactions", response_model=Transaction, status_code=201
)
def record_transaction(
    holdingId: str, request: RecordTransactionRequest, db: Session = Depends(get_db)
):
    try:
        transaction = transaction_service.record_transaction(
            db,
            holdingId,
            request.type,
            request.quantity,
            request.price,
            request.transactionDate,
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    value = transaction_service.transaction_value(transaction)
    return Transaction(
        transactionId=transaction.transactionId,
        holdingId=transaction.holdingId,
        type=transaction.type,
        quantity=float(transaction.quantity),
        price=float(transaction.price),
        value=float(value),
    )
