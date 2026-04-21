import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../../context/NotificationsContext";

export default function OwnerNotificationsBell({ showLabel }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const {
        ownerNotifications,
        markOwnerNotificationRead,
        markAllOwnerNotificationsRead,
    } = useNotifications();

    const containerRef = useRef(null);

    useEffect(() => {
        if (!showDropdown) return;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const unreadCount = ownerNotifications.filter((n) => n.unread).length;

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="relative flex items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-label="Open notifications"
            >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showLabel && (
                <span className="hidden md:inline text-xs font-medium text-slate-500 dark:text-slate-400 ml-2">Notifications</span>
            )}

            {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-900/5 z-40">
                    <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                            <p className="text-[11px] text-slate-400">
                                {unreadCount > 0 ? `${unreadCount} new updates` : "You're all caught up"}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllOwnerNotificationsRead}
                                className="text-[11px] font-semibold text-primary hover:text-emerald-700"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {ownerNotifications.length > 0 ? (
                            ownerNotifications.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => markOwnerNotificationRead(item.id)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-slate-50 dark:bg-slate-800/50 transition-colors ${
                                        item.unread ? "bg-emerald-50/40" : ""
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center ${item.iconBg}`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-[18px] ${item.iconColor}`}
                                        >
                                            {item.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            {item.unread && (
                                                <span className="ml-auto inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                            <span>{item.time}</span>
                                            {item.typeLabel && (
                                                <span
                                                    className={`ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${item.typeBg} ${item.typeText}`}
                                                >
                                                    {item.typeLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-slate-400">
                                No notifications yet.
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                        View detailed history in the activity panel on the right
                    </div>
                </div>
            )}
        </div>
    );
}
