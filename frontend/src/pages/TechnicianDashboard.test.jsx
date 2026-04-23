import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TechnicianDashboard from "./TechnicianDashboard";

const mockGetTechnicianMaintenance = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "tech-1", role: "TECHNICIAN" } }),
}));

vi.mock("../services/api", () => ({
  getTechnicianMaintenance: (...args) => mockGetTechnicianMaintenance(...args),
}));

vi.mock("../components/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

describe("TechnicianDashboard", () => {
  beforeEach(() => {
    mockGetTechnicianMaintenance.mockReset();
  });

  it("loads and renders technician jobs", async () => {
    mockGetTechnicianMaintenance.mockResolvedValueOnce({
      data: {
        data: [
          { id: "r1", title: "AC repair", priority: "HIGH", status: "REPORTED" },
          { id: "r2", title: "Door fix", priority: "LOW", status: "IN_PROGRESS", scheduledAt: "2026-04-14T09:00:00" },
        ],
      },
    });

    render(
      <MemoryRouter>
        <TechnicianDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("AC repair")).toBeInTheDocument();
      expect(screen.getByText("Door fix")).toBeInTheDocument();
    });

    expect(mockGetTechnicianMaintenance).toHaveBeenCalledWith("tech-1");
  });

  it("filters pending tab to reported/paused jobs", async () => {
    mockGetTechnicianMaintenance.mockResolvedValueOnce({
      data: {
        data: [
          { id: "r1", title: "AC repair", priority: "HIGH", status: "REPORTED" },
          { id: "r2", title: "Door fix", priority: "LOW", status: "IN_PROGRESS" },
          { id: "r3", title: "Leak", priority: "MEDIUM", status: "PAUSED" },
        ],
      },
    });

    render(
      <MemoryRouter>
        <TechnicianDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("AC repair")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Pending" }));

    expect(screen.getByText("AC repair")).toBeInTheDocument();
    expect(screen.getByText("Leak")).toBeInTheDocument();
    expect(screen.queryByText("Door fix")).not.toBeInTheDocument();
  });

  it("renders empty state when API fails", async () => {
    mockGetTechnicianMaintenance.mockRejectedValueOnce(new Error("network failed"));

    render(
      <MemoryRouter>
        <TechnicianDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No assigned jobs.")).toBeInTheDocument();
    });
  });
});
