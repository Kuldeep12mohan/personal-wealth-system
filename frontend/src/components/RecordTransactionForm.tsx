import { useState } from "react";
import { recordTransaction, Transaction, TransactionType } from "../services/api";

interface Props {
  holdingId: string;
  onRecorded?: (transaction: Transaction) => void;
}

export default function RecordTransactionForm({ holdingId, onRecorded }: Props) {
  const [type, setType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const quantityNum = Number(quantity);
    const priceNum = Number(price);

    if (!quantity || Number.isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be greater than zero");
      return;
    }
    if (!transactionDate) {
      setError("Transaction date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const transaction = await recordTransaction(
        holdingId,
        type,
        quantityNum,
        priceNum,
        transactionDate
      );
      setSuccess(transaction);
      onRecorded?.(transaction);
      setQuantity("");
      setPrice("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const typeClass = type === "BUY" ? "type-select--buy" : "type-select--sell";
  const badgeClass = type === "BUY" ? "type-badge--buy" : "type-badge--sell";

  const quantityNum = Number(quantity);
  const priceNum = Number(price);
  const previewValid =
    quantity !== "" && price !== "" && !Number.isNaN(quantityNum) && !Number.isNaN(priceNum);
  const previewTotal = previewValid ? quantityNum * priceNum : 0;

  return (
    <div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          Type
          <span className="segmented-select-wrap">
            <select
              className={`form-select type-select ${typeClass}`}
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              aria-label="Transaction type"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </span>
          <span className={`type-badge ${badgeClass}`} aria-hidden="true">
            {type === "BUY" ? "Buying" : "Selling"}
          </span>
        </label>
        <label className="form-field">
          Quantity
          <input
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 10"
            aria-label="Quantity"
          />
        </label>
        <label className="form-field">
          Price
          <input
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 500"
            aria-label="Price"
          />
        </label>
        <label className="form-field">
          Date
          <input
            className="form-input"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            aria-label="Transaction date"
          />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Transaction"}
          </button>
          {isSubmitting && (
            <span className="loading-text" role="status">
              <span className="spinner" aria-hidden="true" />
              Recording transaction...
            </span>
          )}
        </div>
      </form>
      {previewValid && (
        <p className="tx-preview">
          <span className="tx-preview__label">Preview:</span>
          {type} {quantityNum} unit{quantityNum === 1 ? "" : "s"} @ ₹{priceNum} = ₹
          {previewTotal.toLocaleString()}
        </p>
      )}
      {error && <p className="error-text">{error}</p>}
      {success && (
        <p className="banner banner-success">
          <span className="banner-icon" aria-hidden="true">
            ✓
          </span>
          Transaction recorded: {success.transactionId} (value {success.value})
        </p>
      )}
    </div>
  );
}
