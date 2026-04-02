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
import PropertyDetails from "../pages/PropertyDetails";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import OwnerAnalytics from "../pages/OwnerAnalytics";
import TenantDashboard from "../pages/TenantDashboard";
import OwnerBookings from "../pages/OwnerBookings";
import Bookings from "../pages/Bookings";
import ListingModeration from "../pages/ListingModeration";
import UpdateProperty from "../components/owner/dashboard/UpdateProperty";
import ViewPropertyDetails from "../components/owner/dashboard/ViewPropertyDetails";
import Profile from "../pages/Profile";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

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

            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/properties" element={<MyProperties />} />
            <Route path="/owner/add-property" element={<AddProperty />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/owner/properties/:id" element={<ViewPropertyDetails />} />
            <Route path="/edit-property/:id" element={<UpdateProperty />} />
            <Route path="/owner/properties/:id/edit" element={<UpdateProperty />} />
            <Route path="/owner/analytics" element={<OwnerAnalytics />} />

            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/bookings" element={<Bookings />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<ListingModeration />} />
            </Route>
        </Routes>
    );
}
