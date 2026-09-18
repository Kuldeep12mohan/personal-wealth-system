import { PortfolioSummary } from "../services/api";

interface Props {
  summary: PortfolioSummary;
}

function plClass(value: number): string {
  if (value > 0) return "text-[var(--color-success)]";
  if (value < 0) return "text-[var(--color-danger)]";
  return "text-[var(--color-text)]";
}

function signWord(value: number): string {
  if (value > 0) return "Gain";
  if (value < 0) return "Loss";
  return "Flat";
}

export default function SummaryPanel({ summary }: Props) {
  const plClassName = plClass(summary.profitLoss);
  const plWord = signWord(summary.profitLoss);
  const plSign = summary.profitLoss > 0 ? "+" : summary.profitLoss < 0 ? "-" : "";
  const plPctSign =
    summary.profitLossPercentage > 0 ? "+" : summary.profitLossPercentage < 0 ? "-" : "";

  return (
    <div className="grid grid-cols-4 gap-4 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Net Invested
        </div>
        <div className="text-[22px] font-bold text-[var(--color-text)]">
          {summary.totalInvested}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Current Value
        </div>
        <div className="text-[22px] font-bold text-[var(--color-text)]">
          {summary.currentValue}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Total P/L
        </div>
        <div className={`text-[22px] font-bold ${plClassName}`}>
          {plWord} {plSign}
          {Math.abs(summary.profitLoss)}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          P/L %
        </div>
        <div className={`text-[22px] font-bold ${plClassName}`}>
          {plPctSign}
          {Math.abs(summary.profitLossPercentage)}%
        </div>
      </div>
    </div>
  );
}
