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

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Portfolio Setup</h1>
        <p className="page-subtitle">
          Follow the three steps below: create a portfolio, add an investment
          to it, then record a BUY or SELL transaction against that
          investment.
        </p>
      </header>

      <div className="step-flow">
        {/* Step 1: Create Portfolio */}
        <section className="card step-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-step">1</span>
              Create Portfolio
            </h2>
            <span className="card-subtitle">
              Start here — give your portfolio a name and currency.
            </span>
          </div>
          <CreatePortfolioForm onCreated={handleCreated} />
        </section>

        <div className="step-connector" aria-hidden="true" />

        {/* Step 2: Add Investment */}
        <section className={`card step-card ${!hasPortfolio ? "step-card--locked" : ""}`}>
          <div className="card-header">
            <h2 className="card-title">
              <span className={`card-step ${!hasPortfolio ? "card-step--locked" : ""}`}>2</span>
              Add Investment
            </h2>
            {hasPortfolio && (
              <span className="card-subtitle">
                Portfolio: {portfolio!.name} ({portfolio!.portfolioId})
              </span>
            )}
          </div>
          <p className="card-subtitle" style={{ marginBottom: "var(--space-3)" }}>
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
            <p className="step-hint">Create a portfolio first to unlock this step.</p>
          )}
        </section>

        <div className="step-connector" aria-hidden="true" />

        {/* Step 3: Record Transaction */}
        <section className={`card step-card ${!hasHoldings ? "step-card--locked" : ""}`}>
          <div className="card-header">
            <h2 className="card-title">
              <span className={`card-step ${!hasHoldings ? "card-step--locked" : ""}`}>3</span>
              Record Transaction
            </h2>
          </div>
          <p className="card-subtitle" style={{ marginBottom: "var(--space-3)" }}>
            Log a BUY or SELL against one of your investments.
          </p>
          {hasHoldings ? (
            <>
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
                <RecordTransactionForm holdingId={selectedHoldingId} />
              )}
            </>
          ) : (
            <p className="step-hint">
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
