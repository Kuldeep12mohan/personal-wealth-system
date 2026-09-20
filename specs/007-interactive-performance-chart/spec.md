# Feature Specification: Interactive Performance History Chart

**Feature Branch**: `007-interactive-performance-chart`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Improve the Performance History chart UI to make it more polished, readable, and visually informative. Keep the existing two series (Current value, Invested amount). Improve the chart with: a clean, modern financial-dashboard style; clearly labeled X-axis dates with appropriate spacing; a readable Y-axis with currency formatting; subtle horizontal grid lines for easier value comparison; distinct visual styling for Current value and Invested amount; make the Current value line visually prominent; keep Invested amount visually secondary using a dashed line; add interactive tooltips showing the date, current value, invested amount, and P&L for each point; clearly indicate positive/negative P&L at each historical point; add data points/hover indicators so individual history points are easy to inspect; avoid excessive visual elements, gradients, or clutter; make the chart responsive on desktop and mobile; preserve the existing card layout and overall application design system. The chart should make it immediately clear whether portfolio growth comes from additional investment or actual gains/losses."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect the exact numbers behind any point in the trend (Priority: P1)

A user viewing the Performance History chart wants to point at (or tap) any specific moment in their portfolio's history and immediately see exactly what happened then: the date, the current value, the invested amount, and the resulting profit or loss.

**Why this priority**: This is the core new capability requested — turning the chart from a shape you can only eyeball into something you can actually interrogate for exact figures, which is the main reason a user would want this improvement.

**Independent Test**: Can be fully tested by hovering (desktop) or tapping (mobile) a specific point on a populated chart and confirming a tooltip appears showing that point's date, current value, invested amount, and profit/loss.

**Acceptance Scenarios**:

1. **Given** a portfolio with 2+ history points, **When** the user hovers over (desktop) or taps (mobile) a point on the chart, **Then** a tooltip appears showing that point's date, current value, invested amount, and profit/loss (amount and direction).
2. **Given** a tooltip is showing for one point, **When** the user moves to hover a different point (desktop) or taps a different point (mobile), **Then** the tooltip updates to that new point's figures.
3. **Given** a tooltip is showing on a mobile device, **When** the user taps outside any data point, **Then** the tooltip is dismissed.
4. **Given** a portfolio with only 0 or 1 history points, **When** the user views the chart, **Then** the existing "no history yet" / "not enough history yet" states are shown and no tooltip interaction is offered (nothing to inspect yet).

---

### User Story 2 - Read the chart's scale and timeline without guessing (Priority: P1)

A user viewing the chart wants to understand the actual dates and value amounts involved just by looking at the chart's axes, rather than needing to open a tooltip for basic orientation.

**Why this priority**: Equal priority to Story 1 — tooltips answer "what happened at this exact point," but axis labels, gridlines, and currency-formatted values answer "what's the overall scale and timeframe," which a user needs before they even start pointing at individual points.

**Independent Test**: Can be fully tested by viewing a populated chart and confirming dates are labeled along the horizontal axis and currency-formatted values are labeled along the vertical axis, with horizontal reference lines aligned to those value labels.

**Acceptance Scenarios**:

1. **Given** a portfolio with 2+ history points, **When** the user views the chart, **Then** the horizontal axis shows a readable set of date labels spanning the chart's timeframe, and the vertical axis shows currency-formatted value labels.
2. **Given** the vertical axis shows value labels, **When** the user views the chart, **Then** subtle horizontal reference lines align with those labels to make it easy to compare a point's height against a specific value.
3. **Given** a portfolio with many history points, **When** the user views the chart, **Then** date labels remain evenly spaced and legible rather than overlapping or becoming unreadable.

---

### User Story 3 - Tell at a glance whether growth is from new money or real gains (Priority: P2)

A user viewing the chart wants to visually distinguish the "current value" line (what the portfolio is actually worth) from the "invested amount" line (how much was put in), with the current value line standing out as the primary line of interest.

**Why this priority**: Builds on the existing two-line distinction (already partially addressed by a prior chart iteration) by making the visual hierarchy and per-point gain/loss coloring more deliberate — valuable, but the chart is still useful without this refinement since the lines are already distinguishable today.

