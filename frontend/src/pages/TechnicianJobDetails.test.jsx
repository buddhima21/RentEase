import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TechnicianJobDetails from "./TechnicianJobDetails";

const mockNavigate = vi.fn();
const mockAcceptMaintenance = vi.fn();
const mockGetMaintenanceById = vi.fn();
const mockPauseMaintenance = vi.fn();
const mockResolveMaintenance = vi.fn();
const mockResumeMaintenance = vi.fn();
const mockStartMaintenance = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "tech-1", role: "TECHNICIAN" } }),
}));

vi.mock("../services/api", () => ({
  acceptMaintenance: (...args) => mockAcceptMaintenance(...args),
  getMaintenanceById: (...args) => mockGetMaintenanceById(...args),
  pauseMaintenance: (...args) => mockPauseMaintenance(...args),
  resolveMaintenance: (...args) => mockResolveMaintenance(...args),
  resumeMaintenance: (...args) => mockResumeMaintenance(...args),
  startMaintenance: (...args) => mockStartMaintenance(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ jobId: "req-1" }),
  };
});

const baseJob = {
  id: "req-1",
  title: "AC repair",
  priority: "HIGH",
  status: "IN_PROGRESS",
  serviceType: "HVAC",
  description: "No cooling",
  tenantId: "tenant-1",
  propertyId: "UNIT-3B",
};

describe("TechnicianJobDetails", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockAcceptMaintenance.mockReset();
    mockGetMaintenanceById.mockReset();
    mockPauseMaintenance.mockReset();
    mockResolveMaintenance.mockReset();
    mockResumeMaintenance.mockReset();
    mockStartMaintenance.mockReset();

    mockGetMaintenanceById.mockResolvedValue({ data: { data: baseJob } });
    mockAcceptMaintenance.mockResolvedValue({ data: { success: true } });
    mockPauseMaintenance.mockResolvedValue({ data: { success: true } });
    mockStartMaintenance.mockResolvedValue({ data: { success: true } });
    mockResumeMaintenance.mockResolvedValue({ data: { success: true } });
    mockResolveMaintenance.mockResolvedValue({ data: { success: true } });
  });

  it("loads and displays technician job details", async () => {
    render(<TechnicianJobDetails />);

    await waitFor(() => {
      expect(screen.getByText("AC repair")).toBeInTheDocument();
      expect(screen.getByText(/Service:/)).toBeInTheDocument();
      expect(screen.getByText(/Request ID:/)).toBeInTheDocument();
    });

    expect(mockGetMaintenanceById).toHaveBeenCalledWith("req-1");
  });

  it("shows resume button when job status is paused", async () => {
    mockGetMaintenanceById.mockResolvedValueOnce({
      data: {
        data: { ...baseJob, status: "PAUSED" },
      },
    });

    render(<TechnicianJobDetails />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  });

  it("resolves request with summary and navigates back", async () => {
    render(<TechnicianJobDetails />);

    await waitFor(() => {
      expect(screen.getByText("AC repair")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Completion summary"), { target: { value: "Issue fixed" } });
    fireEvent.change(screen.getByPlaceholderText("Technician notes"), { target: { value: "Compressor replaced" } });

    fireEvent.click(screen.getByRole("button", { name: "Resolve Request" }));

    await waitFor(() => {
      expect(mockResolveMaintenance).toHaveBeenCalledTimes(1);
    });

    expect(mockResolveMaintenance).toHaveBeenCalledWith(
      "req-1",
      expect.objectContaining({
        completionSummary: "Issue fixed",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/technician/dashboard");
  });
});
