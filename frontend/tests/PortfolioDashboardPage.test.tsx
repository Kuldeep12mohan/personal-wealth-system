import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PortfolioDashboardPage from "../src/pages/PortfolioDashboardPage";

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
    render(<PortfolioDashboardPage portfolioId="PORT-10001" />);

    expect(await screen.findByText("ABC Bank")).toBeInTheDocument();
    expect(screen.getByText("5000")).toBeInTheDocument();
    expect(screen.getAllByText("5500").length).toBeGreaterThan(0);
  });

  it("renders the add-investment and record-transaction forms in place", async () => {
    render(<PortfolioDashboardPage portfolioId="PORT-10001" />);

    await screen.findByText("ABC Bank");
    expect(screen.getByRole("button", { name: "Add Investment" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Record Transaction" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Price" })).toBeInTheDocument();
  });
});
