import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
    // Check for admin token in localStorage
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    const hasValue = (value) => Boolean(value && value !== "undefined" && value !== "null" && value.trim() !== "");

    // Stronger check: ensure valid strings and not "undefined"/"null"
    const isValid = hasValue(adminToken) && hasValue(adminUser);

    if (!isValid) {
        // Redirect to admin login if not authenticated
        return <Navigate to="/admin/login" replace />;
    }

    // Optional: Check if role is actually ADMIN in the stored JSON
    try {
        const userObj = JSON.parse(adminUser);
        if (userObj.role !== "ADMIN") {
            return <Navigate to="/admin/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/admin/login" replace />;
    }

    // If authenticated, render the child routes
    return <Outlet />;
};

export default ProtectedAdminRoute;
