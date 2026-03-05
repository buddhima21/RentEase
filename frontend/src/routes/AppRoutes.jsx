import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Search from "../pages/Search";
import MapView from "../pages/MapView";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OwnerDashboard from "../pages/OwnerDashboard";

// Maintenance Pages
import MaintenanceLanding from "../pages/MaintenanceLanding";
import TenantMaintenanceDashboard from "../pages/TenantMaintenanceDashboard";
import MaintenanceRequestForm from "../pages/MaintenanceRequestForm";
import MaintenanceTracking from "../pages/MaintenanceTracking";
import MaintenanceHistory from "../pages/MaintenanceHistory";
import ServiceInformation from "../pages/ServiceInformation";
import TechnicianDashboard from "../pages/TechnicianDashboard";
import TechnicianJobDetails from "../pages/TechnicianJobDetails";
import AdminMaintenanceDashboard from "../pages/AdminMaintenanceDashboard";
import MaintenanceCalendar from "../pages/MaintenanceCalendar";

/**
 * AppRoutes – Centralised route definitions for the application.
 */
export default function AppRoutes() {
    return (
        <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />

            {/* Maintenance Public Routes */}
            <Route path="/maintenance" element={<MaintenanceLanding />} />
            <Route path="/maintenance/services" element={<ServiceInformation />} />

            {/* Tenant Maintenance Routes */}
            <Route path="/tenant/maintenance/dashboard" element={<TenantMaintenanceDashboard />} />
            <Route path="/tenant/maintenance/request" element={<MaintenanceRequestForm />} />
            <Route path="/tenant/maintenance/emergency" element={<MaintenanceRequestForm />} />
            <Route path="/tenant/maintenance/track/:requestId" element={<MaintenanceTracking />} />
            <Route path="/tenant/maintenance/history" element={<MaintenanceHistory />} />

            {/* Technician Routes */}
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/technician/job/:jobId" element={<TechnicianJobDetails />} />

            {/* Admin Maintenance Routes */}
            <Route path="/admin/maintenance" element={<AdminMaintenanceDashboard />} />
            <Route path="/admin/maintenance/calendar" element={<MaintenanceCalendar />} />
        </Routes>
    );
}
