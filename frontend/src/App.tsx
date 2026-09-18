import { useState } from "react";
import PortfolioDashboardPage from "./pages/PortfolioDashboardPage";
import PortfolioSetupPage from "./pages/PortfolioSetupPage";
import { useTheme } from "./hooks/useTheme";

type View = "setup" | "dashboard";

/**
 * Simple in-memory view switch between the two allowed screens
 * (FR-022–FR-024) — no router library. Screens are presented as
 * sidebar routes/tabs.
 */
export default function App() {
  const [view, setView] = useState<View>("setup");
  const [portfolioId, setPortfolioId] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`app-shell ${sidebarCollapsed ? "app-shell--collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-header">
          {!sidebarCollapsed && <span className="sidebar-brand">Personal Wealth</span>}
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === "dark"}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
          {!sidebarCollapsed && (
            <span className="theme-toggle__label">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
          )}
        </button>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${view === "setup" ? "active" : ""}`}
            onClick={() => setView("setup")}
            title="Portfolio Setup"
          >
            <span className="sidebar-link__icon" aria-hidden="true">
              🗂️
            </span>
            {!sidebarCollapsed && <span className="sidebar-link__label">Portfolio Setup</span>}
          </button>
          <button
            type="button"
            className={`sidebar-link ${view === "dashboard" ? "active" : ""}`}
            onClick={() => setView("dashboard")}
            disabled={!portfolioId}
            title="Portfolio Dashboard"
          >
            <span className="sidebar-link__icon" aria-hidden="true">
              📊
            </span>
            {!sidebarCollapsed && <span className="sidebar-link__label">Portfolio Dashboard</span>}
          </button>
        </nav>

        {!sidebarCollapsed && (
          <div className="sidebar-footer">
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
        )}
      </aside>

      <main className="app-main">
        <div className="app">
          {view === "setup" && (
            <PortfolioSetupPage
              onPortfolioCreated={(p) => setPortfolioId(p.portfolioId)}
            />
          )}

          {view === "dashboard" && portfolioId && (
            <PortfolioDashboardPage portfolioId={portfolioId} />
          )}
        </div>
      </main>
    </div>
  );
}
