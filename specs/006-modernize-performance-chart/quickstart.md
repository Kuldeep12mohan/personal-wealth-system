# Quickstart: Validate the Modernized Performance History Chart

## Prerequisites

- Existing `frontend/` app set up per `specs/001-wealth-management-poc/quickstart.md` (dependencies installed).
- No backend changes are involved; the backend from `specs/005-portfolio-history-chart` is used as-is.
- No constitution amendment is required for this feature (see `plan.md` Constitution Check — clean PASS).

## Automated validation (primary)

From `frontend/`:

```powershell
npm test -- PerformanceHistoryChart
```

Expected:
1. **Zero points**: the "no history yet" state renders with the section's polished styling (User Story 3, FR-007).
2. **One point**: the "not enough history yet" state renders with that same styling.
3. **Two or more points**: both lines render, remain visually distinguishable by more than color (FR-001), and the chart shows start date, end date, min value, and max value labels (FR-003, per Clarifications).
4. **Near-identical values**: when current value and invested amount are equal or nearly equal at every point, both lines remain individually visible and distinguishable (Edge Cases).
5. **All-zero values**: a portfolio with only zero-valued points renders a clear flat baseline, not an empty or malformed chart (Edge Cases).

Also re-run the existing full test suite to confirm no regressions (constitution Principle III):

```powershell
# from frontend/
npm test
```

No backend test run is required — this feature makes no backend change (FR-008).

## Manual validation (end-to-end)

1. Start the backend and frontend per `specs/001-wealth-management-poc/quickstart.md`.
2. Open a portfolio with two or more recorded history points (created via price updates/transactions, per `specs/005-portfolio-history-chart/quickstart.md`).
3. Confirm the Performance History section visually matches the card styling, spacing, and heading treatment of the Portfolio Summary and Holdings sections above it (SC-002).
4. Confirm the two lines are distinguishable at a glance (not just by color) and a legend identifies each (SC-001).
5. Confirm the start date, end date, and min/max values are visible without needing to guess the scale (FR-003).
6. Toggle the app's light/dark theme and confirm the chart and its labels remain legible and consistent with the rest of the dashboard in both themes (SC-004).
7. Open a brand-new portfolio (zero history points) and one with exactly one history point; confirm both empty/insufficient states look like a deliberate, polished part of the page (SC-002, User Story 3).
8. Confirm no hover tooltips, zoom, or click-driven behavior were added — the chart remains fully static (FR-009).

## Traceability

- Spec: `specs/006-modernize-performance-chart/spec.md` (FR-001–FR-009, SC-001–SC-005)
- Plan: `specs/006-modernize-performance-chart/plan.md`
- No new API contract or data model — see plan.md's Project Structure note.
- Prior feature this refines: `specs/005-portfolio-history-chart` (introduced the chart being modernized here).
