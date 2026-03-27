import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../../context/NotificationsContext";

export default function AdminNotificationsBell() {
    const [open, setOpen] = useState(false);
    const {
        adminNotifications,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
    } = useNotifications();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const unreadCount = adminNotifications.filter((n) => n.unread).length;

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-label="Open notifications"
            >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 z-40">
                    <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Admin notifications</p>
                            <p className="text-[11px] text-slate-400">
                                {unreadCount > 0 ? `${unreadCount} new items require attention` : "No critical alerts right now"}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAdminNotificationsRead}
                                className="text-[11px] font-semibold text-primary hover:text-emerald-700"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {adminNotifications.length > 0 ? (
                            adminNotifications.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => markAdminNotificationRead(item.id)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors ${
                                        item.unread ? "bg-amber-50/40" : ""
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
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {item.title}
                                            </p>
                                            {item.unread && (
                                                <span className="ml-auto inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
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

                    <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                        See detailed logs in the activity panel on the right
                    </div>
                </div>
            )}
        </div>
    );
}
