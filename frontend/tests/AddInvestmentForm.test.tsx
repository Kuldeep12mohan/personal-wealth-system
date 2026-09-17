import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddInvestmentForm from "../src/components/AddInvestmentForm";

describe("AddInvestmentForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("valid submit shows the returned holdingId", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          holdingId: "HOLD-20001",
          portfolioId: "PORT-10001",
          name: "ABC Bank",
          symbol: "ABCBANK",
          type: "STOCK",
          currentPrice: 0,
        }),
    });

    render(<AddInvestmentForm portfolioId="PORT-10001" onAdded={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Investment name"), {
      target: { value: "ABC Bank" },
    });
    fireEvent.change(screen.getByLabelText("Symbol"), {
      target: { value: "ABCBANK" },
    });
    fireEvent.click(screen.getByText("Add Investment"));

    expect(await screen.findByText(/HOLD-20001/)).toBeInTheDocument();
  });

  it("blank name/symbol shows an error", () => {
    render(<AddInvestmentForm portfolioId="PORT-10001" onAdded={vi.fn()} />);

    fireEvent.click(screen.getByText("Add Investment"));

    expect(
      screen.getByText(/Investment name and symbol are required/)
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
