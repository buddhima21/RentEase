import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Search from "../pages/Search";
import MapView from "../pages/MapView";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OwnerDashboard from "../pages/OwnerDashboard";
import MyProperties from "../pages/MyProperties";
import Listings from "../pages/Listings";
import ListingDetails from "../pages/ListingDetails";
import PropertyDetails from "../pages/PropertyDetails";
import AdminDashboard from "../pages/AdminDashboard";
import OwnerAnalytics from "../pages/OwnerAnalytics";
import OwnerReviews from "../pages/OwnerReviews";

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
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/properties" element={<MyProperties />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/owner/analytics" element={<OwnerAnalytics />} />
            <Route path="/owner/reviews" element={<OwnerReviews />} />
        </Routes>
    );
}
