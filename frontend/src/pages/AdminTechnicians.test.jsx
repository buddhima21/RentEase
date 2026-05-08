import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminTechnicians from "./AdminTechnicians";

const mockCreateTechnicianAccount = vi.fn();
const mockGetMaintenanceTechnicians = vi.fn();

vi.mock("../services/api", () => ({
    createTechnicianAccount: (...args) => mockCreateTechnicianAccount(...args),
    getMaintenanceTechnicians: (...args) => mockGetMaintenanceTechnicians(...args),
}));

vi.mock("../components/admin/dashboard/AdminSidebar", () => ({
    default: () => <div>Admin Sidebar</div>,
}));

vi.mock("../components/admin/dashboard/AdminProfileDropdown", () => ({
    default: () => <div>Admin Profile</div>,
}));

function renderWithRoutes() {
    return render(
        <MemoryRouter initialEntries={["/admin/technicians"]}>
            <Routes>
                <Route path="/admin/login" element={<div>Admin Login</div>} />
                <Route path="/admin/technicians" element={<AdminTechnicians />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("AdminTechnicians", () => {
    beforeEach(() => {
        localStorage.clear();
        mockCreateTechnicianAccount.mockReset();
        mockGetMaintenanceTechnicians.mockReset();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("redirects to admin login when admin auth is missing", async () => {
        renderWithRoutes();

        await waitFor(() => {
            expect(screen.getByText("Admin Login")).toBeInTheDocument();
        });
    });

    it("creates technician and reloads list", async () => {
        localStorage.setItem("adminToken", "admin-token");
        localStorage.setItem(
            "adminUser",
            JSON.stringify({ id: "admin-1", fullName: "Admin", email: "admin@rentease.com", role: "ADMIN" })
        );

        mockGetMaintenanceTechnicians
            .mockResolvedValueOnce({ data: { data: [] } })
            .mockResolvedValueOnce({
                data: {
                    data: [{ id: "tech-1", fullName: "Tech One", email: "tech1@example.com", phone: "0771234567" }],
                },
            });
        mockCreateTechnicianAccount.mockResolvedValue({ data: { success: true } });

        renderWithRoutes();

        await waitFor(() => {
            expect(mockGetMaintenanceTechnicians).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Tech One" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tech1@example.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "tempPass123" } });
        fireEvent.click(screen.getByRole("button", { name: "Create Technician" }));

        await waitFor(() => {
            expect(mockCreateTechnicianAccount).toHaveBeenCalledWith({
                fullName: "Tech One",
                email: "tech1@example.com",
                password: "tempPass123",
                phone: undefined,
            });
        });

        await waitFor(() => {
            expect(mockGetMaintenanceTechnicians).toHaveBeenCalledTimes(2);
            expect(screen.getByText("Technician account created successfully.")).toBeInTheDocument();
            expect(screen.getByText("Tech One")).toBeInTheDocument();
        });
    });
});
