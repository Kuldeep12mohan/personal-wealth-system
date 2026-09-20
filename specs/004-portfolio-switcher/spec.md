# Feature Specification: Portfolio Switcher

**Feature Branch**: `004-portfolio-switcher`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Multiple portfolios per view / portfolio switcher — data model already supports many portfolios, but the dashboard shows one at a time"

## Clarifications

### Session 2026-09-20

- Q: Should this feature add a new "list all portfolios" API endpoint, even though the project constitution currently fixes the system at exactly six endpoints? → A: Add one new endpoint (list portfolios) and treat it as an approved, scoped amendment to the constitution's fixed endpoint count, same as the Tailwind CSS precedent.
- Q: How should the system remember which portfolio a user last viewed so it can restore it automatically next time? → A: Persist the last-selected portfolio ID in the browser's `localStorage` so it survives page reloads and browser restarts on that device.
- Q: Should the switcher include search/filter functionality for handling a large number of portfolios, or is a simple scrollable list sufficient for this POC? → A: No search/filter requirement; a simple scrollable list is sufficient, and the "50+ portfolios" edge case is noted only as a non-blocking observation, not a new FR.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Pick a Portfolio Without Remembering Its ID (Priority: P1)

A user who has created one or more portfolios opens the dashboard and wants to see which portfolios exist and select one to view, instead of having to remember and manually type a portfolio identifier.

**Why this priority**: Today the only way to open a portfolio is to type its exact ID into a text field. Without a visible list to choose from, every other multi-portfolio capability is unreachable. This is the entry point and MVP slice of the feature.

**Independent Test**: Can be fully tested by creating two or more portfolios, opening the dashboard, and confirming all existing portfolios appear in a selectable list/switcher with no ID typing required, and that selecting one loads its holdings and summary.

**Acceptance Scenarios**:

1. **Given** two or more portfolios exist in the system, **When** the user opens the dashboard, **Then** a portfolio switcher displays every existing portfolio by name (not by raw ID) and lets the user pick one.
2. **Given** the portfolio switcher is displayed, **When** the user selects a portfolio from it, **Then** the dashboard loads and displays that portfolio's holdings and summary, replacing whatever was shown before.
3. **Given** no portfolios exist yet, **When** the user opens the dashboard, **Then** the switcher shows an empty state that guides the user to create a portfolio instead of showing an empty or broken list.
4. **Given** exactly one portfolio exists, **When** the user opens the dashboard, **Then** that portfolio is shown automatically without requiring a manual selection step.

---

### User Story 2 - Switch Between Portfolios Without Losing Context (Priority: P2)

A user who is viewing one portfolio's dashboard wants to switch to a different portfolio quickly, from wherever they are, without navigating back to a setup screen or re-entering an ID.

**Why this priority**: Once a switcher exists (User Story 1), the next most valuable behavior is making switching a lightweight, always-available action rather than a one-time entry point, which is what makes "multiple portfolios" actually usable day to day.

**Independent Test**: Can be fully tested by loading Portfolio A's dashboard, using the switcher to select Portfolio B without leaving the dashboard view, and confirming the displayed holdings/summary update to Portfolio B's data.

**Acceptance Scenarios**:

1. **Given** the user is viewing Portfolio A's dashboard, **When** they open the switcher and select Portfolio B, **Then** the dashboard updates in place to show Portfolio B's holdings and summary.
2. **Given** the user has just created a new portfolio, **When** they return to the dashboard, **Then** the newly created portfolio appears in the switcher's list without requiring a page reload.
3. **Given** a portfolio the user previously selected still exists, **When** the user reopens the application, **Then** that same portfolio is shown again by default instead of forcing a fresh selection every time.

---

### User Story 3 - Identify Portfolios Clearly When Several Look Similar (Priority: P3)

A user with several portfolios (e.g., "Retirement", "Retirement - Spouse") wants enough distinguishing information in the switcher to confidently pick the right one, especially when names are similar.

**Why this priority**: This is a refinement of usability once the core switching mechanism (P1, P2) works; it reduces the risk of a user acting on the wrong portfolio's data but is not required for the feature to deliver value.

**Independent Test**: Can be fully tested by creating two portfolios with similar names but different currencies or holdings counts, and confirming the switcher shows enough supporting detail (e.g., currency, holdings count) to tell them apart at a glance.

**Acceptance Scenarios**:

1. **Given** two portfolios share a similar or identical name, **When** the switcher lists them, **Then** each entry also shows a distinguishing detail (such as base currency) so the user is not forced to guess.
2. **Given** the user is currently viewing a specific portfolio, **When** they open the switcher, **Then** the currently selected portfolio is visibly marked as active in the list.

