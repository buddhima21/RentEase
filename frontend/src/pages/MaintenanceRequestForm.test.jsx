import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MaintenanceRequestForm from "./MaintenanceRequestForm";

const mockNavigate = vi.fn();
const mockCreateMaintenanceRequest = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "tenant-1", role: "TENANT" } }),
}));

vi.mock("../services/api", () => ({
  createMaintenanceRequest: (...args) => mockCreateMaintenanceRequest(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/tenant/maintenance/request" }),
  };
});

describe("MaintenanceRequestForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreateMaintenanceRequest.mockReset();
  });

  it("renders required fields and default priority", () => {
    render(
      <MemoryRouter>
        <MaintenanceRequestForm />
      </MemoryRouter>
    );

    expect(screen.getByText("Maintenance request")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Request" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("MEDIUM")).toBeInTheDocument();
  });

  it("submits form and redirects to tenant dashboard", async () => {
    mockCreateMaintenanceRequest.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <MaintenanceRequestForm />
      </MemoryRouter>
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "UNIT-3B" } });
    fireEvent.change(screen.getAllByPlaceholderText("Issue title")[0], { target: { value: "Broken faucet" } });
    fireEvent.change(selects[1], { target: { value: "Plumbing" } });

    fireEvent.change(screen.getByPlaceholderText("Describe the issue"), { target: { value: "Kitchen sink leaking heavily" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));

    await waitFor(() => {
      expect(mockCreateMaintenanceRequest).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateMaintenanceRequest.mock.calls[0][0]).toMatchObject({
      propertyId: "UNIT-3B",
      title: "Broken faucet",
      serviceType: "Plumbing",
      tenantId: "tenant-1",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/tenant/maintenance/dashboard");
  });

  it("shows API error message on failure", async () => {
    mockCreateMaintenanceRequest.mockRejectedValueOnce({
      response: { data: { message: "Server validation failed" } },
    });

    render(
      <MemoryRouter>
        <MaintenanceRequestForm />
      </MemoryRouter>
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "UNIT-3B" } });
    fireEvent.change(screen.getAllByPlaceholderText("Issue title")[0], { target: { value: "Broken faucet" } });
    fireEvent.change(selects[1], { target: { value: "Plumbing" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));

    await waitFor(() => {
      expect(screen.getByText("Server validation failed")).toBeInTheDocument();
    });
  });
});
