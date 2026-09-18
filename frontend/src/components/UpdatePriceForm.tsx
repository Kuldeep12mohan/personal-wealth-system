import { useState } from "react";
import { updateCurrentPrice } from "../services/api";

interface Props {
  holdingId: string;
  onUpdated: (holdingId: string, currentPrice: number) => void;
}

export default function UpdatePriceForm({ holdingId, onUpdated }: Props) {
  const [currentPrice, setCurrentPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(currentPrice);
    if (!currentPrice || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Current price must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateCurrentPrice(holdingId, priceNum);
      onUpdated(result.holdingId, result.currentPrice);
      setCurrentPrice("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form className="flex flex-wrap items-end gap-4" onSubmit={handleSubmit}>
        <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          New current price
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="e.g. 550"
            aria-label={`Current price for ${holdingId}`}
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-[9px] text-sm font-semibold text-[var(--color-text)] transition-colors duration-150 enabled:hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Price"}
          </button>
          {isSubmitting && (
            <span
              className="mt-2 inline-flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]"
              role="status"
            >
              <span
                className="h-[13px] w-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]"
                aria-hidden="true"
              />
              Updating price...
            </span>
          )}
        </div>
      </form>
      {error && (
        <p className="mt-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
