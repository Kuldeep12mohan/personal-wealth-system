# Feature Specification: Tailwind CSS UI Modernization

**Feature Branch**: `003-tailwind-ui-modernization`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Modernize the existing frontend UI using Tailwind CSS. Requirements: Replace the existing plain CSS styling with Tailwind CSS utilities where appropriate. Keep the existing frontend functionality unchanged. Do not modify the backend, APIs, database, or business logic. Keep the UI structure and behavior largely unchanged; make only minimal visual improvements. Use Tailwind CSS for new and updated styling. Do not introduce another CSS framework."

## ⚠️ Constitution Conflict Notice

This feature's core requirement — adopting Tailwind CSS as the frontend styling
approach — directly conflicts with the current project constitution
(`.specify/memory/constitution.md`), which mandates **plain CSS** for the frontend and
explicitly prohibits introducing additional frameworks or libraries beyond the fixed
stack (Principle IX, "Technology & Scope Boundaries"). This specification is written to
capture the requested user value; however, it cannot proceed to `/speckit-plan` without
either (a) an approved constitution amendment permitting Tailwind CSS, or (b) an
explicit, justified deviation recorded in the plan's Complexity Tracking section. See
Assumptions below.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent, modern visual styling without behavior change (Priority: P1)

A user of the Personal Wealth Management app opens any existing screen (Portfolio Setup,
Portfolio Dashboard) and experiences a visually refreshed, more modern-looking interface —
consistent spacing, typography, and color treatment — while every action, field, button,
and piece of information they rely on today continues to work exactly as before.

**Why this priority**: This is the entire scope of the request — a visual refresh with zero
functional change. It is the only user-facing outcome being delivered.

**Independent Test**: Navigate through every existing screen and interaction (create
portfolio, add investment, record transaction, update price, view dashboard, view holdings)
before and after the change; confirm all actions succeed identically and the visual
presentation appears modernized (consistent styling, no visually broken or unstyled
elements).

**Acceptance Scenarios**:

1. **Given** a user on the Portfolio Setup screen, **When** they view the page after the
   visual update, **Then** all existing fields, labels, and buttons are present, legible,
   and usable, with a visually modernized appearance (consistent spacing/typography/color).
2. **Given** a user on the Portfolio Dashboard, **When** they view holdings, summary, and
   action panels after the visual update, **Then** all existing data and controls
   (including the holding allocation percentage indicator) remain visible and functional,
   with no layout breakage.
3. **Given** any existing user flow (create portfolio, add investment, record transaction,
   update price), **When** the user completes that flow after the visual update, **Then**
   the flow completes with the same outcome and same validation/error messages as before.
4. **Given** the visual update has been applied, **When** a developer inspects the
   stylesheets, **Then** no CSS framework other than Tailwind CSS is present alongside the
   existing plain CSS being replaced.

---

### Edge Cases

- What happens to error/success/status messages, badges, and empty-state displays (e.g.,
  "No holdings yet") during the restyle? They MUST remain visible and legible with the same
  meaning, just restyled.
- What happens to responsive/table behavior already in place (e.g., the holdings table's
  responsive collapsing on narrow screens)? It MUST continue to work after restyling.
- What happens to elements that carry semantic/functional CSS classes used by existing tests
  (e.g., `data-label` attributes, `role="status"`, `aria-label`s)? These MUST be preserved
  exactly, since tests and accessibility behavior depend on them, even as visual styling
  classes change.
- What happens if a screen or component is partially restyled and partially left in plain
  CSS during an incremental rollout? Partially-restyled states MUST NOT look visually
  broken (e.g., missing spacing, overlapping elements) at any point mid-rollout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST visually present all existing screens and components using
  Tailwind CSS utility classes in place of the existing plain CSS rules, applied
  consistently across the application.
- **FR-002**: The restyle MUST NOT change the structural layout (page sections, component
  boundaries, navigation, ordering of elements) beyond what is required to achieve a
  modernized visual appearance — this is a visual refresh, not a redesign.
- **FR-003**: The restyle MUST NOT change any existing frontend behavior: all forms,
  buttons, validations, data displays, and interactions (including the holding allocation
  percentage indicator introduced previously) MUST continue to function identically.
- **FR-004**: The restyle MUST NOT modify the backend, any API contract, the database, or
  any business/calculation logic.
- **FR-005**: All existing accessibility attributes and test-relevant selectors (e.g.,
  `aria-label`, `role`, `data-label`) MUST be preserved unchanged so existing automated
  tests continue to pass without modification to their assertions.
- **FR-006**: No CSS framework, UI component library, or styling dependency other than
  Tailwind CSS MUST be introduced.
- **FR-007**: Once the restyle is complete for a given screen or component, that screen or
  component MUST NOT retain now-unused plain CSS rules that duplicate what Tailwind utility
  classes now provide (dead CSS should not accumulate).
- **FR-008**: The restyle MUST preserve existing responsive behavior (e.g., the holdings
  table's narrow-screen layout) so the application remains usable at the same range of
  screen sizes as before.

### Key Entities

*(Not applicable — this feature is a presentation-layer change and introduces no new data
entities.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing user flows (create portfolio, add investment, record
  transaction, update price, view dashboard/holdings) complete successfully after the
  restyle, with no functional regression, verified via the existing automated test suite
  passing unmodified in its assertions.
- **SC-002**: 100% of existing screens display with no visually broken elements (no missing
  spacing, unstyled/overlapping content, or illegible text) after the restyle.
- **SC-003**: Zero backend, API, or database changes are introduced, confirmed by zero
  modified files outside the frontend styling/markup layer.
- **SC-004**: The frontend's styling approach uses exactly one CSS methodology (Tailwind
  CSS utilities) with no leftover competing framework, confirmed by inspecting frontend
  dependencies and stylesheets after the change.

## Assumptions

- "Modernize" means updating visual styling (spacing, typography, color, borders, shadows,
  basic layout polish) using Tailwind CSS utility classes, not introducing new pages,
  navigation patterns, or interaction paradigms.
- Tailwind CSS will be added as a frontend build-time dependency (its standard
  integration path with Vite); this is understood by the requester to mean introducing a
  new frontend dependency, which is why this specification calls out the Constitution
  Conflict Notice above — the current constitution's "plain CSS only, no additional
  frameworks" boundary would need to be amended (via `/speckit-constitution`) or an
  explicit, justified deviation accepted before implementation planning can proceed.
- Existing component structure (e.g., `HoldingsTable`, `SummaryPanel`, form components) is
  restyled in place rather than rewritten or replaced with new component libraries.
- "Minimal visual improvements" means the restyle should read as a polish pass (consistent
  spacing/typography/color system) rather than a full visual redesign with new branding,
  imagery, or layout concepts.
- Existing automated tests (React Testing Library) are the acceptance mechanism for "no
  functional regression" — no new manual QA process is introduced by this feature.
