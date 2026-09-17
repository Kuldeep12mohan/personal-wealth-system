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
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field form-field--grow">
          Portfolio name
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Investments"
            aria-label="Portfolio name"
          />
        </label>
        <label className="form-field">
          Currency
          <select
            className="form-select"
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
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Portfolio"}
          </button>
          {isSubmitting && (
            <span className="loading-text" role="status">
              <span className="spinner" aria-hidden="true" />
              Creating portfolio...
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
          Portfolio created: {created.portfolioId} ({created.name})
        </p>
      )}
    </div>
  );
}
