---

description: "Task list template for feature implementation"
---

# Tasks: Tailwind CSS UI Modernization

**Input**: Design documents from `/specs/003-tailwind-ui-modernization/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md (N/A — no entities),
quickstart.md (no contracts/ — no API changes)

**Tests**: No new test tasks are generated — constitution Principle III's testability bar is
met by the existing automated suite, which is verified (research.md) to assert only on ARIA
role/label/text/`data-label`, never CSS class names. Existing tests are the regression gate
for this feature (spec FR-003, FR-005, SC-001); running them is included as verification
tasks below.

**Organization**: This feature has a single user story (US1, P1). All tasks are scoped to
that story; the Foundational phase is not needed beyond Setup.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Paths are relative to the repository root; this is a **frontend-only** change
  (`frontend/`) per plan.md — no `backend/` files are touched.

## Phase 1: Setup

**Purpose**: Add Tailwind CSS to the build pipeline and establish a pre-migration baseline.

- [X] T001 Run `npm test` in `frontend/` and record the current passing count (baseline: 6
      test files / 14 tests per the last known-good state) so later regression checks have a
      reference point.
- [X] T002 Add `tailwindcss` and `@tailwindcss/vite` as dev dependencies in
      `frontend/package.json` and run `npm install` in `frontend/` (plan.md Technical
      Context; constitution Principle IX's Tailwind exception).
- [X] T003 Register the `@tailwindcss/vite` plugin in `frontend/vite.config.ts`'s `plugins`
      array alongside the existing `react()` plugin (research.md "Tailwind CSS version and
      Vite integration").
- [X] T004 Add `@import "tailwindcss";` as the first line of `frontend/src/index.css`,
      above the existing `:root` design-token block, without removing any existing rule yet
      (component-specific rules are removed later, per file, in T014).

**Checkpoint**: Tailwind CSS utilities are available for use in JSX; no visual change yet
since no `className` values have been migrated.

## Phase 2: Foundational

Not applicable — there is no shared infrastructure to build beyond Setup (Phase 1); each
file's migration in Phase 3 is independent aside from the single shared `index.css` cleanup
step (T014), which is sequenced after all per-file migrations.

---

## Phase 3: User Story 1 - Consistent, modern visual styling without behavior change (Priority: P1) 🎯 MVP

**Goal**: Every existing screen and component renders using Tailwind CSS utility classes
instead of the current plain CSS, with identical structure, behavior, accessibility
attributes, and test-relevant selectors (spec FR-001–FR-003, FR-005, FR-008).

**Independent Test**: Walk through every existing user flow (create portfolio, add
investment, record transaction, update price, view dashboard/holdings, toggle light/dark
theme, view on a narrow screen) and confirm each behaves identically to before while
displaying with modernized, consistent Tailwind-based styling and no visually broken
elements.

### Implementation for User Story 1

> For every task below: change only `className` values (and, where noted, replace a custom
> loading-spinner implementation with Tailwind's built-in one) — element types, nesting,
> conditional rendering, event handlers, `data-label`, `role`, and `aria-*` attributes MUST
> be preserved exactly (spec FR-002, FR-003, FR-005; research.md "Preserving the existing
> light/dark theme system" for the color-token mapping approach and "Migration approach and
> scope" for the spacing/radius scale mapping).

- [X] T005 [P] [US1] Migrate `frontend/src/App.tsx` to Tailwind utility classes for its
      shell/layout styling, referencing existing CSS custom properties (`--color-*`) via
      arbitrary-value utilities (e.g. `bg-[var(--color-bg)]`) for any theme-dependent
      color, and standard Tailwind spacing/layout utilities elsewhere.
- [X] T006 [P] [US1] Migrate `frontend/src/pages/PortfolioSetupPage.tsx` to Tailwind utility
      classes, preserving its existing section structure and the Create Portfolio / Add
      Investment / Record Transaction composition.
- [X] T007 [P] [US1] Migrate `frontend/src/pages/PortfolioDashboardPage.tsx` to Tailwind
      utility classes, preserving its existing header, summary/holdings/actions section
      structure, and refs (`addInvestmentRef`, `actionsRef`); replace the
      `<span className="loading-text" role="status">` / `<span className="spinner"
      aria-hidden="true" />` pairing (around line 99-101) with Tailwind's `animate-spin`
      utility on the spinner element, keeping `role="status"` on the same element as today
      (research.md "Loading spinner and other small CSS-only effects").
- [X] T008 [P] [US1] Migrate `frontend/src/components/CreatePortfolioForm.tsx` to Tailwind
      utility classes for its form layout/fields/buttons, including the same
      `loading-text`/`spinner` → `animate-spin` replacement described in T007 (around line
      75-76).
- [X] T009 [P] [US1] Migrate `frontend/src/components/AddInvestmentForm.tsx` to Tailwind
      utility classes, including the same `loading-text`/`spinner` → `animate-spin`
      replacement (around line 85-86).
- [X] T010 [P] [US1] Migrate `frontend/src/components/RecordTransactionForm.tsx` to
      Tailwind utility classes, including the same `loading-text`/`spinner` →
      `animate-spin` replacement (around line 123-124).
- [X] T011 [P] [US1] Migrate `frontend/src/components/UpdatePriceForm.tsx` to Tailwind
      utility classes, including the same `loading-text`/`spinner` → `animate-spin`
      replacement (around line 54-55).
- [X] T012 [P] [US1] Migrate `frontend/src/components/HoldingsTable.tsx` to Tailwind
      utility classes for the table, header cells, row cells, empty state, and row-action
      buttons, explicitly preserving: every `data-label` attribute value (used by
      `frontend/tests/HoldingsTable.test.tsx`), the `.allocation-inline` percentage
      indicator's placement next to Current Value (spec FR-002, from
      `specs/002-holding-allocation-percentage/`), and the table's existing narrow-screen
      responsive behavior (spec FR-008).
- [X] T013 [P] [US1] Migrate `frontend/src/components/SummaryPanel.tsx` to Tailwind utility
      classes for its summary metrics layout.
- [X] T014 [US1] In `frontend/src/index.css`, remove every component-specific plain CSS
      rule now superseded by the Tailwind utility classes applied in T005–T013 (including
      the `.spinner`/`@keyframes spin` rule replaced by `animate-spin` in T007–T011),
      leaving only the `@import "tailwindcss";` line (T004) and the existing `:root` /
      `:root[data-theme="dark"]` design-token blocks; before finishing, grep the migrated
      `.tsx` files to confirm no removed class name is still referenced anywhere (spec
      FR-007). Depends on T005–T013 all being complete (shared-file task, not parallel with
      them).
- [X] T015 [US1] Run `npm test` in `frontend/` and confirm the full existing suite (all 6
      test files, all tests, per the T001 baseline) still passes unmodified, verifying no
      functional or accessibility regression (spec FR-003, FR-005, SC-001).

**Checkpoint**: User Story 1 (the entire feature) is fully migrated to Tailwind CSS,
independently testable, with all existing tests passing and no plain CSS left duplicating
what Tailwind now provides.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T016 Run `npm run build` in `frontend/` and confirm the production build succeeds
      with Tailwind CSS processed via `@tailwindcss/vite`, with no build errors.
- [X] T017 Execute the manual validation steps in
      `specs/003-tailwind-ui-modernization/quickstart.md` against a running frontend (+
      backend or mocked API): visually confirm both screens, the light/dark theme toggle,
      and the holdings table's narrow-screen responsive behavior all work with no visually
      broken elements (spec SC-002).
- [X] T018 [P] Inspect `frontend/package.json` and `frontend/src/index.css` to confirm
      `tailwindcss` and `@tailwindcss/vite` are the only new entries and no other CSS
      framework or UI component library is present (spec FR-006, SC-004).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Not applicable (see Phase 2 note above).
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) completing first (T001–T004 make
  Tailwind available). This is the only user story and constitutes the entire feature
  (MVP = full feature).
- **Polish (Phase 4)**: Depends on Phase 3 (T005–T015) being complete.

### Within User Story 1

- T005–T013 (per-file JSX migrations) can proceed in any order relative to each other —
  each touches a distinct `.tsx` file with no shared dependency between them.
- T014 (CSS cleanup in the shared `index.css`) MUST come after T005–T013 are all complete,
  since it deletes rules only once every consumer has stopped referencing them.
- T015 (test run) MUST come after T014, to verify the fully-migrated, fully-cleaned-up
  state.

### Parallel Opportunities

- T005, T006, T007, T008, T009, T010, T011, T012, T013 can all run in parallel — nine
  distinct `.tsx` files, no shared file, no dependency on each other.
- T014 and T015 are NOT parallel with the above or each other — T014 depends on all of
  T005–T013, and T015 depends on T014.
- T017 and T018 (Polish) can run in parallel with each other once T016 completes.

---

## Parallel Example: User Story 1

```bash
# Launch all nine per-file migrations together (different files, no shared dependency):
Task: "Migrate frontend/src/App.tsx to Tailwind utility classes (T005)"
Task: "Migrate frontend/src/pages/PortfolioSetupPage.tsx to Tailwind utility classes (T006)"
Task: "Migrate frontend/src/pages/PortfolioDashboardPage.tsx to Tailwind utility classes (T007)"
Task: "Migrate frontend/src/components/CreatePortfolioForm.tsx to Tailwind utility classes (T008)"
Task: "Migrate frontend/src/components/AddInvestmentForm.tsx to Tailwind utility classes (T009)"
Task: "Migrate frontend/src/components/RecordTransactionForm.tsx to Tailwind utility classes (T010)"
Task: "Migrate frontend/src/components/UpdatePriceForm.tsx to Tailwind utility classes (T011)"
Task: "Migrate frontend/src/components/HoldingsTable.tsx to Tailwind utility classes (T012)"
Task: "Migrate frontend/src/components/SummaryPanel.tsx to Tailwind utility classes (T013)"

