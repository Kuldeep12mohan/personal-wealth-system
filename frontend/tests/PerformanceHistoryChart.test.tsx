import { fireEvent, render, screen } from "@testing-library/react";
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
    render(<PerformanceHistoryChart history={[]} currency="INR" />);
    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /performance history/i })).not.toBeInTheDocument();
  });

  it("shows a 'not enough history yet' state for exactly one point", () => {
    render(<PerformanceHistoryChart history={[makePoint({})]} currency="INR" />);
    expect(screen.getByText(/not enough history yet/i)).toBeInTheDocument();
  });

  it("renders both lines for two or more points", () => {
    const history = [
      makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 5000, currentValue: 5000 }),
      makePoint({ recordedAt: "2026-09-02T00:00:00Z", totalInvested: 5000, currentValue: 5500 }),
    ];
    render(<PerformanceHistoryChart history={history} currency="INR" />);

    const chart = screen.getByRole("img", { name: /performance history/i });
    expect(chart).toBeInTheDocument();
    expect(chart.querySelectorAll("polyline").length).toBe(2);
  });

  it("distinguishes the two lines beyond color alone (FR-004)", () => {
    const history = [
      makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 5000, currentValue: 5000 }),
      makePoint({ recordedAt: "2026-09-02T00:00:00Z", totalInvested: 5000, currentValue: 5500 }),
    ];
    render(<PerformanceHistoryChart history={history} currency="INR" />);

    const [invested, current] = Array.from(
      screen.getByRole("img", { name: /performance history/i }).querySelectorAll("polyline")
    );
    expect(invested.getAttribute("stroke-dasharray")).not.toBeNull();
    expect(current.getAttribute("stroke-dasharray")).toBeNull();
    expect(current.getAttribute("stroke-width")).not.toBe(invested.getAttribute("stroke-width"));
  });

  it("keeps both lines visible when current value and invested amount are identical at every point", () => {
    const history = [
      makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 5000, currentValue: 5000 }),
      makePoint({ recordedAt: "2026-09-02T00:00:00Z", totalInvested: 5000, currentValue: 5000 }),
    ];
    render(<PerformanceHistoryChart history={history} currency="INR" />);

    const chart = screen.getByRole("img", { name: /performance history/i });
    expect(chart.querySelectorAll("polyline").length).toBe(2);
  });

  it("renders a flat, non-broken baseline when all recorded values are zero", () => {
    const history = [
      makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 0, currentValue: 0 }),
      makePoint({ recordedAt: "2026-09-02T00:00:00Z", totalInvested: 0, currentValue: 0 }),
    ];
    render(<PerformanceHistoryChart history={history} currency="INR" />);

    const chart = screen.getByRole("img", { name: /performance history/i });
    const polylines = chart.querySelectorAll("polyline");
    expect(polylines.length).toBe(2);
    for (const line of Array.from(polylines)) {
      expect(line.getAttribute("points")).not.toContain("NaN");
    }
  });

  it("preserves the empty and insufficient-history wording under the restyled container", () => {
    const { rerender } = render(<PerformanceHistoryChart history={[]} currency="INR" />);
    const emptyMessage = screen.getByText(
      /no history yet — record a transaction or update a price/i
    );
    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage.className).toContain("rounded-xl");

    rerender(<PerformanceHistoryChart history={[makePoint({})]} currency="INR" />);
    const insufficientMessage = screen.getByText(
      /not enough history yet — one more price update or transaction/i
    );
    expect(insufficientMessage).toBeInTheDocument();
    expect(insufficientMessage.className).toContain("rounded-xl");
  });

  // --- specs/007-interactive-performance-chart ---

  const history3 = [
    makePoint({ recordedAt: "2026-08-01T00:00:00Z", totalInvested: 10000, currentValue: 9000 }),
    makePoint({ recordedAt: "2026-08-15T00:00:00Z", totalInvested: 15000, currentValue: 15000 }),
    makePoint({ recordedAt: "2026-09-01T00:00:00Z", totalInvested: 15000, currentValue: 17000 }),
  ];

  it("shows currency-formatted Y-axis labels with gridlines and a fixed, evenly-spaced X-axis (FR-001-FR-003)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });

    const gridlines = chart.querySelectorAll("line");
    expect(gridlines.length).toBeGreaterThanOrEqual(2);

    const svgTexts = Array.from(chart.querySelectorAll("text")).map((t) => t.textContent);
    expect(svgTexts.some((t) => t?.includes("$"))).toBe(true);
    expect(svgTexts).toContain("Aug 1, 2026");
    expect(svgTexts).toContain("Sep 1, 2026");
  });

  it("colors markers green for a gain, red for a loss, and neutral for flat (FR-005)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });
    const markers = Array.from(chart.querySelectorAll("circle"));
    expect(markers).toHaveLength(3);

    expect(markers[0].getAttribute("fill")).toBe("var(--color-danger)");
    expect(markers[1].getAttribute("fill")).toBe("var(--color-text-muted)");
    expect(markers[2].getAttribute("fill")).toBe("var(--color-success)");
  });

  it("shows a tooltip with date, current value, invested amount, and P&L on hover, and updates on hovering a different point (FR-006)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });
    const markers = chart.querySelectorAll("circle");

    fireEvent.mouseEnter(markers[0]);
    let tooltip = screen.getByTestId("chart-tooltip");
    expect(tooltip).toHaveTextContent("Aug 1, 2026");
    expect(tooltip).toHaveTextContent("Current value: $9,000");
    expect(tooltip).toHaveTextContent("Invested amount: $10,000");
    expect(tooltip).toHaveTextContent("P&L: -$1,000");

    fireEvent.mouseEnter(markers[2]);
    tooltip = screen.getByTestId("chart-tooltip");
    expect(tooltip).toHaveTextContent("Sep 1, 2026");
    expect(tooltip).toHaveTextContent("P&L: +$2,000");
  });

  it("shows a tooltip on click (tap) and dismisses it when clicking elsewhere (FR-007)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });
    const markers = chart.querySelectorAll("circle");

    fireEvent.click(markers[1]);
    expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("Aug 15, 2026");

    const background = chart.querySelector("rect");
    fireEvent.click(background!);
    expect(screen.queryByTestId("chart-tooltip")).not.toBeInTheDocument();
  });

  it("stays fluid-width for responsive layouts (FR-008)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });
    expect(chart.getAttribute("class")).toContain("w-full");
  });

  it("clamps the tooltip near the plot's left and right edges so it never renders off-screen (FR-008)", () => {
    render(<PerformanceHistoryChart history={history3} currency="USD" />);
    const chart = screen.getByRole("img", { name: /performance history/i });
    const markers = chart.querySelectorAll("circle");

    fireEvent.mouseEnter(markers[0]);
    let tooltip = screen.getByTestId("chart-tooltip");
    expect(tooltip.style.transform).toContain("translate(0%");

    fireEvent.mouseEnter(markers[2]);
    tooltip = screen.getByTestId("chart-tooltip");
    expect(tooltip.style.transform).toContain("translate(-100%");
  });
});
