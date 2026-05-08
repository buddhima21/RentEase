import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MaintenanceStatCard from "./MaintenanceStatCard";

describe("MaintenanceStatCard", () => {
  it("renders label and value", () => {
    render(<MaintenanceStatCard label="Jobs" value={12} />);

    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders hint when provided", () => {
    render(<MaintenanceStatCard label="Pending" value={3} hint="Requires technician assignment" />);

    expect(screen.getByText("Requires technician assignment")).toBeInTheDocument();
  });

  it("falls back to emerald accent classes for unknown accent", () => {
    const { container } = render(<MaintenanceStatCard label="Metric" value={1} accent="unknown" />);

    expect(container.querySelector(".from-emerald-500")).toBeInTheDocument();
  });
});