# Must run sequentially after the above (shared file, in order):
Task: "Remove now-dead component-specific CSS rules from frontend/src/index.css (T014)"
Task: "Run npm test in frontend/ to confirm no regression (T015)"
```

---

## Implementation Strategy

### MVP First (and only) Scope

1. Complete Phase 1: Setup (T001–T004).
2. Complete Phase 3: User Story 1 (T005–T015) — the nine file migrations, then CSS
   cleanup, then the regression test run.
3. Complete Phase 4: Polish (T016–T018) — build check, manual quickstart validation,
   dependency/CSS-framework audit.
4. Done — this feature has exactly one user story, so completing it is the entire
   deliverable (constitution Principle I: smallest solution that satisfies the
   requirement).

## Notes

- No `backend/` files are touched by any task (spec FR-004; constitution Principle IV).
- No dependency other than `tailwindcss`/`@tailwindcss/vite` is introduced (spec FR-006;
  constitution Principle IX, amended v1.2.0).
- No test file is created or modified — existing tests are verified (research.md) to be
  class-name-agnostic and serve as the regression gate (T001, T015).
- Commit after Setup (T001–T004), after the nine migrations + cleanup (T005–T015), and
  after Polish (T016–T018), per repository convention of small, traceable changes
  (constitution Principle VIII).

## Phase 5: Convergence

- [X] T019 Perform an actual visual/browser check (not just automated proxy checks) of the
      Portfolio Setup screen, the Portfolio Dashboard, both light and dark themes, and the
      holdings table at a narrow (<640px) width, and confirm no visually broken elements
      (missing spacing, unstyled/overlapping content, illegible text) per SC-002 (partial)

