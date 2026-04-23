import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "../context/NotificationsContext";
import AdminMaintenanceDashboard from "./AdminMaintenanceDashboard";

const mockCreateTechnicianAccount = vi.fn();
const mockGetAdminMaintenanceQueue = vi.fn();
const mockGetMaintenanceTechnicians = vi.fn();

vi.mock("../services/api", () => ({
    createTechnicianAccount: (...args) => mockCreateTechnicianAccount(...args),
    getAdminMaintenanceQueue: (...args) => mockGetAdminMaintenanceQueue(...args),
    getMaintenanceTechnicians: (...args) => mockGetMaintenanceTechnicians(...args),
    closeMaintenance: vi.fn(),
    scheduleMaintenance: vi.fn(),
    updateMaintenancePriority: vi.fn(),
}));

function renderWithRouter(component) {
    return render(
        <BrowserRouter>
            <NotificationsProvider>{component}</NotificationsProvider>
        </BrowserRouter>
    );
}

describe("Admin technician creation flow", () => {
    beforeEach(() => {
        localStorage.setItem("adminToken", "admin-token");
        localStorage.setItem(
            "adminUser",
            JSON.stringify({ id: "admin-1", fullName: "Admin", email: "admin@rentease.com", role: "ADMIN" })
        );

        mockCreateTechnicianAccount.mockReset();
        mockGetAdminMaintenanceQueue.mockReset();
        mockGetMaintenanceTechnicians.mockReset();

        mockCreateTechnicianAccount.mockResolvedValue({ data: { success: true } });
        mockGetAdminMaintenanceQueue.mockResolvedValue({ data: { data: [] } });
        mockGetMaintenanceTechnicians
            .mockResolvedValueOnce({ data: { data: [] } })
            .mockResolvedValueOnce({
                data: {
                    data: [{ id: "tech-1", fullName: "Tech One", email: "tech1@example.com" }],
                },
            });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("opens create modal and submits technician details", async () => {
        renderWithRouter(<AdminMaintenanceDashboard />);

        await waitFor(() => {
            expect(mockGetMaintenanceTechnicians).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByRole("button", { name: /Add Technician/i }));

        fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Tech One" } });
        fireEvent.change(screen.getByPlaceholderText("john@rentease.com"), { target: { value: "tech1@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Minimum 8 characters"), { target: { value: "tempPass123" } });

        fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

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
        });
    });
});
