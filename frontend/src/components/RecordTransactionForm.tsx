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

  const typeClasses =
    type === "BUY"
      ? "text-[var(--color-success)] border-[var(--color-success-border)] bg-[var(--color-success-bg)]"
      : "text-[var(--color-danger)] border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]";
  const badgeClasses =
    type === "BUY"
      ? "text-[var(--color-success)] bg-[var(--color-success-bg)] border-[var(--color-success-border)]"
      : "text-[var(--color-danger)] bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]";

  const quantityNum = Number(quantity);
  const priceNum = Number(price);
  const previewValid =
    quantity !== "" && price !== "" && !Number.isNaN(quantityNum) && !Number.isNaN(priceNum);
  const previewTotal = previewValid ? quantityNum * priceNum : 0;

  return (
    <div>
      <form className="flex flex-wrap items-end gap-4" onSubmit={handleSubmit}>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Type
          <span className="relative">
            <select
              className={`min-w-[140px] rounded-lg border-2 px-4 py-[9px] font-sans text-[15px] font-bold transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none ${typeClasses}`}
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              aria-label="Transaction type"
            >
              <option
                value="BUY"
                style={{ backgroundColor: "var(--color-surface)", color: "var(--color-success)" }}
              >
                BUY
              </option>
              <option
                value="SELL"
                style={{ backgroundColor: "var(--color-surface)", color: "var(--color-danger)" }}
              >
                SELL
              </option>
            </select>
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold tracking-wide ${badgeClasses}`}
            aria-hidden="true"
          >
            {type === "BUY" ? "Buying" : "Selling"}
          </span>
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Quantity
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 10"
            aria-label="Quantity"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Price
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 500"
            aria-label="Price"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
          Date
          <input
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            aria-label="Transaction date"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent bg-[var(--color-primary)] px-4 py-[9px] text-sm font-semibold text-white transition-colors duration-150 enabled:hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Recording..." : "Record Transaction"}
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
              Recording transaction...
            </span>
          )}
        </div>
      </form>
      {previewValid && (
        <p className="mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-semibold text-[var(--color-text)]">
          <span className="mr-1 font-medium text-[var(--color-text-muted)]">Preview:</span>
          {type} {quantityNum} unit{quantityNum === 1 ? "" : "s"} @ ₹{priceNum} = ₹
          {previewTotal.toLocaleString()}
        </p>
      )}
      {error && (
        <p className="mt-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-4 py-3 text-[13px] font-semibold text-[var(--color-success)]">
          <span className="shrink-0 font-bold" aria-hidden="true">
            ✓
          </span>
          Transaction recorded: {success.transactionId} (value {success.value})
        </p>
      )}
    </div>
  );
}
