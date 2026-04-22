import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OwnerMaintenanceOverview from "./OwnerMaintenanceOverview";

const mockGetOwnerMaintenance = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "owner-1", role: "OWNER" } }),
}));

vi.mock("../services/api", () => ({
  getOwnerMaintenance: (...args) => mockGetOwnerMaintenance(...args),
}));

vi.mock("../components/owner/dashboard/Sidebar", () => ({
  default: () => <div>Owner Sidebar</div>,
}));

vi.mock("../components/owner/dashboard/OwnerNotificationsBell", () => ({
  default: () => <div>Owner Notifications</div>,
}));

vi.mock("../components/UserDropdown", () => ({
  default: () => <div>User Dropdown</div>,
}));

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <OwnerMaintenanceOverview />
    </MemoryRouter>
  );
}

describe("OwnerMaintenanceOverview", () => {
  beforeEach(() => {
    mockGetOwnerMaintenance.mockReset();
  });

  it("loads and displays owner maintenance rows", async () => {
    mockGetOwnerMaintenance.mockResolvedValueOnce({
      data: {
        data: [
          { id: "req-1", title: "Pipe leak", priority: "HIGH", status: "IN_PROGRESS", assignedTechnicianId: "tech-1" },
        ],
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Pipe leak")).toBeInTheDocument();
      expect(screen.getByText("tech-1")).toBeInTheDocument();
    });

    expect(mockGetOwnerMaintenance).toHaveBeenCalledWith("owner-1");
  });

  it("renders empty state when no requests", async () => {
    mockGetOwnerMaintenance.mockResolvedValueOnce({ data: { data: [] } });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("No requests found.")).toBeInTheDocument();
    });
  });

  it("renders empty state when API fails", async () => {
    mockGetOwnerMaintenance.mockRejectedValueOnce(new Error("network"));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("No requests found.")).toBeInTheDocument();
    });
  });
});
