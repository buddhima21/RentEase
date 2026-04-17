import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MaintenanceTracking from "./MaintenanceTracking";

const mockGetMaintenanceById = vi.fn();

vi.mock("../services/api", () => ({
  getMaintenanceById: (...args) => mockGetMaintenanceById(...args),
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
          serviceType: "HVAC",
          propertyId: "UNIT-3B",
        },
      },
    });

    render(<MaintenanceTracking />);

    await waitFor(() => {
      expect(screen.getByText("AC issue")).toBeInTheDocument();
      expect(screen.getByText(/Technician:/)).toBeInTheDocument();
      expect(screen.getByText(/Service: HVAC/)).toBeInTheDocument();
    });

    expect(mockGetMaintenanceById).toHaveBeenCalledWith("req-1");
  });

  it("shows fallback message when loading fails", async () => {
    mockGetMaintenanceById.mockRejectedValueOnce(new Error("fetch failed"));

    render(<MaintenanceTracking />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load request details.")).toBeInTheDocument();
    });
  });
});
