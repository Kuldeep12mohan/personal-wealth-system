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
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field form-field--grow">
          New current price
          <input
            className="form-input"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="e.g. 550"
            aria-label={`Current price for ${holdingId}`}
          />
        </label>
        <div className="form-actions">
          <button className="btn btn-secondary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Price"}
          </button>
          {isSubmitting && (
            <span className="loading-text" role="status">
              <span className="spinner" aria-hidden="true" />
              Updating price...
            </span>
          )}
        </div>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
