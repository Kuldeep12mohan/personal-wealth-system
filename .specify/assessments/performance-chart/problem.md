# Problem Definition: Historical Performance Chart

- **Slug**: performance-chart
- **Created**: 2026-09-20
- **Inputs used**: intake.md, research.md

## Problem Statement

The personal-wealth app currently shows only a live, single-point-in-time snapshot of a portfolio's value and profit/loss (via `SummaryPanel` and `HoldingsTable`); it retains no history, so the app's sole user cannot see whether their portfolio's value or returns are trending up or down over time — the core question a "wealth" tracker (as opposed to a static holdings list) is meant to answer.

## Affected Users & Stakeholders

- **Users**: the project owner, as the single end-user of the app in its current single-user POC form — affected by not being able to see value/P&L trend over time, only the current state. [source: research.md Users & Demand]
- **Stakeholders**: the project owner, in their dual role as (a) the person who would use this feature and (b) the owner of the SpecKit SDD evaluation POC, who also controls whether the constitution is amended to permit it. There is no other stakeholder — no team, no other users. [NEEDS CLARIFICATION: none expected, but flagged since research found no stakeholder beyond the single owner]

## Goals

- Let the user answer "is my portfolio growing?" and "how has my P&L changed over time?" without manually re-deriving it from transaction history.
- Preserve a record of portfolio value (and ideally P&L) at meaningful points in time, rather than only the current computed state.
- Present that history visually (a trend line) rather than as a raw table, per the original idea.

## Non-Goals

- Real-time or continuously-updating market-driven history — the app has no live price feed; history only advances on discrete user actions (price updates, transactions) or a simple scheduled snapshot, consistent with the existing manual-entry model. [source: research.md Data & Constraints]
- Per-holding historical charts, benchmarking against indices, or any analytics beyond a portfolio-level value/P&L trend — these would compound scope further and are not part of the original idea. [source: intake.md]
- Any feature separately listed in the constitution's Out-of-Scope list beyond charts themselves (dividend tracking, SIP automation, brokerage integrations, etc.) — this problem is scoped to history + trend visualization only.
- Resolving the constitutional conflict itself is a non-goal of this stage — `/speckit-assess-decide` and, if it proceeds, `/speckit-constitution` are where that gets decided/amended, not here.

## Success Metrics

- Qualitative: the project owner can look at the dashboard and state whether their portfolio value has gone up or down over a recent period, without doing manual arithmetic. (baseline: currently impossible — no historical data exists at all) [qualitative, no historical measurement tool exists to baseline against]
- Qualitative: at least one snapshot is captured per meaningful portfolio-changing event (price update and/or transaction), so no user action that changes value is invisible to the history. (baseline: 0 snapshots captured today, by construction)
- Process metric (specific to this POC's own stated evaluation purpose): the amendment + spec + implementation for this feature stays as narrowly scoped as the 003/004 precedents where possible, since one of research's key findings is that this idea currently spans three boundaries (entity count, endpoint count, dependency) at once rather than one. (baseline: 003 and 004 each touched exactly one boundary) [qualitative]

## Cost of Inaction

If this is not built, the app remains a "current holdings and current P&L" viewer rather than a wealth *tracker* in the trend sense — functionally complete per its existing constitution and specs, but unable to show growth or decline over time. Given the single-user, non-production nature of the POC, the cost is low and personal (mild inconvenience to the owner, who can still infer rough trends by remembering past manual checks) rather than any measured business or user-attrition cost — research found no usage data or complaint driving this beyond the owner's own stated interest.

## Open Questions

- [NEEDS CLARIFICATION: Is solving this worth a constitution amendment that spans three boundaries at once (new entity, new endpoint, possible new frontend dependency), given this project's own stated goal of measuring narrowly-scoped SDD change propagation? This is the central question `/speckit-assess-shape` and `/speckit-assess-decide` need to weigh.]
- [NEEDS CLARIFICATION: Snapshot trigger scope — price updates only, transactions only, both, or a schedule — left open per research.md.]
- [NEEDS CLARIFICATION: Whether P&L history requires storing invested-capital-at-snapshot-time or can be recomputed later, affecting how large the new entity/data model needs to be.]
- [NEEDS CLARIFICATION: Charting implementation approach (hand-rolled SVG vs. a new library dependency) — affects whether this needs one boundary exception or two.]
