import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PortfolioDashboardPage from "../src/pages/PortfolioDashboardPage";

const HISTORY_BY_PORTFOLIO: Record<string, unknown[]> = {
  "PORT-10001": [
    {
      recordedAt: "2026-09-01T00:00:00Z",
      totalInvested: 5000,
      currentValue: 5000,
      profitLoss: 0,
      profitLossPercentage: 0,
    },
    {
      recordedAt: "2026-09-02T00:00:00Z",
      totalInvested: 5000,
      currentValue: 5500,
      profitLoss: 500,
      profitLossPercentage: 10,
    },
  ],
  "PORT-10002": [
    {
      recordedAt: "2026-09-03T00:00:00Z",
      totalInvested: 2000,
      currentValue: 2200,
      profitLoss: 200,
      profitLossPercentage: 10,
    },
  ],
};

function mockFetchForPortfolio(portfolioId: string) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/summary")) {
      return Promise.resolve({
        ok: true,
        text: async () =>
          JSON.stringify({
            portfolioId,
            totalInvested: 5000,
            currentValue: 5500,
            profitLoss: 500,
            profitLossPercentage: 10,
          }),
      }) as any;
    }
    if (url.includes("/history")) {
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify(HISTORY_BY_PORTFOLIO[portfolioId] ?? []),
      }) as any;
    }
    if (url.includes("/holdings")) {
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify([]),
      }) as any;
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  }) as any;
}

describe("PortfolioDashboardPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/summary")) {
        return Promise.resolve({
          ok: true,
          text: async () =>
            JSON.stringify({
              portfolioId: "PORT-10001",
              totalInvested: 5000,
              currentValue: 5500,
              profitLoss: 500,
              profitLossPercentage: 10,
            }),
        }) as any;
      }
      if (url.includes("/history")) {
        return Promise.resolve({
          ok: true,
          text: async () => JSON.stringify([]),
        }) as any;
      }
      if (url.includes("/holdings")) {
        return Promise.resolve({
          ok: true,
          text: async () =>
            JSON.stringify([
              {
                holdingId: "HOLD-20001",
                portfolioId: "PORT-10001",
                name: "ABC Bank",
                symbol: "ABCBANK",
                type: "STOCK",
                currentPrice: 550,
                quantity: 10,
                averagePrice: 500,
                currentValue: 5500,
              },
            ]),
        }) as any;
      }
      return Promise.reject(new Error(`unexpected url ${url}`));
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders holdings and summary from a seeded API response", async () => {
    render(<PortfolioDashboardPage portfolioId="PORT-10001" currency="INR" />);

    expect(await screen.findByText("ABC Bank")).toBeInTheDocument();
    expect(screen.getByText("5000")).toBeInTheDocument();
    expect(screen.getAllByText("5500").length).toBeGreaterThan(0);
  });

  it("renders the add-investment and record-transaction forms in place", async () => {
    render(<PortfolioDashboardPage portfolioId="PORT-10001" currency="INR" />);

    await screen.findByText("ABC Bank");
    expect(screen.getByRole("button", { name: "Add Investment" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Record Transaction" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Price" })).toBeInTheDocument();
  });
});

describe("PortfolioDashboardPage history isolation across portfolio switch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only the newly selected portfolio's history after a portfolioId change, never a mix of both", async () => {
    mockFetchForPortfolio("PORT-10001");
    const { rerender } = render(<PortfolioDashboardPage portfolioId="PORT-10001" currency="INR" />);

    const firstChart = await screen.findByRole("img", { name: /performance history/i });
    expect(firstChart.querySelectorAll("polyline").length).toBe(2);

    mockFetchForPortfolio("PORT-10002");
    rerender(<PortfolioDashboardPage portfolioId="PORT-10002" currency="USD" />);

    expect(await screen.findByText(/not enough history yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /performance history/i })
    ).not.toBeInTheDocument();
  });
});