**Independent Test**: Can be fully tested by viewing a populated chart and confirming the current value line is visually prominent (e.g., solid, bolder) while the invested amount line is visually secondary (dashed, muted), and that each point's marker color reflects whether that point was a gain, loss, or flat.

**Acceptance Scenarios**:

1. **Given** a portfolio with 2+ history points, **When** the user views the chart, **Then** the "current value" line is visually prominent (solid, higher visual weight) and the "invested amount" line is visually secondary (dashed, lower visual weight).
2. **Given** a history point where current value exceeds invested amount, **When** the user views that point's marker, **Then** it is shown in a color indicating a gain (e.g., green).
3. **Given** a history point where current value is below invested amount, **When** the user views that point's marker, **Then** it is shown in a color indicating a loss (e.g., red).
4. **Given** a history point where current value equals invested amount, **When** the user views that point's marker, **Then** it is shown in a neutral color indicating neither gain nor loss.

---

### User Story 4 - Use the chart comfortably on a phone (Priority: P3)

A user viewing their dashboard on a mobile device wants the chart to remain legible and usable — readable labels, tappable points, no horizontal overflow — rather than a shrunken or broken version of the desktop chart.

**Why this priority**: Important for mobile users, but the chart already functions on mobile today (per the prior iteration's responsive card layout); this story polishes the interactive and dense-label aspects introduced by this feature specifically for small screens.

**Independent Test**: Can be fully tested by viewing the chart at a mobile viewport width and confirming axis labels remain legible, points remain tappable, and no part of the chart overflows or requires horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** the dashboard is viewed at a mobile viewport width, **When** the user views the chart, **Then** it resizes to fit the available width without horizontal overflow, and axis labels remain legible (not overlapping or truncated illegibly).
2. **Given** the dashboard is viewed at a mobile viewport width, **When** the user taps a data point, **Then** the tooltip described in User Story 1 appears and remains fully visible within the screen (not clipped off-screen).

---

### Edge Cases

- What happens when two lines are very close together or overlapping at some points? → Data point markers and the tooltip remain independently accessible for each series' value at that date, per User Story 1.
- What happens with a portfolio that has many history points (e.g., months of frequent updates)? → Date labels thin out to a fixed evenly-spaced set (see Clarifications); data point markers may become visually dense but must remain individually tappable/hoverable without overlapping to the point of being unusable — the exact density limit is an implementation concern, not specified here.
- What happens when a user hovers/taps very close to the boundary between two adjacent points? → The nearest point's tooltip is shown; there is no ambiguous or blank gap between points' interactive areas.
- What happens when a portfolio has 0 or 1 history points? → Existing "no history yet" / "not enough history yet" states apply unchanged (no tooltip/axis features to show yet, per User Story 1 Scenario 4).
- What happens when all recorded values are zero? → Axis labels and gridlines still render around a flat zero line; tooltips still work per point, showing zero values and a neutral (flat) marker color.
- What happens on a very narrow mobile screen where even the reduced date-label count risks overlap? → The fixed label count may be further reduced by the responsive layout, but at least the first and last dates must always remain visible so the timeframe is never entirely unlabeled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The chart MUST show currency-formatted value labels along its vertical axis, using the currency already associated with the portfolio being viewed (no new data source required — the portfolio's currency is already known wherever the chart is displayed).
- **FR-002**: The chart MUST show a fixed, evenly-spaced set of date labels (4-6) along its horizontal axis regardless of how many history points exist, always including the first and last recorded dates.
- **FR-003**: The chart MUST display subtle horizontal reference lines aligned to the vertical axis's value labels.
- **FR-004**: The chart MUST visually distinguish the "current value" line as prominent (solid, higher visual weight) and the "invested amount" line as secondary (dashed, lower visual weight).
- **FR-005**: The chart MUST render a visible marker at every history point, color-coded to indicate whether that point represents a gain (current value > invested amount), a loss (current value < invested amount), or neither (equal).
- **FR-006**: On desktop, hovering a history point's marker MUST show a tooltip with that point's date, current value, invested amount, and profit/loss (amount and direction).
- **FR-007**: On touch devices, tapping a history point's marker MUST show that point's tooltip; tapping elsewhere MUST dismiss it or move it to the newly tapped point.
- **FR-008**: The chart MUST remain fully legible and usable (no horizontal overflow, no illegibly overlapping labels, tooltips fully visible on-screen) across both desktop and mobile viewport widths.
- **FR-009**: The chart MUST preserve the existing card layout, spacing, and typography conventions already established for the Performance History section (from the prior chart iteration) rather than introducing a new visual container style.
- **FR-010**: The chart MUST NOT introduce gradients or decorative visual elements beyond what is needed to satisfy the requirements above (axis labels, gridlines, line styling, point markers, tooltips).
- **FR-011**: This feature MUST NOT alter what data is captured, stored, or returned by the underlying Performance History feature (portfolio history points or the API that serves them) — it changes only how the existing data is presented and interacted with.
- **FR-012**: For a portfolio with 0 or 1 history points, the chart MUST continue to show the existing "no history yet" / "not enough history yet" states without offering tooltip interaction (nothing exists yet to inspect).

### Key Entities *(include if feature involves data)*

- No new entities are introduced. This feature presents the existing Portfolio History Point data (date, total invested, current value — from which profit/loss is already derived) introduced by the Portfolio Performance History Chart feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can determine the exact date, current value, invested amount, and profit/loss for any single historical point within one interaction (one hover or one tap), without leaving the dashboard.
- **SC-002**: A user can identify, at a glance and without opening a tooltip, whether a given point in the chart's history represented a gain, a loss, or neither.
- **SC-003**: A user can read the chart's approximate value range and timeframe directly from its axis labels, without needing to inspect individual points.
- **SC-004**: The chart remains fully usable (no illegible overlapping labels, no off-screen tooltips, no horizontal scrolling) on both a typical desktop width and a typical mobile phone width.
- **SC-005**: No existing automated test for portfolio data, history capture, or the history API is affected by this change — only chart-presentation and interaction tests are added or updated.

## Assumptions

- **P&L indication style**: Positive/negative P&L is shown via color-coded data point markers (green for a gain, red for a loss, neutral for flat) visible at every point at all times, not only inside the tooltip — chosen because the request to "clearly indicate positive/negative P&L at each historical point" (distinct from the tooltip requirement) implies an always-visible signal, not one gated behind an interaction.
- **X-axis label density**: With many history points, a fixed, evenly-spaced set of 4-6 date labels is shown (always including the first and last dates), rather than labeling every point or a variable count — chosen as the simplest way to guarantee readability regardless of how much history accumulates, consistent with the "appropriate spacing" request.
- **Mobile tooltip interaction**: Since hover has no equivalent on touch devices, tapping a point shows its tooltip, and tapping elsewhere (or another point) dismisses or moves it — the standard mobile-web pattern for hover-equivalent interactions, consistent with the "responsive on desktop and mobile" request.
- **Governance note (significant)**: This feature requests interactive chart behavior (hover/tap tooltips, per-point markers) that goes beyond the constitution's current chart exception (v1.4.0), which explicitly permits only a single, **non-interactive**, portfolio-level, two-line chart and names "interactive or advanced charts (zoom, tooltips, custom date ranges...)" as otherwise out of scope. Building this feature as specified will require a further, more substantial constitution amendment than any prior chart-related change. This specification describes user-facing behavior only; whether and how to amend the constitution is a governance decision for `/speckit-plan` and `/speckit-constitution`, not resolved here.
- The portfolio's currency (INR/USD) is already available wherever this chart is rendered (via the existing Portfolio/Portfolio Summary data already fetched by the dashboard) and can be passed to the chart without any backend or API change.
- "Clean, modern financial-dashboard style" and "avoid excessive visual elements, gradients, or clutter" are treated as guiding design principles applied through the specific, testable requirements above (axis labels, gridlines, line styling, markers, tooltips) rather than as separately measurable requirements themselves.
- No new backend entity, endpoint, or stored data is introduced; profit/loss per point continues to be derived from the existing `totalInvested`/`currentValue` fields already returned by the history endpoint.
- This feature builds directly on top of the chart introduced by `specs/005-portfolio-history-chart` and refined by `specs/006-modernize-performance-chart`; it does not replace or duplicate their scope, only extends it with interactivity and richer axis presentation.
