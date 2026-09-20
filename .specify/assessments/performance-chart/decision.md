# Decision: Historical Performance Chart

- **Slug**: performance-chart
- **Decided**: 2026-09-20
- **Verdict**: go
- **Artifacts reviewed**: intake.md, research.md, problem.md, concept.md

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | adequate | Real gap: the app shows only current-state value/P&L with no trend view, which undercuts the "wealth tracker" purpose — but affects a single user with no external usage evidence beyond their own stated interest (research.md Users & Demand). |
| Evidence strength | adequate | Internal findings are well-sourced and specific (constitution line citations, prior amendment precedents); demand signal itself is thin (one stakeholder, no usage data), but that thinness is explicitly acknowledged rather than glossed over, and the constitutional-conflict evidence (the decisive fact here) is high-confidence and directly cited. |
| Value vs. inaction | weak | problem.md states the cost of inaction is "low and personal" — the owner can still function without this; there is no measured cost beyond convenience. |
| Feasibility / appetite | adequate | Option A (concept.md) is small-appetite, avoids any new frontend dependency, and reuses existing backend conventions (services-layer calculation, per Principle IV) — credible within a few days of work. |
| Strategic fit | weak | Directly collides with the constitution's explicit "advanced charts" exclusion and simultaneously requires widening the entity cap and endpoint cap — a broader amendment than either prior precedent (003, 004), each of which touched exactly one boundary. |
| Risk posture | adequate | Key risks are named with credible mitigations in concept.md (narrow amendment scoping, no new dependency, deferred retention policy as an acknowledged gap rather than a hidden one) — not "strong" only because the amendment's actual approval and exact "advanced" line-drawing is untested until specification. |

## Verdict & Rationale

**Go**, with the recommended concept (Option A — Minimal Snapshot + Sparkline). The scorecard has two `weak` ratings — value-vs-inaction and strategic fit — both stemming from the same root fact: this is a low-stakes convenience improvement that requires an unusually broad constitution amendment. Per the go/no-go bar, a `go` verdict requires problem validity and evidence strength at `adequate`+, which both are; it does not require every criterion to be `strong`, and weak ratings elsewhere are a matter of explicit trade-off, not disqualifying evidence gaps (contrast with a `weak`/`unknown` evidence-strength rating, which would force `needs-clarification`).

The project owner was presented with this exact trade-off — the three-boundary amendment against the low cost of inaction — and explicitly chose to proceed rather than narrow scope further or kill it. That decision is the deciding factor converting what would otherwise be a marginal call into a clear `go`: the strategic-fit and value-vs-inaction concerns are known, named, and consciously accepted rather than overlooked. The amendment should still be scoped as narrowly as the concept describes (a plain sparkline, no new dependency) to stay as close as possible to the project's own precedent of single-boundary changes, even though this one unavoidably spans more than one.

## If needs-clarification

Not applicable — verdict is `go`.

## If go — Handoff to `/speckit-specify`

- **Problem**: The app shows only current portfolio value/P&L with no history, so the user cannot see whether their portfolio is trending up or down over time.
- **Chosen approach**: Option A — Minimal Snapshot + Sparkline. On every price update and every transaction, persist a lightweight snapshot (portfolioId, timestamp, totalInvested, currentValue); expose it via one new read endpoint (`GET /portfolios/{id}/history`); render it as a hand-rolled inline SVG line/sparkline styled with existing Tailwind classes on the dashboard — no new frontend dependency.
- **In scope**: portfolio-level value/P&L trend visualization; snapshot capture on price-update and transaction events; one new backend entity; one new read endpoint.
- **Out of scope**: per-holding history charts, interactive chart features (tooltips/zoom/date-range selection), benchmarking against external indices, snapshot pruning/retention policy (acknowledged gap, not solved in v1), and every other item already excluded by the constitution (dividend tracking, SIP automation, brokerage integrations, real-time prices, etc.).
- **Success metrics**: qualitative — owner can see portfolio value direction (up/down) over a recent period without manual arithmetic; every price-update/transaction event that changes value produces a visible history point; the eventual constitution amendment stays as narrowly scoped as the concept describes despite spanning more than one boundary.
- **Carried-forward open questions** (must be resolved during specification/clarification):
  - [NEEDS CLARIFICATION: Exact snapshot trigger semantics — does a price update with no quantity change produce a meaningfully different point than a transaction, or should the two be visually/semantically distinguished?]
  - [NEEDS CLARIFICATION: Whether to store invested-capital-at-snapshot-time explicitly or always recompute P&L history from stored (totalInvested, currentValue) pairs — verify against existing calculation logic in `backend/app/services`.]
  - [NEEDS CLARIFICATION: How the constitution amendment should precisely redraw the "advanced charts" exclusion line — e.g., naming "a single portfolio-level sparkline, no interactivity" as the scoped exception, mirroring how Tailwind and the extra endpoint were each named narrowly.]
  - [NEEDS CLARIFICATION: Snapshot retention — explicitly deferred, but the spec should state this as a known, accepted gap rather than leaving it unaddressed.]
