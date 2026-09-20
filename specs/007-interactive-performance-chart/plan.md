# Implementation Plan: Interactive Performance History Chart

**Branch**: `007-interactive-performance-chart` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-interactive-performance-chart/spec.md`

## Summary

Rework `PerformanceHistoryChart.tsx` (last touched by `specs/006-modernize-performance-chart`) into an interactive chart: currency-formatted Y-axis labels with subtle horizontal gridlines, a fixed 4-6-label evenly-spaced X-axis (always including first/last dates), always-visible color-coded (gain/loss/neutral) point markers, and a hover (desktop) / tap (mobile) tooltip showing date, current value, invested amount, and profit/loss per point. Implemented entirely with hand-rolled inline SVG + React state (no charting library, no new dependency) and native `Intl.NumberFormat` for currency, threading the already-known portfolio currency down from `App.tsx` as a new prop — no backend or API change. This requires a constitution amendment removing the "non-interactive" qualifier from the existing chart exception (v1.4.0), a larger governance change than any prior chart feature, which the project owner has explicitly reviewed and accepted proceeding with (see Constitution Check).

## Technical Context

**Language/Version**: TypeScript (React 18, Vite) — frontend only; no backend change.

**Primary Dependencies**: React, Tailwind CSS (existing). No new dependency — interactivity (hover/tap state, tooltip positioning) is implemented with React state and inline SVG event handlers; currency formatting uses the browser-native `Intl.NumberFormat` API, not a library.

**Storage**: N/A — no data model change. The component continues to consume the existing `GET /portfolios/{portfolioId}/history` response shape unmodified (FR-011); profit/loss per point continues to be derived client-side from `totalInvested`/`currentValue`, as it already is.

**Testing**: React Testing Library, replacing/extending `frontend/tests/PerformanceHistoryChart.test.tsx` with assertions for axis labels, gridlines, point marker colors, hover/tap tooltip content and dismissal, and currency formatting; `PortfolioDashboardPage.test.tsx` extended to pass a currency prop through.

**Target Platform**: Web (browser, desktop and mobile viewports), same as the rest of the frontend.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change touches `frontend/` only.

**Performance Goals**: N/A beyond existing chart responsiveness — rendering remains a single static SVG plus lightweight hover/tap state per portfolio view; no measurable performance target given the app's single-user, low-volume usage pattern (per constitution and prior features' Assumptions).

**Constraints**: Must not change the `HistoryPoint` prop shape, the API it's fetched from, or any backend code (FR-011). Must not introduce a new frontend dependency (constitution Principle IX) — interactivity and currency formatting use only React and browser-native APIs. Must preserve the existing card layout/spacing/typography established by `specs/006-modernize-performance-chart` (FR-009). Requires threading the portfolio's currency code from `App.tsx` (where the full `Portfolio[]` list, including `currency`, is already fetched) down through `PortfolioDashboardPage.tsx` to the chart — an additive prop-threading change, no new fetch or endpoint.

**Scale/Scope**: One component substantially reworked (`PerformanceHistoryChart.tsx`), its existing test file extended, two files updated to thread the new `currency` prop (`App.tsx`, `PortfolioDashboardPage.tsx`). No backend files, no new entities, no new endpoints.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: **CONDITIONAL PASS** — no new entities, endpoints, or screens; the change is scoped to one component plus prop-threading. It does, however, add meaningfully more behavior (interactivity) to the one calculation/chart model already approved, which is the subject of the amendment below.
- **II. Maintainability Through Convention**: PASS — change stays within `frontend/src/components/PerformanceHistoryChart.tsx` and its existing test file, plus additive prop changes in `App.tsx`/`PortfolioDashboardPage.tsx` following existing prop-drilling conventions already used for `portfolioId`.
- **III. Testability by Design**: PASS (planned) — `PerformanceHistoryChart.test.tsx` is extended with tests for every new visual/interactive behavior in the same change.
- **IV. Clear Frontend/Backend Separation**: PASS — purely frontend; profit/loss derivation logic is unchanged (already computed by the backend's history endpoint per `specs/005`), the frontend only formats and displays it. No business rule is added to the frontend.
- **V. API Contract Consistency**: PASS — no API is added, removed, or reshaped; the component's consumption of the existing history endpoint is unchanged (FR-011).
- **VI. Explicit Business-Rule Validation**: N/A — no new business rule; gain/loss/neutral classification for marker color is a direct, non-configurable comparison (`currentValue` vs `totalInvested`) of already-validated data.
- **VII. Requirement-to-Code Traceability**: PASS — traces to `specs/007-interactive-performance-chart/spec.md` (FR-001–FR-012).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — follows Specification → Clarification → Plan → Tasks → Implementation → Tests, consistent with prior features.
- **IX. Minimal Architecture, Dependencies & Infrastructure**: **CONDITIONAL PASS** — no new dependency is introduced (hand-rolled SVG + native `Intl.NumberFormat`, consistent with `specs/005`/`specs/006`'s precedent), but this feature requires removing the word "non-interactive" from the chart exception the constitution currently names, and reopening (for this one chart only) the "interactive or advanced charts (zoom, tooltips, ...)" Out-of-Scope exclusion that `specs/006` deliberately stayed inside just one feature ago. This is a materially larger governance change than any prior chart-related amendment (005 widened counts; 006 added nothing to amend) and requires a `/speckit-constitution` run before `/speckit-implement` completes the corresponding tasks.

**Gate result**: PASS, conditional on the constitution amendment tracked in Complexity Tracking being carried out (via `/speckit-constitution`) before `/speckit-implement` completes the corresponding tasks. The project owner was explicitly presented with this trade-off — including that it reverses `006`'s deliberate non-interactive choice — and chose to proceed rather than route through `/speckit-assess-decide` first or scale the feature back to stay non-interactive. This is treated here as a known, accepted condition, not an open risk.

## Project Structure

### Documentation (this feature)

```text
specs/007-interactive-performance-chart/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output — N/A, no entities (see note below)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output — N/A, no API change (see note below)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

