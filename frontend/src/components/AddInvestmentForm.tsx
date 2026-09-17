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
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field form-field--grow">
          Investment name
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ABC Bank"
            aria-label="Investment name"
          />
        </label>
        <label className="form-field">
          Symbol
          <input
            className="form-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. ABCBANK"
            aria-label="Symbol"
          />
        </label>
        <label className="form-field">
          Type
          <select
            className="form-select"
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
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Investment"}
          </button>
          {isSubmitting && (
            <span className="loading-text" role="status">
              <span className="spinner" aria-hidden="true" />
              Adding investment...
            </span>
          )}
        </div>
      </form>
      {error && <p className="error-text">{error}</p>}
      {created && (
        <p className="banner banner-success">
          <span className="banner-icon" aria-hidden="true">
            ✓
          </span>
          Holding created: {created.holdingId} ({created.name})
        </p>
      )}
    </div>
  );
}
