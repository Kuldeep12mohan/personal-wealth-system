# Phase 0 Research: Personal Wealth Management System POC

All items below were either fixed by the constitution/source specification
(no research needed) or required a small, low-risk implementation decision
to remove ambiguity before design. No item in the Technical Context was
left as `NEEDS CLARIFICATION` — this feature's technology stack is fully
constrained by `.specify/memory/constitution.md` (Principle IX, Technology
& Scope Boundaries), so Phase 0 here is limited to a handful of concrete
implementation-detail decisions the spec and constitution intentionally
left to planning.

## Decision: Identifier format and generation strategy

- **Decision**: Generate identifiers as `PORT-<n>`, `HOLD-<n>`, `TXN-<n>`
  where `<n>` is an auto-incrementing integer per entity type, seeded at
  10001 (portfolios), 20001 (holdings), and 30001 (transactions) to match
  the source document's examples (`PORT-10001`, `HOLD-20001`,
  `TXN-30001`). Implemented as a SQLite `INTEGER PRIMARY KEY AUTOINCREMENT`
  numeric column plus a computed/formatted display id, or a simple offset
  applied to the autoincrement value.
- **Rationale**: Matches the source specification's examples exactly
  (Requirement-to-Code Traceability, Constitution Principle VII); requires
  no additional library (Constitution Principle IX); SQLite autoincrement
  is sufficient for single-process, single-user POC use.
- **Alternatives considered**: UUIDs (rejected — the source document's
  examples are clearly short sequential codes, and UUIDs would fail
  FR-002/FR-006's "generate a unique identifier" acceptance scenarios in a
  way that diverges from the documented examples for no benefit at this
  scale).

## Decision: Monetary and quantity rounding implementation

- **Decision**: Perform all monetary arithmetic using Python's `Decimal`
  type, quantized to 2 decimal places (money) and 4 decimal places
  (quantity) using `ROUND_HALF_UP`, applied at the point each value is
  persisted or returned from a service function (per FR-019a).
- **Rationale**: `Decimal` is part of the Python standard library — no new
  dependency — and avoids the binary floating-point rounding drift that
  would make SC-002's "100% match" success criterion untestable.
- **Alternatives considered**: Plain `float` (rejected — floating-point
  rounding errors would make exact-match assertions in tests flaky).

## Decision: Supported currency list

- **Decision**: Support a fixed, small list of currency codes for the
  portfolio's base currency: `INR`, `USD` (per the clarification recorded
  in spec.md FR-001/FR-003). The list lives as a single constant in
  `backend/app/services/` (or `schemas/`), not a database table.
- **Rationale**: The source document's only example is `INR`; a fixed
  short list satisfies FR-001 while avoiding an unnecessary
  currency-management feature (Constitution Principle I/IX). A constant
  is simpler than a table for a POC with no currency CRUD requirement.
- **Alternatives considered**: Full ISO 4217 list (rejected — adds
  validation surface with no corresponding requirement); free text
  (rejected — explicitly ruled out during clarification).

## Decision: Frontend test runner pairing with React Testing Library

- **Decision**: Use Vitest as the test runner that executes React Testing
  Library assertions in the frontend project.
- **Rationale**: The source specification and constitution name "React
  Testing Library" but a runner is still required to execute tests; Vitest
  is the Vite-native runner (same config/transform pipeline as the app
  itself), so it adds the least incremental setup of any option and stays
  consistent with Constitution Principle IX's "no additional
  frameworks" intent — it is the natural, near-zero-config counterpart to
  the Vite build already mandated.
- **Alternatives considered**: Jest (rejected — needs separate transform
  configuration to work with Vite's ESM/TypeScript pipeline, which is
  more setup than a POC needs).

## Decision: Database schema creation (no migration tool)

- **Decision**: Create the SQLite schema at application startup via
  SQLAlchemy's `Base.metadata.create_all(engine)`. No Alembic or other
  migration tool is introduced.
- **Rationale**: The 3-entity schema is fixed for the POC's initial
  implementation; a migration tool is infrastructure the specification
  and constitution do not call for (Constitution Principle IX). If the
  incremental-change experiments (percentage allocation, sell-quantity
  validation) require a schema change later, `create_all` combined with
  deleting/recreating the local SQLite file remains sufficient for POC
  purposes.
- **Alternatives considered**: Alembic migrations (rejected — unnecessary
  operational complexity for a single-developer, single-environment POC).

## Output

All Technical Context fields are resolved (no remaining
`NEEDS CLARIFICATION` markers). Proceeding to Phase 1 design.
