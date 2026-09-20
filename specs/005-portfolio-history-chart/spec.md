# Feature Specification: Portfolio Performance History Chart

**Feature Branch**: `005-portfolio-history-chart`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Handoff from .specify/assessments/performance-chart/decision.md (verdict: go). Historical performance chart — capture portfolio value over time (on price updates and transactions) and show it as a trend line on the dashboard, using the smallest viable approach: one new snapshot record per event, one new read endpoint, and a hand-rolled inline chart with no new frontend dependency."

## Clarifications

### Session 2026-09-20

- Q: Should the trend line plot only the portfolio's current value, or plot both current value and invested amount together (so profit/loss visually stands out, not just value direction)? → A: Two lines — current value and invested amount together.
- Q: Should the chart display the portfolio's entire history since the feature was turned on, or only a bounded recent window (e.g., the most recent N points or last N days)? → A: Show full history (every recorded point, unbounded).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See portfolio value trend on the dashboard (Priority: P1)

A user viewing their portfolio dashboard wants to see, at a glance, whether their portfolio's total value has been going up or down recently, rather than only seeing the single current value.

**Why this priority**: This is the entire point of the feature — without it, there is no visible trend at all, only a point-in-time snapshot. It delivers the core value on its own.

**Independent Test**: Can be fully tested by updating a holding's price or recording a transaction two or more times over time, then confirming a trend line appears on the dashboard reflecting those changes in order.

**Acceptance Scenarios**:

1. **Given** a portfolio with at least two recorded history points, **When** the user opens the portfolio dashboard, **Then** a trend line showing portfolio value over time is displayed alongside the existing summary panel.
2. **Given** a portfolio with only one recorded history point, **When** the user opens the dashboard, **Then** the chart area indicates there isn't enough history yet, rather than showing a broken or empty chart.
3. **Given** a brand-new portfolio with zero history points, **When** the user opens the dashboard, **Then** the chart area shows a clear "no history yet" state instead of an error.

---

### User Story 2 - History captured automatically as the user acts (Priority: P1)

A user updating a holding's current price or recording a BUY/SELL transaction wants that action to automatically become part of their portfolio's history, without any extra manual step.

**Why this priority**: Automatic capture is what makes the trend line meaningful and low-effort; if the user had to manually "save a snapshot," the feature would be far less useful and more error-prone (equal priority to Story 1 — the chart is worthless without reliable, automatic data capture).

**Independent Test**: Can be fully tested by performing a price update or a transaction and then confirming, via the history view, that a new history point was recorded at that moment with the correct value.

**Acceptance Scenarios**:

1. **Given** an existing portfolio, **When** the user updates a holding's current price, **Then** a new history point is recorded capturing the portfolio's total value and total invested amount at that moment.
2. **Given** an existing portfolio, **When** the user records a BUY or SELL transaction, **Then** a new history point is recorded capturing the portfolio's total value and total invested amount immediately after the transaction is applied.
3. **Given** a portfolio with several history points already recorded, **When** the user performs another price update or transaction, **Then** the new point is added after the existing ones without altering or removing prior history.

---

### User Story 3 - View trend across multiple portfolios (Priority: P2)

A user who maintains more than one portfolio (via the existing portfolio switcher) wants the trend chart to reflect whichever portfolio is currently selected, so history from one portfolio never appears mixed into another's chart.

**Why this priority**: Builds directly on existing multi-portfolio support; important for correctness but the feature still delivers value for single-portfolio users without it being the first thing built.

**Independent Test**: Can be fully tested by creating two portfolios, generating distinct history in each, switching between them, and confirming each portfolio's chart shows only its own history.

**Acceptance Scenarios**:

1. **Given** two portfolios each with recorded history, **When** the user switches from one portfolio to the other via the existing switcher, **Then** the displayed trend chart updates to show only the newly selected portfolio's history.

---

### Edge Cases

