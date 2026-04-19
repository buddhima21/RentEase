import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MaintenanceBadge from "./MaintenanceBadge";

describe("MaintenanceBadge", () => {
  it("renders status label for in-progress", () => {
    render(<MaintenanceBadge value="IN_PROGRESS" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders emergency text for emergency priority", () => {
    render(<MaintenanceBadge kind="priority" value="EMERGENCY" />);
    expect(screen.getByText("Emergency")).toBeInTheDocument();
  });

  it("renders fallback label for unknown values", () => {
    render(<MaintenanceBadge kind="priority" value="CUSTOM" />);
    expect(screen.getByText("CUSTOM")).toBeInTheDocument();
  });
});
