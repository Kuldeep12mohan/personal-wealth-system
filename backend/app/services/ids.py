"""Sequential prefixed identifier generation (research.md).

PORT-<n> seeded at 10001, HOLD-<n> seeded at 20001, TXN-<n> seeded at
30001. Each call determines the next id by inspecting the max existing
id of that type in the database, so ids survive process restarts.
"""
import re

from sqlalchemy.orm import Session

PORTFOLIO_PREFIX = "PORT-"
HOLDING_PREFIX = "HOLD-"
TRANSACTION_PREFIX = "TXN-"

PORTFOLIO_SEED = 10001
HOLDING_SEED = 20001
TRANSACTION_SEED = 30001

_ID_RE = re.compile(r"-(\d+)$")


def _next_id(db: Session, model, prefix: str, seed: int) -> str:
    rows = db.query(model).all()
    max_n = seed - 1
    for row in rows:
        pk_value = getattr(row, model.__mapper__.primary_key[0].name)
        match = _ID_RE.search(pk_value or "")
        if match:
            n = int(match.group(1))
            if n > max_n:
                max_n = n
    return f"{prefix}{max_n + 1}"


def generate_portfolio_id(db: Session) -> str:
    from app.models.portfolio import Portfolio

    return _next_id(db, Portfolio, PORTFOLIO_PREFIX, PORTFOLIO_SEED)


def generate_holding_id(db: Session) -> str:
    from app.models.holding import Holding

    return _next_id(db, Holding, HOLDING_PREFIX, HOLDING_SEED)


def generate_transaction_id(db: Session) -> str:
    from app.models.transaction import Transaction

    return _next_id(db, Transaction, TRANSACTION_PREFIX, TRANSACTION_SEED)