---

### Edge Cases

- What happens when the currently selected portfolio is deleted or no longer exists (e.g., removed in another session)? The switcher should detect this, drop the stale selection, and fall back to the empty-state or first-available-portfolio behavior rather than showing a broken dashboard.
- How does the system handle a very large number of portfolios (e.g., 50+)? A simple scrollable list is sufficient for this feature's scope (no search/filter requirement); this is a non-blocking observation rather than a functional requirement, consistent with keeping the POC minimal.
- What happens if two portfolios have the exact same name? Both must still appear as distinct, independently selectable entries.
- What happens if the list of portfolios fails to load (e.g., backend unavailable)? The dashboard must show a clear error/retry state instead of an empty or misleading switcher.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a new "list all portfolios" API endpoint so they can be listed for selection; this is an approved, scoped addition to the fixed set of endpoints, requiring a corresponding constitution amendment (analogous to the Tailwind CSS precedent) rather than an implicit exception.
- **FR-002**: Dashboard MUST display a portfolio switcher that lists every existing portfolio by a human-readable name rather than requiring a raw identifier to be entered manually.
- **FR-003**: Users MUST be able to select any listed portfolio from the switcher and have the dashboard update to show that portfolio's holdings and summary.
- **FR-004**: System MUST remove the manual portfolio-ID text entry as the primary way of choosing a portfolio, replacing it with selection from the switcher.
- **FR-005**: System MUST update the switcher's list of available portfolios after a new portfolio is created, without requiring a manual page reload.
- **FR-006**: System MUST visibly indicate which portfolio is currently selected/active within the switcher.
- **FR-007**: System MUST remember the last portfolio a user selected by storing its identifier in the browser's local storage on that device, and MUST show that portfolio again automatically the next time the dashboard is opened on the same browser/device, as long as that portfolio still exists.
- **FR-008**: System MUST show a guided empty state (prompting portfolio creation) when no portfolios exist, and MUST automatically show the single portfolio when exactly one exists.
- **FR-009**: System MUST handle a previously selected portfolio that has since been deleted by clearing that selection and falling back to the empty-state or another available portfolio.
- **FR-010**: Switcher entries MUST include a distinguishing detail beyond the name (such as base currency) to help users tell apart similarly named portfolios.
- **FR-011**: System MUST display a clear error state with a retry option if the list of portfolios cannot be loaded.

### Key Entities

- **Portfolio**: An existing entity representing a named collection of holdings with a base currency; this feature adds the ability to enumerate all portfolios and exposes existing name/currency attributes in a selectable list rather than introducing new attributes.
- **Portfolio Selection (session state)**: The record of which portfolio is currently being viewed and, separately, which portfolio was most recently viewed, so it can be restored on return.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with multiple portfolios can switch from viewing one portfolio to viewing another in under 5 seconds, without typing any identifier.
- **SC-002**: 100% of existing portfolios in the system are discoverable and selectable from the dashboard switcher, with none requiring manual ID entry to reach.
- **SC-003**: A newly created portfolio becomes selectable from the switcher within the same session with no manual refresh needed, in 100% of cases.
- **SC-004**: Users returning to the dashboard see their previously viewed portfolio restored automatically at least 95% of the time when that portfolio still exists.
- **SC-005**: Zero dashboard sessions result in a broken or blank view when the previously selected portfolio has been deleted; the empty-state or fallback is shown instead.

## Assumptions

- The application remains single-tenant with no user accounts or authentication (confirmed by the current codebase, which has no user/owner concept); therefore "all portfolios" means all portfolios that exist in the system, visible to anyone using the dashboard, not portfolios scoped to a logged-in user.
- "Portfolio switcher" means the dashboard shows one portfolio at a time and lets the user change which one is shown; simultaneous side-by-side viewing or aggregation of multiple portfolios' data is out of scope for this feature and may be considered separately in the future.
- "Remembering" the last-selected portfolio is scoped to the user's local browser (via `localStorage`) rather than a synced server-side preference, since there is no user account to attach a server-side preference to; switching browsers or devices will not carry the selection over.
- Portfolio creation, editing, and deletion flows themselves are out of scope for this feature except where they intersect with switcher behavior (new portfolio appears in the list; deleted portfolio is removed from the list and handled gracefully if it was selected).
- No limit is placed on the number of portfolios a user may create as part of this feature; the switcher's usability at scale (FR / edge case above) is a UI concern, not a new data constraint.
