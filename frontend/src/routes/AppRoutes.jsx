import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedRoleRoute from "./ProtectedRoleRoute";
import PageLoader from "../components/PageLoader";

// Lazy-loaded Pages
const Home = React.lazy(() => import("../pages/Home"));
const Search = React.lazy(() => import("../pages/Search"));
const MapView = React.lazy(() => import("../pages/MapView"));
const Login = React.lazy(() => import("../pages/Login"));
const Signup = React.lazy(() => import("../pages/Signup"));
const Profile = React.lazy(() => import("../pages/Profile"));
const Listings = React.lazy(() => import("../pages/Listings"));
const ListingDetails = React.lazy(() => import("../pages/ListingDetails"));
const PropertyDetails = React.lazy(() => import("../pages/PropertyDetails"));

// Owner Pages
const OwnerDashboard = React.lazy(() => import("../pages/OwnerDashboard"));
const OwnerFinance = React.lazy(() => import("../pages/OwnerFinance"));
const MyProperties = React.lazy(() => import("../pages/MyProperties"));
const AddProperty = React.lazy(() => import("../pages/AddProperty"));
const OwnerBookings = React.lazy(() => import("../pages/OwnerBookings"));
const OwnerAnalytics = React.lazy(() => import("../pages/OwnerAnalytics"));
const OwnerAgreements = React.lazy(() => import("../pages/OwnerAgreements"));
const OwnerReviews = React.lazy(() => import("../pages/OwnerReviews"));
const OwnerMilestones = React.lazy(() => import("../pages/OwnerMilestones"));
const OwnerMaintenanceOverview = React.lazy(() => import("../pages/OwnerMaintenanceOverview"));
const UpdateProperty = React.lazy(() => import("../components/owner/dashboard/UpdateProperty"));
const ViewPropertyDetails = React.lazy(() => import("../components/owner/dashboard/ViewPropertyDetails"));

// Tenant Pages
const TenantDashboard = React.lazy(() => import("../pages/TenantDashboard"));
const RentPayment = React.lazy(() => import("../pages/RentPaymentTracking/RentPayment"));
const Bookings = React.lazy(() => import("../pages/Bookings"));
const TenantAgreements = React.lazy(() => import("../pages/TenantAgreements"));
const CreateAgreement = React.lazy(() => import("../pages/CreateAgreement"));
const AgreementDetail = React.lazy(() => import("../pages/AgreementDetail"));
const MaintenanceRequestForm = React.lazy(() => import("../pages/MaintenanceRequestForm"));
const TenantMaintenanceDashboard = React.lazy(() => import("../pages/TenantMaintenanceDashboard"));
const MaintenanceTracking = React.lazy(() => import("../pages/MaintenanceTracking"));
const MaintenanceHistory = React.lazy(() => import("../pages/MaintenanceHistory"));

// Maintenance / Technician
const MaintenanceLanding = React.lazy(() => import("../pages/MaintenanceLanding"));
const ServiceInformation = React.lazy(() => import("../pages/ServiceInformation"));
const TechnicianLogin = React.lazy(() => import("../pages/TechnicianLogin"));
const TechnicianDashboard = React.lazy(() => import("../pages/TechnicianDashboard"));
const TechnicianJobDetails = React.lazy(() => import("../pages/TechnicianJobDetails"));

// Admin Pages
const AdminLogin = React.lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("../pages/AdminDashboard"));
const ListingModeration = React.lazy(() => import("../pages/ListingModeration"));
const AdminMaintenanceDashboard = React.lazy(() => import("../pages/AdminMaintenanceDashboard"));
const MaintenanceCalendar = React.lazy(() => import("../pages/MaintenanceCalendar"));

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetails />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/maintenance" element={<MaintenanceLanding />} />
                <Route path="/maintenance/services" element={<ServiceInformation />} />
                <Route path="/technician/login" element={<TechnicianLogin />} />
