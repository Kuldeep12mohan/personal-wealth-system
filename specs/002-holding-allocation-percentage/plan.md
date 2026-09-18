# Implementation Plan: Holding Allocation Percentage Indicator

**Branch**: `002-holding-allocation-percentage` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-holding-allocation-percentage/spec.md`

## Summary

Show each holding's allocation percentage (its current value ÷ the portfolio's total current value × 100) directly next to that holding's Current Value on the Portfolio Dashboard's holdings table. The calculation and a separate "Allocation %" column already exist in `HoldingsTable.tsx` (with a progress bar) from a prior increment; this change repositions/restates that percentage as a small inline indicator beside the Current Value cell instead of (or in addition to) a standalone column, per the spec's "next to the holding value" requirement. No backend, API, or data-model changes are needed — `currentValue` (per holding) and the portfolio's `currentValue` (from the summary endpoint) are already fetched and passed into the table today.

## Technical Context

**Language/Version**: TypeScript (React 18, Vite) — per constitution Technology & Scope Boundaries; no version change.

**Primary Dependencies**: React, plain CSS (no additional UI/state-management libraries per constitution Principle IX).

**Storage**: N/A — no persistence change; all data already available client-side from existing `GET holdings` and `GET portfolio summary` API responses.

**Testing**: React Testing Library / Vitest (existing `frontend/tests/*.test.tsx` pattern).

**Target Platform**: Web (browser), served by the existing Vite frontend.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change is frontend-only.

**Performance Goals**: N/A beyond existing dashboard render performance — indicator is a pure, synchronous client-side computation over already-loaded data (no new network calls).

**Constraints**: Must not change backend APIs, data contracts, or existing UI structure/navigation (spec FR-006, FR-007; constitution Principles IV, V, IX). Must remain within the existing 2-screen UI scope (constitution "UI Scope").

**Scale/Scope**: Single component (`HoldingsTable.tsx`) and its test file; no new components, routes, or entities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS — smallest possible change (adjust presentation of an already-computed value); no new entities, APIs, or screens.
- **II. Maintainability Through Convention**: PASS — stays within `frontend/src/components/`; no new naming introduced beyond the existing `allocationPercentage`/`currentValue` fields.
- **III. Testability by Design**: PASS (planned) — existing/updated React Testing Library tests will cover the inline percentage display and the zero-total-value edge case, added in the same change.
- **IV. Clear Frontend/Backend Separation**: PASS — the percentage is a presentation-only derived value already computed client-side from data the backend already returns; no business rule is added to the frontend beyond formatting/display.
- **V. API Contract Consistency**: PASS — no request/response schema changes.
- **VI. Explicit Business-Rule Validation**: N/A — no new business rule; existing zero-division guard (`portfolioCurrentValue > 0 ? ... : 0`) is reused.
- **VII. Requirement-to-Code Traceability**: PASS — traces to `specs/002-holding-allocation-percentage/spec.md` (FR-001–FR-008).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — this plan follows Specification → Plan → Tasks → Implementation → Tests as required for changes to already-implemented behavior (the existing allocation-percentage column).
- **IX. Minimal Architecture, Dependencies & Infrastructure**: PASS — no new dependencies; plain CSS only.

No violations. Complexity Tracking section is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-holding-allocation-percentage/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — N/A, no API changes
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
└── (no changes)

frontend/
├── src/
│   └── components/
│       └── HoldingsTable.tsx        # MODIFY: move/restate allocation % inline next to Current Value
└── tests/
    └── HoldingsTable.test.tsx       # ADD: unit tests for the inline allocation indicator (new file;
                                      #      no existing dedicated test file for this component today)
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per constitution Principle II). This change touches only `frontend/src/components/HoldingsTable.tsx` and adds `frontend/tests/HoldingsTable.test.tsx`; `PortfolioDashboardPage.tsx` already passes `portfolioCurrentValue` into `HoldingsTable` and needs no change. No backend files are touched.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
