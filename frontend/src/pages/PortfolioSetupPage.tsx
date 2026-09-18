import { useState } from "react";
import AddInvestmentForm from "../components/AddInvestmentForm";
import CreatePortfolioForm from "../components/CreatePortfolioForm";
import RecordTransactionForm from "../components/RecordTransactionForm";
import { Holding, Portfolio } from "../services/api";

interface Props {
  onPortfolioCreated?: (portfolio: Portfolio) => void;
}

/**
 * Portfolio Setup screen (FR-022): Create Portfolio, Add Investment, and
 * Record BUY/SELL Transaction all live here, presented as a 3-step
 * progression on the one screen.
 */
export default function PortfolioSetupPage({ onPortfolioCreated }: Props) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>("");

  function handleCreated(p: Portfolio) {
    setPortfolio(p);
    onPortfolioCreated?.(p);
  }

  const hasPortfolio = !!portfolio;
  const hasHoldings = holdings.length > 0;

  const cardBase =
    "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-opacity duration-150 max-[720px]:p-4";
  const cardLocked = "bg-[var(--color-surface-muted)] opacity-[0.85]";
  const cardStepBase =
    "mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[13px] font-bold text-[var(--color-primary-dark)]";
  const cardStepLocked = "bg-[var(--color-neutral-bg)] text-[var(--color-text-faint)]";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)]">
          Portfolio Setup
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Follow the three steps below: create a portfolio, add an investment
          to it, then record a BUY or SELL transaction against that
          investment.
        </p>
      </header>

      <div className="relative">
        {/* Step 1: Create Portfolio */}
        <section className={cardBase}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-[var(--color-text)]">
              <span className={cardStepBase}>1</span>
              Create Portfolio
            </h2>
            <span className="text-[13px] text-[var(--color-text-muted)]">
              Start here — give your portfolio a name and currency.
            </span>
          </div>
          <CreatePortfolioForm onCreated={handleCreated} />
        </section>

        <div
          className="ml-8 h-6 w-0.5 bg-[var(--color-border-strong)]"
          aria-hidden="true"
        />

        {/* Step 2: Add Investment */}
        <section className={`${cardBase} ${!hasPortfolio ? cardLocked : ""}`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-[var(--color-text)]">
              <span className={`${cardStepBase} ${!hasPortfolio ? cardStepLocked : ""}`}>2</span>
              Add Investment
            </h2>
            {hasPortfolio && (
              <span className="text-[13px] text-[var(--color-text-muted)]">
                Portfolio: {portfolio!.name} ({portfolio!.portfolioId})
              </span>
            )}
          </div>
          <p className="mb-3 text-[13px] text-[var(--color-text-muted)]">
            Register a stock, mutual fund, or ETF you want to track.
          </p>
          {hasPortfolio ? (
            <AddInvestmentForm
              portfolioId={portfolio!.portfolioId}
              onAdded={(holding) => {
                setHoldings((prev) => [...prev, holding]);
                setSelectedHoldingId(holding.holdingId);
              }}
            />
          ) : (
            <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
              Create a portfolio first to unlock this step.
            </p>
          )}
        </section>

        <div
          className="ml-8 h-6 w-0.5 bg-[var(--color-border-strong)]"
          aria-hidden="true"
        />

        {/* Step 3: Record Transaction */}
        <section className={`${cardBase} ${!hasHoldings ? cardLocked : ""}`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-[var(--color-text)]">
              <span className={`${cardStepBase} ${!hasHoldings ? cardStepLocked : ""}`}>3</span>
              Record Transaction
            </h2>
          </div>
          <p className="mb-3 text-[13px] text-[var(--color-text-muted)]">
            Log a BUY or SELL against one of your investments.
          </p>
          {hasHoldings ? (
            <>
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
                <RecordTransactionForm holdingId={selectedHoldingId} />
              )}
            </>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
              {hasPortfolio
                ? "Add an investment first to unlock this step."
                : "Create a portfolio and add an investment first to unlock this step."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
