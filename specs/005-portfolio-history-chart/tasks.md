---

description: "Task list for Portfolio Performance History Chart"
---

# Tasks: Portfolio Performance History Chart

**Input**: Design documents from `/specs/005-portfolio-history-chart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included — constitution Principle III requires an automated test for every business rule/calculation in the same change that introduces it.

**Organization**: Tasks are grouped by user story (spec.md: US1 "See portfolio value trend," US2 "History captured automatically," both P1; US3 "View trend across multiple portfolios," P2) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and repo-relative

## Path Conventions

Existing web app split: `backend/app/`, `backend/tests/`, `frontend/src/`, `frontend/tests/` (see plan.md Project Structure).

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies are introduced by this feature.

- [X] T001 Confirm `backend/` (FastAPI + SQLAlchemy + Pytest) and `frontend/` (React + Vite + Tailwind + React Testing Library) run per `specs/001-wealth-management-poc/quickstart.md` — no new packages are installed for this feature (constitution Principle IX; plan.md Technical Context confirms no new dependency)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The new entity and its service module are shared by every user story below — both capturing history (US2) and displaying it (US1, US3) depend on them.

**🚨 CRITICAL**: No user story task can begin until this phase is complete.

- [X] T002 [P] Create `PortfolioHistoryPoint` SQLAlchemy model in `backend/app/models/portfolio_history_point.py`: `historyPointId` (String, primary key), `portfolioId` (String, `ForeignKey("portfolios.portfolioId")`, `nullable=False`), `totalInvested` (Numeric, `nullable=False`), `currentValue` (Numeric, `nullable=False`), `recordedAt` (DateTime, `nullable=False`, `default=lambda: datetime.now(timezone.utc)`) — per data-model.md, matching the `Transaction`/`Portfolio` model conventions in `backend/app/models/transaction.py`
- [X] T003 Register the new model in `backend/app/db.py`'s `init_db()` import list (alongside `holding, portfolio, transaction`) so `Base.metadata.create_all` creates the `portfolio_history_points` table on startup
- [X] T004 [P] Add `generate_history_point_id(db)` to `backend/app/services/ids.py` following the existing `_next_id` pattern: prefix `HIST-`, seed `40001`, reusing `_next_id(db, PortfolioHistoryPoint, HISTORY_PREFIX, HISTORY_SEED)`
- [X] T005 [P] Create the `HistoryPoint` response schema in `backend/app/schemas/portfolio_history.py` matching `contracts/openapi.yaml`'s `HistoryPoint` schema exactly: `recordedAt` (datetime), `totalInvested` (float), `currentValue` (float), `profitLoss` (float), `profitLossPercentage` (float) — all required fields
- [X] T006 Create `backend/app/services/history_service.py` with two functions (depends on T002, T004, T005):
  - `record_history_point(db: Session, portfolio_id: str) -> PortfolioHistoryPoint`: computes `totalInvested`/`currentValue` using the same aggregation as `summary_service.get_portfolio_summary` (iterate `portfolio.holdings` → transactions for invested amount; iterate holdings → `holding_calculations.held_quantity(holding) * holding.currentPrice` for current value), rounds both via `app.services.rounding.round_money`, generates an id via `ids.generate_history_point_id(db)`, and persists the row (per research.md "Reuse existing summary calculation" decision)
  - `get_portfolio_history(db: Session, portfolio_id: str) -> list[dict]`: raises `NotFoundError` if the portfolio doesn't exist; otherwise queries all `PortfolioHistoryPoint` rows for that `portfolioId` ordered by `recordedAt` ascending, and for each row derives `profitLoss = currentValue - totalInvested` and `profitLossPercentage = 0 if totalInvested == 0 else round_money((profitLoss / totalInvested) * 100)` — identical formula to `summary_service.get_portfolio_summary` (FR-008)

**Checkpoint**: `PortfolioHistoryPoint` can be created and queried directly (e.g., via a Python shell or a throwaway script) before any user-facing behavior exists.

---

## Phase 3: User Story 2 - History captured automatically as the user acts (Priority: P1)

**Goal**: Every price update and every transaction automatically produces a new history point, with no extra user action (FR-001, FR-002, FR-003).

**Independent Test**: Update a holding's price or record a transaction, then confirm via `history_service.get_portfolio_history` (or a direct DB query) that a new point exists with the correct `totalInvested`/`currentValue`.

### Tests for User Story 2

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation (T009–T010).

- [X] T007 [P] [US2] Unit test in `backend/tests/unit/test_history_service.py::test_price_update_creates_history_point`: updating a holding's current price results in exactly one new `PortfolioHistoryPoint` for that holding's portfolio, with `totalInvested`/`currentValue` matching `summary_service.get_portfolio_summary`'s values immediately after
- [X] T008 [P] [US2] Unit test in `backend/tests/unit/test_history_service.py::test_transaction_creates_history_point`: recording a BUY or SELL transaction results in exactly one new history point reflecting the post-transaction state, and that recording several events in sequence preserves all prior points unmodified (FR-003)

### Implementation for User Story 2

- [X] T009 [US2] In `backend/app/services/holding_service.py::update_current_price`, after `db.commit()`/`db.refresh(holding)` succeeds, call `history_service.record_history_point(db, holding.portfolioId)` (depends on T006)
- [X] T010 [US2] In `backend/app/services/transaction_service.py::record_transaction`, after `db.commit()`/`db.refresh(transaction)` succeeds, resolve the portfolio via `holding.portfolioId` and call `history_service.record_history_point(db, holding.portfolioId)` (depends on T006)

**Checkpoint**: History accumulates automatically and correctly on every price update and transaction — verifiable independently of any UI.

---

## Phase 4: User Story 1 - See portfolio value trend on the dashboard (Priority: P1)

**Goal**: The dashboard shows the selected portfolio's history as a two-line trend chart (current value, invested amount), with explicit empty/insufficient-history states (FR-004–FR-006, FR-008, per Clarifications).

**Independent Test**: With 2+ history points already recorded (via US2), open the dashboard and confirm the trend chart renders both lines; with 0 or 1 points, confirm the correct empty/insufficient state shows instead.

### Tests for User Story 1

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation (T013–T016).

- [X] T011 [P] [US1] Contract test in `backend/tests/contract/test_get_portfolio_history.py`: `GET /portfolios/{portfolioId}/history` returns `200` with an array of `{recordedAt, totalInvested, currentValue, profitLoss, profitLossPercentage}` ordered oldest→newest, returns an empty array `[]` for a portfolio with no history yet, and returns `404` for a non-existent `portfolioId`
- [X] T012 [P] [US1] Frontend test in `frontend/tests/PerformanceHistoryChart.test.tsx` covering three states: 0 points → "no history yet" empty state (FR-006); 1 point → "not enough history yet" state, not a broken single-dot chart (FR-006); 2+ points → both lines (current value, invested amount) render across all points (FR-005)

### Implementation for User Story 1

- [X] T013 [US1] Add `GET /portfolios/{portfolioId}/history` route to `backend/app/api/portfolios.py`, calling `history_service.get_portfolio_history(db, portfolioId)`, returning `list[HistoryPoint]`, and translating `NotFoundError` to HTTP `404` (matching the existing route error-handling pattern in this file) (depends on T005, T006)
- [X] T014 [P] [US1] Add `getPortfolioHistory(portfolioId: string)` to `frontend/src/services/api.ts`, calling the new endpoint and returning the typed `HistoryPoint[]` array
- [X] T015 [US1] Create `frontend/src/components/PerformanceHistoryChart.tsx`: accepts a `HistoryPoint[]` prop; renders an inline `<svg>` with two `<polyline>` elements (current value, invested amount) computed via a simple linear scale over the array, styled with existing Tailwind utility classes; renders a "no history yet" message when the array is empty and a "not enough history yet" message when it has exactly one point (no new dependency, per research.md "Hand-rolled inline SVG chart" decision) (depends on T014)
- [X] T016 [US1] In `frontend/src/pages/PortfolioDashboardPage.tsx`, fetch the selected portfolio's history via `getPortfolioHistory` alongside the existing summary/holdings fetch, and render `PerformanceHistoryChart` with the result; re-fetch history after any successful price update or transaction action on this page (depends on T015)

**Checkpoint**: The dashboard visibly shows a two-line trend for any portfolio with 2+ history points, and correct empty/insufficient states otherwise — User Stories 1 and 2 together deliver the feature's MVP.

---

## Phase 5: User Story 3 - View trend across multiple portfolios (Priority: P2)

**Goal**: Switching the selected portfolio (via the existing `PortfolioSwitcher`) always shows that portfolio's own history, never another's (FR-007).

**Independent Test**: Create two portfolios with distinct history, switch between them via the existing switcher, and confirm each shows only its own trend.

### Tests for User Story 3

- [X] T017 [P] [US3] Frontend test in `frontend/tests/PortfolioDashboardPage.test.tsx` (or extend existing dashboard test coverage): switching the selected portfolio via `PortfolioSwitcher` causes `PerformanceHistoryChart` to re-fetch and display only the newly selected portfolio's history points — no residual data from the previously selected portfolio (FR-007, SC-003)

### Implementation for User Story 3

- [X] T018 [US3] In `frontend/src/pages/PortfolioDashboardPage.tsx`, ensure the history fetch (T016) is keyed to the currently selected `portfolioId` (e.g., re-run on portfolio-switch state change, discarding any in-flight/previous result) so no stale or mixed history is ever rendered after a switch (depends on T016)

**Checkpoint**: All three user stories are independently functional; multi-portfolio users see correctly isolated trends.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety and the governance step this feature depends on.

- [X] T019 [P] Run the full backend suite (`pytest`, from `backend/`) to confirm no regressions against the 7 existing endpoints and existing business rules (constitution Principle III)
- [X] T020 [P] Run the full frontend suite (`npm test`, from `frontend/`) to confirm no regressions in existing components/pages
- [X] T021 Execute the manual validation steps in `specs/005-portfolio-history-chart/quickstart.md` end-to-end
- [X] T022 Run `/speckit-constitution` to record the required amendment from `plan.md` Complexity Tracking (3→4 entities, 7→8 endpoints, narrowing the "advanced charts" Out-of-Scope bullet to name this specific non-interactive two-line chart) — this MUST be completed before this feature is considered done (constitution Principle VIII; `.specify/assessments/performance-chart/decision.md` records the project owner's prior acceptance of this amendment's scope)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories** (T002–T006 must exist before T007+).
- **User Story 2 (Phase 3)**: Depends on Foundational only. Produces the data User Story 1 needs to demonstrate a real trend.
- **User Story 1 (Phase 4)**: Depends on Foundational (for the read side, T005/T006/T013). Its acceptance scenarios need history points to exist, so it should be validated after Phase 3, even though its own tasks (T011–T016) have no code dependency on Phase 3's tasks.
- **User Story 3 (Phase 5)**: Depends on User Story 1 (T016) being complete — it adds isolation behavior on top of the chart wiring.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task.
- Backend model/schema/service before backend route.
- Backend route before frontend service call.
- Frontend service call before frontend component.
- Frontend component before page wiring.

### Parallel Opportunities

- T002, T004, T005 (different files, no cross-dependency) can run in parallel within Foundational.
- T007 and T008 (different test functions, same new file but independent scenarios) can be written in parallel.
- T011 and T012 (backend contract test vs. frontend component test, different files/stacks) can run in parallel.
- T019 and T020 (separate backend/frontend suites) can run in parallel.

---

## Parallel Example: Foundational Phase

```bash
# Launch independent foundational tasks together:
Task: "Create PortfolioHistoryPoint model in backend/app/models/portfolio_history_point.py"
Task: "Add generate_history_point_id to backend/app/services/ids.py"
Task: "Create HistoryPoint response schema in backend/app/schemas/portfolio_history.py"
```

## Parallel Example: User Story 1 Tests

```bash
Task: "Contract test for GET /portfolios/{portfolioId}/history in backend/tests/contract/test_get_portfolio_history.py"
Task: "Frontend test for PerformanceHistoryChart states in frontend/tests/PerformanceHistoryChart.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 2 + 1, both P1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational — blocks everything).
2. Complete Phase 3 (US2 — capture): history starts accumulating automatically.
3. Complete Phase 4 (US1 — display): the dashboard shows the trend chart.
4. **STOP and VALIDATE**: run the Phase 3 + Phase 4 independent tests together — this is the feature's MVP (a single-portfolio user can see their trend).
5. Run `/speckit-constitution` (T022) before calling the MVP done, per constitution Principle VIII.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US2 (capture) → verify independently (no visible UI change yet, but data is now being recorded).
3. Add US1 (display) → verify independently → **MVP reached**.
4. Add US3 (multi-portfolio isolation) → verify independently → full feature complete.
5. Polish (Phase 6), including the constitution amendment (T022).

---

## Notes

- [P] tasks touch different files with no dependency on an incomplete task.
- [Story] labels map each task to spec.md's user stories for traceability.
- Commit after each task or logical group; verify each story's tests fail before implementing, then pass after.
- T022 (constitution amendment) is not optional polish — it is a hard prerequisite for this feature to be considered compliant with the project's governance model (see plan.md Constitution Check "Gate result").
