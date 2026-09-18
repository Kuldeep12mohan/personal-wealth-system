# Implementation Plan: Tailwind CSS UI Modernization

**Branch**: `003-tailwind-ui-modernization` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-tailwind-ui-modernization/spec.md`

## Summary

Replace the frontend's plain CSS (`frontend/src/index.css`, ~1080 lines) with Tailwind CSS
utility classes across every existing component and page, with no change to structure,
behavior, routing, data, or the backend. The existing design-token system (CSS custom
properties for spacing, color, radius, shadow, defined in `:root` and toggled via
`:root[data-theme="dark"]`, driven by the existing `useTheme` hook) is preserved as the
single source of truth for theme-aware colors; Tailwind utilities reference those tokens via
arbitrary-value syntax (e.g. `bg-[var(--color-surface)]`) so the existing light/dark toggle
continues to work unchanged, while spacing, typography, layout, borders, and shadows move to
standard Tailwind utility scales that already align closely with the existing token scale.
This is enabled by the constitution amendment (v1.2.0) naming Tailwind CSS as the approved
frontend styling exception.

## Technical Context

**Language/Version**: TypeScript (React 18, Vite 5) — no version change.

**Primary Dependencies**: Add `tailwindcss` v4 and `@tailwindcss/vite` as new frontend
dev dependencies (the constitution's one named exception, per amended Principle IX). No
other new dependency, UI library, or CSS framework is introduced.

**Storage**: N/A — no data/persistence change.

**Testing**: React Testing Library / Vitest (existing `frontend/tests/*.test.tsx`). Verified
that no existing test asserts on CSS class names — tests query by role, label, text, and
`data-label` attributes only — so no test file requires modification (spec FR-005).

**Target Platform**: Web (browser), same Vite dev/build/preview pipeline.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change is
frontend-only, touching styling and JSX class attributes only.

**Performance Goals**: N/A beyond existing — Tailwind's build-time purge keeps shipped CSS
comparable in size to the existing hand-written stylesheet.

**Constraints**: Must not change backend, APIs, database, or business logic (spec FR-004);
must not change existing behavior, layout structure, accessibility attributes, or
test-relevant selectors (spec FR-002, FR-003, FR-005); must not introduce any CSS framework
or UI library other than Tailwind CSS (spec FR-006, constitution Principle IX); must remove
now-dead plain CSS as each area is migrated (spec FR-007); must preserve existing responsive
behavior (spec FR-008).

**Scale/Scope**: All frontend presentational files: `App.tsx`, both pages
(`PortfolioSetupPage.tsx`, `PortfolioDashboardPage.tsx`), all five components
(`CreatePortfolioForm`, `AddInvestmentForm`, `RecordTransactionForm`, `UpdatePriceForm`,
`HoldingsTable`, `SummaryPanel`), and `index.css` (replaced by a minimal Tailwind entry point
plus the retained design-token `:root` blocks). No new components or routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS — no new entities, APIs, or screens; this is a like-for-like
  styling swap using the single approved new dependency (Tailwind CSS).
- **II. Maintainability Through Convention**: PASS — file/folder structure
  (`frontend/src/{components,pages}`) is unchanged; only class attributes and `index.css`
  content change.
- **III. Testability by Design**: PASS — existing tests are the acceptance mechanism (spec
  SC-001); no new business logic is introduced that would require new tests, and the plan
  confirms no existing test needs modification.
- **IV. Clear Frontend/Backend Separation**: PASS — purely a frontend presentation change;
  zero backend files touched.
- **V. API Contract Consistency**: PASS — no request/response schema changes.
- **VI. Explicit Business-Rule Validation**: N/A — no business rule changes.
- **VII. Requirement-to-Code Traceability**: PASS — traces to
  `specs/003-tailwind-ui-modernization/spec.md` (FR-001–FR-008).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — this plan follows
  Specification → Constitution Amendment → Plan → Tasks → Implementation → Tests, and the
  constitution amendment (v1.2.0) was completed first, specifically to authorize this change.
- **IX. Minimal Architecture, Dependencies & Infrastructure**: PASS (post-amendment) —
  Tailwind CSS is now the named, sole approved frontend styling exception; no other
  framework, library, or infrastructure is added.

No violations. Complexity Tracking section is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-tailwind-ui-modernization/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — N/A, no data model change
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — N/A, no API changes
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
└── (no changes)

frontend/
├── package.json                              # MODIFY: add tailwindcss, @tailwindcss/vite
├── vite.config.ts                            # MODIFY: register @tailwindcss/vite plugin
├── src/
│   ├── index.css                             # MODIFY: replace utility CSS with
│   │                                          #   `@import "tailwindcss";` + retained
│   │                                          #   `:root` / `:root[data-theme="dark"]`
│   │                                          #   design-token blocks only
│   ├── App.tsx                               # MODIFY: Tailwind utility classes
│   ├── pages/
│   │   ├── PortfolioSetupPage.tsx            # MODIFY: Tailwind utility classes
│   │   └── PortfolioDashboardPage.tsx        # MODIFY: Tailwind utility classes
│   └── components/
│       ├── CreatePortfolioForm.tsx           # MODIFY: Tailwind utility classes
│       ├── AddInvestmentForm.tsx             # MODIFY: Tailwind utility classes
│       ├── RecordTransactionForm.tsx         # MODIFY: Tailwind utility classes
│       ├── UpdatePriceForm.tsx               # MODIFY: Tailwind utility classes
│       ├── HoldingsTable.tsx                 # MODIFY: Tailwind utility classes
│       └── SummaryPanel.tsx                  # MODIFY: Tailwind utility classes
└── tests/                                    # NO CHANGES — verified no test asserts on
                                               #   CSS class names (queries use role/
                                               #   label/text/data-label only)
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per
constitution Principle II) is unchanged. This feature touches only frontend styling
(`index.css`) and JSX `className` attributes across existing files; no files are added,
removed, or relocated, and no `backend/` file is touched.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
