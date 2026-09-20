import { useEffect, useRef, useState } from "react";
import AddInvestmentForm from "../components/AddInvestmentForm";
import HoldingsTable from "../components/HoldingsTable";
import PerformanceHistoryChart from "../components/PerformanceHistoryChart";
import RecordTransactionForm from "../components/RecordTransactionForm";
import SummaryPanel from "../components/SummaryPanel";
import UpdatePriceForm from "../components/UpdatePriceForm";
import {
  CurrencyCode,
  getPortfolioHistory,
  getPortfolioSummary,
  HistoryPoint,
  HoldingView,
  listHoldings,
  PortfolioSummary,
} from "../services/api";

interface Props {
  portfolioId: string;
  currency: CurrencyCode;
}

/**
 * Portfolio Dashboard screen (FR-023): summary, holdings list, and the
 * add-investment / record-transaction / update-price actions, all
 * reachable in place (FR-024).
 */
export default function PortfolioDashboardPage({ portfolioId, currency }: Props) {
  const [holdings, setHoldings] = useState<HoldingView[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addInvestmentRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    setLoadError(null);
    try {
      const [holdingsData, summaryData, historyData] = await Promise.all([
        listHoldings(portfolioId),
        getPortfolioSummary(portfolioId),
        getPortfolioHistory(portfolioId),
      ]);
      setHoldings(holdingsData);
      setSummary(summaryData);
      setHistory(historyData);
      if (!selectedHoldingId && holdingsData.length > 0) {
        setSelectedHoldingId(holdingsData[0].holdingId);
      }
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Discard the previous portfolio's history immediately so a switch
    // never briefly shows one portfolio's trend under another's name
    // (FR-007) while the new portfolio's data is still loading.
    setHistory([]);
    setIsLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  function jumpTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function selectAndJumpToActions(holdingId: string) {
    setSelectedHoldingId(holdingId);
    jumpTo(actionsRef);
  }

  const cardBase =
    "mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] max-[720px]:p-4";
  const cardHeader = "mb-4 flex flex-wrap items-baseline justify-between gap-3";
  const cardTitle = "text-[17px] font-semibold text-[var(--color-text)]";
  const btnSecondary =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-[9px] text-sm font-semibold text-[var(--color-text)] transition-colors duration-150 enabled:hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:flex-1";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 max-[640px]:flex-col">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)]">
              Portfolio {portfolioId}
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Track this portfolio&apos;s holdings, current values, and
            profit/loss at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 max-[640px]:w-full">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => jumpTo(addInvestmentRef)}
            aria-label="Jump to add investment section"
          >
            Add Investment
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => jumpTo(actionsRef)}
            aria-label="Jump to record transaction and update price section"
          >
            Record Transaction
          </button>
        </div>
      </header>

      {isLoading && (
        <p
          className="mt-2 inline-flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]"
          role="status"
        >
          <span
            className="h-[13px] w-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]"
            aria-hidden="true"
          />
          Loading portfolio...
        </p>
      )}

      {loadError && !isLoading && (
        <p className="mt-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          Could not load this portfolio: {loadError}
        </p>
      )}

      {!isLoading && !loadError && (
        <>
          <section className={cardBase}>
            <div className={cardHeader}>
              <h2 className={cardTitle}>Portfolio Summary</h2>
            </div>
            {summary && <SummaryPanel summary={summary} />}
          </section>

          <section className={cardBase}>
            <div className={cardHeader}>
              <h2 className={cardTitle}>Performance History</h2>
            </div>
            <PerformanceHistoryChart history={history} currency={currency} />
          </section>

          <section className={cardBase}>
            <div className={cardHeader}>
              <h2 className={cardTitle}>Holdings</h2>
            </div>
            <HoldingsTable
              holdings={holdings}
              portfolioCurrentValue={summary?.currentValue ?? 0}
              onRecordTransaction={selectAndJumpToActions}
              onUpdatePrice={selectAndJumpToActions}
            />
          </section>

          <section className={cardBase} ref={addInvestmentRef}>
            <div className={cardHeader}>
              <h2 className={cardTitle}>Add Investment</h2>
              <span className="text-[13px] text-[var(--color-text-muted)]">
                Register a new stock, mutual fund, or ETF in this portfolio.
              </span>
            </div>
            <AddInvestmentForm portfolioId={portfolioId} onAdded={() => refresh()} />
          </section>

          {holdings.length > 0 && (
            <section className={cardBase} ref={actionsRef}>
              <div className={cardHeader}>
                <h2 className={cardTitle}>Record Transaction / Update Price</h2>
              </div>
              <label className="mb-4 flex max-w-[360px] min-w-[160px] flex-col gap-1 text-[13px] font-semibold text-[var(--color-text-muted)]">
                Holding
                <select
                  className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-[9px] font-sans text-sm text-[var(--color-text)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none"
                  value={selectedHoldingId}
                  onChange={(e) => setSelectedHoldingId(e.target.value)}
                  aria-label="Select holding"
                >
                  {holdings.map((h) => (
                    <option key={h.holdingId} value={h.holdingId}>
                      {h.name} ({h.symbol})
                    </option>
                  ))}
                </select>
              </label>
              {selectedHoldingId && (
                <div className="grid gap-4 min-[720px]:grid-cols-2">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                    <div className="mb-3 text-sm font-bold text-[var(--color-text)]">
                      Record Transaction
                    </div>
                    <RecordTransactionForm
                      holdingId={selectedHoldingId}
                      onRecorded={() => refresh()}
                    />
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                    <div className="mb-3 text-sm font-bold text-[var(--color-text)]">
                      Update Price
                    </div>
                    <UpdatePriceForm
                      holdingId={selectedHoldingId}
                      onUpdated={() => refresh()}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
