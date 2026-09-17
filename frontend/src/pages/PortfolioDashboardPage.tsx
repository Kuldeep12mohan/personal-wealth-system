import { useEffect, useRef, useState } from "react";
import AddInvestmentForm from "../components/AddInvestmentForm";
import HoldingsTable from "../components/HoldingsTable";
import RecordTransactionForm from "../components/RecordTransactionForm";
import SummaryPanel from "../components/SummaryPanel";
import UpdatePriceForm from "../components/UpdatePriceForm";
import {
  getPortfolioSummary,
  HoldingView,
  listHoldings,
  PortfolioSummary,
} from "../services/api";

interface Props {
  portfolioId: string;
}

/**
 * Portfolio Dashboard screen (FR-023): summary, holdings list, and the
 * add-investment / record-transaction / update-price actions, all
 * reachable in place (FR-024).
 */
export default function PortfolioDashboardPage({ portfolioId }: Props) {
  const [holdings, setHoldings] = useState<HoldingView[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addInvestmentRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    setLoadError(null);
    try {
      const [holdingsData, summaryData] = await Promise.all([
        listHoldings(portfolioId),
        getPortfolioSummary(portfolioId),
      ]);
      setHoldings(holdingsData);
      setSummary(summaryData);
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

  return (
    <div>
      <header className="page-header dashboard-header">
        <div>
          <div className="dashboard-header__meta">
            <h1 className="page-title">Portfolio {portfolioId}</h1>
          </div>
          <p className="page-subtitle">
            Track this portfolio&apos;s holdings, current values, and
            profit/loss at a glance.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => jumpTo(addInvestmentRef)}
            aria-label="Jump to add investment section"
          >
            Add Investment
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => jumpTo(actionsRef)}
            aria-label="Jump to record transaction and update price section"
          >
            Record Transaction
          </button>
        </div>
      </header>

      {isLoading && (
        <p className="loading-text" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading portfolio...
        </p>
      )}

      {loadError && !isLoading && (
        <p className="error-text">
          Could not load this portfolio: {loadError}
        </p>
      )}

      {!isLoading && !loadError && (
        <>
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Portfolio Summary</h2>
            </div>
            {summary && <SummaryPanel summary={summary} />}
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Holdings</h2>
            </div>
            <HoldingsTable
              holdings={holdings}
              portfolioCurrentValue={summary?.currentValue ?? 0}
              onRecordTransaction={selectAndJumpToActions}
              onUpdatePrice={selectAndJumpToActions}
            />
          </section>

          <section className="card" ref={addInvestmentRef}>
            <div className="card-header">
              <h2 className="card-title">Add Investment</h2>
              <span className="card-subtitle">
                Register a new stock, mutual fund, or ETF in this portfolio.
              </span>
            </div>
            <AddInvestmentForm portfolioId={portfolioId} onAdded={() => refresh()} />
          </section>

          {holdings.length > 0 && (
            <section className="card" ref={actionsRef}>
              <div className="card-header">
                <h2 className="card-title">Record Transaction / Update Price</h2>
              </div>
              <label className="form-field holding-picker">
                Holding
                <select
                  className="form-select"
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
                <div className="action-panels">
                  <div className="subpanel">
                    <div className="subpanel-title">Record Transaction</div>
                    <RecordTransactionForm
                      holdingId={selectedHoldingId}
                      onRecorded={() => refresh()}
                    />
                  </div>
                  <div className="subpanel">
                    <div className="subpanel-title">Update Price</div>
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
