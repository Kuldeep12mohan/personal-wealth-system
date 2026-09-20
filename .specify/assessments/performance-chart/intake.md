# Idea Intake: Historical Performance Chart

- **Slug**: performance-chart
- **Created**: 2026-09-20
- **Source**: pasted text (from an assistant-generated feature-idea list produced during a project analysis session)
- **Type**: new-capability

## Idea (as captured)

"Historical performance chart — snapshot portfolio value over time (even just on each price update) and plot a line chart of net worth/P&L trend."

## Restated

Add the ability to record a portfolio's total value (and profit/loss) at points in time — at minimum whenever a price is updated — and display that history as a line chart on the dashboard, so a user can see how their portfolio's value and returns have trended rather than only seeing a single current snapshot.

## Origin & Context

- **Raised by**: Suggested by the assistant (Claude) as part of a broader "what could be added next" analysis of the personal-wealth project, requested by the project owner (kuldeep_kumar@epam.com).
- **Trigger**: The project owner asked for an analysis of the existing personal-wealth POC (a single-user investment portfolio tracker) and ideas for new features. This was one of several suggestions, flagged as the highest-priority "quick win" because the app currently only shows a live snapshot of portfolio value with no historical trend.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: What event(s) should trigger a snapshot — every price update only, or also every transaction (BUY/SELL), or a scheduled/periodic snapshot (e.g., daily) independent of user actions?]
- [NEEDS CLARIFICATION: How far back should history be retained/shown — unlimited, or a rolling window?]
- [NEEDS CLARIFICATION: Should the chart show value per-holding, portfolio-total only, or both?]
- [NEEDS CLARIFICATION: Should snapshots also record profit/loss and profit/loss % at that point in time, or should those be recomputed from stored value + a separately tracked "invested" figure?]
- [NEEDS CLARIFICATION: Does adding a new "PortfolioSnapshot" (or similar) entity and a new endpoint conflict with the project's constitution (which fixes the number of REST endpoints and has required formal amendments for prior schema/endpoint additions)? Likely needs a constitution amendment, as with the 003 and 004 features.]
- [NEEDS CLARIFICATION: Which charting approach/library, if any, is acceptable under the constitution's "no extra libraries beyond approved exceptions" rule — or should this be hand-rolled with SVG to avoid a new dependency?]
- [NEEDS CLARIFICATION: Behavior when a portfolio has zero or one historical snapshots — what does the chart show?]
