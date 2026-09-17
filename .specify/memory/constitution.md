<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Rationale: MINOR bump — the UI scope constraint is materially redefined
(4 screens → maximum 2 screens, with explicit screen composition) while
no principle is removed or backward-incompatibly redefined. No backend
API, data model, business rule, or calculation is affected.

Modified principles:
- I. Simplicity First — "4 UI screens" → "a maximum of 2 UI screens"

Added sections:
- "UI Scope" bullet added under Technology & Scope Boundaries, defining
  the two consolidated screens (Portfolio Setup; Portfolio Dashboard) and
  their contained actions/views.

Removed sections: none.

Templates requiring updates (checked, not modified by this command):
- .specify/templates/plan-template.md — ✅ compatible
- .specify/templates/spec-template.md — ✅ compatible
- .specify/templates/tasks-template.md — ✅ compatible
- .claude/commands/speckit-*.md — ✅ no changes required

Follow-up TODOs: none.
-->

# Personal Wealth Management System (SpecKit SDD POC) Constitution

## Core Principles

### I. Simplicity First
The system MUST implement only what is described in
`docs/Personal_Wealth_Management-SpecKit_SDD_POC.pdf`: 3 entities
(Portfolio, Holding, Transaction), 6 APIs, a maximum of 2 UI screens, and
one portfolio calculation model. Every design or implementation choice MUST favor the
smallest solution that satisfies the specification over a more general or
"future-proof" one. When two approaches both satisfy a requirement, the
one with fewer moving parts (fewer files, fewer layers, fewer
configuration options) MUST be chosen.
**Rationale**: This is a one-day POC whose purpose is to evaluate
Spec-Driven Development, not to build a production wealth-management
platform. Unnecessary generality wastes implementation time and inflates
the token-consumption measurements the POC is meant to produce.

### II. Maintainability Through Convention
Code MUST follow the repository structure defined in the source
specification (`frontend/src/{components,pages,services}`,
`backend/app/{api,models,schemas,services}`, `backend/tests`). Naming for
entities, fields, and endpoints MUST match the specification exactly
(e.g. `portfolioId`, `holdingId`, `transactionId`, `currentValue`).
Business logic (calculations, validation) MUST live in backend
`services/`, never duplicated across API handlers or the frontend.
**Rationale**: A small POC with three entities and six endpoints stays
easy to extend and review only if naming and structure are predictable;
divergent naming between spec, API, and code is the single biggest
source of confusion in short-lived SDD experiments.

### III. Testability by Design
Every business rule and calculation defined in the specification
(portfolio creation, holding validation, BUY/SELL rules, average price,
current value, profit/loss) MUST have at least one corresponding
automated test (Pytest for backend logic and API contracts, React
Testing Library for frontend components/pages). Tests MUST be written or
updated in the same change that introduces or modifies the behavior they
cover. A feature is not "done" until its tests exist and pass.
**Rationale**: One of the POC's explicit success criteria is that "tests
cover the important requirements" and that "existing functionality
continues to work after changes" — this is only verifiable if tests are
treated as part of the deliverable, not an afterthought.

### IV. Clear Frontend/Backend Separation
The frontend (React/TypeScript/Vite) MUST NOT contain business logic,
calculation rules, or persistence logic; its responsibility is limited to
collecting user input, calling the documented REST APIs, and rendering
returned data. The backend (FastAPI/SQLAlchemy) owns all validation,
calculations, and persistence, and MUST NOT assume any particular UI
framework or rendering behavior. Frontend and backend MUST be able to be
built, tested, and reasoned about independently, communicating only
through the documented JSON API contract.
**Rationale**: Clear separation keeps each layer small and testable in
isolation, matches the two-track technology stack mandated by the
specification, and prevents calculation logic from silently drifting
out of sync between client and server.

### V. API Contract Consistency
The 6 REST endpoints, their request/response JSON shapes, field names,
and HTTP status codes (400, 404, 409) MUST match
`docs/Personal_Wealth_Management-SpecKit_SDD_POC.pdf` exactly unless a
change is introduced through the incremental-change process (Principle
VIII). Any change to a request/response schema MUST be reflected
simultaneously in the specification, the backend schema/route, and any
frontend service call that consumes it — these three MUST never be
allowed to drift apart.
**Rationale**: API drift between spec, backend, and frontend is the
primary failure mode this POC is designed to detect; contract
consistency is both a development principle and the thing being
measured.

### VI. Explicit Business-Rule Validation
All business rules listed in the specification's "Business Rules" and
"Transaction Rules" sections (mandatory fields, supported investment
types, supported transaction types, positive quantity/price, SELL
quantity not exceeding held quantity, positive current price) MUST be
enforced explicitly in backend code with a clear, testable error path
(400/404/409 with a descriptive error message), not left as implicit
behavior or only enforced in the UI. The frontend MAY perform the same
validation for user experience, but the backend validation is
authoritative and MUST NOT be skipped.
**Rationale**: The specification enumerates a deliberately small,
closed set of rules; enforcing them explicitly and server-side is what
makes "invalid transactions are rejected" a verifiable success
criterion rather than an assumption.

### VII. Requirement-to-Code Traceability
Every implemented feature, API, validation rule, and calculation MUST be
traceable back to a specific section of the source specification or an
approved incremental change request. Specifications, plans, and tasks
produced through the SpecKit workflow are the primary reference for
implementation — when code and specification disagree, the specification
(as amended through the proper workflow) wins, and the code MUST be
corrected or the specification MUST be updated through an explicit
change, never left silently inconsistent.
**Rationale**: Requirement-to-code traceability is one of the named
dimensions this POC is meant to evaluate; without deliberate discipline
here, the experiment cannot produce a meaningful comparison against the
BMAD baseline.

