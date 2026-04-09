import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminProfileDropdown({ adminUser }) {
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

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        // Also clear normal user tokens to be safe/clean
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin/login");
    };

    if (!adminUser) return null;

    // Generate avatar URL based on name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.fullName || "Admin")}&background=10B981&color=fff&bold=true`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 outline-none focus:ring-2 focus:ring-[#26C289]/20"
            >
                <img
                    src={avatarUrl}
                    alt={adminUser.fullName}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                    {adminUser.fullName}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-sm hidden md:block">
                    expand_more
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{adminUser.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            to="/admin/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <span className="material-symbols-outlined text-[20px] text-slate-400">person</span>
                            My Profile
                        </Link>
                        <Link
                            to="/admin/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
                            Settings
                        </Link>
                    </div>

                    <div className="py-1 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
