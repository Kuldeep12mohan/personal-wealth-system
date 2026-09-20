# Quickstart: Validate the Portfolio Performance History Chart

## Prerequisites

- Existing `backend/` and `frontend/` apps set up per `specs/001-wealth-management-poc/quickstart.md` (dependencies installed).
- The companion constitution amendment for this feature (new entity, new endpoint, narrowed "advanced charts" exclusion — see `plan.md` Complexity Tracking) has been recorded via `/speckit-constitution`.

## Automated validation (primary)

From `backend/`:

```powershell
pytest tests/unit/test_history_service.py
pytest tests/contract/test_get_portfolio_history.py
```

Expected:
1. **Capture on price update**: updating a holding's current price creates exactly one new `PortfolioHistoryPoint` for that holding's portfolio, with `totalInvested`/`currentValue` matching what `summary_service.get_portfolio_summary` would return immediately after (FR-001, FR-008).
2. **Capture on transaction**: recording a BUY or SELL transaction creates exactly one new history point, reflecting the post-transaction state (FR-002, FR-008).
3. **Append-only ordering**: recording several events in sequence produces history points in the same order, with none of the earlier points altered (FR-003, FR-004).
4. **Contract**: `GET /portfolios/{portfolioId}/history` returns `200` with an array of `{recordedAt, totalInvested, currentValue, profitLoss, profitLossPercentage}` ordered oldest to newest, an empty array for a portfolio with no history yet, and `404` for a non-existent portfolio.

From `frontend/`:

```powershell
npm test -- PerformanceHistoryChart
```

Expected:
1. **No history (0 points)**: shows the "no history yet" empty state (FR-006, SC-004).
2. **Insufficient history (1 point)**: shows the "not enough history yet" state, not a broken single-dot chart (FR-006, SC-004).
3. **Trend shown (2+ points)**: renders both lines (current value, invested amount) across all recorded points (FR-005, per Clarifications).
4. **Portfolio isolation**: switching the selected portfolio (via the existing `PortfolioSwitcher`) updates the chart to that portfolio's own history only, never mixing another portfolio's data (FR-007, SC-003).

Also re-run the existing full test suites to confirm no regressions (constitution Principle III):

```powershell
# from backend/
pytest

# from frontend/
npm test
```

## Manual validation (end-to-end)

1. Start the backend and frontend per `specs/001-wealth-management-poc/quickstart.md`.
2. Create a new portfolio and add a holding: confirm the dashboard's history chart area shows the "no history yet" state (no history points exist).
3. Update the holding's current price once: confirm exactly one history point now exists (verify via the `GET .../history` endpoint or a quick DB check), and the chart shows "not enough history yet" (only one point).
4. Update the price again (a different value) or record a BUY transaction: confirm the chart now shows a two-line trend (current value, invested amount) reflecting both points in order (SC-001).
5. Record a few more price updates/transactions with varying values: confirm each one adds a new point to the chart without disturbing earlier points (SC-002).
6. Create a second portfolio with its own holdings/transactions, generating different history: switch between the two portfolios via the existing switcher and confirm each shows only its own trend (SC-003).

## Traceability

- Spec: `specs/005-portfolio-history-chart/spec.md` (FR-001–FR-008, SC-001–SC-004)
- Plan: `specs/005-portfolio-history-chart/plan.md`
- New API contract: `specs/005-portfolio-history-chart/contracts/openapi.yaml` (delta only — see `specs/001-wealth-management-poc/contracts/` and `specs/004-portfolio-switcher/contracts/` for the 7 unchanged existing endpoints)
- Data model: `specs/005-portfolio-history-chart/data-model.md`
- Constitution amendment required: see `plan.md` Complexity Tracking
- Assessment trail: `.specify/assessments/performance-chart/` (intake → research → problem → concept → decision)
