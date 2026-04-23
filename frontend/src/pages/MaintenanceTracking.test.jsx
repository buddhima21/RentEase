import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MaintenanceTracking from "./MaintenanceTracking";

const mockGetMaintenanceById = vi.fn();

vi.mock("../services/api", () => ({
  getMaintenanceById: (...args) => mockGetMaintenanceById(...args),
}));

vi.mock("../components/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ requestId: "req-1" }),
  };
});

describe("MaintenanceTracking", () => {
  beforeEach(() => {
    mockGetMaintenanceById.mockReset();
  });

  it("renders request details when loaded", async () => {
    mockGetMaintenanceById.mockResolvedValueOnce({
      data: {
        data: {
          id: "req-1",
          title: "AC issue",
          description: "No cool air",
          priority: "HIGH",
          status: "IN_PROGRESS",
          assignedTechnicianId: "tech-1",
          technicianName: "Tech One",
          serviceType: "HVAC",
          propertyId: "UNIT-3B",
          workflowEvents: [
            { action: "REQUEST_CREATED", note: "Created by tenant", occurredAt: "2026-04-20T09:00:00" },
            { action: "REQUEST_ACCEPTED", note: "Technician accepted and started work", occurredAt: "2026-04-20T10:00:00" },
          ],
        },
      },
    });

    render(
      <MemoryRouter>
        <MaintenanceTracking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("AC issue")).toBeInTheDocument();
      expect(screen.getByText("Request progress")).toBeInTheDocument();
      expect(screen.getByText("REQUEST_ACCEPTED")).toBeInTheDocument();
    });

    expect(mockGetMaintenanceById).toHaveBeenCalledWith("req-1");
  });

  it("shows fallback message when loading fails", async () => {
    mockGetMaintenanceById.mockRejectedValueOnce(new Error("fetch failed"));

    render(
      <MemoryRouter>
        <MaintenanceTracking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load this request.")).toBeInTheDocument();
    });
  });
});
