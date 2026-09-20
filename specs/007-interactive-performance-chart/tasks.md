---

description: "Task list for Interactive Performance History Chart"
---

# Tasks: Interactive Performance History Chart

**Input**: Design documents from `/specs/007-interactive-performance-chart/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no data-model.md/contracts/ — presentation-only, no entity or API change)

**Tests**: Included — constitution Principle III requires an automated test for every behavior change in the same change that introduces it.

**Organization**: Tasks are grouped by user story (spec.md: US1 "Inspect exact numbers via tooltip," P1; US2 "Read scale/timeline via axes," P1; US3 "Tell growth source via visual hierarchy + P&L color," P2; US4 "Use comfortably on mobile," P3). All stories converge on the same component file (`PerformanceHistoryChart.tsx`), so implementation tasks across stories are sequential even though each story is independently testable in outcome.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are exact and repo-relative

## Path Conventions

Frontend-only change: `frontend/src/`, `frontend/tests/` (see plan.md Project Structure). No backend files are touched.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies are introduced by this feature.

- [X] T001 Confirm `frontend/` (React + Vite + Tailwind + React Testing Library) test suite runs per `specs/001-wealth-management-poc/quickstart.md` — no new packages are installed for this feature (constitution Principle IX; plan.md confirms no new dependency, only native `Intl.NumberFormat`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The currency prop and the interactive marker/tooltip state machine are shared by every user story below.

**🚨 CRITICAL**: No user story task can begin until this phase is complete.

- [X] T002 In `frontend/src/App.tsx`, look up the selected portfolio's `currency` from the already-fetched `portfolios` array (matching `portfolioId`) and pass it as a new `currency` prop to `<PortfolioDashboardPage>` (depends on nothing; reuses existing state)
- [X] T003 In `frontend/src/pages/PortfolioDashboardPage.tsx`, accept a new `currency: CurrencyCode` prop and forward it to `<PerformanceHistoryChart>` (depends on T002)
- [X] T004 In `frontend/src/components/PerformanceHistoryChart.tsx`, add a `currency` prop to `Props`, and add a `formatCurrency(value: number)` helper using `new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 })` (per research.md "Currency formatting via native Intl.NumberFormat" decision) (depends on T003)
- [X] T005 In the same file, add `activeIndex: number | null` state; render a `<circle>` marker at every history point (initially a neutral fill, colored by US3); wire `onMouseEnter`/`onMouseLeave` (desktop) and `onClick` (mouse + touch) on each marker to set/clear `activeIndex`, and a background `<rect>` behind the plot area with its own `onClick` that clears `activeIndex` when the user clicks/taps elsewhere (per research.md "Tooltip and marker interactivity via React state" decision) (depends on T004)

**Checkpoint**: Markers render and respond to hover/click by updating internal state, and currency is available for formatting — before any story-specific behavior (tooltip content, axis labels, marker color) is added.

---

## Phase 3: User Story 1 - Inspect the exact numbers behind any point in the trend (Priority: P1)

**Goal**: Hovering (desktop) or tapping (mobile) a point shows its date, current value, invested amount, and profit/loss in a tooltip (FR-006, FR-007, FR-012).

**Independent Test**: Hover/tap a point on a populated chart and confirm the tooltip shows that exact point's four values; hover/tap a different point and confirm it updates; tap elsewhere and confirm it dismisses.

### Tests for User Story 1

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation (T008).

- [X] T006 [P] [US1] In `frontend/tests/PerformanceHistoryChart.test.tsx`, add a test: hovering (`fireEvent.mouseEnter`) a point's marker shows a tooltip containing that point's formatted date, current value, invested amount, and profit/loss; hovering a different marker updates the tooltip to the new point's values (FR-006)
- [X] T007 [P] [US1] In the same file, add a test: clicking a marker shows its tooltip (simulating tap), and clicking the chart's background (outside any marker) dismisses it (FR-007); and a test confirming no tooltip/marker interaction is offered when `history` has 0 or 1 points (FR-012, reusing the existing empty/insufficient-history assertions)

### Implementation for User Story 1

- [X] T008 [US1] In `frontend/src/components/PerformanceHistoryChart.tsx`, when `activeIndex !== null`, render a tooltip `<div>` absolutely positioned via percentage coordinates derived from the active point's SVG `(x, y)` divided by `CHART_WIDTH`/`CHART_HEIGHT` (per research.md "Tooltip positioned via percentage coordinates" decision), showing that point's formatted date (reuse `formatDateLabel` from the prior iteration), `formatCurrency(currentValue)`, `formatCurrency(totalInvested)`, and profit/loss (amount, using `formatCurrency`, plus a `+`/`-` sign) (depends on T005, T004)

**Checkpoint**: A user can hover/tap any point and see its exact figures — the feature's core requested capability is demonstrable.

---

## Phase 4: User Story 2 - Read the chart's scale and timeline without guessing (Priority: P1)

**Goal**: Currency-formatted Y-axis labels with gridlines, and a fixed, evenly-spaced X-axis date label set including the first and last dates (FR-001–FR-003).

**Independent Test**: View a populated chart and confirm Y-axis shows currency-formatted values with aligned gridlines, and X-axis shows 4-6 evenly spaced date labels including the first and last recorded dates.

### Tests for User Story 2

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation (T010–T011).

- [X] T009 [P] [US2] In `frontend/tests/PerformanceHistoryChart.test.tsx`, add a test: for 2+ points, the chart shows currency-formatted Y-axis labels (using the `currency` prop, e.g. asserting a `$`/`₹`-prefixed value) with a matching count of horizontal gridlines, and an X-axis with between 2 and 6 date labels that always include the first and last recorded dates (FR-001–FR-003)

### Implementation for User Story 2

- [X] T010 [US2] In `frontend/src/components/PerformanceHistoryChart.tsx`, compute 3 evenly spaced Y-axis value labels (data max, midpoint, data min) and render each as `formatCurrency(value)` text aligned with a horizontal `<line>` gridline at that value's plotted height (per research.md "Fixed axis label counts" decision) (depends on T004)
- [X] T011 [US2] In the same file, compute up to 6 evenly spaced X-axis date label indices (always including index `0` and `history.length - 1`, de-duplicating when there are fewer points than label slots) and render each as a `formatDateLabel` text below the plot area (depends on T010)

**Checkpoint**: The chart is self-explanatory for scale and timeframe without needing to touch it — combined with User Story 1, the chart is now both readable and inspectable.

---

## Phase 5: User Story 3 - Tell at a glance whether growth is from new money or real gains (Priority: P2)

**Goal**: The "current value" line stays visually prominent and "invested amount" secondary (unchanged from `specs/006`); every point marker is colored to show gain, loss, or flat (FR-004, FR-005).

**Independent Test**: View a populated chart and confirm the two lines retain their prominent/secondary styling, and each marker's color matches whether that point was a gain (green), loss (red), or flat (neutral).

### Tests for User Story 3

> **NOTE**: Write this test FIRST, ensure it FAILs before implementation (T013).

- [X] T012 [P] [US3] In `frontend/tests/PerformanceHistoryChart.test.tsx`, add a test: a point where `currentValue > totalInvested` renders its marker with a gain color (e.g., asserting a `fill` matching the app's `--color-success` token), a point where `currentValue < totalInvested` renders a loss color (`--color-danger`), and a point where they're equal renders a neutral color (`--color-text-muted`) (FR-005); also assert the existing solid/dashed line distinction from `specs/006` is unchanged (FR-004)

### Implementation for User Story 3

- [X] T013 [US3] In `frontend/src/components/PerformanceHistoryChart.tsx`, set each marker `<circle>`'s `fill` based on comparing that point's `currentValue` to `totalInvested`: `var(--color-success)` if greater, `var(--color-danger)` if less, `var(--color-text-muted)` if equal (depends on T005)

**Checkpoint**: All three P1/P2 stories are functional — the chart now reads clearly at a glance and rewards closer inspection.

---

## Phase 6: User Story 4 - Use the chart comfortably on a phone (Priority: P3)

**Goal**: The chart and its tooltip remain fully usable at mobile viewport widths, with no horizontal overflow and no off-screen tooltips (FR-008).

**Independent Test**: Render the chart at a narrow viewport and confirm it fits without horizontal scroll, and that a tapped tooltip stays fully within the visible area.

### Tests for User Story 4

- [X] T014 [P] [US4] In `frontend/tests/PerformanceHistoryChart.test.tsx`, add a test asserting the chart's root `<svg>` retains `className="h-[180px] w-full"` (or equivalent fluid sizing) so it always fits its container's width rather than a fixed pixel width, and a test asserting the tooltip's computed `left`/`top` percentage values stay within `0-100%` for points at the very start and end of the series (guarding against off-screen clipping at the plot's edges)

### Implementation for User Story 4

- [X] T015 [US4] In `frontend/src/components/PerformanceHistoryChart.tsx`, clamp the tooltip's horizontal percentage position (e.g., via a CSS `transform: translateX(...)` that shifts the tooltip left/right near the plot's edges, or an equivalent clamping calculation) so it never renders partially off-screen for points near the first/last index (depends on T008)

**Checkpoint**: All four user stories are independently functional; the chart works well on both desktop and mobile.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety and the governance step this feature depends on.

- [X] T016 [P] Run the full frontend suite (`npm test`, from `frontend/`) to confirm no regressions in `PerformanceHistoryChart.test.tsx`, `PortfolioDashboardPage.test.tsx`, `App.test.tsx`, or any other existing test (constitution Principle III)
- [X] T017 Execute the manual validation steps in `specs/007-interactive-performance-chart/quickstart.md` end-to-end, including desktop hover, mobile tap, and both currencies (INR/USD)
- [X] T018 Run `/speckit-constitution` to record the required amendment from `plan.md` Complexity Tracking (removing/narrowing the "non-interactive" qualifier on the chart exception to permit hover/tap tooltips and always-visible point markers, while still excluding zoom and custom date-range filtering) — this MUST be completed before this feature is considered done (constitution Principle VIII; the project owner's acceptance of this trade-off is recorded in `plan.md`'s Constitution Check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories** (T002–T005 must exist before T006+).
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only; independent of User Story 1's tooltip logic.
- **User Story 3 (Phase 5)**: Depends on Foundational only (colors the markers T005 already rendered); independent of Stories 1 and 2.
- **User Story 4 (Phase 6)**: Depends on User Story 1 (T008, the tooltip must exist before it can be clamped to stay on-screen).
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task.
- Because all stories converge on one file, implementation tasks across stories (T008, T010–T011, T013, T015) are applied sequentially, not concurrently — even though each story's tests can be drafted in parallel ahead of time.

### Parallel Opportunities

- T006/T007 (US1 tests), T009 (US2 test), T012 (US3 test), T014 (US4 tests) can all be drafted in parallel before any implementation, since they assert independent behaviors in the same file.
- T016 has no backend counterpart to run alongside it in this feature (no backend change).

---

## Parallel Example: Writing Tests Up Front

```bash
# Draft all test assertions before any implementation change:
Task: "Assert tooltip shows correct values on hover and updates on hovering a different point"
Task: "Assert clicking a marker shows its tooltip and clicking elsewhere dismisses it"
Task: "Assert Y-axis currency labels + gridlines and X-axis evenly spaced date labels"
Task: "Assert marker fill color reflects gain/loss/neutral per point"
Task: "Assert the chart stays fluid-width and tooltip percentages stay within 0-100%"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2, both P1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational — blocks everything).
2. Complete Phase 3 (US1 — tooltip) and Phase 4 (US2 — axes/gridlines).
3. **STOP and VALIDATE**: a user can now both read the chart's scale at a glance and inspect any point's exact figures — this is the feature's MVP.
4. Continue with US3 (visual hierarchy + P&L color) and US4 (mobile polish) as incremental refinement.
5. Run `/speckit-constitution` (T018) before calling any of this done, per constitution Principle VIII.

### Incremental Delivery

1. Setup + Foundational → currency and interactivity plumbing ready.
2. Add US1 (tooltip) → verify independently.
3. Add US2 (axes/gridlines) → verify independently → **MVP reached** (both P1 stories done).
4. Add US3 (marker color + line hierarchy check) → verify independently.
5. Add US4 (mobile clamping) → verify independently → full feature complete.
6. Polish (Phase 7), including the constitution amendment (T018).

---

## Notes

- [P] tasks are independent test assertions with no dependency on an incomplete task; implementation tasks are never marked [P] here since all four stories share one component file.
- Commit after each task or logical group; verify each story's tests fail before implementing, then pass after.
- T018 (constitution amendment) is not optional polish — it is a hard prerequisite for this feature to be considered compliant with the project's governance model (see plan.md Constitution Check "Gate result").
