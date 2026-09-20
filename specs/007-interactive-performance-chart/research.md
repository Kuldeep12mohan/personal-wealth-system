# Phase 0 Research: Interactive Performance History Chart

No `NEEDS CLARIFICATION` markers remain in the Technical Context. This document records the implementation-approach decisions needed before touching the component.

## Decision: Tooltip and marker interactivity via React state, no charting library

- **Decision**: A single `activeIndex: number | null` state value tracks which history point is currently "active" (hovered on desktop, tapped on mobile). Each point's `<circle>` marker gets `onMouseEnter`/`onMouseLeave` (desktop) and `onClick` (works for both mouse click and touch tap) handlers that set/clear `activeIndex`. A background `<rect>` behind the plot, with its own `onClick`, clears `activeIndex` when the user taps/clicks elsewhere on the chart (satisfying the "tapping elsewhere dismisses it" behavior from spec.md Assumptions).
- **Rationale**: Satisfies FR-006/FR-007 without a charting library, consistent with constitution Principle IX (no new dependency) and the precedent set by `specs/005`/`specs/006`. `onClick` naturally fires for both mouse and touch in React/DOM, avoiding the need for separate touch-event handling.
- **Alternatives considered**: A charting library with built-in tooltip support (e.g., Recharts) was rejected — it would be a second dependency exception on top of Tailwind, a larger ask than the constitution amendment already required for interactivity itself, and unnecessary given the hand-rolled approach already works for this scale of chart.

## Decision: Tooltip positioned via percentage coordinates over the SVG, not `foreignObject`

- **Decision**: The tooltip is a plain HTML `<div>` absolutely positioned over the chart, using `left`/`top` expressed as percentages derived from the active point's SVG-space `(x, y)` divided by `CHART_WIDTH`/`CHART_HEIGHT` — since the SVG uses `viewBox` scaling, percentage-based positioning stays correctly aligned with the rendered marker regardless of the SVG's actual rendered pixel size (responsive by construction, satisfying FR-008).
- **Rationale**: Avoids SVG `foreignObject` (inconsistent cross-browser text-wrapping behavior) and avoids needing a `ResizeObserver`/pixel-measurement approach, keeping the implementation dependency-free and simple (Principle I).
- **Alternatives considered**: Measuring the SVG's rendered bounding box via a ref and computing pixel offsets was rejected as unnecessary complexity — the percentage-based approach achieves the same visual result with no JavaScript measurement code and no re-render-on-resize logic.

## Decision: Currency formatting via native `Intl.NumberFormat`, threaded down as a prop

- **Decision**: `App.tsx` already holds the full `Portfolio[]` list (each with `currency`); it looks up the selected portfolio's `currency` and passes it to `PortfolioDashboardPage`, which forwards it to `PerformanceHistoryChart`. The chart formats Y-axis labels and tooltip amounts via `new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)`.
- **Rationale**: `Intl.NumberFormat` is a browser-native API — no new dependency, consistent with constitution Principle IX. Threading currency as a prop is additive (no new fetch, no new endpoint) and reuses data `App.tsx` already has, satisfying FR-011 and the spec's Assumption that currency is "already available wherever this chart is rendered."
- **Alternatives considered**: Fetching currency directly inside the chart component (e.g., via a new `getPortfolio(portfolioId)` call) was rejected — it would require either a new backend endpoint (there is currently no `GET /portfolios/{id}` single-portfolio endpoint, only the list and summary endpoints) or fetching the full portfolio list redundantly from a leaf component, both unnecessary given the data already exists one level up.

## Decision: Fixed axis label counts computed by simple index sampling

- **Decision**: X-axis: pick indices `0` and `history.length - 1` always, plus up to 4 more evenly spaced indices in between (`Math.round(i * (length-1) / (labelCount-1))` for `i` in range), de-duplicating any indices that coincide when there are fewer points than label slots. Y-axis: 3 evenly spaced value labels (data max, midpoint, data min) with a horizontal gridline `<line>` at each.
- **Rationale**: Satisfies FR-002 and FR-003 with simple arithmetic — no new dependency, no date-bucketing library. Matches the spec's Assumption of "4-6" evenly spaced date labels and keeps the Y-axis to a small, legible set of reference lines (extending `specs/006`'s "minimal labeling" precedent from 2 labels — min/max — to 3, adding a midpoint for a more chart-like feel, still non-cluttered per FR-010).
- **Alternatives considered**: A "nice numbers" gridline algorithm (as full charting libraries use, e.g., rounding to nearest 100/1000) was considered but rejected as unnecessary complexity for a POC-scale chart with no requirement for exact round-number gridlines.
