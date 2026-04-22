import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/owner/dashboard/Sidebar";
import StatCard from "../components/owner/dashboard/StatCard";
import PropertyTable from "../components/owner/dashboard/PropertyTable";
import ActionCard from "../components/owner/dashboard/ActionCard";
import ActivityList from "../components/owner/dashboard/ActivityList";
import RevenueChart from "../components/owner/dashboard/RevenueChart";
import OwnerNotificationsBell from "../components/owner/dashboard/OwnerNotificationsBell";
import { statsData, pendingActions, ownerProfile } from "../data/ownerDashboardData";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

/**
 * OwnerDashboard — Modern, professional property owner dashboard.
 * Route: /owner/dashboard
 * Theme: Emerald/Teal with glassmorphism
 */
export default function OwnerDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, logout } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div
            className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20"
            style={{ "--color-primary": "#26C289" }}
        >
            {/* ── Sidebar ─────────────────────────────────────── */}
            <Sidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 font-sans">
                {/* ── Header ────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-30 h-[72px] border-b border-slate-100/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0"
                >
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100">
                        Dashboard
                    </h2>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Search */}
                        <div className="relative hidden sm:block w-64 lg:w-72 group">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-emerald-500 transition-colors duration-200">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:focus:border-emerald-500 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                                placeholder="Search properties..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <OwnerNotificationsBell />
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                        {/* Avatar / Dropdown */}
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-cover bg-center shrink-0 shadow-md ring-2 ring-emerald-100"
                                style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                            />
                        )}
                    </div>
                </motion.header>

                {/* ── Dashboard Content ─────────────────────────── */}
                <motion.div
                    className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >

                    {/* ── KPI Stats Grid ──────────────────────────── */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {statsData.map((stat, i) => (
                            <StatCard key={i} {...stat} index={i} />
                        ))}
                    </motion.div>

                    {/* ── Main Content Grid ───────────────────────── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* LEFT: Properties + Revenue */}
                        <div className="xl:col-span-2 space-y-6">
                            <motion.div variants={itemVariants}>
                                <PropertyTable />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <RevenueChart />
                            </motion.div>
                        </div>

                        {/* RIGHT: Pending Actions + Activity */}
                        <div className="space-y-6">
                            {/* Pending Actions */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-lg dark:shadow-slate-900/20 p-6 hover:shadow-xl transition-shadow duration-500"
                            >
                                <h3 className="font-bold text-lg mb-5 flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
                                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white">
                                        <span className="material-symbols-outlined text-lg">assignment_late</span>
                                    </div>
                                    Pending Actions
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                                        className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"
                                    >
                                        {pendingActions.length}
                                    </motion.span>
                                </h3>
                                <div className="space-y-3">
                                    {pendingActions.map((action, i) => (
                                        <ActionCard key={action.id} {...action} index={i} />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Activity List */}
                            <motion.div variants={itemVariants}>
                                <ActivityList />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
