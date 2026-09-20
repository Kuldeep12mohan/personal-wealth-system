import { Portfolio } from "../services/api";

interface Props {
  portfolios: Portfolio[];
  selectedId: string;
  loading: boolean;
  error: string | null;
  onSelect: (portfolioId: string) => void;
  onRetry: () => void;
}

const entryBase =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-[13px] font-semibold text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";
const entryActive = "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] hover:text-white";

export default function PortfolioSwitcher({
  portfolios,
  selectedId,
  loading,
  error,
  onSelect,
  onRetry,
}: Props) {
  if (error) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
        <span>Could not load portfolios: {error}</span>
        <button
          type="button"
          className="self-start rounded-lg border border-[var(--color-danger-border)] px-3 py-1 text-[13px] font-semibold text-[var(--color-danger)] transition-colors duration-150 hover:bg-[var(--color-danger-bg)]"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <p
        className="inline-flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]"
        role="status"
      >
        <span
          className="h-[13px] w-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]"
          aria-hidden="true"
        />
        Loading portfolios...
      </p>
    );
  }

  if (portfolios.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-3 py-2 text-[13px] text-[var(--color-text-muted)]">
        No portfolios yet — create one to get started.
      </p>
    );
  }

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label="Portfolio switcher"
    >
      {portfolios.map((p) => {
        const isActive = p.portfolioId === selectedId;
        return (
          <button
            key={p.portfolioId}
            type="button"
            className={`${entryBase} ${isActive ? entryActive : ""}`}
            onClick={() => onSelect(p.portfolioId)}
            aria-current={isActive ? "true" : undefined}
          >
            <span className="truncate">
              {p.name} ({p.currency})
            </span>
          </button>
        );
      })}
    </nav>
  );
}
