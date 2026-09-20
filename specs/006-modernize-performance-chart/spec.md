# Feature Specification: Modernize Performance History Chart

**Feature Branch**: `006-modernize-performance-chart`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Modernize the existing Performance history chart to make it more visually appealing, polished, and easier to understand. Preserve the existing data and functionality, while improving the chart's visual hierarchy, readability, spacing, labels, and overall UI consistency. Keep the change focused only on the Performance chart and avoid unnecessary changes to other parts of the application."

## Clarifications

### Session 2026-09-20

- Q: How much axis/reference detail should the modernized chart show — just the start/end dates and the min/max values, or a fuller set of intermediate tick marks and gridlines? → A: Minimal — label only the start date, end date, and min/max values.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the trend at a glance with a clearer chart (Priority: P1)

A user viewing their portfolio dashboard looks at the Performance History chart and wants to immediately understand how their portfolio's value and invested amount have moved over time, without having to study the chart or guess what the lines mean.

**Why this priority**: This is the core value of the modernization — the chart already exists and shows correct data, but the improvement only matters if it makes the trend genuinely easier to read at a glance.

**Independent Test**: Can be fully tested by viewing a portfolio with several history points and confirming a user can, within a few seconds and without prior explanation, identify which line is "current value" versus "invested amount," roughly read the value range, and tell whether the trend is up or down.

**Acceptance Scenarios**:

1. **Given** a portfolio with two or more history points, **When** the user views the Performance History section, **Then** the two lines (current value, invested amount) are clearly distinguishable from each other (e.g., by color and style, not color alone) and are each labeled so their meaning is unambiguous.
2. **Given** a portfolio with two or more history points, **When** the user views the chart, **Then** the approximate value range and time span are visible (e.g., via axis labels or reference lines), not just an unlabeled pair of lines.
3. **Given** a portfolio with a very small or very large range of values, **When** the user views the chart, **Then** the chart still renders proportionally and legibly — it never collapses into a flat, unreadable line or an unreadably compressed shape.

---

### User Story 2 - Consistent, polished look with the rest of the dashboard (Priority: P2)

A user viewing the dashboard wants the Performance History chart to feel like a native, deliberately designed part of the same application, matching the spacing, color palette, and typography already used in the Portfolio Summary and Holdings sections, rather than looking like an unfinished or bolted-on element.

**Why this priority**: Visual consistency reinforces trust in the data and the product overall, but the chart is already functional and correct without it — this refines the existing experience rather than fixing a defect.

**Independent Test**: Can be fully tested by visually comparing the modernized chart section against the existing Portfolio Summary and Holdings sections on the same dashboard and confirming shared visual language (card styling, spacing, color usage, typography scale).

**Acceptance Scenarios**:

1. **Given** the dashboard is displayed in either light or dark theme, **When** the user views the Performance History chart, **Then** its colors, borders, and text remain legible and consistent with the current theme, matching how other dashboard sections adapt to theme changes.
2. **Given** the dashboard's existing sections use a consistent card layout, spacing, and heading style, **When** the user views the Performance History section, **Then** it uses that same layout, spacing, and heading style rather than a visually distinct treatment.

---

### User Story 3 - Clear feedback when there isn't a trend to show yet (Priority: P3)

A user with a brand-new portfolio, or one with only a single recorded history point, wants the "no history yet" and "not enough history yet" messages to look like an intentional, polished part of the page rather than plain placeholder text.

**Why this priority**: These states are already functionally correct (per the existing Portfolio Performance History Chart feature); this only improves their visual presentation to match the rest of the modernization.

**Independent Test**: Can be fully tested by viewing a brand-new portfolio (zero history points) and a portfolio with exactly one history point, and confirming both states are visually styled consistently with the modernized chart section rather than looking like unstyled fallback text.

**Acceptance Scenarios**:

1. **Given** a portfolio with zero history points, **When** the user views the Performance History section, **Then** the empty state is presented with the same polished visual treatment (spacing, card styling, tone) as the rest of the modernized section.
2. **Given** a portfolio with exactly one history point, **When** the user views the Performance History section, **Then** the "not enough history yet" state is presented with that same polished visual treatment.

---

### Edge Cases

