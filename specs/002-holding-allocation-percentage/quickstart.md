# Quickstart: Validate the Holding Allocation Percentage Indicator

## Prerequisites

- Existing `frontend/` app set up per `specs/001-wealth-management-poc/quickstart.md` (dependencies installed).
- A running backend (or the existing mocked-fetch test setup) providing at least one portfolio with holdings, per `specs/001-wealth-management-poc/contracts/`.

## Automated validation (primary)

From `frontend/`:

```powershell
npm test -- HoldingsTable
```

Expected: `frontend/tests/HoldingsTable.test.tsx` passes, covering:
1. A multi-holding portfolio shows a percentage next to each holding's Current Value, and the displayed percentages sum to ~100% (±0.5%, per spec SC-002).
2. A single-holding portfolio shows 100%.
3. A portfolio with total current value of 0 shows 0% for every holding (no NaN/Infinity/error).

Also re-run the existing full frontend suite to confirm no regressions (constitution Principle III, spec FR-006/SC-003):

```powershell
npm test
```

## Manual validation (end-to-end)

1. Start the backend and frontend per the existing project quickstart (see `specs/001-wealth-management-poc/quickstart.md`).
2. Create a portfolio with 2–3 holdings of different current values (via existing Add Investment / Record Transaction flows — no new UI is introduced).
3. Open the Portfolio Dashboard for that portfolio.
4. **Expected**: In the Holdings table, each row's Current Value cell shows a small percentage next to the value (e.g., `5,500 (68.8%)`). No separate "Allocation %" column remains.
5. Confirm all other dashboard sections (Summary, Add Investment, Record Transaction/Update Price) and existing holding-row actions are unchanged in position and behavior (spec FR-006).
6. Optional: set all holdings' current price/quantity such that the portfolio's total current value is 0, and confirm every holding shows a neutral `0%` rather than an error.

## Traceability

- Spec: `specs/002-holding-allocation-percentage/spec.md` (FR-001–FR-008, SC-001–SC-004)
- Plan: `specs/002-holding-allocation-percentage/plan.md`
- No API contracts changed — see `specs/001-wealth-management-poc/contracts/` for the unchanged existing endpoints this feature reads from.