Note: `data-model.md` and `contracts/` are skipped — no entity or API surface change (FR-011); the spec's own Key Entities section already states this explicitly.

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── App.tsx                             # MODIFY: pass the selected portfolio's
│   │                                        #         currency down to PortfolioDashboardPage
│   ├── pages/
│   │   └── PortfolioDashboardPage.tsx      # MODIFY: accept and forward the new
│   │                                        #         currency prop to PerformanceHistoryChart
│   └── components/
│       └── PerformanceHistoryChart.tsx     # MODIFY: add currency-formatted Y-axis +
│                                            #         gridlines, fixed evenly-spaced X-axis
│                                            #         labels, always-visible color-coded
│                                            #         point markers, hover/tap tooltip
└── tests/
    ├── PerformanceHistoryChart.test.tsx    # MODIFY: extend with axis/gridline/marker/
    │                                        #         tooltip assertions
    └── PortfolioDashboardPage.test.tsx     # MODIFY: seed a currency in fetch mocks,
                                             #         confirm it reaches the chart
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per constitution Principle II). This feature reworks one existing component and threads one new prop through two existing files — no new files, no new directories, no backend involvement.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Removing the "non-interactive" qualifier from the constitution's chart exception, reopening part of the "interactive or advanced charts" Out-of-Scope exclusion | The spec's core requested capability (User Story 1: inspect exact date/value/P&L for any point via hover/tap) is inherently interactive; there is no way to satisfy FR-006/FR-007 (hover and tap tooltips) while the chart remains non-interactive as currently constitutionally required | Keeping the chart non-interactive (the alternative explicitly offered to and declined by the project owner during `/speckit-plan`) was rejected because it would mean not building the feature as specified — the tooltip-on-demand capability is the spec's primary requested value, not an optional enhancement |

**Required companion action**: Run `/speckit-constitution` to record this amendment — removing "non-interactive" from the Technology & Scope Boundaries' Out-of-Scope bullet's chart exception (or narrowing it to name this specific interaction pattern: hover/tap tooltips and always-visible point markers, still excluding zoom and custom date-range filtering, which this spec does not request) — before `/speckit-implement` completes the corresponding tasks.
