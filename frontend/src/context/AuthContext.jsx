import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

/**
 * AuthProvider – Wraps the app and provides auth state + helpers.
 * Hydrates from localStorage on mount so the user stays logged in across refreshes.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Hydrate once on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) setUser(JSON.parse(stored));
        } catch {
            localStorage.removeItem("user");
        }
    }, []);

    /** Persist user to localStorage and update state */
    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    /** Clear everything and reset state */
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth – Convenience hook to consume auth context.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
