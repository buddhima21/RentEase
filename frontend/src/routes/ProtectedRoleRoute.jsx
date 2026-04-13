import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoleRoute({ roles = [], fallback = "/login" }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={fallback} replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
}
