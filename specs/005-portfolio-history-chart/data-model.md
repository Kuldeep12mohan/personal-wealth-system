# Phase 1 Data Model: Portfolio Performance History Chart

## Entity: PortfolioHistoryPoint

Represents a portfolio's total invested amount and total current value at one specific moment, captured automatically as a side effect of a price update or a transaction. Append-only: rows are never updated or deleted by this feature.

| Field | Type | Notes |
|---|---|---|
| `historyPointId` | String (PK) | Generated the same way as other entity IDs (`app.services.ids`), consistent with `portfolioId`/`holdingId`/`transactionId`. |
| `portfolioId` | String (FK → `portfolios.portfolioId`) | The portfolio this point belongs to. Required. |
| `totalInvested` | Numeric | Same aggregation as `summary_service.get_portfolio_summary`'s `totalInvested`, rounded via `app.services.rounding.round_money`. |
| `currentValue` | Numeric | Same aggregation as `summary_service.get_portfolio_summary`'s `currentValue`, rounded via `round_money`. |
| `recordedAt` | DateTime (UTC) | Set at creation time (`datetime.now(timezone.utc)`), matching the `createdAt` convention used by `Portfolio`/`Transaction`. This is the ordering key for the time series (FR-004). |

**Relationships**: Many `PortfolioHistoryPoint` rows belong to one `Portfolio` (no cascade delete needed yet — no portfolio-delete capability exists in the system per spec.md Edge Cases).

**Derived fields (computed at read time, not stored)**:
- `profitLoss` = `currentValue - totalInvested`, rounded via `round_money` — same formula as `summary_service`.
- `profitLossPercentage` = `0` if `totalInvested == 0`, else `round_money((profitLoss / totalInvested) * 100)` — identical formula to `summary_service.get_portfolio_summary`, per FR-008.

**Validation rules**: None beyond what's implied by the FK and NOT NULL constraints above — this entity has no user-supplied input; it is only ever written by `history_service.record_history_point`, never directly by an API caller.

**State transitions**: None — a `PortfolioHistoryPoint` is immutable once created (created → exists; no other states).

## Unaffected existing entities

`Portfolio`, `Holding`, and `Transaction` are unchanged by this feature — no new columns, no schema migration for existing tables. `PortfolioHistoryPoint` is a purely additive new table.
