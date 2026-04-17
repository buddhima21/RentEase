import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoleRoute({ roles = [], fallback = "/login" }) {
    const { user } = useAuth();

    let effectiveUser = user;
    if (!effectiveUser) {
        try {
            const stored = localStorage.getItem("user");
            effectiveUser = stored ? JSON.parse(stored) : null;
        } catch {
            effectiveUser = null;
        }
    }

    if (!effectiveUser) {
        return <Navigate to={fallback} replace />;
    }

    if (roles.length > 0 && !roles.includes(effectiveUser.role)) {
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
}
