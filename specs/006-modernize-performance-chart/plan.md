# Implementation Plan: Modernize Performance History Chart

**Branch**: `006-modernize-performance-chart` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-modernize-performance-chart/spec.md`

## Summary

Refine `PerformanceHistoryChart.tsx` (introduced by `specs/005-portfolio-history-chart`) in place: add minimal reference labeling (start date, end date, min value, max value, per Clarifications), strengthen the visual distinction between the two lines beyond color, and restyle the empty/insufficient-history states to match the dashboard's existing card treatment. No data, API, entity, or dependency changes — this is a presentation-only refinement of one existing component, consuming the same `HistoryPoint[]` prop it already does.

## Technical Context

**Language/Version**: TypeScript (React 18, Vite) — frontend only; no backend change.

**Primary Dependencies**: React, Tailwind CSS (existing). No new dependency — the chart remains hand-rolled inline SVG, per constitution Principle IX and FR-009 (no interactivity, no charting library).

**Storage**: N/A — no data model change. The component continues to consume the existing `GET /portfolios/{portfolioId}/history` response shape (`recordedAt`, `totalInvested`, `currentValue`, `profitLoss`, `profitLossPercentage`) unmodified.

**Testing**: React Testing Library, extending `frontend/tests/PerformanceHistoryChart.test.tsx` with assertions for the new labeling and line-distinction behavior; existing `PortfolioDashboardPage.test.tsx` isolation tests are unaffected (same prop contract).

**Target Platform**: Web (browser), same as the rest of the frontend.

**Project Type**: Web application (existing `frontend/` + `backend/` split); this change touches `frontend/` only.

**Performance Goals**: N/A beyond existing chart responsiveness — rendering remains a single static SVG per portfolio view, no added computation of consequence (label formatting on an already-computed min/max/date range).

**Constraints**: Must not change the `HistoryPoint` prop shape, the API it's fetched from, or any backend code (FR-008). Must remain non-interactive — no tooltips, zoom, or hover-driven behavior (FR-009, constitution's chart exception as amended in v1.4.0). Must not introduce a new frontend dependency (constitution Principle IX). Must reuse the dashboard's existing card/spacing/typography conventions rather than defining a new visual language (FR-005).

**Scale/Scope**: One component modified (`PerformanceHistoryChart.tsx`), its existing test file extended, no other file requires a functional change. `PortfolioDashboardPage.tsx`'s existing card wrapper around the chart section is unaffected (already matches FR-005's card convention today).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS — smallest change that satisfies the spec: edits to one existing component, no new entities, endpoints, screens, or calculation model.
- **II. Maintainability Through Convention**: PASS — change stays within `frontend/src/components/PerformanceHistoryChart.tsx`, following the file's existing structure; no new files needed beyond the existing test file.
- **III. Testability by Design**: PASS (planned) — `PerformanceHistoryChart.test.tsx` is extended with tests for the new labeling and line-distinction behavior in the same change.
- **IV. Clear Frontend/Backend Separation**: PASS — purely a frontend presentational change; no backend code is touched, no business logic is added to the frontend (date/min/max formatting is display logic, not a business rule).
- **V. API Contract Consistency**: PASS — no API is added, removed, or reshaped; the component's consumption of the existing history endpoint is unchanged.
- **VI. Explicit Business-Rule Validation**: N/A — no business rule is introduced; this is a display-only change to already-validated data.
- **VII. Requirement-to-Code Traceability**: PASS — traces to `specs/006-modernize-performance-chart/spec.md` (FR-001–FR-009).
- **VIII. Safe, Controlled Incremental Specification Changes**: PASS — this plan follows Specification → Clarification → Plan → Tasks → Implementation → Tests, consistent with prior features.
- **IX. Minimal Architecture, Dependencies & Infrastructure**: PASS — no new dependency; the chart stays hand-rolled inline SVG and stays within the exact, narrow chart exception already recorded in the constitution (v1.4.0: "a single, non-interactive, portfolio-level, two-line... performance-history chart"). Adding static reference labels to that same chart does not change its interactive character and does not require a further amendment.

**Gate result**: PASS — no constitution amendment is required for this feature, unlike `specs/005-portfolio-history-chart`. This is the first feature since the v1.4.0 amendment to operate entirely within the now-current boundaries without needing to widen them further.

## Project Structure

### Documentation (this feature)

```text
specs/006-modernize-performance-chart/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output — N/A, no entities (see note below)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output — N/A, no API change (see note below)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

Note: `data-model.md` and `contracts/` are skipped for this feature (see Phase 1 below) — there is no data model or API surface change to document; the spec's own Assumptions section already states this explicitly (FR-008).

### Source Code (repository root)

```text
frontend/
├── src/
│   └── components/
│       └── PerformanceHistoryChart.tsx   # MODIFY: add reference labels (start/end date,
│                                          #         min/max value), strengthen line
│                                          #         distinction, restyle empty/insufficient
│                                          #         states to match dashboard card treatment
└── tests/
    └── PerformanceHistoryChart.test.tsx  # MODIFY: extend with assertions for the new
                                           #         labeling and line-distinction behavior
```

**Structure Decision**: Existing web application structure (`frontend/` + `backend/`, per constitution Principle II). This feature touches exactly one existing component and its existing test file — no new files, no new directories, no backend involvement.

## Complexity Tracking

*No entries — the Constitution Check above is a clean PASS with no violations to justify.*
