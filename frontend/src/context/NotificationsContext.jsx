import { createContext, useContext, useState } from "react";
import { ownerNotifications as ownerInitial } from "../data/ownerDashboardData";
import { adminNotifications as adminInitial } from "../data/adminDashboardData";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const [ownerNotifications, setOwnerNotifications] = useState(ownerInitial);
    const [adminNotifications, setAdminNotifications] = useState(adminInitial);

    const markOwnerNotificationRead = (id) => {
        setOwnerNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    };

    const markAllOwnerNotificationsRead = () => {
        setOwnerNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    const markAdminNotificationRead = (id) => {
        setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    };

    const markAllAdminNotificationsRead = () => {
        setAdminNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    return (
        <NotificationsContext.Provider
            value={{
                ownerNotifications,
                adminNotifications,
                markOwnerNotificationRead,
                markAllOwnerNotificationsRead,
                markAdminNotificationRead,
                markAllAdminNotificationsRead,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return ctx;
}
