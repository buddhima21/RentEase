import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("AdminMaintenanceDashboard", () => {
  beforeEach(() => {
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

  it("loads queue and technician list", async () => {
    render(<AdminMaintenanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText("AC breakdown")).toBeInTheDocument();
      expect(screen.getAllByText("Tech One").length).toBeGreaterThan(0);
    });

    expect(mockGetAdminMaintenanceQueue).toHaveBeenCalled();
    expect(mockGetMaintenanceTechnicians).toHaveBeenCalled();
  });

  it("assigns technician and reloads queue", async () => {
    render(<AdminMaintenanceDashboard />);

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
    render(<AdminMaintenanceDashboard />);

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
});
