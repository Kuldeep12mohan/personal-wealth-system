---

description: "Task list template for feature implementation"
---

# Tasks: Portfolio Switcher

**Input**: Design documents from `/specs/004-portfolio-switcher/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included and REQUIRED — constitution Principle III (Testability by Design) mandates a Pytest contract test for the new endpoint and React Testing Library tests for every new/changed frontend behavior, written in the same change.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2, US3 = P3) per spec.md. The new `GET /portfolios` endpoint and its frontend client call are shared by all three stories, so they live in the Foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root. This feature touches both `backend/` (one new endpoint) and `frontend/` (switcher UI), per plan.md.

## Phase 1: Setup

Not applicable — this feature modifies an existing, already-configured project (no new language, framework, or tooling initialization is required; constitution Principle IX; plan.md Technical Context).

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `GET /portfolios` endpoint and its frontend client call are read by every user story's UI; they must exist before any story-level work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `backend/tests/contract/test_list_portfolios.py` with test cases: (a) `GET /api/portfolios` with zero portfolios in the database returns `200` and `[]`; (b) after creating two portfolios (e.g. via the existing `create_portfolio` service or `POST /portfolios`), `GET /api/portfolios` returns `200` with a list of exactly those two, each shaped as `{portfolioId, name, currency}` matching the existing `Portfolio` schema, ordered by creation time ascending. Confirm this test FAILS before T002/T003 (no such route exists yet).
- [X] T002 In `backend/app/services/portfolio_service.py`, add `list_portfolios(db: Session) -> list[Portfolio]` that returns `db.query(Portfolio).order_by(Portfolio.createdAt).all()` (research.md: ordering decision), alongside the existing `create_portfolio`/`get_portfolio` functions.
- [X] T003 In `backend/app/api/portfolios.py`, add `@router.get("/portfolios", response_model=list[Portfolio])` calling `portfolio_service.list_portfolios(db)` and mapping each row to the existing `Portfolio` schema (same shape as the `create_portfolio` response) — no new Pydantic model needed (data-model.md). Run `pytest backend/tests/contract/test_list_portfolios.py` and confirm T001 now passes.
- [X] T004 [P] In `frontend/src/services/api.ts`, add `export function listPortfolios() { return get<Portfolio[]>("/portfolios"); }` reusing the existing `Portfolio` interface (contracts/openapi.yaml delta).

**Checkpoint**: Foundation ready — `GET /portfolios` is live and callable from the frontend; user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse and Pick a Portfolio Without Remembering Its ID (Priority: P1) 🎯 MVP

**Goal**: Replace the manual "type a Portfolio ID" text field with a switcher that lists every existing portfolio by name; selecting one loads its dashboard. Handles the empty-portfolios, single-portfolio, and list-load-error cases (spec.md FR-002, FR-003, FR-004, FR-008, FR-011).

**Independent Test**: With 0 portfolios, the dashboard nav shows a guided empty state and no ID field exists anywhere. With exactly 1 portfolio, it is shown automatically with no selection step. With 2+ portfolios, the switcher lists all of them by name and selecting one loads that portfolio's dashboard. If the list request fails, a clear error state with a retry option is shown.

### Tests for User Story 1 ⚠️

> Write these tests FIRST; confirm they FAIL against the current manual-text-input implementation before implementing.

- [X] T005 [P] [US1] Create `frontend/tests/PortfolioSwitcher.test.tsx` (new file) with test cases: (a) given a list of 2+ portfolios, renders each one's `name` and calls the `onSelect(portfolioId)` prop when a user picks one; (b) given an empty list, renders a guided empty state (e.g. "No portfolios yet — create one to get started") instead of an empty/broken control; (c) given a `loading` prop `true`, renders a loading indicator instead of the list; (d) given an `error` prop set, renders the error message and a "Retry" control that calls the `onRetry` prop when clicked.
- [X] T006 [P] [US1] Create `frontend/tests/App.test.tsx` (new file, mocking `listPortfolios`/`createPortfolio` from `../src/services/api`) with test cases: (a) with the mock resolving to exactly one portfolio, that portfolio's dashboard is shown automatically with no manual selection step, and the "Portfolio Dashboard" nav button is enabled; (b) with the mock resolving to `[]`, the dashboard nav stays disabled and a guided empty state is visible; (c) no element with `aria-label="Portfolio ID"` (the old manual text input) exists anywhere in the rendered tree.

### Implementation for User Story 1

- [X] T007 [US1] Create `frontend/src/components/PortfolioSwitcher.tsx`: a component accepting `{ portfolios: Portfolio[], selectedId: string, loading: boolean, error: string | null, onSelect: (portfolioId: string) => void, onRetry: () => void }`, rendering (in priority order) the error+retry state, then the loading state, then an empty-state message when `portfolios.length === 0`, otherwise a list/dropdown of `portfolios` labeled by `name` that calls `onSelect` on choice. Style with existing Tailwind utility patterns from `App.tsx`'s sidebar (no new UI library, constitution Principle IX). Run `npm test -- PortfolioSwitcher` and confirm T005 passes.
- [X] T008 [US1] In `frontend/src/App.tsx`: remove the "Portfolio ID for dashboard" `<label>`/`<input>` block (the manual `aria-label="Portfolio ID"` text field); add `portfolios`, `isLoadingPortfolios`, and `portfoliosError` state; on mount, call `listPortfolios()` to populate `portfolios` (catching errors into `portfoliosError`); render `<PortfolioSwitcher>` in the sidebar wired to this state and to `onSelect={setPortfolioId}`; when the fetched list has exactly one portfolio, auto-set `portfolioId` to it; keep the "Portfolio Dashboard" nav button disabled while `!portfolioId`. Run `npm test -- App` and confirm T006 passes.

**Checkpoint**: User Story 1 is fully functional and independently testable — the dashboard's only way to choose a portfolio is the switcher; manual ID entry is gone.

---

## Phase 4: User Story 2 - Switch Between Portfolios Without Losing Context (Priority: P2)

**Goal**: The switcher's list updates immediately after creating a new portfolio (no reload); the last-selected portfolio is remembered via `localStorage` and restored automatically; a stale (no-longer-existing) stored selection falls back gracefully instead of breaking the view (spec.md FR-005, FR-007, FR-009).

**Independent Test**: Create a new portfolio via the existing Portfolio Setup screen and confirm it appears in the switcher without a manual refresh. Select a portfolio, reload/remount the app, and confirm the same portfolio is shown again. Simulate a stored `portfolioId` that is absent from the fetched list and confirm the app falls back to the empty state or another available portfolio rather than showing a broken dashboard.

### Tests for User Story 2 ⚠️

- [X] T009 [P] [US2] Extend `frontend/tests/App.test.tsx` with test cases: (a) after `PortfolioSetupPage`'s `onPortfolioCreated` callback fires for a newly created portfolio, the switcher's rendered list includes it without any additional manual action (mock `listPortfolios` being re-invoked, or the new portfolio being appended to state); (b) after selecting a portfolio, simulate a remount of `App` with `localStorage` pre-populated from the prior selection, and confirm that same `portfolioId` is auto-selected on the new mount; (c) with `localStorage` pre-populated with a `portfolioId` that is NOT present in the `listPortfolios` mock's resolved list, confirm the app does not crash or show a broken dashboard, instead clearing the stale value and applying the empty-state/first-available fallback.

### Implementation for User Story 2

- [X] T010 [US2] In `frontend/src/App.tsx`, change the `onPortfolioCreated` handler (currently `(p) => setPortfolioId(p.portfolioId)`) to also refresh the `portfolios` list (e.g. re-call `listPortfolios()` or append the newly created portfolio to existing state) so the switcher reflects the new portfolio immediately (FR-005), in addition to selecting it.
- [X] T011 [US2] In `frontend/src/App.tsx`: on mount, read `localStorage.getItem("personal-wealth:lastPortfolioId")`; after `listPortfolios()` resolves, if that stored id matches a `portfolioId` in the returned list, use it as the initial selection (FR-007), otherwise call `localStorage.removeItem(...)` and fall back to the empty state (no portfolios) or the first portfolio in the list (FR-009); whenever the user selects a portfolio via `PortfolioSwitcher`'s `onSelect`, write that `portfolioId` to the same `localStorage` key.

**Checkpoint**: User Stories 1 and 2 both work independently — the switcher stays in sync with newly created portfolios and remembers the user's last choice across reloads.

---

## Phase 5: User Story 3 - Identify Portfolios Clearly When Several Look Similar (Priority: P3)

**Goal**: Each switcher entry shows its base currency alongside its name so similarly-named portfolios can be told apart, and the currently active portfolio is visibly marked in the list (spec.md FR-006, FR-010).

**Independent Test**: Create two portfolios with similar or identical names but different currencies; confirm the switcher shows each one's currency next to its name, and that the entry matching the currently displayed portfolio is visibly marked as selected/active.

### Tests for User Story 3 ⚠️

- [X] T012 [P] [US3] Extend `frontend/tests/PortfolioSwitcher.test.tsx` with test cases: (a) given two portfolios with the same `name` but different `currency` values, both render with their respective currency visible (e.g. "My Investments (INR)" and "My Investments (USD)"), so the two are visually distinguishable; (b) given a `selectedId` matching one portfolio in the list, that entry's rendered element carries a marker of being active (e.g. `aria-current="true"` or a distinct class/attribute) while the others do not.

### Implementation for User Story 3

- [X] T013 [US3] In `frontend/src/components/PortfolioSwitcher.tsx`: render each entry's `currency` next to its `name` (e.g. `${p.name} (${p.currency})`), and apply `aria-current="true"` plus a distinct visual treatment (reusing the existing `sidebarLinkActive`-style Tailwind classes from `App.tsx`) to the entry whose `portfolioId` equals the `selectedId` prop. Run `npm test -- PortfolioSwitcher` and confirm T012 passes.

**Checkpoint**: All three user stories are independently functional — the feature described in spec.md is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T014 [P] Run `pytest` from `backend/` and confirm the full suite passes with no regressions to the 5 pre-existing endpoints (constitution Principle III, V).
- [X] T015 [P] Run `npm test` from `frontend/` and confirm the full suite passes with no regressions to existing components/pages.
- [X] T016 Execute the manual validation steps in `specs/004-portfolio-switcher/quickstart.md` end-to-end against a running backend + frontend.
- [X] T017 Run `/speckit-constitution` to record the approved, scoped amendment for the new `GET /portfolios` endpoint (six → seven endpoints in Technology & Scope Boundaries), per plan.md's Complexity Tracking — required before this feature can be considered fully compliant with constitution Principle VIII/Governance.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Not applicable.
- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories (T007+ need `listPortfolios()` from T004; T008+ need the live endpoint from T003).
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion, and builds on the `App.tsx` switcher wiring introduced in US1 (T008) — implement after Phase 3.
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion, and builds on the `PortfolioSwitcher.tsx` component introduced in US1 (T007) — implement after Phase 3. Independent of US2 (can be done before or after Phase 4).
- **Polish (Phase 6)**: Depends on all desired user stories being complete; T017 (constitution amendment) may be done at any point but MUST land before the feature is marked done.

### Within Each User Story

- Tests (T005/T006, T009, T012) MUST be written and FAIL before their corresponding implementation tasks.
- Foundational service (T002) before route (T003); route (T003) before frontend client (T004 can be parallel, but calling it is pointless until T003 exists).
- Within US1: T007 (new component) and T008 (App.tsx wiring) both needed for T006 to pass; T007 should land first since T008 renders `<PortfolioSwitcher>`.

### Parallel Opportunities

- T001 (backend contract test) and T004 (frontend api.ts addition) can run in parallel — different files/stacks.
- T005 (PortfolioSwitcher tests) and T006 (App tests) can run in parallel — different files.
- T009 [US2] and T012 [US3] can be developed in parallel once Phase 3 is complete — different concerns, though both may touch files also touched by Phase 3 tasks, so rebase/merge carefully.
- T014 and T015 (full suite runs) can run in parallel — different stacks.

---

## Parallel Example: Foundational Phase

```bash
# Can run together (different files/stacks):
Task: "Create backend/tests/contract/test_list_portfolios.py (T001)"
Task: "Add listPortfolios() to frontend/src/services/api.ts (T004)"

