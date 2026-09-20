# Phase 1 Data Model: Portfolio Switcher

This feature introduces **no new persisted entities** and **no changes to existing entity schemas**. It adds one read query over the existing `Portfolio` table and one piece of client-side (non-persisted-server-side) state.

## Portfolio (existing — unchanged)

Source: `backend/app/models/portfolio.py`

| Field | Type | Notes |
|---|---|---|
| `portfolioId` | string (PK) | Unchanged |
| `name` | string | Unchanged; used as the switcher's primary label (FR-002) |
| `currency` | string (`INR` \| `USD`) | Unchanged; used as the switcher's distinguishing detail (FR-010) |
| `createdAt` | datetime | Unchanged; used only to order the new list response (see research.md) |

**New usage**: A `list_portfolios(db) -> list[Portfolio]` service function performs `db.query(Portfolio).order_by(Portfolio.createdAt).all()` — a read-only query; no write path, validation rule, or lifecycle/state transition is added to this entity.

## Portfolio List Item (API response shape — reuses existing `Portfolio` schema)

Source: `backend/app/schemas/portfolio.py` (existing `Portfolio` Pydantic model, no changes needed)

| Field | Type |
|---|---|
| `portfolioId` | string |
| `name` | string |
| `currency` | string |

The new `GET /portfolios` endpoint returns `list[Portfolio]` using this existing model — see `contracts/openapi.yaml`.

## Portfolio Selection (client-side, non-persisted-server-side)

Not a backend entity. Represents the feature's "Portfolio Selection (session state)" key entity from spec.md, realized entirely in the frontend:

| Concept | Representation | Lifetime |
|---|---|---|
| Currently selected portfolio | `App.tsx` React state (`portfolioId: string`) | In-memory, for the current page load |
| Last-selected portfolio (for restore) | `localStorage["personal-wealth:lastPortfolioId"]` (string) | Persists across reloads and browser restarts on the same browser/device (per Clarifications Q2) |

**Transitions**:
- On selecting a portfolio in the switcher → both the in-memory state and the `localStorage` value are updated to that `portfolioId`.
- On app load → the `localStorage` value is read; if it matches a portfolio in the fetched list, it becomes the initial in-memory state; otherwise it is cleared and the fallback rule (FR-008/FR-009) applies: empty state if no portfolios exist, otherwise the first portfolio in the fetched list.
- On the fetched list becoming empty for a previously non-empty selection (portfolio no longer present) → the same stale-selection fallback applies (FR-009).

No validation rules apply to this client-side state beyond "must reference a `portfolioId` present in the most recently fetched list, or be absent."
