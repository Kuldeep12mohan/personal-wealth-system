# Phase 0 Research: Portfolio Performance History Chart

No `NEEDS CLARIFICATION` markers remain in the Technical Context (all resolved during `/speckit-specify` and `/speckit-clarify`). This document records the small set of implementation-approach decisions needed before design.

## Decision: Reuse existing summary calculation for history-point values

- **Decision**: `history_service.record_history_point(db, portfolio_id)` computes `totalInvested` and `currentValue` by calling the same aggregation logic already used in `summary_service.get_portfolio_summary` (iterate holdings → transactions for invested amount; iterate holdings → held quantity × currentPrice for current value), rather than introducing a second calculation path.
- **Rationale**: Constitution Principle II (Maintainability Through Convention) requires business logic to live in `services/` and never be duplicated; Principle IV requires the frontend to never compute this. Reusing the existing aggregation guarantees the history chart's numbers can never drift from the live summary panel's numbers.
- **Alternatives considered**: Writing a second, independent aggregation inside `history_service` was rejected — it would duplicate logic that already exists in `summary_service`/`holding_calculations` and risks the two diverging over time, exactly the failure mode Principle II calls out.

## Decision: Capture history as a side effect inside existing service functions, not new API calls

- **Decision**: `holding_service.update_current_price(...)` and `transaction_service.record_transaction(...)` each call `history_service.record_history_point(db, portfolio_id)` after their existing write succeeds, within the same database session/transaction.
- **Rationale**: FR-001/FR-002 require automatic capture with no extra user action; doing this inside the existing service functions (rather than requiring the frontend to make a second call) keeps the frontend free of business logic (Principle IV) and guarantees capture cannot be skipped by a caller that forgets to invoke a separate "snapshot" endpoint.
- **Alternatives considered**: A frontend-triggered explicit "record snapshot" call after each mutation was rejected — it reintroduces the manual-step problem the spec explicitly rules out (User Story 2), and would let history silently fall out of sync with actual mutations if the second call ever failed or was omitted.

## Decision: Hand-rolled inline SVG chart, no charting library

- **Decision**: `PerformanceHistoryChart.tsx` computes simple linear-scale point coordinates itself and renders two `<polyline>` elements (current value, invested amount) inside an inline `<svg>`, styled with existing Tailwind utility classes.
- **Rationale**: Constitution Principle IX names Tailwind as "the sole approved exception to an otherwise closed stack"; adding a charting library would be a second dependency exception, a materially larger ask than what `.specify/assessments/performance-chart/concept.md` (Option A) recommended and the project owner accepted.
- **Alternatives considered**: A charting library (e.g., Recharts) was evaluated in the concept-shaping assessment as Option B and explicitly not recommended, given the added dependency risk against Principle IX for a two-line, non-interactive chart that doesn't need the library's interactivity features.

## Decision: History storage shape — one row per event, unbounded, append-only

- **Decision**: `PortfolioHistoryPoint` has exactly the fields needed to reconstruct value and P&L at that instant: `historyPointId`, `portfolioId`, `totalInvested`, `currentValue`, `recordedAt`. No `profitLoss`/`profitLossPercentage` columns are stored — they are derived at read time from the two stored numbers (per FR-008 and spec.md Assumptions).
- **Rationale**: Matches the existing convention of storing minimal source-of-truth numbers and deriving presentation values at read time (see `summary_service.get_portfolio_summary`, which derives `profitLoss`/`profitLossPercentage` from `totalInvested`/`currentValue` rather than storing them). Keeps the new table's schema minimal per Principle I.
- **Alternatives considered**: Storing derived P&L columns alongside the raw numbers was rejected as redundant data that could drift from the derivation formula if the formula ever changes (rounding rules, etc.) — a single source of truth is simpler and safer.
