import { createContext, useContext, useState, useEffect } from "react";
import { addFavorite, removeFavorite } from "../services/api";

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
        // Ensure favoritePropertyIds is an array
        if (!userData.favoritePropertyIds) {
            userData.favoritePropertyIds = [];
        }
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    /** Update user object in memory and local storage */
    const updateUserData = (newData) => {
        const updated = { ...user, ...newData };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
    };

    const toggleFavorite = async (propertyId) => {
        if (!user) return;
        const isFav = user.favoritePropertyIds?.includes(propertyId);
        
        // Optimistic UI update
        const newFavs = isFav 
            ? user.favoritePropertyIds.filter(id => id !== propertyId)
            : [...(user.favoritePropertyIds || []), propertyId];
            
        updateUserData({ favoritePropertyIds: newFavs });

        try {
            if (isFav) {
                await removeFavorite(user.id, propertyId);
            } else {
                await addFavorite(user.id, propertyId);
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            // Revert on failure
            updateUserData({ favoritePropertyIds: user.favoritePropertyIds });
        }
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
        <AuthContext.Provider value={{ user, login, logout, toggleFavorite, updateUserData }}>
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