# Must run sequentially after T001 (same backend, in order):
Task: "Add list_portfolios(db) in backend/app/services/portfolio_service.py (T002)"
Task: "Add GET /portfolios route in backend/app/api/portfolios.py (T003)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004).
2. Complete Phase 3: User Story 1 (T005–T008).
3. **STOP and VALIDATE**: Confirm the switcher fully replaces manual ID entry, per the Independent Test above.
4. This alone satisfies the feature's core request ("portfolio switcher").

### Incremental Delivery

1. Foundational (T001–T004) → endpoint live.
2. User Story 1 (T005–T008) → switcher replaces manual ID entry → MVP demoable.
3. User Story 2 (T009–T011) → list stays in sync with new portfolios; selection persists across reloads.
4. User Story 3 (T012–T013) → currency shown per entry; active entry visibly marked.
5. Polish (T014–T017) → full regression pass, manual validation, and the required constitution amendment.

## Notes

- No new entities, dependencies, or UI screens are introduced (constitution Principles I, IX); the only constitution impact is the one new endpoint, explicitly tracked via T017.
- `backend/` changes are limited to T001–T003; all user-story-level work (T005–T013) is frontend-only.
- Commit after each phase's tests pass, per repository convention of small, traceable changes (constitution Principle VIII).

---

## Phase 7: Convergence

- [X] T018 [US2] Add a test case to `frontend/tests/App.test.tsx` that renders `App`, navigates to the "Portfolio Dashboard" view for Portfolio A, then selects Portfolio B via the `PortfolioSwitcher` in the sidebar, and asserts the dashboard updates in place to show Portfolio B's data (e.g. its `Portfolio {portfolioId}` heading), without leaving or reloading the dashboard view — per spec.md US2 Acceptance Scenario 1 (partial)
