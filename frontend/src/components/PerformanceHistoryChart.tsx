import { useState } from "react";
import { CurrencyCode, HistoryPoint } from "../services/api";

interface Props {
  history: HistoryPoint[];
  currency: CurrencyCode;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
const PADDING_X = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 16;
const MAX_X_LABELS = 6;
const Y_LABEL_COUNT: number = 3;

function formatDateLabel(iso: string): string {
  // Explicit locale keeps this deterministic across environments/browsers
  // rather than depending on the runtime's default locale.
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value: number, currency: CurrencyCode): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}

const emptyStateClass =
  "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-center text-sm text-[var(--color-text-muted)]";

interface PlotPoint {
  x: number;
  y: number;
}

function computePoints(values: number[], min: number, max: number): PlotPoint[] {
  const range = max - min || 1;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const step =
    values.length > 1 ? (CHART_WIDTH - PADDING_X * 2) / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: PADDING_X + index * step,
    y: CHART_HEIGHT - PADDING_BOTTOM - ((value - min) / range) * plotHeight,
  }));
}

function toPolylinePoints(points: PlotPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/** Evenly spaced indices for axis labels, always including the first and last. */
function evenlySpacedIndices(length: number, maxLabels: number): number[] {
  if (length <= maxLabels) {
    return Array.from({ length }, (_, i) => i);
  }
  const indices = new Set<number>();
  for (let i = 0; i < maxLabels; i++) {
    indices.add(Math.round((i * (length - 1)) / (maxLabels - 1)));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

function markerColor(currentValue: number, totalInvested: number): string {
  if (currentValue > totalInvested) return "var(--color-success)";
  if (currentValue < totalInvested) return "var(--color-danger)";
  return "var(--color-text-muted)";
}

/**
 * Interactive portfolio-level history trend (specs/007): hand-rolled inline
 * SVG, no charting library, per constitution Principle IX. Two lines —
 * current value and invested amount — with currency-formatted axes,
 * gridlines, always-visible color-coded point markers, and a hover
 * (desktop) / tap (mobile) tooltip per point.
 */
export default function PerformanceHistoryChart({ history, currency }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <p className={emptyStateClass}>
        No history yet — record a transaction or update a price to start
        tracking this portfolio's trend.
      </p>
    );
  }

  if (history.length === 1) {
    return (
      <p className={emptyStateClass}>
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

  const currentPoints = computePoints(currentValues, min, max);
  const investedPoints = computePoints(investedValues, min, max);

  const yLabelValues = Array.from({ length: Y_LABEL_COUNT }, (_, i) => {
    const t = Y_LABEL_COUNT === 1 ? 0 : i / (Y_LABEL_COUNT - 1);
    return max - t * (max - min);
  });
  const xLabelIndices = evenlySpacedIndices(history.length, MAX_X_LABELS);

  const active = activeIndex !== null ? history[activeIndex] : null;
  const activePoint = activeIndex !== null ? currentPoints[activeIndex] : null;
  const activeLeftPct = activePoint ? (activePoint.x / CHART_WIDTH) * 100 : 0;
  const activeTopPct = activePoint ? (activePoint.y / CHART_HEIGHT) * 100 : 0;
  // Clamp near the plot's edges so the tooltip never renders off-screen.
  const clampedTransform =
    activeLeftPct < 15
      ? "translate(0%, -110%)"
      : activeLeftPct > 85
      ? "translate(-100%, -110%)"
      : "translate(-50%, -110%)";

  return (
    <div className="relative">
      <svg
        role="img"
        aria-label="Performance history: current value and invested amount over time"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[220px] w-full"
      >
        {yLabelValues.map((value, i) => {
          const y =
            CHART_HEIGHT -
            PADDING_BOTTOM -
            ((value - min) / (max - min || 1)) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
          return (
            <g key={`y-${i}`}>
              <line
                x1={PADDING_X}
                x2={CHART_WIDTH - PADDING_X}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={PADDING_X}
                y={y - 4}
                fontSize={10}
                fill="var(--color-text-muted)"
              >
                {formatCurrency(value, currency)}
              </text>
            </g>
          );
        })}

        <polyline
          points={toPolylinePoints(investedPoints)}
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeOpacity={0.85}
        />
        <polyline
          points={toPolylinePoints(currentPoints)}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {xLabelIndices.map((index) => (
          <text
            key={`x-${index}`}
            x={currentPoints[index].x}
            y={CHART_HEIGHT - 2}
            fontSize={10}
            textAnchor={
              index === 0 ? "start" : index === history.length - 1 ? "end" : "middle"
            }
            fill="var(--color-text-muted)"
          >
            {formatDateLabel(history[index].recordedAt)}
          </text>
        ))}

        {/* Background hit-area: clicking/tapping outside a marker dismisses the tooltip. */}
        <rect
          x={0}
          y={0}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          fill="transparent"
          onClick={() => setActiveIndex(null)}
        />

        {history.map((point, index) => (
          <circle
            key={point.recordedAt + index}
            cx={currentPoints[index].x}
            cy={currentPoints[index].y}
            r={activeIndex === index ? 6 : 4}
            fill={markerColor(point.currentValue, point.totalInvested)}
            stroke="var(--color-surface)"
            strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((current) => (current === index ? null : index));
            }}
          />
        ))}
      </svg>

      {active && (
        <div
          data-testid="chart-tooltip"
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] shadow-[var(--shadow-sm)]"
          style={{
            left: `${activeLeftPct}%`,
            top: `${activeTopPct}%`,
            transform: clampedTransform,
          }}
        >
          <div className="font-semibold text-[var(--color-text)]">
            {formatDateLabel(active.recordedAt)}
          </div>
          <div className="text-[var(--color-text-muted)]">
            Current value: {formatCurrency(active.currentValue, currency)}
          </div>
          <div className="text-[var(--color-text-muted)]">
            Invested amount: {formatCurrency(active.totalInvested, currency)}
          </div>
          <div
            className="font-semibold"
            style={{ color: markerColor(active.currentValue, active.totalInvested) }}
          >
            P&amp;L: {formatSignedCurrency(active.currentValue - active.totalInvested, currency)}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-4 text-[13px] text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full bg-[var(--color-primary)]" />
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
