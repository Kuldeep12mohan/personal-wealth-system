"""Derived holding calculations (FR-012, FR-012a, FR-019a)."""
from decimal import Decimal

from app.models.holding import Holding
from app.services.rounding import round_money, round_quantity


def held_quantity(holding: Holding) -> Decimal:
    total = Decimal("0")
    for txn in holding.transactions:
        if txn.type == "BUY":
            total += Decimal(str(txn.quantity))
        elif txn.type == "SELL":
            total -= Decimal(str(txn.quantity))
    return round_quantity(total)


def average_purchase_price(holding: Holding) -> Decimal:
    buy_value = Decimal("0")
    buy_quantity = Decimal("0")
    for txn in holding.transactions:
        if txn.type == "BUY":
            qty = Decimal(str(txn.quantity))
            price = Decimal(str(txn.price))
            buy_value += qty * price
            buy_quantity += qty
    if buy_quantity == 0:
        return round_money(Decimal("0"))
    return round_money(buy_value / buy_quantity)
