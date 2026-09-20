---

description: "Task list for Modernize Performance History Chart"
---

# Tasks: Modernize Performance History Chart

**Input**: Design documents from `/specs/006-modernize-performance-chart/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no data-model.md/contracts/ — this feature changes presentation only)

**Tests**: Included — constitution Principle III requires an automated test for every behavior change in the same change that introduces it.

**Organization**: Tasks are grouped by user story (spec.md: US1 "Read the trend at a glance," P1; US2 "Consistent, polished look," P2; US3 "Clear feedback for empty states," P3). All three stories touch the same single file (`PerformanceHistoryChart.tsx`), so — unlike a typical multi-file feature — tasks within a story are not parallelizable with tasks in another story on that file, even though the stories remain independently testable in outcome.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and repo-relative

## Path Conventions

Frontend-only change: `frontend/src/components/`, `frontend/tests/` (see plan.md Project Structure). No backend files are touched.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies are introduced by this feature.

- [X] T001 Confirm `frontend/` (React + Vite + Tailwind + React Testing Library) test suite runs per `specs/001-wealth-management-poc/quickstart.md` — no new packages are installed for this feature (constitution Principle IX; plan.md Technical Context confirms no new dependency)

*No separate Foundational phase: this feature modifies one existing component with no new shared infrastructure, entities, or services to stand up first.*

---

## Phase 2: User Story 1 - Read the trend at a glance with a clearer chart (Priority: P1)

**Goal**: The chart labels its start date, end date, min value, and max value (per Clarifications), and its two lines are clearly distinguishable by more than color (FR-001, FR-003).

**Independent Test**: View a portfolio with 2+ history points and confirm the four reference labels are present and the two lines remain visually distinguishable without relying on color alone.

### Tests for User Story 1

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation (T004–T005).

- [X] T002 [P] [US1] Extend `frontend/tests/PerformanceHistoryChart.test.tsx`: for 2+ points, assert the chart displays the start date, end date, minimum value, and maximum value as visible text (FR-003)
- [X] T003 [P] [US1] Extend `frontend/tests/PerformanceHistoryChart.test.tsx`: assert the two `<polyline>` elements have distinguishable stroke attributes beyond color alone (e.g., differing `stroke-dasharray` and/or `stroke-width`) (FR-001)

### Implementation for User Story 1

- [X] T004 [US1] In `frontend/src/components/PerformanceHistoryChart.tsx`, derive the start date (`history[0].recordedAt`), end date (`history[history.length - 1].recordedAt`), and the already-computed `min`/`max` values, and render them as four small text labels positioned at the plot area's corners (max value at top, min value at bottom, start date at left, end date at right); format dates and values consistently with how the rest of the dashboard displays them (depends on T002, T003)
- [X] T005 [US1] In the same file, reinforce the visual distinction between the "current value" line (solid) and "invested amount" line (dashed) by adjusting stroke width and/or opacity so the two remain clearly distinct even before reading the legend, without introducing point markers (per research.md "Distinguish lines by width and style" decision) (depends on T004)

**Checkpoint**: A portfolio with 2+ history points shows a chart with visible reference labels and two clearly distinct lines — User Story 1 is independently demonstrable.

---

## Phase 3: User Story 2 - Consistent, polished look with the rest of the dashboard (Priority: P2)

**Goal**: The Performance History section's card styling, spacing, and theme handling match the Portfolio Summary and Holdings sections (FR-005, FR-006).

**Independent Test**: Compare the chart section side by side with the Portfolio Summary and Holdings sections in both light and dark theme and confirm consistent card treatment, spacing, and legible theme-adaptive colors.

### Implementation for User Story 2

- [X] T006 [US2] Verify that `frontend/src/components/PerformanceHistoryChart.tsx`'s root element introduces no border/background that duplicates or conflicts with `PortfolioDashboardPage.tsx`'s existing card wrapper (`cardBase`); the component's own colors already use the shared `var(--color-*)` tokens (already theme-adaptive, FR-006) — no page-level file change is needed (per research.md "Keep the fix scoped" decision). If a redundant border remains after User Story 3's restyle (T008), note it there rather than duplicating the fix here.

**Checkpoint**: The Performance History section reads as visually native to the dashboard in both themes — User Story 2 is independently verifiable without further code change beyond confirming T008's restyle (US3) resolved any redundant inner border.

---

## Phase 4: User Story 3 - Clear feedback when there isn't a trend to show yet (Priority: P3)

**Goal**: The "no history yet" and "not enough history yet" states are restyled to match the section's polished card treatment while preserving their existing wording (FR-007).

**Independent Test**: View a brand-new portfolio (0 points) and one with exactly 1 point, and confirm both states use the same visual language as the rest of the modernized section rather than a disconnected placeholder box.

### Tests for User Story 3

> **NOTE**: Write this test FIRST, ensure it FAILs before implementation (T008).

- [X] T007 [P] [US3] Extend `frontend/tests/PerformanceHistoryChart.test.tsx`: assert the "no history yet" and "not enough history yet" messages retain their exact existing wording (FR-007's "preserving their existing meaning and wording intent") while their container uses the section's restyled treatment (e.g., asserting the `rounded-xl` class introduced in T008 rather than the prior `rounded-lg`)

### Implementation for User Story 3

- [X] T008 [US3] In `frontend/src/components/PerformanceHistoryChart.tsx`, restyle the empty (`history.length === 0`) and insufficient-history (`history.length === 1`) message containers to use the same `rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4` stat-tile convention used by `frontend/src/components/SummaryPanel.tsx` (replacing the current `rounded-lg` treatment), keeping the existing message text unchanged (depends on T007)

**Checkpoint**: Both empty/insufficient-history states look like a deliberate part of the section — all three user stories are now independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety.

- [X] T009 [P] Run the full frontend suite (`npm test`, from `frontend/`) to confirm no regressions in `PerformanceHistoryChart.test.tsx`, `PortfolioDashboardPage.test.tsx`, or any other existing test (constitution Principle III)
- [X] T010 Execute the manual validation steps in `specs/006-modernize-performance-chart/quickstart.md` end-to-end, including both light and dark theme checks

*No constitution amendment is required for this feature (plan.md Constitution Check: clean PASS) — there is no equivalent to a governance-amendment task here.*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends on Setup only.
- **User Story 2 (Phase 3)**: Depends on Setup only for its verification step (T006), but its "no redundant border" concern is only fully resolved once User Story 3's restyle (T008) lands — see the note in T006.
- **User Story 3 (Phase 4)**: Depends on Setup only; independent of User Story 1's changes in code, though both land in the same file so must be applied sequentially, not concurrently.
- **Polish (Phase 5)**: Depends on all three user stories being complete.

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task.
- Because all three stories edit the same file, implementation tasks across stories (T004/T005, T008) must be applied in sequence (not concurrently) even though each story's *tests* can be written in parallel ahead of time.

### Parallel Opportunities

- T002 and T003 (different test cases in the same file, no shared implementation dependency) can be drafted in parallel.
- T007 can be drafted in parallel with T002/T003, since it targets a different set of assertions (empty/insufficient states vs. populated-chart states).
- T009 has no parallel counterpart in this feature (no backend suite to run alongside it, unlike prior features).

---

## Parallel Example: Writing Tests Up Front

```bash
# Draft all test assertions before any implementation change:
Task: "Assert start/end date and min/max value labels appear for 2+ points"
Task: "Assert the two polylines are distinguishable beyond color"
Task: "Assert empty/insufficient-history wording is preserved under the new container styling"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (US1 — labels + line distinction).
3. **STOP and VALIDATE**: confirm a populated chart now shows reference labels and clearly distinct lines — this alone delivers the feature's core stated value ("easier to understand").
4. Continue with US2 verification and US3 restyle as incremental polish.

### Incremental Delivery

1. Setup → foundation ready (trivial for this feature).
2. Add US1 (labels + line distinction) → verify independently → core value delivered.
3. Add US3 (restyle empty/insufficient states) → verify independently.
4. Verify US2 (card consistency) — largely already satisfied; confirm no redundant border remains after US3's change.
5. Polish (Phase 5): full regression run + manual quickstart pass.

---

## Notes

- [P] tasks touch different, non-overlapping test assertions within the same file with no dependency on an incomplete task; implementation tasks are never marked [P] here since all three stories share one component file.
- Commit after each task or logical group; verify each story's tests fail before implementing, then pass after.
- This feature has no backend, data-model, or API task category — plan.md's Constitution Check was a clean PASS with nothing to justify in Complexity Tracking.
