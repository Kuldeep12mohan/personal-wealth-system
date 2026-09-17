"""Transaction recording rules (FR-008–FR-012a)."""
import datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.holding import Holding
from app.models.transaction import SUPPORTED_TYPES, Transaction
from app.services import holding_calculations, ids
from app.services.errors import NotFoundError, ValidationError
from app.services.rounding import round_money, round_quantity


def record_transaction(
    db: Session,
    holding_id: str,
    type_: str | None,
    quantity,
    price,
    transaction_date: datetime.date | None,
) -> Transaction:
    holding = db.get(Holding, holding_id)
    if holding is None:
        raise NotFoundError(f"Holding {holding_id} not found")

    if type_ not in SUPPORTED_TYPES:
        raise ValidationError(f"Type must be one of {', '.join(SUPPORTED_TYPES)}")
    if quantity is None or Decimal(str(quantity)) <= 0:
        raise ValidationError("Quantity must be greater than zero")
    if price is None or Decimal(str(price)) <= 0:
        raise ValidationError("Price must be greater than zero")
    if transaction_date is None:
        raise ValidationError("Transaction date is required")

    quantity_dec = round_quantity(quantity)
    price_dec = round_money(price)

    if type_ == "SELL":
        currently_held = holding_calculations.held_quantity(holding)
        if quantity_dec > currently_held:
            raise ValidationError(
                "Sell quantity exceeds available holding quantity"
            )

    transaction_id = ids.generate_transaction_id(db)
    transaction = Transaction(
        transactionId=transaction_id,
        holdingId=holding_id,
        type=type_,
        quantity=quantity_dec,
        price=price_dec,
        transactionDate=transaction_date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def transaction_value(transaction: Transaction) -> Decimal:
    return round_money(Decimal(str(transaction.quantity)) * Decimal(str(transaction.price)))
