# Implementation Plan: Portfolio Switcher

**Branch**: `004-portfolio-switcher` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-portfolio-switcher/spec.md`

## Summary

Replace the dashboard's manual "type a Portfolio ID" text field with a real portfolio switcher: a new `GET /portfolios` backend endpoint lists every existing portfolio (`portfolioId`, `name`, `currency`), and the frontend renders that list as a selectable dropdown in the sidebar. Selecting an entry updates the dashboard in place; the chosen `portfolioId` is persisted to the browser's `localStorage` so it is restored automatically on return, with graceful fallback to an empty state (no portfolios), auto-selection (exactly one portfolio), or the next available portfolio (previously selected one no longer exists). This requires one new API endpoint beyond the constitution's currently-fixed set of six, which must be approved via a companion constitution amendment (see Constitution Check and Complexity Tracking below), mirroring the precedent set for the Tailwind CSS styling exception.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI backend) and TypeScript (React 18, Vite) — per constitution Technology & Scope Boundaries; no version change.

**Primary Dependencies**: FastAPI, SQLAlchemy (backend); React, Tailwind CSS (frontend). No new dependencies — the switcher is a `<select>`-based control built with existing UI primitives, and "remember last selection" uses the browser's native `localStorage` API (no new library per constitution Principle IX).

**Storage**: SQLite via the existing `Portfolio` table — no schema change; the new endpoint only reads existing rows (`portfolioId`, `name`, `currency`). Client-side: `localStorage` holds a single string key for the last-selected `portfolioId`.

**Testing**: Pytest contract test for the new `GET /portfolios` endpoint (`backend/tests/contract/`); React Testing Library tests for the new switcher component and updated `App.tsx` selection/persistence/fallback behavior (`frontend/tests/`).

**Target Platform**: Web (browser), served by the existing Vite frontend and FastAPI backend.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change touches both.

**Performance Goals**: N/A beyond existing dashboard responsiveness — the portfolio list is expected to be small (POC scale); no pagination/search is required (per Clarifications).

**Constraints**: Must not change the 5 existing endpoints' request/response shapes (constitution Principle V); the one new endpoint MUST be the minimum surface needed (list only, no filtering/sorting params) and MUST be reflected as an explicit constitution amendment before/alongside implementation (constitution Principle VIII, Governance). Must remain within the existing 2-screen UI scope — the switcher lives inside the existing sidebar/dashboard, it does not introduce a third screen.

**Scale/Scope**: One new backend endpoint + service function; one new frontend switcher component; modifications to `App.tsx` (selection/persistence state) and `frontend/src/services/api.ts` (new `listPortfolios` call). No new entities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS — smallest change that satisfies the spec: one read-only endpoint, one new component, no new entities or calculation model.
- **II. Maintainability Through Convention**: PASS — new endpoint lives in `backend/app/api/portfolios.py` alongside the existing portfolio routes; new service function in `backend/app/services/portfolio_service.py`; frontend switcher follows the existing `frontend/src/components/` + `services/api.ts` pattern. Field names (`portfolioId`, `name`, `currency`) match existing conventions exactly.
- **III. Testability by Design**: PASS (planned) — a new contract test for `GET /portfolios` and new/updated frontend tests for the switcher (list rendering, selection, empty state, single-portfolio auto-select, stale-selection fallback, load-error state) are added in the same change.
- **IV. Clear Frontend/Backend Separation**: PASS — the backend owns portfolio enumeration (a plain read from the `Portfolio` table, no calculation); the frontend only renders the list and manages which one is currently displayed. No business rule crosses the boundary.
- **V. API Contract Consistency**: PASS for the 5 existing endpoints (unchanged). The **new** `GET /portfolios` endpoint is introduced consistently across spec, backend, and frontend in this same change (see Complexity Tracking for the constitution amendment this requires).
- **VI. Explicit Business-Rule Validation**: N/A — no new business rule; listing portfolios has no validation beyond "return what exists."
- **VII. Requirement-to-Code Traceability**: PASS — traces to `specs/004-portfolio-switcher/spec.md` (FR-001–FR-011).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — this plan follows Specification → Clarification → Plan → Tasks → Implementation → Tests, and the new endpoint was explicitly raised and approved in `/speckit-clarify` (see spec.md Clarifications) rather than introduced silently in code.
- **IX. Minimal Architecture, Dependencies & Infrastructure**: **CONDITIONAL PASS** — no new frameworks, libraries, or infrastructure are introduced (native `localStorage`, existing stack only), but the "exactly six endpoints" boundary in Technology & Scope Boundaries is exceeded by one. This is flagged in Complexity Tracking below and requires a `/speckit-constitution` amendment (bumping the endpoint count and adding this endpoint to the enumerated list) before or alongside implementation, exactly as was done for the Tailwind CSS exception (1.1.0 → 1.2.0).

**Gate result**: PASS, conditional on the constitution amendment tracked in Complexity Tracking being carried out (via `/speckit-constitution`) before `/speckit-implement` marks the corresponding task complete.

## Project Structure

### Documentation (this feature)

```text
specs/004-portfolio-switcher/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — new endpoint delta only
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── portfolios.py            # MODIFY: add GET /portfolios (list) route
│   ├── schemas/
│   │   └── portfolio.py             # MODIFY: add PortfolioListItem (or reuse Portfolio) response model
│   └── services/
│       └── portfolio_service.py     # MODIFY: add list_portfolios(db) -> list[Portfolio]
└── tests/
    └── contract/
        └── test_list_portfolios.py  # ADD: contract test for GET /portfolios

frontend/
├── src/
│   ├── App.tsx                      # MODIFY: replace manual ID text input with switcher; own
│   │                                 #         selection state, localStorage persistence, fallback logic
│   ├── components/
│   │   └── PortfolioSwitcher.tsx    # ADD: dropdown listing portfolios, empty/error states
│   └── services/
│       └── api.ts                   # MODIFY: add listPortfolios()
└── tests/
    ├── PortfolioSwitcher.test.tsx   # ADD: list rendering, selection, empty/error states
    └── App.test.tsx                 # ADD (or extend existing coverage): persistence + fallback behavior
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per constitution Principle II). This feature adds exactly one backend endpoint/service function and one frontend component, and modifies `App.tsx` and `api.ts` to use them in place of the manual ID field. No new entities, screens, or directories are introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| A 7th API endpoint (`GET /portfolios`), exceeding the constitution's "exactly six endpoints" boundary | A portfolio switcher cannot list real portfolios to choose from without a way to fetch them; this was evaluated and approved during `/speckit-clarify` (see spec.md Clarifications, Q1) as the only way to deliver "browse and pick a portfolio" without hardcoding or guessing IDs | Reusing an existing endpoint's response shape to smuggle in the list (e.g., embedding it in the summary response) was rejected because it conflates two unrelated concerns (one portfolio's summary vs. all portfolios) and would violate Principle V (API Contract Consistency) more than adding one clearly-scoped endpoint does; dropping the feature to only improve ID-entry persistence (no real list) was rejected because it fails the feature's core request (a real switcher) |

**Required companion action**: Run `/speckit-constitution` to record this as an approved, scoped amendment (analogous to the Tailwind CSS exception in v1.2.0) — updating the "APIs: exactly the six endpoints..." bullet in Technology & Scope Boundaries to enumerate this 7th endpoint — before `/speckit-implement` completes the corresponding backend task.
