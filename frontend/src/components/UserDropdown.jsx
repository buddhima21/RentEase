import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * UserDropdown – Authenticated user profile area with a professional dropdown menu.
 * Features an Airbnb-style trigger pill and a realistic account menu.
 *
 * @param {{ user: { fullName: string, email?: string, role: string, avatar?: string }, onLogout: () => void }} props
 */
export default function UserDropdown({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape key
    useEffect(() => {
        function handleEscape(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    /** Build avatar initials from fullName (e.g. "John Doe" → "JD") */
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const dashboardPath =
        user.role === "ADMIN" 
            ? "/admin/dashboard" 
            : user.role === "OWNER" 
                ? "/owner/dashboard" 
                : "/tenant/dashboard";

    const handleLogout = () => {
        setOpen(false);
        onLogout();
        navigate("/");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ─── Trigger Button ─── */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1.5 pl-3 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none"
                aria-haspopup="true"
                aria-expanded={open}
                id="user-menu-button"
            >
                {/* Menu Icon */}
                <span className="material-symbols-outlined text-slate-500 text-[20px] font-medium leading-none">
                    menu
                </span>

                {/* Avatar */}
                {(user.profileImageUrl || user.avatar) ? (
                    <img
                        src={user.profileImageUrl || user.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none shrink-0">
                        {getInitials(user.fullName)}
                    </div>
                )}
            </button>

            {/* ─── Dropdown Menu ─── */}
            <div
                className={`absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden transition-all duration-200 origin-top-right ${
                    open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
                role="menu"
                aria-labelledby="user-menu-button"
            >
                {/* User Info Header */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
                    {(user.profileImageUrl || user.avatar) ? (
                        <img
                            src={user.profileImageUrl || user.avatar}
                            alt="Profile"
                            className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                            {getInitials(user.fullName)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {user.fullName}
                        </p>
                        {user.email && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                {user.email}
                            </p>
                        )}
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 text-slate-600 bg-slate-50">
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <Link
                        to={dashboardPath}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                        role="menuitem"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">
                            dashboard
                        </span>
                        Dashboard
                    </Link>

                    {user.role === "TENANT" && (
                        <Link
                            to="/tenant/agreements"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-4 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                            role="menuitem"
                        >
                            <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">
                                description
                            </span>
                            My Agreements
                        </Link>
                    )}

                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                        role="menuitem"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">
                            person
                        </span>
                        My Profile
                    </Link>

                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                        role="menuitem"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">
                            settings
                        </span>
                        Account Settings
                    </Link>
                    
                    <Link
                        to="#"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                        role="menuitem"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">
                            help
                        </span>
                        Help Center
                    </Link>
                </div>

                {/* Separator + Logout */}
                <div className="border-t border-slate-100 py-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        role="menuitem"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            logout
                        </span>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

