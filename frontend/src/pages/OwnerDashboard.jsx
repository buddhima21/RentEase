import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import PropertyTable from "../components/dashboard/PropertyTable";
import ActionCard from "../components/dashboard/ActionCard";
import ActivityList from "../components/dashboard/ActivityList";
import RevenueChart from "../components/dashboard/RevenueChart";
import { statsData, pendingActions, ownerProfile } from "../data/ownerDashboardData";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";
import { useEffect } from "react";
import { getOwnerAnalytics } from "../services/api";

/**
 * OwnerDashboard — Full-featured property owner dashboard page.
 * Route: /owner/dashboard
 * Theme: Green (#13ec6d) — overrides global primary for dashboard scope.
 */
export default function OwnerDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState(statsData);
    const { user, logout } = useAuth();

    useEffect(() => {
        getOwnerAnalytics()
            .then(res => {
                const data = res.data.data;
                // Map backend data to the statsData structure used by StatCard
                const updatedStats = [
                    { ...statsData[0], value: `Rs. ${data.totalRevenue.toLocaleString()}` }, // Revenue
                    { ...statsData[1], value: data.activeBookings.toString() }, // Bookings
                    { ...statsData[2], value: data.totalProperties.toString() }, // Properties
                    { ...statsData[3], value: `${data.occupancyRate.toFixed(1)}%` }, // Occupancy
                ];
                setStats(updatedStats);
            })
            .catch(err => console.error("Failed to fetch owner analytics:", err));
    }, []);

    return (
        <div
            className="flex min-h-screen bg-[#f6f8f7]"
            style={{ "--color-primary": "#13ec6d" }}
        >
            {/* ── Sidebar ─────────────────────────────────────── */}
            <Sidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Owner Dashboard
                    </h2>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Search */}
                        <div className="relative hidden sm:block w-52 lg:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border border-emerald-100 rounded-lg focus:ring-2 focus:ring-primary text-sm placeholder-slate-400 transition-all"
                                placeholder="Search properties..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                        </button>

                        {/* Avatar / Dropdown */}
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                            />
                        )}
                    </div>
                </header>

                {/* ── Dashboard Content ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-8">
                    {/* ── KPI Stats Grid ──────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {stats.map((stat, i) => (
                            <StatCard key={i} {...stat} />
                        ))}
                    </div>

                    {/* ── Main Content Grid ───────────────────────── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* LEFT: Properties + Revenue */}
                        <div className="xl:col-span-2 space-y-6">
                            <PropertyTable />
                            <RevenueChart />
                        </div>

                        {/* RIGHT: Pending Actions + Activity */}
                        <div className="space-y-6">
                            {/* Pending Actions */}
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-xl">
                                        assignment_late
                                    </span>
                                    Pending Actions
                                    <span className="ml-auto bg-primary/15 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                        {pendingActions.length}
                                    </span>
                                </h3>
                                <div className="space-y-3">
                                    {pendingActions.map((action) => (
                                        <ActionCard key={action.id} {...action} />
                                    ))}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <ActivityList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
