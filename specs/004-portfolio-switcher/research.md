# Phase 0 Research: Portfolio Switcher

All Technical Context fields were resolvable directly from the constitution and the existing codebase — no `NEEDS CLARIFICATION` markers remain. This document records the decisions behind the plan's choices.

## Decision: List endpoint shape

**Decision**: Add `GET /portfolios` returning `Portfolio[]` (`portfolioId`, `name`, `currency`) — the exact same shape already returned by `POST /portfolios`, no new schema.

**Rationale**: `backend/app/schemas/portfolio.py` already defines a `Portfolio` Pydantic model used by the create endpoint. Reusing it avoids introducing a new response shape, keeps FR-010's "distinguishing detail" (currency) available for free, and requires no new SQLAlchemy query beyond `db.query(Portfolio).all()` via a new `list_portfolios(db)` service function alongside the existing `get_portfolio`/`create_portfolio` functions in `portfolio_service.py`.

**Alternatives considered**:
- A dedicated `PortfolioListItem` schema with extra fields (e.g., holdings count) — rejected as unnecessary; the spec's distinguishing-detail requirement (FR-010) is satisfied by `currency` alone, and adding a holdings count would require a join/aggregate query the spec does not ask for.
- Adding a `?portfolioIds=` filter or pagination params — rejected per Clarifications Q3 (no search/filter/pagination in scope for this POC).

## Decision: Ordering of returned portfolios

**Decision**: Return portfolios ordered by `createdAt` ascending (creation order), matching SQLAlchemy's default row order for this table with no explicit `ORDER BY` surprises.

**Rationale**: The spec does not require a specific sort order (no clarification was raised on this because it's low-impact), and creation order is the simplest, most predictable default — new portfolios naturally appear at the end of the list, which reads naturally as "most recently added last." No UI requirement depends on alphabetical or other ordering.

**Alternatives considered**: Alphabetical by `name` — deferred as a possible frontend-only display concern (out of scope; can be added later without an API change since the frontend receives the full list already).

## Decision: "Last selected" persistence mechanism and key

**Decision**: Store the last-selected `portfolioId` under a single `localStorage` key, e.g. `personal-wealth:lastPortfolioId`, written whenever the user selects a portfolio from the switcher, read once on `App.tsx` mount.

**Rationale**: Approved in Clarifications (Q2). `localStorage` requires no new dependency (native browser API), persists across reloads/restarts on the same device as required by FR-007, and needs no backend change since there is no user/session concept to attach a server-side preference to (per spec Assumptions).

**Alternatives considered**: `sessionStorage` (rejected — does not survive browser restart, which FR-007 explicitly requires); a URL query/path parameter (rejected — introduces routing/history concerns and a new dependency class not currently in the stack, when the constitution favors the smallest solution); server-side preference storage (rejected — there is no user entity to key it on, and adding one is explicitly out of scope).

## Decision: Handling a stale ("deleted") last-selected portfolio

**Decision**: On load, after fetching the portfolio list, if the `localStorage`-stored `portfolioId` is not present in the returned list, clear the stored value and fall back per FR-008/FR-009 (empty state if the list is empty, otherwise the first portfolio in the returned list).

**Rationale**: There is no portfolio-delete endpoint in this codebase today (confirmed: only `POST /portfolios` and `GET /portfolios/{id}/summary` exist pre-feature), so this scenario is reachable only via manual data changes (e.g., resetting the SQLite file during development) — but the spec still requires graceful handling (FR-009, edge case), so the check must be defensive rather than assumed unreachable.

**Alternatives considered**: Treating a missing `portfolioId` as a hard error — rejected; it fails Success Criterion SC-005 ("zero dashboard sessions result in a broken or blank view").

## Decision: Where switcher selection state lives

**Decision**: Keep the currently-selected `portfolioId` as `App.tsx` state (as today), replacing the manual `useState("")` + text input with state driven by the new `PortfolioSwitcher` component's `onSelect` callback and the `localStorage`-backed initial value.

**Rationale**: Matches the existing architecture (no router library, `App.tsx` already owns `portfolioId` and passes it down to `PortfolioDashboardPage`) and requires no new state-management dependency, consistent with Principle IX.

**Alternatives considered**: A React Context or global store for selection — rejected as unnecessary; only `App.tsx` and its direct child (`PortfolioDashboardPage`) need this value, exactly as today.
