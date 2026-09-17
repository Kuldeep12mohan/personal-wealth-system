"""Rounding utilities (FR-019a).

All monetary amounts round to 2 decimal places; all quantities round to
4 decimal places. Both use Decimal with ROUND_HALF_UP to avoid binary
floating-point drift (research.md).
"""
from decimal import ROUND_HALF_UP, Decimal

MONEY_QUANTUM = Decimal("0.01")
QUANTITY_QUANTUM = Decimal("0.0001")


def _to_decimal(value) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def round_money(value) -> Decimal:
    return _to_decimal(value).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def round_quantity(value) -> Decimal:
    return _to_decimal(value).quantize(QUANTITY_QUANTUM, rounding=ROUND_HALF_UP)
