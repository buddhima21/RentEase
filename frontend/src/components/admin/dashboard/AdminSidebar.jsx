import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { adminSidebarLinks } from "../../../data/adminDashboardData";

/**
 * AdminSidebar — Collapsible sidebar navigation for admin pages.
 * Desktop: fixed left column.  Mobile: slide-over drawer with backdrop.
 * Theme: Green (#26C289) consistent with platform design.
 */
export default function AdminSidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const navContent = (
        <>
            {/* ── Brand ───────────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 bg-emerald-50/50 rounded-xl shrink-0">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 10L12 4L20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"/>
                        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" className="text-emerald-500"/>
                        <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-lg font-extrabold tracking-tight leading-none text-slate-900">
                        Rent<span className="text-[#26C289]">Ease</span>
                    </h1>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Admin Portal</p>
                </div>
            </div>

            {/* ── Nav Links ───────────────────────────────────── */}
            <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                {adminSidebarLinks.map((link) => {
                    const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
                    return (
                        <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive
                                    ? "bg-[#26C289]/10 text-emerald-700 font-bold"
                                    : "text-slate-600 font-medium hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                            {link.label}
                            {link.badge && (
                                <span className="ml-auto bg-[#26C289] text-white text-[10px] leading-none px-2 py-1 rounded-full font-bold">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>


        </>
    );

    return (
        <>
            {/* ── Mobile Hamburger ────────────────────────────── */}
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-emerald-100 text-slate-700 hover:text-emerald-600 transition-colors"
                aria-label="Open sidebar"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>

            {/* ── Mobile Backdrop ─────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* ── Sidebar Panel ───────────────────────────────── */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white flex flex-col shrink-0 border-r border-emerald-100
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* Mobile close button */}
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    aria-label="Close sidebar"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {navContent}
            </aside>
        </>
    );
}
