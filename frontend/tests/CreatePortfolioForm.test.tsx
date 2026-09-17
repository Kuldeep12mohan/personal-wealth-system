import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreatePortfolioForm from "../src/components/CreatePortfolioForm";

describe("CreatePortfolioForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("valid submit shows the returned portfolioId", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ portfolioId: "PORT-10001", name: "My Investments", currency: "INR" }),
    });

    const onCreated = vi.fn();
    render(<CreatePortfolioForm onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("Portfolio name"), {
      target: { value: "My Investments" },
    });
    fireEvent.click(screen.getByText("Create Portfolio"));

    expect(await screen.findByText(/PORT-10001/)).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({ portfolioId: "PORT-10001" })
    );
  });

  it("blank name shows an error and does not call the create endpoint", () => {
    render(<CreatePortfolioForm onCreated={vi.fn()} />);

    fireEvent.click(screen.getByText("Create Portfolio"));

    expect(screen.getByText(/Portfolio name is required/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