- What happens when a portfolio has zero history points (brand new, no price updates or transactions yet)? → Show a clear "no history yet" empty state (see Story 1, Scenario 3).
- What happens when a portfolio has exactly one history point? → Show a "not enough history yet" state rather than a single meaningless dot-chart (see Story 1, Scenario 2).
- How does the system handle a very large number of history points accumulating over a long time (e.g., years of daily price updates)? → Out of scope for this feature to solve fully; the chart must still render without failing, but pruning/retention is explicitly deferred (see Assumptions).
- What happens if two history-triggering actions (e.g., a price update and a transaction) happen at effectively the same instant? → Each action still produces its own history point, recorded in the order the actions occurred.
- What happens to history when a portfolio is deleted? *(No portfolio-delete capability exists in the current system; this is out of scope until such a capability exists.)*

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record a history point for a portfolio whenever a holding's current price is updated, capturing the portfolio's total invested amount and total current value at that moment.
- **FR-002**: The system MUST record a history point for a portfolio whenever a BUY or SELL transaction is recorded, capturing the portfolio's total invested amount and total current value immediately after the transaction is applied.
- **FR-003**: The system MUST preserve every previously recorded history point; recording a new point MUST NOT modify or delete prior points.
- **FR-004**: The system MUST allow retrieving a portfolio's full history as an ordered time series (oldest to newest), with no windowing or truncation applied — every recorded history point is included.
- **FR-005**: The dashboard MUST display the selected portfolio's history as a trend chart with two lines — total current value and total invested amount — plotted over time, so the user can see both value direction and how much of any change reflects new investment versus gains/losses.
- **FR-006**: The dashboard MUST distinguish between three history states for a portfolio: no history points (empty state), exactly one history point (not-enough-history state), and two or more history points (trend line shown).
- **FR-007**: When the user switches the selected portfolio, the displayed trend chart MUST update to reflect only that portfolio's own history.
- **FR-008**: The system MUST derive profit/loss and profit/loss percentage at each history point from that point's recorded total invested amount and total current value, consistent with how current-state profit/loss is already calculated for the portfolio summary.

### Key Entities *(include if feature involves data)*

- **Portfolio History Point**: A record of a single portfolio's total invested amount and total current value at a specific point in time. Belongs to exactly one Portfolio. Ordered by the time it was recorded. Never modified after creation — only ever appended.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can determine, at a glance and without performing any manual calculation, both whether their portfolio's value has increased or decreased over the recent period shown, and whether that change came from new investment or from gains/losses.
- **SC-002**: Every price update or transaction the user performs results in a visible addition to the portfolio's trend chart data.
- **SC-003**: Switching between portfolios always shows the correct, non-mixed history for the newly selected portfolio, with no observed instance of one portfolio's history appearing under another's name.
- **SC-004**: A portfolio with fewer than two history points never presents a broken or misleading chart to the user — it always shows one of the two defined empty/insufficient-history states instead.

## Assumptions

- Each history point stores both total invested amount and total current value (rather than only a single "value" number), so that profit/loss and profit/loss percentage can be derived at any historical point the same way they are derived for the current-state summary today (per FR-008).
- History points are captured automatically only by the two events named in FR-001/FR-002 (price update, transaction); no scheduled/periodic snapshot independent of user action is included in this feature.
- No retention limit, pruning, or archival policy is applied to history points in this feature — all points accumulate indefinitely. This is an accepted, known gap given the app's current single-user, manual-entry, low-volume usage pattern, to be revisited later if it becomes a problem.
- The trend chart shows portfolio-level value over time only; per-holding historical trends, comparisons to market indices, and interactive chart features (tooltips, zoom, custom date ranges) are out of scope for this feature.
- This feature intentionally introduces a new kind of stored data and a new way to retrieve it, which is a governance-level change for this project (tracked and pre-approved via `.specify/assessments/performance-chart/decision.md`) rather than a product-requirements question — the specification above describes user-facing behavior only, and does not depend on how that governance change is written.
