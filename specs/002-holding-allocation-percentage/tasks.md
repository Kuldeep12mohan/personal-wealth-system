---

description: "Task list template for feature implementation"
---

# Tasks: Holding Allocation Percentage Indicator

**Input**: Design documents from `/specs/002-holding-allocation-percentage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (no contracts/ — no API changes)

**Tests**: Included and REQUIRED — constitution Principle III (Testability by Design) mandates a React Testing Library test for every changed frontend behavior, written in the same change.

**Organization**: This feature has a single user story (US1, P1). All tasks are scoped to that story; Setup and Foundational phases are not needed since no new project infrastructure is introduced.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Paths are relative to the repository root; this is a **frontend-only** change (`frontend/`) per plan.md — no `backend/` files are touched.

## Phase 1: Setup

Not applicable — this change modifies existing, already-configured frontend code (`frontend/src/components/HoldingsTable.tsx`); no new project, dependency, or tooling initialization is required (plan.md Technical Context; constitution Principle IX).

## Phase 2: Foundational

Not applicable — the allocation calculation and the data it needs (`holding.currentValue`, `portfolioCurrentValue`) already exist and are already passed into `HoldingsTable` by `PortfolioDashboardPage.tsx` (research.md, data-model.md). No blocking prerequisite work is needed before User Story 1.

---

## Phase 3: User Story 1 - See each holding's share of the portfolio (Priority: P1) 🎯 MVP

**Goal**: Each holding on the Portfolio Dashboard shows its allocation percentage (current value ÷ portfolio total current value × 100) immediately next to its Current Value, replacing the current standalone "Allocation %" column, with no backend/API/layout changes beyond this.

**Independent Test**: Open the Portfolio Dashboard for a portfolio with 2+ holdings; confirm each row's Current Value cell shows a small percentage next to the value, the percentages sum to ~100%, a single-holding portfolio shows 100%, and a zero-total-value portfolio shows 0% for every holding — with all other dashboard sections/columns/actions unchanged.

### Tests for User Story 1 ⚠️

> Write these tests FIRST; confirm they FAIL against the current implementation (which renders allocation as a separate column, not inline) before implementing.

- [X] T001 [P] [US1] Create `frontend/tests/HoldingsTable.test.tsx` (new file) with test cases: (a) a 3-holding portfolio (e.g. current values 2000/3000/5000, portfolioCurrentValue 10000) renders `20.0%`, `30.0%`, `50.0%` each adjacent to that row's Current Value text, and no element with the current `"Allocation %"` column header remains; (b) a single-holding portfolio (holding currentValue = portfolioCurrentValue) renders `100.0%` next to the value; (c) `portfolioCurrentValue = 0` renders `0%` (or `0.0%`) next to every holding's value with no `NaN`/`Infinity`/thrown error; (d) existing columns (Name, Symbol, Type, Quantity, Avg Price, Current Price, P/L, P/L %) and the row action buttons (`onRecordTransaction`, `onUpdatePrice`) still render as before, per spec.md FR-006.

### Implementation for User Story 1

- [X] T002 [US1] In `frontend/src/components/HoldingsTable.tsx`, remove the standalone `<th>Allocation %</th>` header (line 73) and its corresponding `<td className="numeric" data-label="Allocation %">` cell containing the `allocation-cell`/`allocation-bar`/`allocation-bar__fill` markup (lines 112–122), keeping `computeDerived()`'s `allocationPercentage` calculation (lines 25–33) unchanged since it already implements spec.md FR-003/FR-004 correctly.
- [X] T003 [US1] In `frontend/src/components/HoldingsTable.tsx`, update the `<td className="numeric" data-label="Current Value">{h.currentValue}</td>` cell (line 103-105) to also render `allocationPercentage` rounded to 1 decimal place (e.g. `allocationPercentage.toFixed(1)`) as a small, visually secondary inline element next to `h.currentValue` (e.g. wrap the percentage in a `<span className="allocation-inline">` styled via the existing `--color-text-muted` token), satisfying spec.md FR-002 and FR-005.
- [X] T004 [US1] In `frontend/src/index.css`, replace the now-unused `.allocation-cell`, `.allocation-bar`, `.allocation-bar__fill` rules (lines 895–918) with a single small `.allocation-inline` rule (muted color via `var(--color-text-muted)`, smaller font-size, left margin) used by the inline percentage span added in T003.
- [X] T005 [US1] Run `npm test` in `frontend/` and confirm `HoldingsTable.test.tsx` (T001) passes and `PortfolioDashboardPage.test.tsx` still passes unmodified, verifying no regression per spec.md FR-006/SC-003.

**Checkpoint**: User Story 1 (the entire feature) is fully functional and independently testable — the Portfolio Dashboard displays each holding's allocation percentage next to its Current Value, with no backend, API, or unrelated UI changes.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T006 Execute the manual validation steps in `specs/002-holding-allocation-percentage/quickstart.md` against a running frontend (+ backend or mocked API) to visually confirm the inline percentage, the removal of the old column, and that no other dashboard section changed position or behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup / Foundational**: Not applicable (see Phase 1/2 notes above).
- **User Story 1 (Phase 3)**: No dependency on other phases; this is the only user story and constitutes the entire feature (MVP = full feature).
- **Polish (Phase 4)**: Depends on Phase 3 (T001–T005) being complete.

### Within User Story 1

- T001 (tests) MUST be written before T002/T003 (implementation) and MUST fail against the current column-based implementation.
- T002 and T003 both modify `HoldingsTable.tsx` and MUST be done sequentially (not parallel) since they touch overlapping regions of the same file.
- T004 (CSS) can be done in parallel with T002/T003 since it's a different file, but must land before T005 (test run) for the inline style class to exist.
- T005 (test run) depends on T001, T002, T003, and T004 all being complete.

### Parallel Opportunities

- T001 (new test file) and T004 (CSS file) can be worked on in parallel — different files, no shared dependency until T005.
- T002 and T003 are NOT parallel — both edit `frontend/src/components/HoldingsTable.tsx`.

---

## Parallel Example: User Story 1

```bash
# Can run together (different files):
Task: "Create frontend/tests/HoldingsTable.test.tsx with allocation-percentage test cases (T001)"
Task: "Replace allocation-bar CSS rules with .allocation-inline in frontend/src/index.css (T004)"

# Must run sequentially after the above (same file, in order):
Task: "Remove standalone Allocation % column in frontend/src/components/HoldingsTable.tsx (T002)"
Task: "Render allocationPercentage inline next to Current Value in frontend/src/components/HoldingsTable.tsx (T003)"
```

---

## Implementation Strategy

### MVP First (and only) Scope

1. Complete T001 (failing tests).
2. Complete T002–T004 (remove old column, add inline indicator, update CSS).
3. Complete T005 (automated test run — should now pass).
4. Complete T006 (manual quickstart validation).
5. Done — this feature has exactly one user story, so completing it is the entire deliverable (constitution Principle I: smallest solution that satisfies the requirement).

## Notes

- No `backend/` files are touched by any task (spec.md FR-007; constitution Principle V).
- No new dependencies, entities, or API contracts are introduced (constitution Principles I, IX).
- Commit after T001 (failing tests) and again after T002–T005 (passing implementation), per repository convention of small, traceable changes (constitution Principle VIII).
