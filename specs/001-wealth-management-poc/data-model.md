# Phase 1 Data Model: Personal Wealth Management System POC

Source: spec.md Key Entities, Functional Requirements FR-001–FR-021, and
research.md decisions (identifier format, rounding, currency list). Three
entities only, per Constitution Technology & Scope Boundaries.

## Entity: Portfolio

| Field | Type | Rules |
|---|---|---|
| `portfolioId` | string, e.g. `PORT-10001` | Primary key. Auto-generated (research.md: autoincrement + prefix), immutable. |
| `name` | string | Required, non-empty (FR-001, FR-003). |
| `currency` | string enum | Required; MUST be one of the supported codes (`INR`, `USD` — research.md); reject otherwise (FR-001, FR-003). |
| `createdAt` | timestamp | Set automatically on creation; immutable. |

**Relationships**: One `Portfolio` has many `Holding` (1:N). No delete/rename operation exists in this feature's scope (spec.md Assumptions).

**Validation summary** (FR-003): reject creation if `name` or `currency` missing, or `currency` not in the supported list — no partial record is persisted.

## Entity: Holding

| Field | Type | Rules |
|---|---|---|
| `holdingId` | string, e.g. `HOLD-20001` | Primary key. Auto-generated, immutable. |
| `portfolioId` | string (FK → Portfolio) | Required; the referenced portfolio MUST exist (FR-007). |
| `name` | string | Required, non-empty (FR-004, FR-007). |
| `symbol` | string | Required, non-empty (FR-004, FR-007). Duplicate symbols within the same portfolio are allowed and create a separate holding (FR-007, clarified in spec.md). |
| `type` | string enum | One of `STOCK`, `MUTUAL_FUND`, `ETF` (FR-005); reject any other value. |
| `currentPrice` | decimal(≤ any, stored @ 2dp) | Defaults to `0` at creation (FR-006a); updated only via the explicit price-update operation (FR-013, FR-014); MUST be > 0 when updated. |
| `createdAt` | timestamp | Set automatically on creation; immutable. |

**Derived (not stored — computed from Transactions)**:
- `quantity` = running total of BUY quantities − SELL quantities across this holding's transactions (FR-012).
- `averagePurchasePrice` = (sum of BUY transaction values) ÷ (sum of BUY quantities), unaffected by SELL transactions (FR-012a, clarified in spec.md). Undefined/zero when no BUY transactions exist yet.
- `currentValue` = `quantity` × `currentPrice` (FR-016).

**Relationships**: One `Holding` belongs to one `Portfolio`; one `Holding` has many `Transaction` (1:N).

**Validation summary** (FR-007): reject creation if `name` or `symbol` missing, `type` unsupported, or `portfolioId` does not reference an existing portfolio.

## Entity: Transaction

| Field | Type | Rules |
|---|---|---|
| `transactionId` | string, e.g. `TXN-30001` | Primary key. Auto-generated, immutable. |
| `holdingId` | string (FK → Holding) | Required; the referenced holding MUST exist (FR-010). |
| `type` | string enum | `BUY` or `SELL` (FR-010); reject any other value. |
| `quantity` | decimal (4dp) | Required, MUST be > 0 (FR-010). |
| `price` | decimal (2dp) | Required, MUST be > 0 (FR-010). Field name `price` maps to "price per unit" in the spec. |
| `transactionDate` | date | Required. |
| `createdAt` | timestamp | Set automatically on creation; immutable. |

**Derived (not stored)**:
- `value` = `quantity` × `price` (FR-009).

**Relationships**: Each `Transaction` belongs to exactly one `Holding`.

**Validation summary** (FR-010, FR-011): reject if `quantity` ≤ 0, `price` ≤ 0, `type` not BUY/SELL, or `holdingId` does not exist. Additionally, reject a SELL whose `quantity` exceeds the holding's currently-derived `quantity` at the time of submission (FR-011) — the held quantity is unchanged by a rejected transaction.

## Entity Relationship Summary

```text
Portfolio (1) ──< (N) Holding (1) ──< (N) Transaction
```

## Portfolio Summary (derived, not a stored entity)

Computed on demand for a given `portfolioId` (FR-017, FR-018):

- `totalInvested` = Σ(BUY transaction values across all holdings) − Σ(SELL transaction values across all holdings).
- `currentValue` = Σ(holding.quantity × holding.currentPrice) across all holdings in the portfolio.
- `profitLoss` = `currentValue` − `totalInvested`.
- `profitLossPercentage` = (`profitLoss` ÷ `totalInvested`) × 100 (undefined/zero when `totalInvested` is 0 — see spec.md Edge Cases).

All monetary results are rounded to 2 decimal places; all quantity results to 4 decimal places (FR-019a).

## State Notes

- No entity in this feature supports update-in-place except `Holding.currentPrice` (via the dedicated price-update operation) — `Portfolio` and the rest of `Holding`/`Transaction` fields are write-once after creation, consistent with spec.md Assumptions (no delete/rename operations in scope).
- There is no soft-delete, versioning, or audit trail — out of scope per Constitution Technology & Scope Boundaries and spec.md FR-026.
