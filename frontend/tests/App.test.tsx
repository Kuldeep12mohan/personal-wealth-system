import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const LAST_PORTFOLIO_KEY = "personal-wealth:lastPortfolioId";

function mockPortfoliosResponse(portfolios: unknown[]) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/portfolios") && !url.includes("/summary")) {
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify(portfolios),
      }) as any;
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  }) as any;
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("auto-selects the single portfolio and enables the dashboard nav with no manual step", async () => {
    mockPortfoliosResponse([
      { portfolioId: "PORT-10001", name: "Retirement", currency: "INR" },
    ]);

    render(<App />);

    expect(await screen.findByText(/Retirement/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Portfolio Dashboard" })
    ).toBeEnabled();
  });

  it("keeps the dashboard nav disabled and shows a guided empty state when there are no portfolios", async () => {
    mockPortfoliosResponse([]);

    render(<App />);

    expect(await screen.findByText(/No portfolios yet/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Portfolio Dashboard" })
    ).toBeDisabled();
  });

  it("no longer renders a manual Portfolio ID text input", async () => {
    mockPortfoliosResponse([
      { portfolioId: "PORT-10001", name: "Retirement", currency: "INR" },
    ]);

    render(<App />);

    await screen.findByText(/Retirement/);
    expect(screen.queryByLabelText("Portfolio ID")).not.toBeInTheDocument();
  });

  it("refreshes the switcher list after a new portfolio is created, without a manual reload", async () => {
    let listCallCount = 0;
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/portfolios") && !url.includes("/summary") && (!options || options.method === undefined || options.method === "GET")) {
        listCallCount += 1;
        const body =
          listCallCount === 1
            ? [{ portfolioId: "PORT-10001", name: "Existing", currency: "INR" }]
            : [
                { portfolioId: "PORT-10001", name: "Existing", currency: "INR" },
                { portfolioId: "PORT-10002", name: "Brand New", currency: "USD" },
              ];
        return Promise.resolve({ ok: true, text: async () => JSON.stringify(body) }) as any;
      }
      if (url.includes("/portfolios") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          text: async () =>
            JSON.stringify({ portfolioId: "PORT-10002", name: "Brand New", currency: "USD" }),
        }) as any;
      }
      return Promise.reject(new Error(`unexpected url ${url}`));
    }) as any;

    render(<App />);

    await screen.findByText(/Existing/);

    fireEvent.change(screen.getByLabelText("Portfolio name"), {
      target: { value: "Brand New" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Portfolio" }));

    expect(
      await screen.findByRole("button", { name: /Brand New/ })
    ).toBeInTheDocument();
    expect(listCallCount).toBeGreaterThanOrEqual(2);
  });

  it("restores the previously selected portfolio from localStorage on a new mount", async () => {
    localStorage.setItem(LAST_PORTFOLIO_KEY, "PORT-10002");
    mockPortfoliosResponse([
      { portfolioId: "PORT-10001", name: "Existing", currency: "INR" },
      { portfolioId: "PORT-10002", name: "Restored", currency: "USD" },
    ]);

    render(<App />);

    await screen.findByText(/Existing/);
    fireEvent.click(screen.getByRole("button", { name: "Portfolio Dashboard" }));

    expect(await screen.findByText(/Portfolio PORT-10002/)).toBeInTheDocument();
  });

  it("updates the dashboard in place when switching from Portfolio A to Portfolio B while the dashboard is already open", async () => {
    mockPortfoliosResponse([
      { portfolioId: "PORT-10001", name: "Portfolio A", currency: "INR" },
      { portfolioId: "PORT-10002", name: "Portfolio B", currency: "USD" },
    ]);

    render(<App />);

    await screen.findByText(/Portfolio A/);
    fireEvent.click(screen.getByRole("button", { name: /Portfolio A/ }));
    fireEvent.click(screen.getByRole("button", { name: "Portfolio Dashboard" }));

    expect(await screen.findByText(/Portfolio PORT-10001/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Portfolio B/ }));

    expect(await screen.findByText(/Portfolio PORT-10002/)).toBeInTheDocument();
    expect(screen.queryByText(/Portfolio PORT-10001/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Portfolio Dashboard" })
    ).toBeEnabled();
  });

  it("clears a stale stored selection and falls back gracefully instead of breaking", async () => {
    localStorage.setItem(LAST_PORTFOLIO_KEY, "PORT-99999");
    mockPortfoliosResponse([
      { portfolioId: "PORT-10001", name: "Existing", currency: "INR" },
    ]);

    render(<App />);

    expect(await screen.findByText(/Existing/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Portfolio Dashboard" })
    ).toBeEnabled();
    expect(localStorage.getItem(LAST_PORTFOLIO_KEY)).not.toBe("PORT-99999");
  });
});
