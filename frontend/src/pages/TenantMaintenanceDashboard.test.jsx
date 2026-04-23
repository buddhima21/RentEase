import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TenantMaintenanceDashboard from "./TenantMaintenanceDashboard";

const mockGetTenantMaintenance = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "tenant-1", role: "TENANT" } }),
}));

vi.mock("../services/api", () => ({
  getTenantMaintenance: (...args) => mockGetTenantMaintenance(...args),
}));

vi.mock("../components/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

describe("TenantMaintenanceDashboard", () => {
  beforeEach(() => {
    mockGetTenantMaintenance.mockReset();
  });

  it("loads and renders tenant maintenance rows", async () => {
    mockGetTenantMaintenance.mockResolvedValueOnce({
      data: {
        data: [
          { id: "req-1", title: "Tap repair", serviceType: "Plumbing", priority: "HIGH", status: "REPORTED", scheduledAt: null },
        ],
      },
    });

    render(
      <MemoryRouter>
        <TenantMaintenanceDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Tap repair")).toBeInTheDocument();
      expect(screen.getByText("Plumbing")).toBeInTheDocument();
      expect(screen.getByText("Track")).toBeInTheDocument();
    });

    expect(mockGetTenantMaintenance).toHaveBeenCalledWith("tenant-1");
  });

  it("shows empty state when tenant has no requests", async () => {
    mockGetTenantMaintenance.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <MemoryRouter>
        <TenantMaintenanceDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No maintenance requests yet")).toBeInTheDocument();
    });
  });

  it("falls back to empty state when API fails", async () => {
    mockGetTenantMaintenance.mockRejectedValueOnce(new Error("timeout"));

    render(
      <MemoryRouter>
        <TenantMaintenanceDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No maintenance requests yet")).toBeInTheDocument();
    });
  });
});
