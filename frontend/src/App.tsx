import { useEffect, useRef, useState } from "react";
import PortfolioDashboardPage from "./pages/PortfolioDashboardPage";
import PortfolioSetupPage from "./pages/PortfolioSetupPage";
import PortfolioSwitcher from "./components/PortfolioSwitcher";
import { useTheme } from "./hooks/useTheme";
import { listPortfolios, Portfolio } from "./services/api";

type View = "setup" | "dashboard";

const LAST_PORTFOLIO_KEY = "personal-wealth:lastPortfolioId";

/**
 * Simple in-memory view switch between the two allowed screens
 * (FR-022–FR-024) — no router library. Screens are presented as
 * sidebar routes/tabs.
 */
export default function App() {
  const [view, setView] = useState<View>("setup");
  const [portfolioId, setPortfolioId] = useState("");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(true);
  const [portfoliosError, setPortfoliosError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const hasAppliedInitialSelection = useRef(false);

  async function refreshPortfolios() {
    setIsLoadingPortfolios(true);
    setPortfoliosError(null);
    try {
      const data = await listPortfolios();
      setPortfolios(data);
      if (!hasAppliedInitialSelection.current) {
        hasAppliedInitialSelection.current = true;
        const stored = localStorage.getItem(LAST_PORTFOLIO_KEY);
        if (stored && data.some((p) => p.portfolioId === stored)) {
          setPortfolioId(stored);
        } else {
          if (stored) localStorage.removeItem(LAST_PORTFOLIO_KEY);
          if (data.length === 1) {
            setPortfolioId(data[0].portfolioId);
          }
        }
      }
    } catch (err) {
      setPortfoliosError((err as Error).message);
    } finally {
      setIsLoadingPortfolios(false);
    }
  }

  useEffect(() => {
    refreshPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fall back gracefully (FR-009) if the currently selected portfolio is no
  // longer present in the latest fetched list (e.g. removed elsewhere).
  useEffect(() => {
    if (isLoadingPortfolios || portfoliosError) return;
    if (portfolioId && !portfolios.some((p) => p.portfolioId === portfolioId)) {
      localStorage.removeItem(LAST_PORTFOLIO_KEY);
      setPortfolioId(portfolios.length > 0 ? portfolios[0].portfolioId : "");
    }
  }, [portfolios, portfolioId, isLoadingPortfolios, portfoliosError]);

  function selectPortfolio(id: string) {
    setPortfolioId(id);
    if (id) {
      localStorage.setItem(LAST_PORTFOLIO_KEY, id);
    }
  }

  const sidebarLinkBase =
    "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-[var(--color-text-muted)] transition-colors duration-150 hover:enabled:bg-[var(--color-surface-muted)] hover:enabled:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 max-[720px]:w-auto";
  const sidebarLinkActive = "bg-[var(--color-primary)] text-white";

  return (
    <div
      className={`flex min-h-screen items-stretch max-[720px]:flex-col ${
        sidebarCollapsed ? "" : ""
      }`}
    >
      <aside
        className={`sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 transition-[width,flex-basis] duration-150 max-[720px]:static max-[720px]:h-auto max-[720px]:w-full max-[720px]:border-r-0 max-[720px]:border-b ${
          sidebarCollapsed
            ? "w-16 flex-none px-2"
            : "w-[232px] flex-none"
        }`}
        aria-label="Primary navigation"
      >
        <div className="mb-6 flex items-center justify-between gap-2 px-1">
          {!sidebarCollapsed && (
            <span className="truncate text-[15px] font-bold tracking-tight text-[var(--color-text)]">
              Personal Wealth
            </span>
          )}
          <button
            type="button"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[13px] leading-none text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>

        <button
          type="button"
          className="mb-4 flex w-full items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-left text-[13px] font-semibold text-[var(--color-text-muted)] transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === "dark"}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="flex-none text-[15px] leading-none" aria-hidden="true">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
          {!sidebarCollapsed && (
            <span className="truncate">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
          )}
        </button>

        <nav className="flex flex-col gap-1 max-[720px]:flex-row max-[720px]:flex-wrap">
          <button
            type="button"
            className={`${sidebarLinkBase} ${view === "setup" ? sidebarLinkActive : ""}`}
            onClick={() => setView("setup")}
            title="Portfolio Setup"
          >
            <span className="flex-none text-base leading-none" aria-hidden="true">
              🗂️
            </span>
            {!sidebarCollapsed && <span className="truncate">Portfolio Setup</span>}
          </button>
          <button
            type="button"
            className={`${sidebarLinkBase} ${view === "dashboard" ? sidebarLinkActive : ""}`}
            onClick={() => setView("dashboard")}
            disabled={!portfolioId}
            title="Portfolio Dashboard"
          >
            <span className="flex-none text-base leading-none" aria-hidden="true">
              📊
            </span>
            {!sidebarCollapsed && <span className="truncate">Portfolio Dashboard</span>}
          </button>
        </nav>

        {!sidebarCollapsed && (
          <div className="mt-auto border-t border-[var(--color-border)] pt-4">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-faint)]">
              Portfolios
            </span>
            <PortfolioSwitcher
              portfolios={portfolios}
              selectedId={portfolioId}
              loading={isLoadingPortfolios}
              error={portfoliosError}
              onSelect={selectPortfolio}
              onRetry={() => refreshPortfolios()}
            />
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1080px] px-6 pt-6 pb-12 max-[720px]:px-3 max-[720px]:pt-4 max-[720px]:pb-8">
          {view === "setup" && (
            <PortfolioSetupPage
              onPortfolioCreated={async (p) => {
                await refreshPortfolios();
                selectPortfolio(p.portfolioId);
              }}
            />
          )}

          {view === "dashboard" && portfolioId && (
            <PortfolioDashboardPage
              portfolioId={portfolioId}
              currency={
                portfolios.find((p) => p.portfolioId === portfolioId)?.currency ?? "INR"
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
