import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sidebarLinks, ownerProfile } from "../../../data/ownerDashboardData";
import { useAuth } from "../../../context/AuthContext";

/**
 * Sidebar — Modern glassmorphism sidebar with smooth transitions.
 */
export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const navContent = (
        <>
            {/* ── Brand ───────────────────────────────────────── */}
            <div className="px-6 py-6 border-b border-slate-100/80">
                <Link to="/" className="flex items-center gap-3 group">
                    {/* Brand Logo - Black & Green - Modern & Simple */}
                    <motion.div 
                        className="relative flex items-center justify-center w-11 h-11 bg-emerald-50/50 rounded-xl group-hover:bg-emerald-100 transition-colors shrink-0"
                        whileHover={{ scale: 1.05 }}
                    >
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 10L12 4L20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"/>
                            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" className="text-emerald-500"/>
                            <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500"/>
                        </svg>
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                            Rent<span className="text-emerald-500">Ease</span>
                        </h1>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-1">Owner Portal</p>
                    </div>
                </Link>
            </div>

            {/* ── Nav Links ───────────────────────────────────── */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                {sidebarLinks.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => setOpen(false)}
                            className="block relative group"
                        >
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100/50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                    />
                                )}
                            </AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                                    ${isActive
                                        ? "text-emerald-700 font-bold"
                                        : "text-slate-500 font-medium group-hover:text-emerald-600 group-hover:bg-slate-50/70"
                                    }`}
                            >
                                <motion.span
                                    className={`material-symbols-outlined text-[22px] transition-all ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                                        }`}
                                    whileHover={{ scale: 1.15 }}
                                >
                                    {link.icon}
                                </motion.span>
                                {link.label}
                                {link.badge && (
                                    <span className={`ml-auto text-[10px] leading-none px-2.5 py-1 rounded-full font-bold ${isActive
                                            ? "bg-emerald-200 text-emerald-800"
                                            : "bg-rose-100 text-rose-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                        } transition-colors`}>
                                        {link.badge}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        className="absolute right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full"
                                        layoutId="activeDot"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Add Property CTA ────────────────────────────── */}
            <div className="px-4 pb-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                        to="/owner/add-property"
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add New Property
                    </Link>
                </motion.div>
            </div>


        </>
    );

    return (
        <>
            {/* ── Mobile Hamburger ────────────────────────────── */}
            <motion.button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 text-slate-700 hover:text-emerald-600 transition-colors"
                aria-label="Open sidebar"
                whileTap={{ scale: 0.9 }}
            >
                <span className="material-symbols-outlined">menu</span>
            </motion.button>

            {/* ── Mobile Backdrop ─────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar Panel ───────────────────────────────── */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-[270px] bg-white/95 backdrop-blur-xl flex flex-col shrink-0 
                    border-r border-slate-100/80 shadow-2xl lg:shadow-none
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Mobile close button */}
                <motion.button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    aria-label="Close sidebar"
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="material-symbols-outlined">close</span>
                </motion.button>

                {navContent}
            </aside>
        </>
    );
}