### VIII. Safe, Controlled Incremental Specification Changes
Changes to already-implemented behavior (such as the percentage
allocation feature and the sell-quantity validation experiment described
in the source specification) MUST flow through the same SpecKit stages
as the initial build: specification update → clarification →
plan/tasks update → implementation → tests. A change MUST NOT be
implemented directly in code without first updating the specification
that describes it. Each incremental change MUST be scoped to the minimum
set of files it touches (spec, calculation logic, API response, frontend
view, tests) and MUST NOT be used as an opportunity to widen scope beyond
the change request.
**Rationale**: The incremental-change experiment is an explicit,
named part of this POC's evaluation goals; changes made outside the SDD
workflow would defeat the purpose of measuring how well specification
changes propagate through implementation.

### IX. Minimal Architecture, Dependencies & Infrastructure
The project MUST use only the technology stack defined in the
specification: React + TypeScript + Vite + plain CSS (frontend), FastAPI
+ SQLAlchemy (backend), SQLite (database), Pytest + React Testing
Library (tests). No additional frameworks, state-management libraries,
ORMs, message queues, containers, CI/CD pipelines, cloud services, or
microservices MAY be introduced. Anything listed in the specification's
"Explicitly Out of Scope" section (authentication/SSO, real-time market
data, brokerage/bank integrations, tax/capital-gains logic, notifications,
cloud deployment, multi-user access control, advanced charts, etc.) MUST
NOT be implemented, even if it would be "nice to have."
**Rationale**: The specification states the stack is "intentionally
simple to minimize implementation and token overhead" and defines an
explicit out-of-scope list; adding architecture or dependencies beyond
this list changes what is being measured and risks missing the one-day
implementation target.

## Technology & Scope Boundaries

- **Frontend**: React, TypeScript, Vite, plain CSS — no additional UI
  frameworks or component libraries.
- **Backend**: Python, FastAPI, SQLAlchemy.
- **Database**: SQLite.
- **Testing**: Pytest (backend), React Testing Library (frontend).
- **Data model**: exactly three entities — Portfolio, Holding,
  Transaction — with a 1:N:N relationship as defined in the
  specification. No additional entities may be introduced without a
  specification change.
- **APIs**: exactly the six endpoints defined in the specification
  (create portfolio, add holding, record transaction, view holdings,
  update current price, view portfolio summary). New endpoints require a
  specification update first.
- **UI scope**: a maximum of 2 screens, consolidating the source
  specification's four screens without dropping any of their
  functionality:
  1. **Portfolio Setup** — Create Portfolio, Add Investment, and Record
     BUY/SELL Transaction.
  2. **Portfolio Dashboard** — Portfolio summary, holdings list, current
     price display, and actions to add investments, record transactions,
     and update prices as appropriate.
  This is a UI consolidation only; it MUST NOT be used to remove or
  alter any backend API, data model, business rule, or calculation from
  the source specification.
- **Out of scope** (must not be built): real-time market data, NSE/BSE or
  brokerage/bank integrations, authentication/SSO, tax or capital-gains
  calculation, dividend tracking, SIP automation, financial advice or AI
  recommendations, portfolio optimization, notifications, cloud
  deployment, microservices, advanced charts, multi-user access control.

## Development Workflow (SpecKit SDD)

- The initial feature and every incremental change MUST move through the
  SpecKit stages in order: Specification → Clarification → Plan → Tasks
  → Implementation → Tests. Stages MAY be revisited (e.g., clarification
  after plan reveals a gap) but MUST NOT be skipped outright.
- The specification remains the single source of truth for expected
  behavior; plans and tasks derive from it, and implementation derives
  from plans and tasks.
- A pull request or completed task is not considered done unless: (a) it
  traces to a specification section or approved change request, (b) it
  respects the technology and scope boundaries above, and (c) it includes
  passing tests for the behavior it introduces or changes.
- Manual corrections and deviations from generated artifacts should be
  minimized; when a correction is needed, prefer fixing the specification
  or plan and regenerating, over patching code in a way that leaves the
  specification stale.

## Governance

This constitution governs all specification, planning, and implementation
work in this repository and supersedes ad-hoc practice where the two
conflict.

**Amendment procedure**: Amendments are made only via the
`/speckit-constitution` workflow (or equivalent constitution-update
process), which MUST regenerate the Sync Impact Report, bump the version
per the policy below, and update `LAST_AMENDED_DATE`. Amendments MUST NOT
be made by directly editing this file outside that workflow.

**Versioning policy** (semantic versioning for this document):
- **MAJOR**: Removal or incompatible redefinition of a principle, or a
  change that removes a governance safeguard.
- **MINOR**: A new principle or section is added, or existing guidance is
  materially expanded.
- **PATCH**: Wording clarifications, typo fixes, or non-semantic
  refinements that do not change what is required or prohibited.

**Compliance review**: Every specification, plan, and task set produced
during this POC MUST include a check against these principles (in
particular Simplicity, Technology & Scope Boundaries, and API Contract
Consistency) before implementation begins. Any deviation MUST be
justified explicitly in the relevant artifact (e.g., a "Complexity
Justification" note in the plan) or the deviation MUST be removed.

**Version**: 1.1.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-17
