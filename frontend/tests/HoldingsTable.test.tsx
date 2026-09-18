import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HoldingsTable from "../src/components/HoldingsTable";
import { HoldingView } from "../src/services/api";

function makeHolding(overrides: Partial<HoldingView>): HoldingView {
  return {
    holdingId: "HOLD-1",
    portfolioId: "PORT-1",
    name: "Test Holding",
    symbol: "TST",
    type: "STOCK",
    currentPrice: 10,
    quantity: 10,
    averagePrice: 10,
    currentValue: 100,
    ...overrides,
  };
}

describe("HoldingsTable allocation percentage", () => {
  it("shows each holding's allocation percentage next to its Current Value and sums to ~100%", () => {
    const holdings = [
      makeHolding({ holdingId: "HOLD-1", name: "A Corp", currentValue: 2000 }),
      makeHolding({ holdingId: "HOLD-2", name: "B Corp", currentValue: 3000 }),
      makeHolding({ holdingId: "HOLD-3", name: "C Corp", currentValue: 5000 }),
    ];

    render(<HoldingsTable holdings={holdings} portfolioCurrentValue={10000} />);

    expect(screen.queryByText("Allocation %")).not.toBeInTheDocument();

    const rowA = screen.getByText("A Corp").closest("tr")!;
    const rowB = screen.getByText("B Corp").closest("tr")!;
    const rowC = screen.getByText("C Corp").closest("tr")!;

    expect(rowA.querySelector('[data-label="Current Value"]')?.textContent).toContain("20.0%");
    expect(rowB.querySelector('[data-label="Current Value"]')?.textContent).toContain("30.0%");
    expect(rowC.querySelector('[data-label="Current Value"]')?.textContent).toContain("50.0%");

    const sum = 20.0 + 30.0 + 50.0;
    expect(sum).toBeCloseTo(100, 1);
  });

  it("shows 100% for a single holding", () => {
    const holdings = [makeHolding({ currentValue: 4200 })];

    render(<HoldingsTable holdings={holdings} portfolioCurrentValue={4200} />);

    const row = screen.getByText("Test Holding").closest("tr")!;
    expect(row.querySelector('[data-label="Current Value"]')?.textContent).toContain("100.0%");
  });

  it("shows 0% for every holding when the portfolio's total current value is zero", () => {
    const holdings = [
      makeHolding({ holdingId: "HOLD-1", name: "A Corp", currentValue: 0 }),
      makeHolding({ holdingId: "HOLD-2", name: "B Corp", currentValue: 0 }),
    ];

    render(<HoldingsTable holdings={holdings} portfolioCurrentValue={0} />);

    const rowA = screen.getByText("A Corp").closest("tr")!;
    const rowB = screen.getByText("B Corp").closest("tr")!;

    const textA = rowA.querySelector('[data-label="Current Value"]')?.textContent ?? "";
    const textB = rowB.querySelector('[data-label="Current Value"]')?.textContent ?? "";

    expect(textA).not.toMatch(/NaN|Infinity/);
    expect(textB).not.toMatch(/NaN|Infinity/);
    expect(textA).toContain("0.0%");
    expect(textB).toContain("0.0%");
  });

  it("keeps existing columns and row actions unchanged", () => {
    const holdings = [makeHolding({})];
    const onRecordTransaction = () => {};
    const onUpdatePrice = () => {};

    render(
      <HoldingsTable
        holdings={holdings}
        portfolioCurrentValue={100}
        onRecordTransaction={onRecordTransaction}
        onUpdatePrice={onUpdatePrice}
      />
    );

    for (const header of [
      "Name",
      "Symbol",
      "Type",
      "Quantity",
      "Avg Price",
      "Current Price",
      "Current Value",
      "P/L",
      "P/L %",
      "Actions",
    ]) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }

    expect(
      screen.getByRole("button", { name: /record transaction for/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update price for/i })).toBeInTheDocument();
  });
});
