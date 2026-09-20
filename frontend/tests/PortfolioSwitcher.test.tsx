import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PortfolioSwitcher from "../src/components/PortfolioSwitcher";
import { Portfolio } from "../src/services/api";

const portfolios: Portfolio[] = [
  { portfolioId: "PORT-10001", name: "Retirement", currency: "INR" },
  { portfolioId: "PORT-10002", name: "Growth", currency: "USD" },
];

describe("PortfolioSwitcher", () => {
  it("renders each portfolio by name and calls onSelect when chosen", () => {
    const onSelect = vi.fn();
    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        selectedId=""
        loading={false}
        error={null}
        onSelect={onSelect}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/Retirement/)).toBeInTheDocument();
    expect(screen.getByText(/Growth/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Growth/));
    expect(onSelect).toHaveBeenCalledWith("PORT-10002");
  });

  it("shows a guided empty state when there are no portfolios", () => {
    render(
      <PortfolioSwitcher
        portfolios={[]}
        selectedId=""
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/No portfolios yet/)).toBeInTheDocument();
  });

  it("shows a loading indicator while fetching", () => {
    render(
      <PortfolioSwitcher
        portfolios={[]}
        selectedId=""
        loading={true}
        error={null}
        onSelect={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows each portfolio's currency to distinguish similarly named portfolios", () => {
    const sameName: Portfolio[] = [
      { portfolioId: "PORT-10001", name: "My Investments", currency: "INR" },
      { portfolioId: "PORT-10002", name: "My Investments", currency: "USD" },
    ];

    render(
      <PortfolioSwitcher
        portfolios={sameName}
        selectedId=""
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText("My Investments (INR)")).toBeInTheDocument();
    expect(screen.getByText("My Investments (USD)")).toBeInTheDocument();
  });

  it("marks the entry matching selectedId as active", () => {
    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        selectedId="PORT-10002"
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /Growth/ })
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: /Retirement/ })
    ).not.toHaveAttribute("aria-current");
  });

  it("shows an error state with a retry control that calls onRetry", () => {
    const onRetry = vi.fn();
    render(
      <PortfolioSwitcher
        portfolios={[]}
        selectedId=""
        loading={false}
        error="Network error"
        onSelect={vi.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
