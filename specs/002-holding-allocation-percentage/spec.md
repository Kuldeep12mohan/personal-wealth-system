# Feature Specification: Holding Allocation Percentage Indicator

**Feature Branch**: `002-holding-allocation-percentage`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Add a small allocation percentage indicator to each holding on the Portfolio Dashboard. Show the percentage next to the holding value. Keep the existing UI structure, backend APIs, and functionality unchanged. Make only the minimal frontend and test changes required."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See each holding's share of the portfolio (Priority: P1)

A user viewing their Portfolio Dashboard wants to understand, at a glance, how much of their total portfolio value each holding represents, without navigating away or performing any calculation themselves.

**Why this priority**: This is the entire scope of the feature — a single, self-contained display enhancement that delivers immediate value by helping users understand portfolio concentration and diversification.

**Independent Test**: Open the Portfolio Dashboard for a portfolio containing multiple holdings with known values; verify that next to each holding's value a percentage appears, and that the percentages reflect each holding's share of the portfolio's total current value.

**Acceptance Scenarios**:

1. **Given** a portfolio with multiple holdings each having a current value, **When** the user views the Portfolio Dashboard, **Then** each holding displays a percentage next to its value representing that holding's share of the portfolio's total current value.
2. **Given** a portfolio with a single holding, **When** the user views the Portfolio Dashboard, **Then** that holding displays an allocation of 100%.
3. **Given** the values of holdings in a portfolio, **When** their displayed allocation percentages are added together, **Then** the sum equals 100% (subject to normal rounding).
4. **Given** an existing Portfolio Dashboard user, **When** the allocation percentage indicator is introduced, **Then** all previously existing dashboard information, layout, and interactions remain unchanged aside from the addition of the percentage indicator.

---

### Edge Cases

- What happens when a portfolio has zero total current value (e.g., all holdings have zero quantity or zero price)? The percentage indicator should display a neutral placeholder (e.g., "0%" or "—") rather than an error or an undefined/NaN value.
- What happens when a holding's own current value is zero while other holdings in the portfolio have positive value? That holding should display 0% allocation.
- What happens when there is only one holding in the portfolio? It should display 100% allocation.
- How are percentages rounded/displayed when they do not divide evenly (e.g., three equal holdings each ~33.3%)? Values are rounded for display to one decimal place, and small rounding discrepancies in the displayed total are expected and acceptable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Portfolio Dashboard MUST display, for each holding, a percentage value representing that holding's current value as a proportion of the portfolio's total current value.
- **FR-002**: The percentage indicator MUST be displayed adjacent to (next to) the existing holding value on the dashboard.
- **FR-003**: The percentage MUST be calculated as (holding's current value ÷ portfolio's total current value) × 100.
- **FR-004**: The system MUST handle a portfolio total current value of zero by displaying a neutral placeholder for every holding's percentage instead of an invalid (e.g., division-by-zero) result.
- **FR-005**: The percentage indicator MUST be presented as a small, visually secondary element relative to the holding value, consistent with the existing visual hierarchy of the dashboard.
- **FR-006**: The feature MUST NOT alter the existing Portfolio Dashboard's layout structure, navigation, or any other existing functionality beyond adding the percentage indicator.
- **FR-007**: The feature MUST NOT require any changes to backend APIs, data contracts, or persisted data — the percentage MUST be derived entirely from data already available to the dashboard.
- **FR-008**: Displayed percentages MUST update to reflect current holding and portfolio values whenever the dashboard's existing data refresh/display logic runs (no new refresh mechanism is introduced).

### Key Entities

- **Holding** (existing entity, unchanged): Represents a single position within a portfolio; already carries the current value used as input to the new percentage calculation.
- **Portfolio** (existing entity, unchanged): Represents the collection of holdings; its aggregate current value is already available and is used as the denominator for the percentage calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can determine any holding's share of their total portfolio value directly from the Portfolio Dashboard, with no additional navigation or calculation, in under 5 seconds.
- **SC-002**: For any portfolio with a non-zero total value, the displayed allocation percentages across all holdings sum to 100% within normal rounding tolerance (±0.5%).
- **SC-003**: 100% of existing Portfolio Dashboard functionality and layout observed before this change continues to behave identically after this change, verified via existing and updated tests.
- **SC-004**: The change introduces no modifications to backend API contracts, confirmed by zero backend code changes in the implementation.

## Assumptions

- "Holding value" refers to each holding's current market value (quantity × current price), consistent with how the dashboard already computes and displays holding values.
- "Portfolio" total value used as the denominator is the same aggregate total the dashboard already displays or already has available from existing data.
- The percentage is a read-only, presentation-only indicator; it introduces no new user interactions (e.g., no sorting/filtering by allocation is required for this feature).
- Rounding to one decimal place is an acceptable and sufficient level of precision for this indicator.
- No new backend endpoint, field, or data model change is needed because holding and portfolio current values are already available to the frontend where the dashboard is rendered.
