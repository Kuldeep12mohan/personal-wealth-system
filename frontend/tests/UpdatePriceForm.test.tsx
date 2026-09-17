import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UpdatePriceForm from "../src/components/UpdatePriceForm";

describe("UpdatePriceForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("a valid update calls onUpdated with the new current value inputs", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ holdingId: "HOLD-20001", currentPrice: 550 }),
    });

    const onUpdated = vi.fn();
    render(<UpdatePriceForm holdingId="HOLD-20001" onUpdated={onUpdated} />);

    fireEvent.change(screen.getByLabelText("Current price for HOLD-20001"), {
      target: { value: "550" },
    });
    fireEvent.click(screen.getByText("Update Price"));

    await waitFor(() =>
      expect(onUpdated).toHaveBeenCalledWith("HOLD-20001", 550)
    );
  });

  it("a non-positive price shows a validation error", () => {
    render(<UpdatePriceForm holdingId="HOLD-20001" onUpdated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Current price for HOLD-20001"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("Update Price"));

    expect(
      screen.getByText(/Current price must be greater than zero/)
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
