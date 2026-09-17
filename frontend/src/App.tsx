import { useState } from "react";
import PortfolioDashboardPage from "./pages/PortfolioDashboardPage";
import PortfolioSetupPage from "./pages/PortfolioSetupPage";

type View = "setup" | "dashboard";

/**
 * Simple in-memory view switch between the two allowed screens
 * (FR-022–FR-024) — no router library.
 */
export default function App() {
  const [view, setView] = useState<View>("setup");
  const [portfolioId, setPortfolioId] = useState("");

  return (
    <div className="app">
      <nav className="app-nav">
        <button
          className={view === "setup" ? "active" : ""}
          onClick={() => setView("setup")}
        >
          Portfolio Setup
        </button>
        <button
          className={view === "dashboard" ? "active" : ""}
          onClick={() => setView("dashboard")}
          disabled={!portfolioId}
        >
          Portfolio Dashboard
        </button>
      </nav>

      {view === "setup" && (
        <div>
          <div className="card portfolio-id-field">
            <label className="form-field">
              Portfolio ID for dashboard
              <input
                className="form-input"
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                placeholder="e.g. PORT-10001"
                aria-label="Portfolio ID"
              />
            </label>
          </div>
          <PortfolioSetupPage
            onPortfolioCreated={(p) => setPortfolioId(p.portfolioId)}
          />
        </div>
      )}

      {view === "dashboard" && portfolioId && (
        <PortfolioDashboardPage portfolioId={portfolioId} />
      )}
    </div>
  );
}
