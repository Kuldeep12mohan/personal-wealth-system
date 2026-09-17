import { PortfolioSummary } from "../services/api";

interface Props {
  summary: PortfolioSummary;
}

function plClass(value: number): string {
  if (value > 0) return "value-positive";
  if (value < 0) return "value-negative";
  return "value-neutral";
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
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-card__label">Net Invested</div>
        <div className="summary-card__value">{summary.totalInvested}</div>
      </div>
      <div className="summary-card">
        <div className="summary-card__label">Current Value</div>
        <div className="summary-card__value">{summary.currentValue}</div>
      </div>
      <div className="summary-card">
        <div className="summary-card__label">Total P/L</div>
        <div className={`summary-card__value ${plClassName}`}>
          {plWord} {plSign}
          {Math.abs(summary.profitLoss)}
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-card__label">P/L %</div>
        <div className={`summary-card__value ${plClassName}`}>
          {plPctSign}
          {Math.abs(summary.profitLossPercentage)}%
        </div>
      </div>
    </div>
  );
}
