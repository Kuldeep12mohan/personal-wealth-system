# Concept: Historical Performance Chart

- **Slug**: performance-chart
- **Created**: 2026-09-20
- **Recommended option**: Option A — Minimal Snapshot + Sparkline

## Options

### Option A — Minimal Snapshot + Sparkline
- **Sketch**: On every price update and every transaction (BUY/SELL), the backend writes one lightweight snapshot row (portfolioId, timestamp, totalInvested, currentValue) — no separate profit/loss fields, since P&L and P&L% are derivable from the two stored numbers at read time, matching the existing calculation-in-services convention. The dashboard adds a single new read endpoint (`GET /portfolios/{id}/history`) and renders the series as a hand-rolled inline SVG line ("sparkline"), styled with existing Tailwind classes — no new frontend dependency. The user sees a simple trend line under the summary panel; hovering isn't required for v1.
- **Appetite**: small (a few days, similar order of magnitude to the 004 portfolio-switcher change)
- **Trade-offs**: Wins: touches the smallest possible surface — one new entity, one new endpoint, zero new dependencies, calculation logic stays backend-owned per Principle IV. Sacrifices: no rich interactivity (tooltips, zoom, date-range selection); "advanced charts" framing in the constitution still needs to be squarely addressed since even a sparkline is a chart, and the term "advanced" is not defined — reviewers could argue either way.
- **Rabbit holes**: (1) Deciding what "on every price update" means when a price update doesn't itself change quantity — is that noise or signal in the trend? (2) Snapshot retention/pruning is unaddressed — an actively-used portfolio could accumulate many rows; SQLite has no built-in TTL, so an unbounded table is a latent (if currently harmless, given single-user low volume) design gap. (3) The constitution amendment itself: this is the first change to touch the entity-count and endpoint-count boundaries in the same PR, so the amendment write-up needs unusually careful, narrow scoping to keep with the project's own precedent of one-boundary-at-a-time changes.

### Option B — Full History Library Integration
- **Sketch**: Same snapshot-on-event data model as Option A, but the frontend adopts a real charting library (e.g., Recharts) for a richer, interactive line chart with tooltips, hover values, and a date-range selector, plus a dedicated "History" view rather than an inline sparkline.
- **Appetite**: medium (a new dependency evaluation/integration, a new UI surface, plus the same backend work as Option A)
- **Trade-offs**: Wins: materially better UX for actually inspecting trend data (hover for exact values, zoom into ranges). Sacrifices: adds a second approved-exception dependency on top of Tailwind, which is a larger constitutional ask than Option A and directly cuts against Principle IX's "Tailwind is the sole approved exception to an otherwise closed stack" language; also risks exceeding the "maximum of 2 UI screens" boundary if implemented as a separate screen rather than a dashboard panel.
- **Rabbit holes**: Library selection/bundle-size/license review becomes its own mini-project; "just add a history screen" tends to invite further scope (filters, per-holding drill-down) that this problem's non-goals explicitly exclude.

### Option C — Do Nothing (Manual Tracking Stays External)
- **Sketch**: Don't build this in-app; the user continues to informally track trend by memory or by exporting/checking data outside the app (e.g., in a spreadsheet) if they want history.
- **Appetite**: none
- **Trade-offs**: Wins: zero constitutional risk, zero implementation cost, preserves the project's minimal-scope identity untouched. Sacrifices: the stated problem (no visibility into trend) remains completely unsolved; the app stays a pure current-state viewer.
- **Rabbit holes**: none — but this option should only be chosen if the owner genuinely doesn't value the feature enough to justify even a small, narrowly-scoped amendment, given research found the "demand" signal is just the owner's own stated interest.

## Recommendation

**Option A — Minimal Snapshot + Sparkline.** It directly satisfies the problem's goals (see problem.md: trend visibility, preserved history, visual presentation) at the smallest appetite, and it is the only option that keeps the amendment close in spirit to the project's own precedent of narrow, single-purpose constitution changes (003 touched styling only; 004 touched endpoint count only). Option B's second-dependency ask is a much harder sell against Principle IX's explicit "sole approved exception" language and risks the 2-screen cap too. Option C leaves the defined problem unsolved and is only right if, on reflection, the owner decides this isn't worth even a small amendment — which is a legitimate outcome `/speckit-assess-decide` should weigh explicitly, not assume away.

## Out of Scope (for the recommended option)

- Per-holding historical charts or trend lines (portfolio-level only).
- Interactive chart features: tooltips, zoom, custom date ranges, exportable chart images.
- Benchmarking against market indices or any external comparison series.
- Snapshot pruning/retention policy — deferred; acceptable for now given single-user, low-volume, manual-entry usage, but should be flagged as a known gap in the eventual spec.
- Any other Out-of-Scope item already named in the constitution (dividend tracking, SIP automation, brokerage integrations, real-time prices, etc.) — unaffected by this concept.

## Assumptions to Validate

- That a plain SVG line/sparkline rendered with Tailwind utility classes will be judged "not advanced" enough to require lifting the "advanced charts" exclusion entirely, or that the exclusion can be narrowly amended (mirroring the Tailwind/endpoint precedents) to carve out exactly this shape of chart — this framing needs to be tested during the constitution-amendment conversation, not assumed here.
- That snapshotting on "every price update and every transaction" is the right trigger granularity — problem.md left this as an open question; Option A's sketch picks it as a starting assumption for shaping purposes only.
- That storing (totalInvested, currentValue) per snapshot is sufficient to derive historical P&L and P&L% correctly, consistent with how current-state P&L is already computed in `backend/app/services` — needs verification against the existing calculation code during specification.
- That the single-user, manual-entry usage pattern keeps snapshot volume low enough that no pruning/pagination is needed for v1.
