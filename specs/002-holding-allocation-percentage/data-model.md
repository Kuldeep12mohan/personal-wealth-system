# Phase 1 Data Model: Holding Allocation Percentage Indicator

No new entities, fields, or persisted data are introduced by this feature. This document records the one derived, presentation-only value added to the frontend.

## Existing Entities (unchanged)

- **Holding** — see `specs/001-wealth-management-poc/data-model.md`. Relevant existing field used as input: `currentValue` (= `quantity × currentPrice`).
- **Portfolio** — see `specs/001-wealth-management-poc/data-model.md`. Relevant existing value used as input: the portfolio summary's `currentValue` (= Σ `holding.currentValue` across all holdings in the portfolio), already returned by the existing `GET` portfolio-summary endpoint and already passed into `HoldingsTable` via `PortfolioDashboardPage`.

## Derived Value (frontend-only, not persisted, not returned by any API)

| Name | Type | Computation | Notes |
|------|------|-------------|-------|
| `allocationPercentage` | number (percentage, 0–100) | `portfolioCurrentValue > 0 ? (holding.currentValue / portfolioCurrentValue) * 100 : 0` | Computed client-side in `HoldingsTable.tsx`; guarded against division by zero (spec FR-004). Displayed rounded to 1 decimal place next to the holding's Current Value (spec FR-002, FR-003). |

**Validation rules**: None new — the value is purely derived from already-validated `currentValue` fields; no user input is collected for this indicator.

**State transitions**: None — the value is recalculated on every render from the holdings/summary data already loaded, and updates whenever the dashboard's existing refresh logic re-fetches that data (spec FR-008).
