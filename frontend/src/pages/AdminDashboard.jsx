import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminStatCard from "../components/admin/dashboard/AdminStatCard";
import AdminActivityList from "../components/admin/dashboard/AdminActivityList";
import ReviewModeration from "../components/admin/ReviewModeration";
import { adminStatsData, platformOverview } from "../data/adminDashboardData";

/**
 * AdminDashboard — Full-featured admin dashboard page.
 * Route: /admin/dashboard
 * Auth: Guards using adminToken/adminUser from localStorage (separate from normal user auth).
 * Theme: Green (#1DBC60)
 */
export default function AdminDashboard() {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Hydrate admin user from localStorage
    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                }
            }
        } catch {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
        } finally {
            setLoading(false);
        }
    }, []);

    // Show nothing while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#1DBC60]">progress_activity</span>
            </div>
        );
    }

    // Redirect to admin login if not authenticated
    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div
            className="flex min-h-screen bg-[#f6f8f7]"
            style={{ "--color-primary": "#1DBC60" }}
        >
            {/* ── Sidebar ─────────────────────────────────────── */}
            <AdminSidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Admin Dashboard
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
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border border-emerald-100 rounded-lg focus:ring-2 focus:ring-[#1DBC60] text-sm placeholder-slate-400 transition-all"
                                placeholder="Search platform..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1DBC60] rounded-full" />
                        </button>

                        {/* Admin Avatar */}
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.fullName || "Admin")}&background=1DBC60&color=fff&bold=true&size=40`}
                                alt="Admin"
                                className="w-10 h-10 rounded-full ring-2 ring-[#1DBC60]/30"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{adminUser.fullName || adminUser.email}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Dashboard Content ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-8">

                    {/* ── Welcome Banner ────────────────────────── */}
                    <div className="bg-gradient-to-r from-[#1DBC60] to-emerald-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">
                                Welcome back, {adminUser.fullName || "Admin"}! 👋
                            </h1>
                            <p className="text-emerald-100 text-sm lg:text-base max-w-xl">
                                Here's an overview of the platform activity. You have <span className="font-bold text-white">12 pending reviews</span> and <span className="font-bold text-white">5 new user registrations</span> today.
                            </p>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
                        <div className="absolute -right-4 -bottom-12 w-28 h-28 bg-white/5 rounded-full" />
                    </div>

                    {/* ── KPI Stats Grid ──────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {adminStatsData.map((stat, i) => (
                            <AdminStatCard key={i} {...stat} />
                        ))}
                    </div>

                    {/* ── Quick Overview Cards ────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-lg">calendar_month</span>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
                                <p className="text-lg font-extrabold">{platformOverview.totalBookings}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 p-2 rounded-lg">check_circle</span>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Active Listings</p>
                                <p className="text-lg font-extrabold">{platformOverview.activeListings}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-lg">hotel</span>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Occupancy Rate</p>
                                <p className="text-lg font-extrabold">{platformOverview.occupancyRate}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-600 bg-purple-50 p-2 rounded-lg">star</span>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Avg. Rating</p>
                                <p className="text-lg font-extrabold">{platformOverview.avgRating}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Main Content Grid ───────────────────────── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* LEFT: Review Moderation */}
                        <div className="xl:col-span-2">
                            <ReviewModeration />
                        </div>

                        {/* RIGHT: Activity Feed */}
                        <div className="space-y-6">
                            <AdminActivityList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
