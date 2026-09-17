# Personal Wealth Management System (SpecKit SDD POC)

A small full-stack proof-of-concept that lets a single user create an
investment portfolio, add holdings (STOCK / MUTUAL_FUND / ETF), record
BUY/SELL transactions, manually maintain each holding's current price,
and view portfolio holdings and summary performance.

Built strictly to the SpecKit design artifacts in
`specs/001-wealth-management-poc/` (spec.md, plan.md, data-model.md,
contracts/openapi.yaml, tasks.md) and `.specify/memory/constitution.md`.

## Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (`backend/wealth.db`, created on startup via `Base.metadata.create_all` — no migration tool)
- **Frontend**: React + TypeScript + Vite + plain CSS (no UI framework, no router library)
- **Tests**: Pytest (backend contract + unit tests), Vitest + React Testing Library (frontend component tests)

## Repository Structure

```text
backend/
├── app/
│   ├── api/          # FastAPI routers: portfolios.py, holdings.py, transactions.py
│   ├── models/       # SQLAlchemy models: Portfolio, Holding, Transaction
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/       # Business logic: creation, validation, calculations
│   └── main.py           # FastAPI app entrypoint
├── tests/
│   ├── contract/     # API contract tests
│   └── unit/          # Service-level unit tests
└── requirements.txt

frontend/
├── src/
│   ├── components/   # Shared presentational pieces (forms, table, summary tiles)
│   ├── pages/          # PortfolioSetupPage.tsx, PortfolioDashboardPage.tsx (exactly 2 screens)
│   ├── services/        # Typed API client (apiClient.ts, api.ts)
│   └── App.tsx             # In-memory view switch between the 2 screens
├── tests/               # Vitest + React Testing Library component tests
└── package.json
```

## Setup & Run

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is served at `http://localhost:8000/api` (interactive docs at
`http://localhost:8000/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so the
two screens can call the backend without CORS configuration.

## Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

## Screens

1. **Portfolio Setup** — Create Portfolio, Add Investment, Record
   BUY/SELL Transaction.
2. **Portfolio Dashboard** — Portfolio summary, holdings list (with
   current price), and the actions to add an investment, record a
   transaction, and update a current price, all in place.

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/portfolios` | Create a portfolio |
| POST | `/api/portfolios/{portfolioId}/holdings` | Add a holding |
| GET | `/api/portfolios/{portfolioId}/holdings` | List holdings with derived quantity/average price/current value |
| POST | `/api/holdings/{holdingId}/transactions` | Record a BUY/SELL transaction |
| PUT | `/api/holdings/{holdingId}/price` | Manually update a holding's current price |
| GET | `/api/portfolios/{portfolioId}/summary` | Portfolio-level totalInvested/currentValue/profitLoss/profitLossPercentage |

See `specs/001-wealth-management-poc/contracts/openapi.yaml` for the
authoritative request/response contract.

## Business Rules (backend-enforced)

- Currency restricted to `INR`/`USD`; investment type restricted to
  `STOCK`/`MUTUAL_FUND`/`ETF`; transaction type restricted to
  `BUY`/`SELL`.
- A new holding's `currentPrice` starts at `0` until explicitly updated.
- A SELL transaction cannot exceed the holding's currently held quantity
  (rejected with `"Sell quantity exceeds available holding quantity"`).
- Average purchase price is the weighted average of BUY transactions
  only; SELL transactions never change it.
- All monetary values round to 2 decimal places; all quantities round to
  4 decimal places, using `Decimal`/`ROUND_HALF_UP`.
- `profitLossPercentage` is `0` (not an error) when `totalInvested` is
  `0`.

## Out of Scope

No authentication, no real-time market data, no brokerage/bank
integrations, no tax/capital-gains logic, no multi-user access control —
see `.specify/memory/constitution.md` and spec.md FR-026 for the full
list.