- What happens when the current value and invested amount are identical or nearly identical at every point (the two lines overlap or nearly overlap)? → Both lines must remain individually distinguishable (e.g., via distinct line style, not relying on visual separation alone).
- What happens when there are many history points (a long-running portfolio with frequent price updates)? → The chart must remain readable rather than becoming a dense, illegible cluster of lines and labels; older points may be visually compressed but must not be dropped or misrepresented.
- What happens when the browser window or container is narrow (small screens)? → The chart must remain legible and proportioned, consistent with how the rest of the dashboard already adapts to smaller widths.
- What happens when all recorded values are zero (e.g., a portfolio with holdings but no priced value yet)? → The chart must still render a clear, non-broken flat baseline rather than an empty or malformed graphic.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Performance History chart MUST visually distinguish the "current value" line from the "invested amount" line using more than color alone (e.g., line style, markers, or pattern), so the distinction remains clear for users who cannot rely on color perception.
- **FR-002**: The Performance History chart MUST display a legend or equivalent labeling that identifies which line represents "current value" and which represents "invested amount."
- **FR-003**: The Performance History chart MUST label the start date, the end date, and the minimum and maximum values shown, so a user can judge the approximate value range and time span without needing intermediate tick marks or gridlines.
- **FR-004**: The Performance History chart MUST scale its display proportionally to the actual range of values present, remaining legible whether that range is very small or very large, without requiring code changes for specific data shapes.
- **FR-005**: The Performance History section MUST use the same card layout, spacing, and heading treatment already used by the Portfolio Summary and Holdings sections on the same dashboard.
- **FR-006**: The Performance History chart's colors and text MUST remain legible and consistent with the dashboard's current theme (light or dark), matching how other dashboard sections respond to theme changes.
- **FR-007**: The "no history yet" and "not enough history yet" states MUST be restyled to match the same polished visual treatment as the rest of the modernized Performance History section, while preserving their existing meaning and wording intent.
- **FR-008**: This modernization MUST NOT alter what data is captured, stored, or returned by the Performance History feature (portfolio history points, their values, or the API that serves them) — it changes only how the existing chart and its states are presented.
- **FR-009**: This modernization MUST NOT introduce interactive chart behavior (such as hover tooltips, zoom, or click-driven filtering) — the chart remains a static, non-interactive visual, consistent with its current approved scope.

### Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user viewing a portfolio with history can correctly identify which line represents current value versus invested amount without needing to ask or consult documentation.
- **SC-002**: The Performance History section is visually indistinguishable in styling approach (spacing, card treatment, typography) from the Portfolio Summary and Holdings sections on the same dashboard, when compared side by side.
- **SC-003**: The chart remains fully legible (no overlapping unreadable text, no collapsed/invisible lines) across the full range of realistic data shapes: zero points, one point, many points, near-identical lines, and both very small and very large value ranges.
- **SC-004**: The chart and its empty/insufficient-history states remain legible and visually consistent in both light and dark theme, with no regression in either theme.
- **SC-005**: No existing automated test for portfolio data, history capture, or the history API is affected by this change — only chart-presentation-focused tests are added or updated.

## Assumptions

- This feature only touches the presentation of the existing Performance History chart (introduced by `specs/005-portfolio-history-chart`); the underlying data model, API contract, and history-capture behavior are unchanged and out of scope.
- The chart remains **non-interactive** (no tooltips, zoom, or date-range filtering), preserving compliance with the constitution's current out-of-scope boundary for charts (v1.4.0), which permits only a single, non-interactive, portfolio-level, two-line chart. Adding interactivity would require a further constitution amendment, which this feature does not request.
- "Visual hierarchy, readability, spacing, labels, and UI consistency" are addressed through static, non-interactive means: legends, axis/reference labeling, line styling, and shared layout/spacing/typography with the rest of the dashboard — not through new interactive affordances.
- No new charting library or frontend dependency is introduced; the existing hand-rolled inline SVG approach is refined in place, consistent with the constitution's closed-stack principle (Tailwind CSS remains the sole styling exception).
- The scope is limited to the Performance History chart component and its immediate empty/insufficient-history states; no other dashboard section, page, or API is modified.
