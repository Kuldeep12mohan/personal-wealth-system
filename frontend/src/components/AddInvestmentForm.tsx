import { useState } from "react";
import { addHolding, Holding, InvestmentType } from "../services/api";

interface Props {
  portfolioId: string;
  onAdded: (holding: Holding) => void;
}

const TYPES: InvestmentType[] = ["STOCK", "MUTUAL_FUND", "ETF"];

export default function AddInvestmentForm({ portfolioId, onAdded }: Props) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<InvestmentType>("STOCK");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Holding | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !symbol.trim()) {
      setError("Investment name and symbol are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const holding = await addHolding(portfolioId, name, symbol, type);
      setCreated(holding);
      onAdded(holding);
      setName("");
      setSymbol("");
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
          Investment name
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ABC Bank"
            aria-label="Investment name"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Symbol
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. ABCBANK"
            aria-label="Symbol"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Type
          <select
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={type}
            onChange={(e) => setType(e.target.value as InvestmentType)}
            aria-label="Type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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
            {isSubmitting ? "Adding..." : "Add Investment"}
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
              Adding investment...
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
          Holding created: {created.holdingId} ({created.name})
        </p>
      )}
    </div>
  );
}
