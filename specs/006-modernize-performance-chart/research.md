# Phase 0 Research: Modernize Performance History Chart

No `NEEDS CLARIFICATION` markers remain in the Technical Context (resolved during `/speckit-specify` and `/speckit-clarify`). This document records the implementation-approach decisions needed before touching the component.

## Decision: Keep the fix scoped to `PerformanceHistoryChart.tsx` only

- **Decision**: All visual changes (labeling, line distinction, empty/insufficient-state styling) are made inside the existing component; `PortfolioDashboardPage.tsx`'s surrounding card wrapper (`cardBase`/`cardHeader`/`cardTitle` classes) is left untouched, since it already applies the same card/spacing/heading treatment used by the Portfolio Summary and Holdings sections (FR-005).
- **Rationale**: The user's own instruction and spec Assumptions both scope this to "the Performance chart" specifically; the dashboard page already wraps the chart in the correct card convention, so no page-level change is needed to satisfy FR-005 — only the chart's *internal* empty/insufficient-history messages need restyling to match that same card language, since they currently render their own independent bordered `<p>` block instead of feeling like part of one coherent section (per User Story 3).
- **Alternatives considered**: Restructuring `PortfolioDashboardPage.tsx`'s section wrapper was rejected — the wrapper already satisfies FR-005; touching it would violate the "avoid unnecessary changes to other parts of the application" instruction and constitution Principle I's smallest-change preference.

## Decision: Minimal reference labels — start date, end date, min value, max value only

- **Decision**: Render four small text labels positioned at the chart's plot-area corners (top: max value; bottom: min value; left: start date; right: end date), computed directly from the existing `history` array (`history[0].recordedAt`, `history[history.length - 1].recordedAt`, and `Math.min`/`Math.max` over the already-computed value arrays) — no new data fetching or computation beyond what the component already derives for scaling the lines.
- **Rationale**: Matches the Clarification answer (Option A: minimal labeling) — avoids the complexity of computing evenly-spaced intermediate ticks (which would require a date-bucketing/formatting scheme not otherwise needed) while still satisfying FR-003.
- **Alternatives considered**: Multiple evenly-spaced date ticks and value gridlines (Clarification Option B) was explicitly not chosen — it would add meaningfully more layout logic for a static, minimal-appetite polish pass.

## Decision: Distinguish lines by width and style, not only color, using existing tokens

- **Decision**: Keep the existing dash-pattern distinction (solid "current value" line vs. dashed "invested amount" line) already present in the component, and slightly increase the visual weight/contrast between them (e.g., a slightly heavier stroke for the primary "current value" line) using only existing CSS custom properties (`var(--color-primary)`, `var(--color-text-muted)`) — no new color tokens are introduced.
- **Rationale**: FR-001 requires distinction beyond color alone; the dash pattern already satisfies this today, so this decision is about reinforcing it (weight/contrast) rather than inventing a new mechanism, keeping the change small per Principle I.
- **Alternatives considered**: Adding point markers (dots) at each data point was considered for extra distinction but rejected as unnecessary given the dash pattern already resolves FR-001, and markers would add visual noise on portfolios with many history points (per spec Edge Cases).

## Decision: Restyle empty/insufficient-history states to reuse the chart's own container instead of a standalone bordered paragraph

- **Decision**: Replace the current independent bordered `<p>` blocks (used for 0 and 1-point states) with a treatment that reads as part of the same section as the eventual chart (consistent padding/typography, no redundant inner border since the outer dashboard card already provides one).
- **Rationale**: Directly addresses User Story 3 / FR-007 — these states currently look like disconnected placeholder text rather than a deliberate part of the section.
- **Alternatives considered**: Leaving the current bordered-box treatment unchanged was rejected because it's the specific issue User Story 3 calls out; a full redesign with icons/illustrations was rejected as disproportionate to a "minimal, focused" polish pass.
