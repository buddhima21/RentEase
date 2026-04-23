import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Search from "../pages/Search";
import MapView from "../pages/MapView";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OwnerDashboard from "../pages/OwnerDashboard";
import MyProperties from "../pages/MyProperties";
import AddProperty from "../pages/AddProperty";
import Listings from "../pages/Listings";
import ListingDetails from "../pages/ListingDetails";
import Favorites from "../pages/Favorites";
import PropertyDetails from "../pages/PropertyDetails";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminBookings from "../pages/AdminBookings";
import AdminReviews from "../pages/AdminReviews";
import AdminAnalytics from "../pages/AdminAnalytics";
import OwnerAnalytics from "../pages/OwnerAnalytics";
import TenantDashboard from "../pages/TenantDashboard";
import OwnerBookings from "../pages/OwnerBookings";
import Bookings from "../pages/Bookings";
import TenantAgreements from "../pages/TenantAgreements";
import CreateAgreement from "../pages/CreateAgreement";
import AgreementDetail from "../pages/AgreementDetail";
import TenantBills from "../pages/TenantBills";
import TenantWallet from "../pages/TenantWallet";
import OwnerAgreements from "../pages/OwnerAgreements";
import ListingModeration from "../pages/ListingModeration";
import UpdateProperty from "../components/owner/dashboard/UpdateProperty";
import ViewPropertyDetails from "../components/owner/dashboard/ViewPropertyDetails";
import Profile from "../pages/Profile";
import AccountSettings from "../pages/AccountSettings";
import HelpCenter from "../pages/HelpCenter";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
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
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/favorites" element={<Favorites />} />
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
            <Route path="/owner/agreements/:id" element={<AgreementDetail />} />
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

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<ListingModeration />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/reports" element={<AdminAnalytics />} />
                <Route path="/admin/maintenance" element={<AdminMaintenanceDashboard />} />
                <Route path="/admin/maintenance/calendar" element={<MaintenanceCalendar />} />
            </Route>
        </Routes>
    );
}
