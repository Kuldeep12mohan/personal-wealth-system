# Quickstart: Personal Wealth Management System POC

Validates the feature end-to-end against spec.md's user stories and
success criteria, using the contract in `contracts/openapi.yaml` and the
entities in `data-model.md`. Implementation details (code) belong in
`tasks.md`, not here.

## Prerequisites

- Python 3.11+ with `pip`
- Node.js 20.x with `npm`
- No external services, accounts, or API keys required (no external
  integrations exist per FR-026).

## Setup

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend dev server should be configured to proxy `/api/*` requests
to `http://localhost:8000` (Vite `server.proxy`), so the two screens can
call the backend without CORS configuration.

## Validation Scenario 1 — Portfolio Setup (User Story 1 & 2)

1. Open the **Portfolio Setup** screen.
2. Create a portfolio: name `My Investments`, currency `INR`.
   - **Expect**: confirmation showing a generated `portfolioId` like
     `PORT-10001` (FR-002).
3. On the same screen, add an investment: name `ABC Bank`, symbol
   `ABCBANK`, type `STOCK`.
   - **Expect**: a generated `holdingId` like `HOLD-20001`, current price
     shown as `0` (FR-006a).
4. On the same screen, record a BUY transaction for that holding:
   quantity `10`, price `500`, date today.
   - **Expect**: transaction created with `value = 5000` (FR-009); no
     navigation to a third screen was required (FR-022).
5. Attempt to record a SELL transaction for `15` units of the same
   holding (more than the `10` held).
   - **Expect**: rejected with a validation error such as "Sell quantity
     exceeds available holding quantity" (FR-011, SC-003); held quantity
     remains `10`.

## Validation Scenario 2 — Dashboard & Price Update (User Story 3 & 4)

1. Navigate to the **Portfolio Dashboard** for the portfolio created
   above.
2. Confirm the holdings list shows `ABC Bank / ABCBANK`, quantity `10`,
   average price `500`, current price `0`, current value `0` (FR-016,
   FR-006a).
3. Use the dashboard's "update price" action to set the current price to
   `550`.
   - **Expect**: holding's current price becomes `550`; current value
     recalculates to `5500` (quantity × price) without leaving the
     dashboard (FR-013, FR-023).
4. Confirm the portfolio summary shows: total invested `5000`, current
   value `5500`, profit/loss `500`, profit/loss percentage `10`
   (FR-017, FR-018, SC-002).
5. From the dashboard, use the "add investment" and "record transaction"
   actions and confirm both work without navigating to a third screen
   (FR-023, FR-024, SC-004).

## Cross-Cutting Checks

- **SC-001**: Steps 1–4 of Scenario 1, plus Scenario 2 step 2, should be
  completable in one sitting using only the two screens.
- **SC-002**: The Scenario 2 step 4 figures must match hand-calculated
  values from `data-model.md`'s Portfolio Summary formulas, to 2 decimal
  places (money) / 4 decimal places (quantity) (FR-019a).
- **SC-004**: All six operations in `contracts/openapi.yaml` were
  exercised above without ever requiring a third screen.
- **SC-005**: Every step above corresponds to a numbered FR in spec.md —
  no additional UI action or backend behavior was needed to complete the
  scenarios.

## Automated Test Coverage (see tasks.md for the authoritative list)

- Pytest: one test per FR-001–FR-021 validation/calculation rule,
  plus API contract tests against `contracts/openapi.yaml` request/response
  shapes.
- React Testing Library (via Vitest): rendering and interaction tests for
  the Portfolio Setup and Portfolio Dashboard pages and their shared
  components.

## T053 — Manual Validation Run (2026-09-17)

Executed against a live `uvicorn app.main:app --port 8000` instance using
`curl`, exercising the exact request bodies shown in Scenario 1 and
Scenario 2 above.

### Scenario 1 — Portfolio Setup

| Step | Action | Result | Pass/Fail |
|---|---|---|---|
| 2 | Create portfolio (`My Investments`, `INR`) | `{"portfolioId":"PORT-10001","name":"My Investments","currency":"INR"}` | PASS |
| 3 | Add investment (`ABC Bank`/`ABCBANK`/`STOCK`) | `{"holdingId":"HOLD-20001", ..., "currentPrice":0.0}` | PASS |
| 4 | Record BUY 10 @ 500 | `{"transactionId":"TXN-30001", ..., "value":5000.0}` | PASS |
| 5 | Attempt SELL 15 (> 10 held) | HTTP 400, `{"error":"Sell quantity exceeds available holding quantity"}` | PASS |

### Scenario 2 — Dashboard & Price Update

| Step | Action | Result | Pass/Fail |
|---|---|---|---|
| 2 | List holdings | quantity `10.0`, averagePrice `500.0`, currentPrice `0.0`, currentValue `0.0` | PASS |
| 3 | Update price to `550` | `{"holdingId":"HOLD-20001","currentPrice":550.0}` | PASS |
| 4 | Portfolio summary | totalInvested `5000.0`, currentValue `5500.0`, profitLoss `500.0`, profitLossPercentage `10.0` | PASS |

All steps matched the documented expected values exactly (SC-002,
SC-003). No third screen or additional endpoint was needed (SC-004).
