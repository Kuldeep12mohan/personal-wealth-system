# Idea Research: Historical Performance Chart

- **Slug**: performance-chart
- **Created**: 2026-09-20
- **Evidence confidence (overall)**: medium

## Users & Demand

- The sole user of this POC is the project owner (kuldeep_kumar@epam.com), who is also the requester of this idea's parent analysis session. There is no independent user research, ticket, or usage-log signal — the "demand" is a single stakeholder's stated interest surfaced during an assistant-led feature-brainstorm, not an observed pain point. — [source: this conversation] (confidence: high that this is the only signal; low as demand evidence)
- ASSUMPTION: A wealth-tracking tool's core value proposition (seeing whether net worth is growing) is weakened without any trend view — only a live snapshot exists today (`SummaryPanel`, `HoldingsTable`). This is a reasonable inference from the app's stated purpose, not a sourced user complaint. (confidence: medium, ASSUMPTION)

## Prior Art

- Internal: no prior spec or code in this repo touches historical snapshots or charting of any kind. `specs/001` through `specs/004` cover core CRUD, allocation %, Tailwind styling, and portfolio switching only — none introduce a time-series concept. — [source: specs/001-004 directory listing] (confidence: high)
- Internal, directly relevant: the project's own constitution (`.specify/memory/constitution.md`, v1.3.0) explicitly lists **"advanced charts"** in its "Out of scope (must not be built)" list under Technology & Scope Boundaries, alongside dividend tracking, SIP automation, and multi-user access. This is the single most important prior-art finding: the idea as stated collides directly with a named, current exclusion, not just an unaddressed gap. — [source: .specify/memory/constitution.md lines 213–217] (confidence: high)
- Internal precedent for *how* such a collision gets resolved: two prior features (003-tailwind-ui-modernization, 004-portfolio-switcher) each required a formal constitution amendment (v1.1.0→1.2.0 for Tailwind; v1.2.0→1.3.0 for the extra endpoint) before implementation, following a documented "Sync Impact Report" pattern. Both amendments were scoped narrowly (one exception each) rather than reopening the stack broadly. — [source: constitution.md Sync Impact Report header, and version-history bullets in Principles I/IX] (confidence: high)
- External: line/trend charts for portfolio value over time are a standard, near-universal feature in commercial and open-source personal-finance tools (e.g., Mint-style trend graphs, brokerage "performance over time" views). No specific external source was fetched (none was supplied and no URL was in scope for this research pass), so this is recorded as a general-knowledge assumption rather than a cited external source. (confidence: medium, ASSUMPTION)

## Market & Context

- Cost of doing nothing: the app continues to answer "what is my portfolio worth right now" but not "is it growing," which is arguably the more important question for a *wealth* tracker (as opposed to a *holdings* list). This is an assumption about user value, not measured. (confidence: medium, ASSUMPTION)
- No competitive/market research was performed for this pass — the project is an internal single-user POC, not a product being benchmarked against competitors for a launch decision. — ASSUMPTION that competitive analysis is out of scope for this POC.

## Data & Constraints

- Current data model has exactly 3 entities (Portfolio, Holding, Transaction) and the constitution caps entities at 3 "without a specification change" (Principle IX / Technology & Scope Boundaries). A history feature almost certainly requires a new persisted concept (e.g., a `PortfolioSnapshot`/`ValuationHistory` row per snapshot event), which is a 4th entity. — [source: constitution.md lines 190–193] (confidence: high)
- Current API surface is capped at exactly 7 endpoints, each individually enumerated in the constitution, with new endpoints requiring a spec update following the same approval pattern as the 004 exception. A chart feature needs at least one new read endpoint (e.g., `GET /portfolios/{id}/history`). — [source: constitution.md lines 194–201] (confidence: high)
- No charting library exists in the current stack (Tailwind CSS is the only approved frontend addition beyond React/TS/Vite; Principle IX names Tailwind as "the one approved exception to an otherwise closed stack"). Any real chart component (e.g., Recharts, Chart.js, Victory) would be a second library exception requiring its own justification, or the team hand-rolls an SVG line chart to avoid a new dependency. — [source: constitution.md Principle IX] (confidence: high)
- Snapshot volume is low by construction: this is a manual-entry, single-user, no-real-time-feed app, so history only advances on user actions (price updates, transactions) or a low-frequency schedule — no performance/scale concern. (confidence: high, ASSUMPTION grounded in existing architecture)

## Evidence Against the Idea

- **Direct constitutional conflict**: "advanced charts" is explicitly named in the current Out-of-Scope list. Building this without first amending the constitution would violate Principle IX and the Technology & Scope Boundaries section as written today — this is the strongest reason not to proceed straight to implementation. — [source: constitution.md line 217]
- **Scope creep on two axes at once**: unlike the 003/004 precedents (each touched exactly one boundary — styling approach, or endpoint count), this idea simultaneously requires a new entity (breaking the "exactly three entities" rule) AND a new endpoint (extending the 7-endpoint cap again) AND potentially a new frontend dependency (breaking the "Tailwind is the sole exception" rule). That is a wider amendment than any prior change in this project's history.
- **Ambiguous trigger semantics compound the scope**: "even if just on each price update" (per the original idea) is under-specified — it doesn't distinguish organic value change (BUY/SELL) from manual price correction, and doesn't say whether snapshots also need to capture invested-capital-at-that-time to make P&L%-over-time meaningful, which could balloon the data model further.
- **No measured demand**: this is a single stakeholder's brainstorm suggestion for a one-day SDD-evaluation POC, not a request arising from actual usage pain — for a project whose stated purpose is to measure the SDD process itself (not to maximize end-user feature richness), "does this help evaluate SpecKit" is arguably a more relevant question than "is this useful to a wealth-tracker user."

## Gaps & Open Questions

- [NEEDS CLARIFICATION: Is the project owner willing to amend the constitution again (a 3rd amendment) to lift "advanced charts" from Out-of-Scope, and to raise both the entity cap and endpoint cap? Or should scope be trimmed to fit within existing boundaries — e.g., a "simple sparkline" argued as not "advanced," to avoid touching the out-of-scope line?]
- [NEEDS CLARIFICATION: Snapshot trigger — price update only, every transaction, both, or a scheduled cadence?]
- [NEEDS CLARIFICATION: Retention window and whether snapshot data needs to store P&L% at time-of-snapshot or be recomputed later from stored (value, invested) pairs?]
- [NEEDS CLARIFICATION: Charting approach — hand-rolled SVG (no new dependency, likely easier to justify under Principle IX) vs. a charting library (would need its own constitution exception, mirroring the Tailwind precedent)?]

## Sources

- No external URLs were fetched for this research pass — no links were supplied and general market claims about competitor charting features are marked as ASSUMPTION rather than cited. Internal sources cited above are repository paths, not URLs.
