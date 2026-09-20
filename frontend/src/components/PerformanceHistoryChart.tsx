import { HistoryPoint } from "../services/api";

interface Props {
  history: HistoryPoint[];
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 180;
const PADDING = 8;

function buildPoints(values: number[], min: number, max: number): string {
  const range = max - min || 1;
  const step =
    values.length > 1 ? (CHART_WIDTH - PADDING * 2) / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const x = PADDING + index * step;
      const y =
        CHART_HEIGHT -
        PADDING -
        ((value - min) / range) * (CHART_HEIGHT - PADDING * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

/**
 * Portfolio-level history trend (FR-005, FR-006): hand-rolled inline SVG,
 * no charting library, per constitution Principle IX. Two lines — current
 * value and invested amount — over the full, unbounded history.
 */
export default function PerformanceHistoryChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
        No history yet — record a transaction or update a price to start
        tracking this portfolio's trend.
      </p>
    );
  }

  if (history.length === 1) {
    return (
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
        Not enough history yet — one more price update or transaction will
        start showing a trend.
      </p>
    );
  }

  const currentValues = history.map((point) => point.currentValue);
  const investedValues = history.map((point) => point.totalInvested);
  const allValues = [...currentValues, ...investedValues];
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 0);

  return (
    <div>
      <svg
        role="img"
        aria-label="Performance history: current value and invested amount over time"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[180px] w-full"
      >
        <polyline
          points={buildPoints(investedValues, min, max)}
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <polyline
          points={buildPoints(currentValues, min, max)}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
        />
      </svg>
      <div className="mt-2 flex gap-4 text-[13px] text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-4 bg-[var(--color-primary)]" />
          Current value
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-4 border-t-2 border-dashed border-[var(--color-text-muted)]" />
          Invested amount
        </span>
      </div>
    </div>
  );
}
