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
  if (value > 0) return "text-[var(--color-success)]";
  if (value < 0) return "text-[var(--color-danger)]";
  return "text-[var(--color-text)]";
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
      <div className="px-4 py-12 text-center text-[var(--color-text-muted)]">
        <div className="mb-1 text-base font-semibold text-[var(--color-text)]">
          No holdings yet
        </div>
        <p className="text-[13px]">
          Add an investment above to start tracking it in this portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table--responsive w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-[var(--color-border)] p-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Name
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Symbol
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Type
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Quantity
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Avg Price
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Current Price
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Current Value
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              P/L
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              P/L %
            </th>
            <th className="border-b border-[var(--color-border)] p-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const { profitLoss, profitLossPercentage, allocationPercentage } =
              computeDerived(h, portfolioCurrentValue);
            const className = plClass(profitLoss);
            const plWord = profitLoss > 0 ? "Gain" : profitLoss < 0 ? "Loss" : "Flat";

            return (
              <tr key={h.holdingId} className="hover:bg-[var(--color-surface-muted)]">
                <td
                  className="border-b border-[var(--color-border)] p-3 text-sm whitespace-nowrap"
                  data-label="Name"
                >
                  {h.name}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-sm whitespace-nowrap"
                  data-label="Symbol"
                >
                  {h.symbol}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-sm whitespace-nowrap"
                  data-label="Type"
                >
                  {h.type}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap"
                  data-label="Quantity"
                >
                  {h.quantity}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap"
                  data-label="Avg Price"
                >
                  {h.averagePrice}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap"
                  data-label="Current Price"
                >
                  {h.currentPrice > 0 ? (
                    h.currentPrice
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-faint)]">
                      Not set
                    </span>
                  )}
                </td>
                <td
                  className="border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap"
                  data-label="Current Value"
                >
                  {h.currentValue}
                  <span className="ml-1 text-[0.85em] text-[var(--color-text-muted)]">
                    ({allocationPercentage.toFixed(1)}%)
                  </span>
                </td>
                <td
                  className={`border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap ${className}`}
                  data-label="P/L"
                >
                  {plWord} {signed(profitLoss)}
                </td>
                <td
                  className={`border-b border-[var(--color-border)] p-3 text-right text-sm whitespace-nowrap ${className}`}
                  data-label="P/L %"
                >
                  {plWord} {signed(profitLossPercentage)}%
                </td>
                <td className="border-b border-[var(--color-border)] p-3 text-sm" data-label="Actions">
                  <div className="flex flex-wrap gap-2">
                    {onRecordTransaction && (
                      <button
                        type="button"
                        className="cursor-pointer whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-1 text-xs font-semibold text-[var(--color-primary-dark)] transition-colors duration-150 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                        onClick={() => onRecordTransaction(h.holdingId)}
                        aria-label={`Record transaction for ${h.name}`}
                      >
                        Transaction
                      </button>
                    )}
                    {onUpdatePrice && (
                      <button
                        type="button"
                        className="cursor-pointer whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-1 text-xs font-semibold text-[var(--color-primary-dark)] transition-colors duration-150 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
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
