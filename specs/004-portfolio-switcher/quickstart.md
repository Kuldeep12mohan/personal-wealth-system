# Quickstart: Validate the Portfolio Switcher

## Prerequisites

- Existing `backend/` and `frontend/` apps set up per `specs/001-wealth-management-poc/quickstart.md` (dependencies installed).
- The companion constitution amendment for the new `GET /portfolios` endpoint (see `plan.md` Complexity Tracking) has been recorded via `/speckit-constitution`.

## Automated validation (primary)

From `backend/`:

```powershell
pytest tests/contract/test_list_portfolios.py
```

Expected: confirms `GET /portfolios` returns `200` with an array of `{portfolioId, name, currency}` for every existing portfolio, ordered by creation time, and returns an empty array (not an error) when none exist.

From `frontend/`:

```powershell
npm test -- PortfolioSwitcher
npm test -- App
```

Expected:
1. **Switcher rendering**: with 2+ portfolios, all are listed by name with their currency shown, none requiring an ID to be typed (spec FR-002, FR-010).
2. **Selection**: choosing an entry updates the dashboard's displayed portfolio without a page reload (FR-003).
3. **Empty state**: with 0 portfolios, a guided empty state is shown instead of a blank/broken switcher (FR-008).
4. **Single-portfolio auto-select**: with exactly 1 portfolio, it is shown automatically with no manual selection step (FR-008).
5. **Persistence**: after selecting a portfolio, re-mounting `App` (simulating a reload) restores that same portfolio from `localStorage` (FR-007).
6. **Stale-selection fallback**: if the `localStorage`-stored `portfolioId` is not present in the fetched list, the selection is cleared and the fallback rule applies instead of a broken view (FR-009, SC-005).
7. **Load error**: if the portfolio list request fails, a clear error state with a retry option is shown (FR-011).

Also re-run the existing full test suites to confirm no regressions (constitution Principle III):

```powershell
# from backend/
pytest

# from frontend/
npm test
```

## Manual validation (end-to-end)

1. Start the backend and frontend per `specs/001-wealth-management-poc/quickstart.md`.
2. With no portfolios yet, open the app: confirm the dashboard nav shows a guided empty state prompting portfolio creation, and no ID text field is present anywhere.
3. Create two portfolios with different names/currencies via the existing Portfolio Setup screen.
4. Return to the dashboard: confirm the switcher lists both portfolios by name with their currency, and the just-created one is selectable immediately without a page refresh (FR-005, SC-003).
5. Select the first portfolio, confirm its holdings/summary load; select the second, confirm the view updates in place (SC-001).
6. Reload the browser tab: confirm the same (second) portfolio is shown automatically (FR-007, SC-004).
7. Manually clear the app's SQLite data (or otherwise remove the currently-selected portfolio's row) and reload: confirm the app does not show a broken/blank dashboard, but instead falls back to the empty state or another available portfolio (FR-009, SC-005).

## Traceability

- Spec: `specs/004-portfolio-switcher/spec.md` (FR-001–FR-011, SC-001–SC-005)
- Plan: `specs/004-portfolio-switcher/plan.md`
- New API contract: `specs/004-portfolio-switcher/contracts/openapi.yaml` (delta only — see `specs/001-wealth-management-poc/contracts/` for the 5 unchanged existing endpoints)
- Constitution amendment required: see `plan.md` Complexity Tracking
