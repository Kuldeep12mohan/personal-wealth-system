from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api import holdings, portfolios, transactions
from app.db import init_db

app = FastAPI(title="Personal Wealth Management System POC")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    # Surface Pydantic-level validation failures (e.g. missing required
    # fields) with the same {"error": "..."} shape as business-rule errors.
    return JSONResponse(status_code=400, content={"error": "Invalid request payload"})


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    # Contracts/openapi.yaml's Error schema is {"error": string}, not
    # FastAPI's default {"detail": string}.
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


app.include_router(portfolios.router, prefix="/api")
app.include_router(holdings.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
