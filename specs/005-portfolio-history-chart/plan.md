# Implementation Plan: Portfolio Performance History Chart

**Branch**: `005-portfolio-history-chart` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-portfolio-history-chart/spec.md`

## Summary

Add a new `PortfolioHistoryPoint` record that captures a portfolio's `totalInvested` and `currentValue` every time a holding's price is updated or a BUY/SELL transaction is recorded, reusing the existing summary-calculation logic (`summary_service.get_portfolio_summary`) so the numbers stay consistent with the current-state summary. Expose the full, unbounded time series via one new read endpoint, `GET /portfolios/{portfolioId}/history`. On the dashboard, render it as a hand-rolled inline SVG chart with two lines — current value and invested amount — using existing Tailwind classes, with explicit empty (0 points) and insufficient-history (1 point) states. This requires a companion constitution amendment spanning three boundaries at once (a 4th entity, an 8th endpoint, and narrowing the "advanced charts" exclusion) — a wider amendment than any prior change, consciously accepted per `.specify/assessments/performance-chart/decision.md`.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI backend) and TypeScript (React 18, Vite) — per constitution Technology & Scope Boundaries; no version change.

**Primary Dependencies**: FastAPI, SQLAlchemy (backend); React, Tailwind CSS (frontend). No new dependencies — the chart is hand-rolled inline SVG styled with existing Tailwind utility classes, per Assumption in spec.md and the concept chosen in `.specify/assessments/performance-chart/concept.md` (Option A).

**Storage**: SQLite via a new `portfolio_history_points` table (one row per captured event) — additive schema change only; no existing tables are modified. Rows are append-only (never updated or deleted by this feature).

**Testing**: Pytest contract test for `GET /portfolios/{portfolioId}/history` and unit tests for the new history-recording service function (`backend/tests/`); React Testing Library tests for the new chart component covering the three history-count states (0, 1, 2+) and the multi-portfolio isolation behavior (`frontend/tests/`).

**Target Platform**: Web (browser), served by the existing Vite frontend and FastAPI backend.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change touches both.

**Performance Goals**: N/A beyond existing dashboard responsiveness. History is unbounded by design (per spec.md Clarifications), but volume stays low under the app's single-user, manual-entry usage pattern; no pagination is required for v1.

**Constraints**: Must not change any of the 7 existing endpoints' request/response shapes (constitution Principle V). The new endpoint is read-only and additive. History points MUST be recorded as a side effect of the existing price-update and transaction-recording operations, without altering those operations' existing request/response contracts. The chart MUST NOT introduce a frontend dependency (constitution Principle IX) and MUST fit within the existing 2-screen UI scope (added to the existing Portfolio Dashboard screen, not a new screen).

**Scale/Scope**: One new entity/table, one new service module (history capture + retrieval), two call-sites wired into existing services (price update, transaction recording), one new backend endpoint, one new frontend chart component, and dashboard wiring to fetch and display it per selected portfolio.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: **CONDITIONAL PASS** — the chosen design (Option A from the concept-shaping assessment) is the smallest solution that satisfies the spec: one new entity, one new endpoint, no new dependency, reusing existing calculation logic rather than duplicating it. It still exceeds the constitution's current "3 entities, 7 APIs" ceiling, which is the subject of the required amendment below.
- **II. Maintainability Through Convention**: PASS — new model in `backend/app/models/portfolio_history_point.py`; new endpoint added to `backend/app/api/portfolios.py` alongside existing portfolio routes; new service module `backend/app/services/history_service.py` follows the existing `services/` convention; field names (`portfolioId`, `totalInvested`, `currentValue`, `recordedAt`) match existing naming style exactly.
- **III. Testability by Design**: PASS (planned) — contract test for the new endpoint, unit tests for history-point creation triggered by price updates and transactions, and frontend tests for all three chart states are added in the same change.
- **IV. Clear Frontend/Backend Separation**: PASS — the backend owns history capture and profit/loss derivation (reusing `summary_service` logic); the frontend only fetches the series and renders it. No calculation logic is duplicated in the frontend, consistent with FR-008.
- **V. API Contract Consistency**: PASS for the 7 existing endpoints (unchanged). The new `GET /portfolios/{portfolioId}/history` endpoint is introduced consistently across spec, backend, and frontend in this same change (see Complexity Tracking for the required amendment).
- **VI. Explicit Business-Rule Validation**: PASS — the only new rule is "history points are append-only, never modified or deleted," enforced simply by never exposing an update/delete path for this entity; no other business rule applies to a read-derived record.
- **VII. Requirement-to-Code Traceability**: PASS — traces to `specs/005-portfolio-history-chart/spec.md` (FR-001–FR-008) and to `.specify/assessments/performance-chart/decision.md` (the approved concept and accepted amendment scope).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — this plan follows Specification → Clarification → Plan → Tasks → Implementation → Tests, matching the process used for 003 and 004.
- **IX. Minimal Architecture, Dependencies & Infrastructure**: **CONDITIONAL PASS** — no new frameworks or libraries are introduced (hand-rolled SVG, existing stack only), but this feature (a) adds a 4th data entity beyond the constitution's "exactly three entities" boundary, (b) adds an 8th API endpoint beyond the current 7-endpoint boundary, and (c) requires narrowing the "advanced charts" line in the Out-of-Scope list to carve out this specific, non-interactive portfolio-level chart. All three are flagged in Complexity Tracking below and require a `/speckit-constitution` amendment before `/speckit-implement` marks the corresponding tasks complete — a wider amendment than the single-boundary precedents set by 003 (styling) and 004 (endpoint count).

**Gate result**: PASS, conditional on the constitution amendment tracked in Complexity Tracking being carried out (via `/speckit-constitution`) before `/speckit-implement` completes the corresponding tasks. This wider-than-usual amendment was explicitly reviewed and accepted by the project owner in `/speckit-assess-decide` (see `.specify/assessments/performance-chart/decision.md`), so it is treated here as a known, pre-approved condition rather than an open risk.

## Project Structure

### Documentation (this feature)

```text
specs/005-portfolio-history-chart/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — new endpoint only
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   └── portfolio_history_point.py   # ADD: PortfolioHistoryPoint SQLAlchemy model
│   ├── schemas/
│   │   └── portfolio_history.py         # ADD: HistoryPoint response schema
│   ├── api/
│   │   └── portfolios.py                # MODIFY: add GET /portfolios/{portfolioId}/history route
│   └── services/
│       ├── history_service.py           # ADD: record_history_point(db, portfolio_id); get_history(db, portfolio_id)
│       ├── holding_service.py           # MODIFY: call record_history_point after update_current_price
│       └── transaction_service.py       # MODIFY: call record_history_point after record_transaction
└── tests/
    ├── contract/
    │   └── test_get_portfolio_history.py    # ADD: contract test for GET .../history
    └── unit/
        └── test_history_service.py          # ADD: history capture on price update + transaction

