import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "../context/NotificationsContext";
import AdminMaintenanceDashboard from "./AdminMaintenanceDashboard";

const mockAssignMaintenanceTechnician = vi.fn();
const mockGetAdminMaintenanceQueue = vi.fn();
const mockGetMaintenanceTechnicians = vi.fn();
const mockUpdateMaintenancePriority = vi.fn();

vi.mock("../services/api", () => ({
  assignMaintenanceTechnician: (...args) => mockAssignMaintenanceTechnician(...args),
  getAdminMaintenanceQueue: (...args) => mockGetAdminMaintenanceQueue(...args),
  getMaintenanceTechnicians: (...args) => mockGetMaintenanceTechnicians(...args),
  updateMaintenancePriority: (...args) => mockUpdateMaintenancePriority(...args),
}));

/**
 * Helper to render component with Router and NotificationsProvider context.
 */
function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      <NotificationsProvider>
        {component}
      </NotificationsProvider>
    </BrowserRouter>
  );
}

describe("AdminMaintenanceDashboard", () => {
  beforeEach(() => {
    // Set up admin auth storage to prevent Navigate redirect in tests
    localStorage.setItem('adminToken', 'test-admin-token');
    localStorage.setItem('adminUser', JSON.stringify({
      id: 'admin-123',
      role: 'ADMIN',
      token: 'test-admin-token'
    }));

    mockAssignMaintenanceTechnician.mockReset();
    mockGetAdminMaintenanceQueue.mockReset();
    mockGetMaintenanceTechnicians.mockReset();
    mockUpdateMaintenancePriority.mockReset();

    mockGetAdminMaintenanceQueue.mockResolvedValue({
      data: {
        data: [
          { id: "req-1", title: "AC breakdown", priority: "HIGH", status: "REPORTED", assignedTechnicianId: "" },
        ],
      },
    });
    mockGetMaintenanceTechnicians.mockResolvedValue({
      data: {
        data: [
          { id: "tech-1", fullName: "Tech One", email: "tech1@example.com" },
          { id: "tech-2", fullName: "Tech Two", email: "tech2@example.com" },
        ],
      },
    });
    mockAssignMaintenanceTechnician.mockResolvedValue({ data: { success: true } });
    mockUpdateMaintenancePriority.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    // Clear auth storage to prevent test pollution
    localStorage.clear();
  });

  it("loads queue and technician list", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
      expect(screen.getAllByText("Tech One").length).toBeGreaterThan(0);
    });

    expect(mockGetAdminMaintenanceQueue).toHaveBeenCalled();
    expect(mockGetMaintenanceTechnicians).toHaveBeenCalled();
  });

  it("assigns technician and reloads queue", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const assignmentSelect = selects[4];
    fireEvent.change(assignmentSelect, { target: { value: "tech-1" } });

    fireEvent.click(screen.getByRole("button", { name: "Assign" }));

    await waitFor(() => {
      expect(mockAssignMaintenanceTechnician).toHaveBeenCalledWith("req-1", { technicianId: "tech-1" });
    });

    expect(mockGetAdminMaintenanceQueue).toHaveBeenCalledTimes(2);
  });

  it("saves priority changes", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const prioritySelect = selects[3];
    fireEvent.change(prioritySelect, { target: { value: "EMERGENCY" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateMaintenancePriority).toHaveBeenCalledWith("req-1", "EMERGENCY");
    });
  });

  it("does not assign when technician is not selected", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Assign" }));

    expect(mockAssignMaintenanceTechnician).not.toHaveBeenCalled();
  });

  it("applies queue filters and calls API with selected params", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "REPORTED" } });
    fireEvent.change(selects[1], { target: { value: "HIGH" } });
    fireEvent.change(selects[2], { target: { value: "tech-1" } });

    await waitFor(() => {
      expect(mockGetAdminMaintenanceQueue).toHaveBeenLastCalledWith({
        priority: "HIGH",
        status: "REPORTED",
        technicianId: "tech-1",
      });
    });
  });

  it("shows empty queue state when API load fails", async () => {
    mockGetAdminMaintenanceQueue.mockRejectedValueOnce(new Error("queue unavailable"));

    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("No requests in queue.")).toBeInTheDocument();
    });
  });
});
