import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecordTransactionForm from "../src/components/RecordTransactionForm";

describe("RecordTransactionForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillCommon() {
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "500" } });
    fireEvent.change(screen.getByLabelText("Transaction date"), {
      target: { value: "2026-09-01" },
    });
  }

  it("valid BUY succeeds", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          transactionId: "TXN-30001",
          holdingId: "HOLD-20001",
          type: "BUY",
          quantity: 10,
          price: 500,
          value: 5000,
        }),
    });

    render(<RecordTransactionForm holdingId="HOLD-20001" />);
    fillCommon();
    fireEvent.click(screen.getByText("Record Transaction"));

    expect(await screen.findByText(/TXN-30001/)).toBeInTheDocument();
  });

  it("an over-sell attempt shows a clear error message and quantity is unchanged", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      text: async () =>
        JSON.stringify({ error: "Sell quantity exceeds available holding quantity" }),
    });

    render(<RecordTransactionForm holdingId="HOLD-20001" />);
    fireEvent.change(screen.getByLabelText("Transaction type"), {
      target: { value: "SELL" },
    });
    fillCommon();
    fireEvent.click(screen.getByText("Record Transaction"));

    expect(
      await screen.findByText(/Sell quantity exceeds available holding quantity/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue("10");
  });

  it("BUY and SELL options have explicit background/text colors so they stay legible in dark mode", () => {
    render(<RecordTransactionForm holdingId="HOLD-20001" />);

    const select = screen.getByLabelText("Transaction type") as HTMLSelectElement;
    const options = Array.from(select.options);
    const buyOption = options.find((option) => option.value === "BUY")!;
    const sellOption = options.find((option) => option.value === "SELL")!;

    expect(buyOption.style.backgroundColor).not.toBe("");
    expect(buyOption.style.color).not.toBe("");
    expect(sellOption.style.backgroundColor).not.toBe("");
    expect(sellOption.style.color).not.toBe("");
    expect(buyOption.style.color).not.toBe(sellOption.style.color);
  });
});
