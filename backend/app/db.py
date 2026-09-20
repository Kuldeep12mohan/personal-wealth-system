"""SQLAlchemy engine/session/declarative Base.

Schema is created via Base.metadata.create_all(engine) on startup —
no migration tool (research.md decision).
"""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = Path(__file__).resolve().parent.parent / "wealth.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> None:
    # Import models so they are registered on Base.metadata before create_all.
    from app.models import (  # noqa: F401
        holding,
        portfolio,
        portfolio_history_point,
        transaction,
    )

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