frontend/
├── src/
│   ├── components/
│   │   └── PerformanceHistoryChart.tsx  # ADD: inline SVG two-line chart + empty/insufficient states
│   ├── pages/
│   │   └── PortfolioDashboardPage.tsx   # MODIFY: fetch + render history chart for selected portfolio
│   └── services/
│       └── api.ts                       # MODIFY: add getPortfolioHistory(portfolioId)
└── tests/
    └── PerformanceHistoryChart.test.tsx # ADD: 0/1/2+ point states, multi-portfolio isolation
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per constitution Principle II). This feature adds exactly one backend entity, one service module, one endpoint, and one frontend component, wiring into the two existing mutation flows (price update, transaction) as a side effect rather than a new user-facing action. No new screens are introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| A 4th data entity (`PortfolioHistoryPoint`), exceeding the constitution's "exactly three entities" boundary | Showing a trend over time requires persisting more than one point in time; the existing three entities (Portfolio, Holding, Transaction) only ever represent current state — Transaction rows record individual buy/sell events, not portfolio-level value snapshots, and deriving history by replaying all transactions against historical prices is impossible because historical prices are never stored (only the current price is kept per holding) | Reconstructing history purely from the Transaction table was rejected because current prices are overwritten in place (no price history), so past `currentValue` cannot be recomputed after the fact — a dedicated snapshot record is the only way to capture value at a point in time |
| An 8th API endpoint (`GET /portfolios/{portfolioId}/history`), exceeding the current 7-endpoint boundary | The frontend needs a way to retrieve the time series to render the chart; no existing endpoint returns more than the current-state summary | Embedding history in the existing summary endpoint's response was rejected because it would conflate "current state" and "time series" concerns in one contract, violate Principle V's shape stability for that endpoint, and force every summary-fetching caller to pay the cost of the (potentially large, unbounded) history payload even when not displaying a chart |
| Narrowing the "advanced charts" line in Technology & Scope Boundaries' Out-of-Scope list | The out-of-scope list currently excludes "advanced charts" outright; a two-line, non-interactive, hand-rolled SVG trend chart still falls under "charts" even though it has none of the interactivity (zoom, tooltips, date-range selection) the term was likely meant to exclude | Building nothing was rejected per the explicit `go` verdict in `.specify/assessments/performance-chart/decision.md`; building it without amending the constitution was rejected because it would leave code silently inconsistent with governance (constitution Principle VII/VIII) |

**Required companion action**: Run `/speckit-constitution` to record all three changes above as one scoped, reviewed amendment (mirroring the Tailwind CSS and portfolio-switcher precedents, but explicitly wider in surface area) — updating the entity count, the endpoint enumeration, and narrowing the "advanced charts" Out-of-Scope bullet to name exactly what this feature adds (a non-interactive, portfolio-level, two-line value/invested trend chart) — before `/speckit-implement` completes the corresponding tasks.
