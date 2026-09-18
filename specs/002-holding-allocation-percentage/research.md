# Phase 0 Research: Holding Allocation Percentage Indicator

No `NEEDS CLARIFICATION` markers remain in the Technical Context — the technology stack, testing framework, and project structure are all fixed by the project constitution. The research below covers the presentation and calculation decisions needed to implement the spec.

## Decision: Where the calculation lives

**Decision**: Reuse the existing `computeDerived()` allocation calculation already present in `frontend/src/components/HoldingsTable.tsx` (`allocationPercentage = portfolioCurrentValue > 0 ? (h.currentValue / portfolioCurrentValue) * 100 : 0`).

**Rationale**: This calculation already matches spec FR-003 exactly and already guards the zero-total-value case (FR-004). No backend change is needed because `HoldingView.currentValue` (per holding) and the portfolio's `currentValue` (from `getPortfolioSummary`) are already fetched by `PortfolioDashboardPage.tsx` and passed down as `portfolioCurrentValue` — satisfying FR-007 (no backend/API changes) and constitution Principle IV (frontend performs no new business logic, only formatting an existing derived value).

**Alternatives considered**:
- Computing allocation in the backend summary endpoint and returning it per holding — rejected: violates constitution Principle V (API Contract Consistency) and FR-007, and is unnecessary since the frontend already has both values.
- Recomputing allocation in `PortfolioDashboardPage.tsx` and passing it down — rejected: duplicates logic already correctly encapsulated in `HoldingsTable.tsx`; keeps the change minimal (touches one file).

## Decision: Presentation — "next to the holding value"

**Decision**: Move the percentage display from its current standalone "Allocation %" column (with a progress bar) into the "Current Value" cell, rendered as a small, visually secondary inline element immediately after the value (e.g., `5,500 (68.8%)`), matching spec FR-002 and FR-005. The standalone "Allocation %" column and its bar are removed to avoid duplicate/redundant display of the same figure, keeping the table's existing column structure otherwise unchanged (FR-006).

**Rationale**: The spec explicitly asks for the percentage "next to the holding value," not as a separate column. Keeping both would duplicate information and add visual clutter beyond what the spec asks for (constitution Principle I — smallest solution that satisfies the requirement). Rendering it as a smaller, muted inline span preserves existing visual hierarchy (FR-005) without introducing new CSS classes beyond one small utility class for the secondary text style, if one does not already exist.

**Alternatives considered**:
- Keep the separate "Allocation %" column *and* add an inline value next to Current Value — rejected: redundant, contradicts "minimal frontend changes" instruction and Principle I.
- Replace Current Value's content entirely with only the percentage — rejected: spec requires the value to remain visible; percentage is additive, not a replacement (FR-002 says "next to," not "instead of").

## Decision: Formatting and rounding

**Decision**: Round the displayed percentage to one decimal place (e.g., `68.8%`), reusing `toFixed(1)`. For a zero-total-value portfolio, display `0%` for every holding (reusing the existing guarded `0` result), which satisfies the spec's "neutral placeholder" requirement (FR-004) without introducing a new sentinel string like `"—"`.

**Rationale**: Matches spec Assumptions ("rounding to one decimal place is acceptable") and Edge Cases (neutral placeholder on zero total). Reusing the existing numeric `0` output (already guarded against division by zero) is simpler than introducing a new display-only sentinel, consistent with constitution Principle I.

**Alternatives considered**:
- Two decimal places (current behavior in the existing column) — rejected: spec Assumptions specify one decimal place as sufficient; reduces visual noise for a "small" indicator (FR-005).
- A dash (`—`) placeholder for the zero-total case — considered acceptable per spec, but `0%` is simpler to implement (no new branch) and is not misleading (every holding truly has 0% of a zero-value portfolio).

## Decision: Test coverage

**Decision**: Add `frontend/tests/HoldingsTable.test.tsx` (no dedicated test file exists for this component today) covering: (1) percentage appears next to the value for a multi-holding portfolio and sums to ~100%; (2) a single holding shows 100%; (3) a zero-total-value portfolio shows 0% instead of NaN/Infinity; (4) existing table columns/actions (row buttons, other columns) remain present and unchanged.

**Rationale**: Satisfies constitution Principle III (Testability by Design) and spec SC-002/SC-003. `PortfolioDashboardPage.test.tsx` already exercises the page end-to-end but does not assert on allocation percentages; a focused component test is the minimal-footprint way to cover this behavior without expanding the existing page-level test's scope.

**Alternatives considered**:
- Only extend `PortfolioDashboardPage.test.tsx` — rejected: that file's fetch mocks only seed one holding, insufficient to test multi-holding sum-to-100% and zero-total scenarios without significant rework; a small dedicated component test is less invasive.
