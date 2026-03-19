import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sidebarLinks, ownerProfile } from "../../data/ownerDashboardData";

/**
 * Sidebar — Collapsible sidebar navigation for owner pages.
 * Desktop: fixed left column.  Mobile: slide-over drawer with backdrop.
 * Theme: Green (emerald) consistent with dashboard design.
 */
export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const navContent = (
        <>
            {/* ── Brand ───────────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-slate-900 shrink-0">
                    <span className="material-symbols-outlined block text-xl">domain</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight leading-none">RentEase</h1>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Owner Portal</p>
                </div>
            </div>

            {/* ── Nav Links ───────────────────────────────────── */}
            <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                {sidebarLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive
                                    ? "bg-primary/10 text-emerald-700 font-bold"
                                    : "text-slate-600 font-medium hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                            {link.label}
                            {link.badge && (
                                <span className="ml-auto bg-primary text-slate-900 text-[10px] leading-none px-2 py-1 rounded-full font-bold">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Add Property CTA ────────────────────────────── */}
            <div className="px-4 pb-4">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-slate-900 rounded-lg font-bold text-sm hover:brightness-105 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add New Property
                </button>
            </div>

            {/* ── Profile Footer ──────────────────────────────── */}
            <div className="p-4 border-t border-emerald-100">
                <div className="flex items-center gap-3 px-2">
                    <img
                        src={ownerProfile.avatar}
                        alt={ownerProfile.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{ownerProfile.name}</p>
                        <p className="text-xs text-slate-500">{ownerProfile.role}</p>
                    </div>
                    <button className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
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
