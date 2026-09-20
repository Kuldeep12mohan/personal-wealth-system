import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PerformanceHistoryChart from "../src/components/PerformanceHistoryChart";
import { HistoryPoint } from "../src/services/api";

function makePoint(overrides: Partial<HistoryPoint>): HistoryPoint {
  return {
    recordedAt: "2026-09-01T00:00:00Z",
    totalInvested: 5000,
    currentValue: 5000,
    profitLoss: 0,
    profitLossPercentage: 0,
    ...overrides,
  };
}

describe("PerformanceHistoryChart", () => {
  it("shows a 'no history yet' state for zero points", () => {
    render(<PerformanceHistoryChart history={[]} />);
    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /performance history/i })).not.toBeInTheDocument();
  });

  it("shows a 'not enough history yet' state for exactly one point", () => {
    render(<PerformanceHistoryChart history={[makePoint({})]} />);
    expect(screen.getByText(/not enough history yet/i)).toBeInTheDocument();
  });

  it("renders both lines for two or more points", () => {
    const history = [
      makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 5000, currentValue: 5000 }),
      makePoint({ recordedAt: "2026-09-02T00:00:00Z", totalInvested: 5000, currentValue: 5500 }),
    ];
    render(<PerformanceHistoryChart history={history} />);

    const chart = screen.getByRole("img", { name: /performance history/i });
    expect(chart).toBeInTheDocument();
    expect(chart.querySelectorAll("polyline").length).toBe(2);
  });
});
