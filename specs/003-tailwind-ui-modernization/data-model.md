# Phase 1 Data Model: Tailwind CSS UI Modernization

Not applicable. This feature is a frontend presentation-layer restyle only: no entity,
field, relationship, validation rule, or state transition is added, removed, or modified.

- **Portfolio / Holding / Transaction** — see `specs/001-wealth-management-poc/data-model.md`.
  Unchanged; this feature does not touch data shapes, only how existing data is styled and
  laid out on screen.
- No new derived/presentation values are introduced (compare to
  `specs/002-holding-allocation-percentage/data-model.md`, whose `allocationPercentage`
  derived value is retained as-is and simply re-rendered with Tailwind utility classes).
