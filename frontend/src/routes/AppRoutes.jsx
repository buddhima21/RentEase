import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Search from "../pages/Search";
import MapView from "../pages/MapView";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OwnerDashboard from "../pages/OwnerDashboard";

/**
 * AppRoutes – Centralised route definitions for the application.
 */
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Routes>
    );
}
