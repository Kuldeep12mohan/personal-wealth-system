# Implementation Plan: Personal Wealth Management System POC

**Branch**: `001-wealth-management-poc` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-wealth-management-poc/spec.md`

## Summary

Build a small web application that lets a single user create an investment
portfolio, add holdings (STOCK / MUTUAL_FUND / ETF), record BUY/SELL
transactions, manually maintain each holding's current price, and view
portfolio holdings and summary performance (invested amount, current
value, profit/loss). All six backend operations from the source
specification are preserved exactly; the only intentional deviation from
the source document is that the four logical UI workflows are
consolidated into two physical screens — **Portfolio Setup** (create
portfolio, add investment, record transaction) and **Portfolio
Dashboard** (summary, holdings, current price, and the same three actions
reachable in-place) — per FR-022–FR-025. Backend: FastAPI + SQLAlchemy
over SQLite. Frontend: React + TypeScript + Vite + plain CSS. No
authentication, no external integrations, no additional frameworks.

## Technical Context

**Language/Version**: Python 3.11 (backend); TypeScript 5.x on Node 20.x (frontend, via Vite)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic (bundled with FastAPI) — backend. React 18, Vite, plain CSS — frontend. No additional UI/state-management libraries.

**Storage**: SQLite, single file (`backend/wealth.db`), created via `SQLAlchemy` `Base.metadata.create_all` on startup — no migration tool (unneeded for a POC with a fixed 3-entity schema; adding one would violate Constitution IX).

**Testing**: Pytest (backend unit + API contract tests) — React Testing Library on Vitest (frontend component tests; Vitest chosen as the Vite-native test runner needed to execute RTL, see research.md).

**Target Platform**: Local developer machine — `uvicorn` dev server (backend) and Vite dev server (frontend), no deployment target (cloud deployment is explicitly out of scope).

**Project Type**: Web application (separate `frontend/` + `backend/` projects, per source specification §20 and Constitution Principle II).

**Performance Goals**: None specified beyond ordinary single-user, local, low-volume interactive use (source document defines no performance targets; POC is not measured on this axis).

**Constraints**: Must be implementable in ~1 working day (Constitution I); no authentication/session/multi-user concerns (FR-026); current price is always manually entered, never fetched (FR-015); UI limited to 2 screens (FR-022–FR-025).

**Scale/Scope**: Single implicit user, a handful of portfolios/holdings/transactions for demonstration purposes; 3 entities, 6 REST endpoints, 2 UI screens — no scale/load requirements.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Simplicity First | Plan implements exactly 3 entities, 6 APIs, ≤2 UI screens, 1 calculation model; no speculative generality introduced | PASS |
| II. Maintainability Through Convention | Project Structure below matches source §20 exactly (adapted only for 2 pages instead of 4); naming (`portfolioId`, `holdingId`, `transactionId`, etc.) preserved; business logic confined to `backend/app/services/` | PASS |
| III. Testability by Design | Testing section specifies Pytest for all backend rules/calculations and RTL for frontend components; tasks phase will pair every FR with a test | PASS |
| IV. Clear Frontend/Backend Separation | Frontend limited to `components/pages/services` calling REST APIs; all validation/calculation lives in backend `services/`; contracts/ defines the JSON boundary | PASS |
| V. API Contract Consistency | contracts/openapi.yaml mirrors the source document's 6 endpoints/schemas exactly; any FR needing a field the source didn't specify (e.g., rounding) is additive, not a breaking change | PASS |
| VI. Explicit Business-Rule Validation | data-model.md and contracts/openapi.yaml enumerate every validation rule (FR-001–FR-021) as backend-enforced, testable error paths | PASS |
| VII. Requirement-to-Code Traceability | Every plan artifact section is annotated back to spec FR-IDs; tasks.md (next phase) will carry the same FR references | PASS |
| VIII. Safe, Controlled Incremental Specification Changes | N/A for initial plan — no incremental change is being introduced here; the two named incremental changes remain scheduled for after initial implementation | PASS |
| IX. Minimal Architecture, Dependencies & Infrastructure | No ORM migration tool, no state-management library, no container/CI infra added; only FastAPI/SQLAlchemy/SQLite and React/Vite/plain CSS plus Pytest/RTL(+Vitest) appear anywhere in this plan | PASS |

No violations requiring justification — Complexity Tracking section is empty.

**Post-Design Re-check** (after Phase 1 artifacts below): data-model.md
introduces no 4th entity; contracts/openapi.yaml defines exactly the 6
source endpoints with no additions beyond rounding/default clarifications
already recorded in spec.md; research.md's decisions (autoincrement IDs,
`Decimal` rounding, Vitest, no migration tool) add no new frameworks or
infrastructure. All 9 principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-wealth-management-poc/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
personal-wealth/
├── backend/
│   ├── app/
│   │   ├── api/               # FastAPI routers: portfolios.py, holdings.py, transactions.py
│   │   ├── models/             # SQLAlchemy ORM models: Portfolio, Holding, Transaction
│   │   ├── schemas/             # Pydantic request/response schemas (mirrors contracts/openapi.yaml)
│   │   ├── services/            # Business logic: creation, validation, calculations (FR-001–FR-021)
│   │   └── main.py               # FastAPI app entrypoint
│   ├── tests/                     # Pytest: unit tests for services/, contract tests for api/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Shared presentational pieces (forms, holdings table, summary tiles)
│   │   ├── pages/                   # Exactly 2 pages: PortfolioSetupPage.tsx, PortfolioDashboardPage.tsx
│   │   ├── services/                 # Typed API client functions (one per backend endpoint)
│   │   └── App.tsx
│   ├── tests/                         # React Testing Library + Vitest component tests
│   └── package.json
│
└── README.md
```

**Structure Decision**: Web application split into `backend/` (FastAPI/SQLAlchemy/SQLite) and
`frontend/` (React/TypeScript/Vite), exactly as laid out in the source specification's repository
structure (§20) and Constitution Principle II. The only structural deviation from the source
document is that `frontend/src/pages/` contains **2** page components instead of 4, per the
FR-022–FR-025 UI consolidation constraint; each page composes the same shared `components/` (e.g.,
an `AddInvestmentForm`, a `RecordTransactionForm`, a `HoldingsTable`) so no backend-facing behavior
is lost.

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
