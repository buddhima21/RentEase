import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "../context/NotificationsContext";
import AdminMaintenanceDashboard from "./AdminMaintenanceDashboard";

const mockAssignMaintenanceTechnician = vi.fn();
const mockCloseMaintenance = vi.fn();
const mockGetAdminMaintenanceQueue = vi.fn();
const mockGetMaintenanceTechnicians = vi.fn();
const mockUpdateMaintenancePriority = vi.fn();

vi.mock("../services/api", () => ({
  assignMaintenanceTechnician: (...args) => mockAssignMaintenanceTechnician(...args),
  closeMaintenance: (...args) => mockCloseMaintenance(...args),
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
    mockCloseMaintenance.mockReset();
    mockGetAdminMaintenanceQueue.mockReset();
    mockGetMaintenanceTechnicians.mockReset();
    mockUpdateMaintenancePriority.mockReset();

    mockGetAdminMaintenanceQueue.mockResolvedValue({
      data: {
        data: [
          {
            id: "req-1",
            propertyId: "prop-1",
            tenantId: "tenant-1",
            title: "AC breakdown",
            priority: "HIGH",
            status: "REPORTED",
            assignedTechnicianId: "",
            technicianName: null,
            technicianEmail: null,
          },
          {
            id: "req-2",
            propertyId: "prop-2",
            tenantId: "tenant-2",
            title: "Pipe leak",
            priority: "MEDIUM",
            status: "RESOLVED",
            assignedTechnicianId: "tech-1",
            technicianName: "Tech One",
            technicianEmail: "tech1@example.com",
          },
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
    mockCloseMaintenance.mockResolvedValue({ data: { success: true } });
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
      expect(screen.getByText("Pipe leak")).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText("Technician for AC breakdown"), { target: { value: "tech-1" } });

    fireEvent.click(screen.getAllByRole("button", { name: "Assign" })[0]);

    await waitFor(() => {
      expect(mockAssignMaintenanceTechnician).toHaveBeenCalledWith("req-1", { technicianId: "tech-1" });
    });

    expect(mockGetAdminMaintenanceQueue).toHaveBeenCalledTimes(2);
  });

  it("closes resolved request with optional note", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Pipe leak")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Closure note"), { target: { value: "Verified by admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(mockCloseMaintenance).toHaveBeenCalledWith("req-2", "Verified by admin");
    });
  });

  it("saves priority changes", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Priority for AC breakdown"), { target: { value: "EMERGENCY" } });

    fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

    await waitFor(() => {
      expect(mockUpdateMaintenancePriority).toHaveBeenCalledWith("req-1", "EMERGENCY");
    });
  });

  it("does not assign when technician is not selected", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Assign" })[0]);

    expect(mockAssignMaintenanceTechnician).not.toHaveBeenCalled();
  });

  it("applies queue filters and calls API with selected params", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Filter by status"), { target: { value: "REPORTED" } });
    fireEvent.change(screen.getByLabelText("Filter by priority"), { target: { value: "HIGH" } });
    fireEvent.change(screen.getByLabelText("Filter by technician"), { target: { value: "tech-1" } });

    await waitFor(() => {
      expect(mockGetAdminMaintenanceQueue).toHaveBeenLastCalledWith({
        priority: "HIGH",
        status: "REPORTED",
        technicianId: "tech-1",
      });
    });
  });

  it("filters the queue with search across request and technician text", async () => {
    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
      expect(screen.getByText("Pipe leak")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Search maintenance requests"), { target: { value: "tech one" } });

    await waitFor(() => {
      expect(screen.getByText("Pipe leak")).toBeInTheDocument();
      expect(screen.queryByText("AC breakdown")).not.toBeInTheDocument();
    });
  });

  it("shows empty queue state when API load fails", async () => {
    mockGetAdminMaintenanceQueue.mockRejectedValueOnce(new Error("queue unavailable"));

    renderWithRouter(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load queue.")).toBeInTheDocument();
    });
  });
});