import OwnerFinance from "../pages/OwnerFinance";
import RentPayment from "../pages/RentPaymentTracking/RentPayment";
import OwnerReviews from "../pages/OwnerReviews";
import OwnerMilestones from "../pages/OwnerMilestones";
import ProtectedRoleRoute from "./ProtectedRoleRoute";
import MaintenanceLanding from "../pages/MaintenanceLanding";
import ServiceInformation from "../pages/ServiceInformation";
import MaintenanceRequestForm from "../pages/MaintenanceRequestForm";
import TenantMaintenanceDashboard from "../pages/TenantMaintenanceDashboard";
import MaintenanceTracking from "../pages/MaintenanceTracking";
import MaintenanceHistory from "../pages/MaintenanceHistory";
import AdminMaintenanceDashboard from "../pages/AdminMaintenanceDashboard";
import MaintenanceCalendar from "../pages/MaintenanceCalendar";
import TechnicianDashboard from "../pages/TechnicianDashboard";
import TechnicianJobDetails from "../pages/TechnicianJobDetails";
import TechnicianLogin from "../pages/TechnicianLogin";
import OwnerMaintenanceOverview from "../pages/OwnerMaintenanceOverview";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/maintenance" element={<MaintenanceLanding />} />
            <Route path="/maintenance/services" element={<ServiceInformation />} />
            <Route path="/technician/login" element={<TechnicianLogin />} />

                {/* Owner Routes */}
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/finance" element={<OwnerFinance />} />
                <Route path="/owner/properties" element={<MyProperties />} />
                <Route path="/owner/add-property" element={<AddProperty />} />
                <Route path="/owner/bookings" element={<OwnerBookings />} />
                <Route path="/owner/properties/:id" element={<ViewPropertyDetails />} />
                <Route path="/edit-property/:id" element={<UpdateProperty />} />
                <Route path="/owner/properties/:id/edit" element={<UpdateProperty />} />
                <Route path="/owner/analytics" element={<OwnerAnalytics />} />
                <Route path="/owner/agreements" element={<OwnerAgreements />} />
                <Route path="/owner/reviews" element={<OwnerReviews />} />
                <Route path="/owner/milestones" element={<OwnerMilestones />} />

            <Route element={<ProtectedRoleRoute roles={["OWNER"]} fallback="/login" />}>
                <Route path="/owner/maintenance" element={<OwnerMaintenanceOverview />} />
            </Route>

            {/* Tenant Routes */}
            <Route element={<ProtectedRoleRoute roles={["TENANT"]} fallback="/login" />}>
                <Route path="/tenant/dashboard" element={<TenantDashboard />} />
                <Route path="/tenant/payment" element={<RentPayment />} />
                <Route path="/tenant/bookings" element={<Bookings />} />
                <Route path="/tenant/agreements" element={<TenantAgreements />} />
                <Route path="/tenant/agreements/new" element={<CreateAgreement />} />
                <Route path="/tenant/agreements/:id" element={<AgreementDetail />} />
                <Route path="/tenant/maintenance/request" element={<MaintenanceRequestForm />} />
                <Route path="/tenant/maintenance/emergency" element={<MaintenanceRequestForm />} />
                <Route path="/tenant/maintenance/dashboard" element={<TenantMaintenanceDashboard />} />
                <Route path="/tenant/maintenance/track/:requestId" element={<MaintenanceTracking />} />
                <Route path="/tenant/maintenance/history" element={<MaintenanceHistory />} />
            </Route>

            <Route element={<ProtectedRoleRoute roles={["TECHNICIAN"]} fallback="/maintenance" />}>
                <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                <Route path="/technician/job/:jobId" element={<TechnicianJobDetails />} />
            </Route>

                {/* Tenant Routes */}
                <Route element={<ProtectedRoleRoute roles={["TENANT"]} fallback="/login" />}>
                    <Route path="/tenant/dashboard" element={<TenantDashboard />} />
                    <Route path="/tenant/payment" element={<RentPayment />} />
                    <Route path="/tenant/bookings" element={<Bookings />} />
                    <Route path="/tenant/agreements" element={<TenantAgreements />} />
                    <Route path="/tenant/agreements/new" element={<CreateAgreement />} />
                    <Route path="/tenant/agreements/:id" element={<AgreementDetail />} />
                    <Route path="/tenant/maintenance/request" element={<MaintenanceRequestForm />} />
                    <Route path="/tenant/maintenance/emergency" element={<MaintenanceRequestForm />} />
                    <Route path="/tenant/maintenance/dashboard" element={<TenantMaintenanceDashboard />} />
                    <Route path="/tenant/maintenance/track/:requestId" element={<MaintenanceTracking />} />
                    <Route path="/tenant/maintenance/history" element={<MaintenanceHistory />} />
                </Route>

            <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<ListingModeration />} />
                <Route path="/admin/maintenance" element={<AdminMaintenanceDashboard />} />
                <Route path="/admin/maintenance/calendar" element={<MaintenanceCalendar />} />
            </Route>
        </Routes>
    );
}
