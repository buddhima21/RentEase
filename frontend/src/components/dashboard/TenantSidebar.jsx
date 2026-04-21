import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const tenantLinks = [
    { label: "Dashboard", path: "/tenant/dashboard", icon: "dashboard" },
    { label: "My Bills", path: "/tenant/dashboard?tab=bills", icon: "receipt_long" },
    { label: "My Wallet", path: "/tenant/dashboard?tab=wallet", icon: "account_balance_wallet" },
    { label: "Properties", path: "/listings", icon: "search" },
    { label: "Settings", path: "/profile", icon: "settings" },
];

export default function TenantSidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const navContent = (
        <>
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-slate-900 dark:text-white shrink-0">
                    <span className="material-symbols-outlined block text-xl">domain</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight leading-none">RentEase</h1>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Tenant Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                {tenantLinks.map((link) => {
                    const isActive = location.pathname + location.search === link.path;
                    return (
                        <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive
                                    ? "bg-primary/10 text-emerald-700 font-bold"
                                    : "text-slate-600 dark:text-slate-300 font-medium hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-emerald-100 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
                aria-label="Open sidebar"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-slate-900 flex flex-col shrink-0 border-r border-emerald-100
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                    aria-label="Close sidebar"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                {navContent}
            </aside>
        </>
    );
}
