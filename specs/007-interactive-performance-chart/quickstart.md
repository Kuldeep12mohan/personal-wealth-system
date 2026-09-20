# Quickstart: Validate the Interactive Performance History Chart

## Prerequisites

- Existing `frontend/` app set up per `specs/001-wealth-management-poc/quickstart.md` (dependencies installed).
- No backend changes are involved; the backend from `specs/005-portfolio-history-chart` is used as-is.
- **The companion constitution amendment for this feature (removing/narrowing the "non-interactive" chart qualifier — see `plan.md` Complexity Tracking) has been recorded via `/speckit-constitution`.**

## Automated validation (primary)

From `frontend/`:

```powershell
npm test -- PerformanceHistoryChart
```

Expected:
1. **Axis & gridlines**: for 2+ points, the Y-axis shows currency-formatted value labels with horizontal gridlines, and the X-axis shows a fixed, evenly-spaced set of date labels (4-6) always including the first and last recorded dates (FR-001–FR-003).
2. **Line hierarchy**: the "current value" line remains solid/prominent and "invested amount" remains dashed/secondary (unchanged from `specs/006`, FR-004).
3. **Point markers**: every history point has a visible marker colored green (gain), red (loss), or neutral (flat), based on `currentValue` vs `totalInvested` (FR-005).
4. **Desktop tooltip**: hovering a marker shows a tooltip with that point's date, current value, invested amount, and profit/loss; hovering a different marker updates it (FR-006).
5. **Mobile tooltip**: tapping a marker shows its tooltip; tapping elsewhere dismisses it (FR-007).
6. **0/1-point states**: unchanged "no history yet" / "not enough history yet" messages, with no tooltip interaction offered (FR-012).
7. **Currency formatting**: passing a different `currency` prop (e.g., "USD" vs "INR") changes the formatted symbol/style of axis labels and tooltip amounts (FR-001).

Also re-run the existing full test suite to confirm no regressions (constitution Principle III):

```powershell
# from frontend/
npm test
```

No backend test run is required — this feature makes no backend change (FR-011).

## Manual validation (end-to-end)

1. Start the backend and frontend per `specs/001-wealth-management-poc/quickstart.md`.
2. Open a portfolio with several recorded history points spanning both gains and losses (via price updates/transactions, per `specs/005-portfolio-history-chart/quickstart.md`).
3. Confirm the Y-axis shows currency-formatted values with subtle gridlines, and the X-axis shows a readable, evenly-spaced set of dates (SC-003).
4. Hover over several points on a desktop browser; confirm each shows a tooltip with that exact point's date, current value, invested amount, and profit/loss (SC-001).
5. Confirm each point's marker color matches whether that point was a gain, loss, or flat, without needing to open the tooltip (SC-002).
6. Resize the browser to a mobile width (or use a touch device/emulator); confirm the chart resizes without horizontal overflow, tapping a point shows its tooltip fully on-screen, and tapping elsewhere dismisses it (SC-004).
7. Confirm no gradients or decorative clutter were introduced — the chart reads as clean and minimal (FR-010).
8. Confirm the surrounding card layout, spacing, and typography are unchanged from the `specs/006` modernization (FR-009).

## Traceability

- Spec: `specs/007-interactive-performance-chart/spec.md` (FR-001–FR-012, SC-001–SC-005)
- Plan: `specs/007-interactive-performance-chart/plan.md`
- No new API contract or data model — see plan.md's Project Structure note.
- Prior features this extends: `specs/005-portfolio-history-chart` (introduced the chart), `specs/006-modernize-performance-chart` (first visual polish pass).
- Constitution amendment required: see `plan.md` Complexity Tracking.
