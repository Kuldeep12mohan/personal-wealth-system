import { HoldingView } from "../services/api";

interface Props {
  holdings: HoldingView[];
  /** Portfolio-level current value, used to compute each holding's allocation %. */
  portfolioCurrentValue?: number;
  /** Row-level compact actions — optional so the table can be reused without them. */
  onRecordTransaction?: (holdingId: string) => void;
  onUpdatePrice?: (holdingId: string) => void;
}

function plClass(value: number): string {
  if (value > 0) return "value-positive";
  if (value < 0) return "value-negative";
  return "value-neutral";
}

/**
 * Presentation-only derived display values (not returned by the backend):
 * per-holding profit/loss and its percentage, plus allocation % of the
 * portfolio. All computed from fields already present on HoldingView /
 * fetched from GET holdings + GET summary. Division by zero is guarded
 * so an empty/zero portfolio shows 0% instead of NaN/Infinity.
 */
function computeDerived(h: HoldingView, portfolioCurrentValue: number) {
  const invested = h.quantity * h.averagePrice;
  const profitLoss = h.quantity * (h.currentPrice - h.averagePrice);
  const profitLossPercentage = invested > 0 ? (profitLoss / invested) * 100 : 0;
  const allocationPercentage =
    portfolioCurrentValue > 0 ? (h.currentValue / portfolioCurrentValue) * 100 : 0;

  return { profitLoss, profitLossPercentage, allocationPercentage };
}

function signed(value: number): string {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export default function HoldingsTable({
  holdings,
  portfolioCurrentValue = 0,
  onRecordTransaction,
  onUpdatePrice,
}: Props) {
  if (holdings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">No holdings yet</div>
        <p className="empty-state__hint">
          Add an investment above to start tracking it in this portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table table--responsive">
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Type</th>
            <th className="numeric">Quantity</th>
            <th className="numeric">Avg Price</th>
            <th className="numeric">Current Price</th>
            <th className="numeric">Current Value</th>
            <th className="numeric">P/L</th>
            <th className="numeric">P/L %</th>
            <th className="numeric">Allocation %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const { profitLoss, profitLossPercentage, allocationPercentage } =
              computeDerived(h, portfolioCurrentValue);
            const className = plClass(profitLoss);
            const plWord = profitLoss > 0 ? "Gain" : profitLoss < 0 ? "Loss" : "Flat";
            const allocationWidth = Math.min(100, Math.max(0, allocationPercentage));

            return (
              <tr key={h.holdingId}>
                <td data-label="Name">{h.name}</td>
                <td data-label="Symbol">{h.symbol}</td>
                <td data-label="Type">{h.type}</td>
                <td className="numeric" data-label="Quantity">
                  {h.quantity}
                </td>
                <td className="numeric" data-label="Avg Price">
                  {h.averagePrice}
                </td>
                <td className="numeric" data-label="Current Price">
                  {h.currentPrice > 0 ? (
                    h.currentPrice
                  ) : (
                    <span className="badge-unset">Not set</span>
                  )}
                </td>
                <td className="numeric" data-label="Current Value">
                  {h.currentValue}
                </td>
                <td className={`numeric ${className}`} data-label="P/L">
                  {plWord} {signed(profitLoss)}
                </td>
                <td className={`numeric ${className}`} data-label="P/L %">
                  {plWord} {signed(profitLossPercentage)}%
                </td>
                <td className="numeric" data-label="Allocation %">
                  <div className="allocation-cell">
                    <span>{allocationPercentage.toFixed(2)}%</span>
                    <span className="allocation-bar" aria-hidden="true">
                      <span
                        className="allocation-bar__fill"
                        style={{ width: `${allocationWidth}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td data-label="Actions">
                  <div className="row-actions">
                    {onRecordTransaction && (
                      <button
                        type="button"
                        className="btn-compact"
                        onClick={() => onRecordTransaction(h.holdingId)}
                        aria-label={`Record transaction for ${h.name}`}
                      >
                        Transaction
                      </button>
                    )}
                    {onUpdatePrice && (
                      <button
                        type="button"
                        className="btn-compact"
                        onClick={() => onUpdatePrice(h.holdingId)}
                        aria-label={`Update price for ${h.name}`}
                      >
                        Price
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
