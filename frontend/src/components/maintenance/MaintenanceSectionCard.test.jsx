import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MaintenanceSectionCard from "./MaintenanceSectionCard";

describe("MaintenanceSectionCard", () => {
  it("renders title, eyebrow, description and children", () => {
    render(
      <MaintenanceSectionCard
        eyebrow="Queue"
        title="Work buckets"
        description="Use tabs to filter"
      >
        <button type="button">Child Action</button>
      </MaintenanceSectionCard>
    );

    expect(screen.getByText("Queue")).toBeInTheDocument();
    expect(screen.getByText("Work buckets")).toBeInTheDocument();
    expect(screen.getByText("Use tabs to filter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Child Action" })).toBeInTheDocument();
  });

  it("omits optional eyebrow and description when not provided", () => {
    render(
      <MaintenanceSectionCard title="Only title">
        <span>Body</span>
      </MaintenanceSectionCard>
    );

    expect(screen.getByText("Only title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.queryByText("Queue")).not.toBeInTheDocument();
  });
});
