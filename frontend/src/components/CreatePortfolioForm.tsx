import { useState } from "react";
import { createPortfolio, CurrencyCode, Portfolio } from "../services/api";

interface Props {
  onCreated: (portfolio: Portfolio) => void;
}

const CURRENCIES: CurrencyCode[] = ["INR", "USD"];

export default function CreatePortfolioForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Portfolio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Portfolio name is required");
      return;
    }
    if (!currency) {
      setError("Currency is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const portfolio = await createPortfolio(name, currency);
      setCreated(portfolio);
      onCreated(portfolio);
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
          Portfolio name
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Investments"
            aria-label="Portfolio name"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Currency
          <select
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label="Currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent bg-[var(--color-primary)] px-4 py-[9px] text-sm font-semibold text-white transition-colors duration-150 enabled:hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Portfolio"}
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
              Creating portfolio...
            </span>
          )}
        </div>
      </form>
      {error && (
        <p className="mt-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {created && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-4 py-3 text-[13px] font-semibold text-[var(--color-success)]">
          <span className="shrink-0 font-bold" aria-hidden="true">
            ✓
          </span>
          Portfolio created: {created.portfolioId} ({created.name})
        </p>
      )}
    </div>
  );
}
