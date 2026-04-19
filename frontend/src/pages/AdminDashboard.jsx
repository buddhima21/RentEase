import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminActivityList from "../components/admin/dashboard/AdminActivityList";
import ReviewModeration from "../components/admin/ReviewModeration";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminStatCard from "../components/admin/dashboard/AdminStatCard";
import { getAllPropertiesForAdmin, getSystemAnalytics } from "../services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import PageLoader from "../components/PageLoader";

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

// Mock Data for Global Platform Velocity
const platformVelocityData = [
    { name: "Sep", volume: 130 },
    { name: "Oct", volume: 150 },
    { name: "Nov", volume: 140 },
    { name: "Dec", volume: 160 },
    { name: "Jan", volume: 175 },
    { name: "Feb", volume: 170 },
    { name: "Mar", volume: 190 }
];

export default function AdminDashboard() {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [properties, setProperties] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    // Hydrate admin user from localStorage and fetch properties
    useEffect(() => {
        const checkAuthAndFetch = async () => {
            let isAdmin = false;
            try {
                const token = localStorage.getItem("adminToken");
                const stored = localStorage.getItem("adminUser");
                if (token && stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.role === "ADMIN") {
                        setAdminUser(parsed);
                        isAdmin = true;
                    }
                }
            } catch {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
            }

            if (isAdmin) {
                try {
                    const [propsRes, analyticsRes] = await Promise.all([
                        getAllPropertiesForAdmin(),
                        getSystemAnalytics()
                    ]);
                    if (propsRes.data.success) {
                        setProperties(propsRes.data.data);
                    }
                    if (analyticsRes.data.success) {
                        setAnalytics(analyticsRes.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch admin data:", err);
                }
            }
            setLoading(false);
        };
        checkAuthAndFetch();
    }, []);

    // Show nothing while checking auth
    if (loading) {
        return <PageLoader />;
    }

    // Redirect to admin login if not authenticated
    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans selection:bg-emerald-100" style={{ "--color-primary": "#26C289" }}>
            {/* ── Sidebar ─────────────────────────────────────── */}
            <AdminSidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-30 h-[88px] bg-white/70 backdrop-blur-2xl border-b border-slate-100/80 px-8 flex items-center justify-between gap-4 shrink-0"
                >
                    <h2 className="text-[22px] font-black tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800">
                        System Analytics
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Search */}
                        <div className="relative hidden sm:block w-72">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-full focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 shadow-sm transition-all outline-none"
                                placeholder="Search platform data..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="bg-white border border-slate-100 p-2.5 rounded-full shadow-sm text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors relative">
                            <AdminNotificationsBell />
                        </div>

                        {/* Admin Avatar & Dropdown */}
                        <div className="pl-4 flex">
                            {adminUser && <AdminProfileDropdown adminUser={adminUser} />}
                        </div>
                    </div>
                </motion.header>

                {/* ── Dashboard Content ─────────────────────────── */}
                <motion.div
                    className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent p-6 md:p-8 space-y-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >

                    {/* Header Banner Area */}
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black tracking-widest uppercase">Active Session</span>
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
                                Hi, Admin👋
                            </h1>
                            <p className="text-slate-500 font-medium mt-2 text-[15px]">Central command for RentEase platform safety.</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </div>
                            <Link
                                to="/admin/maintenance"
                                className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(5,150,105,0.2)]"
                            >
                                <span className="material-symbols-outlined text-[18px]">construction</span>
                                Open Maintenance Queue
                            </Link>
                        </div>
                       <div>
                          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              <span className="text-[10px] font-black tracking-widest uppercase">Active Session</span>
                          </div>
                          <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
                              Hi, Admin👋
                          </h1>
                          <p className="text-slate-500 font-medium mt-2 text-[15px]">Central command for RentEase platform safety.</p>
                       </div>
                              <div className="flex flex-col items-end gap-3">
                                  <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700">
                                      <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                      {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                  </div>
                                  <Link
                                        to="/admin/maintenance"
                                        className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-sm"
                                  >
                                        <span className="material-symbols-outlined text-[18px]">construction</span>
                                        Open Maintenance Queue
                                  </Link>
                       </div>
                    </div>

                    {/* Custom Tall KPI Cards & Chart Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left - KPI Cards */}
                        <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">

                            <AdminStatCard
                                title="Flagged Content"
                                value="12"
                                subtitle="Priority Queue"
                                icon="error"
                                colorTheme="red"
                                actionText="Manage Stream"
                                index={0}
                            />

                            <AdminStatCard
                                title="Active Nodes"
                                value={analytics?.totalUsers?.toLocaleString() || '1,420'}
                                subtitle="User Connection"
                                icon="group"
                                colorTheme="emerald"
                                index={1}
                            />

                            <AdminStatCard
                                title="System Uptime"
                                value="99.9%"
                                subtitle="Live Infrastructure"
                                icon="verified_user"
                                colorTheme="primary"
                                actionText="Manage System"
                                index={2}
                            />

                        </div>

                        {/* Right side - Admin Activity List */}
                        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 md:p-8">
                            <AdminActivityList />
                        </motion.div>

                    </div>

                    {/* Global Platform Velocity Chart */}
                    <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100/50">
                                <span className="material-symbols-outlined text-[24px]">dashboard</span>
                            </div>
                            <div>
                                <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Global Platform Velocity</h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">Volume of platform-wide user interactions and safety reports</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={platformVelocityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
                                    <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="volume" stroke="#059669" strokeWidth={4} fillOpacity={1} fill="url(#colorVelocity)" activeDot={{ r: 8, strokeWidth: 0, fill: '#059669' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-8">
                        <ReviewModeration />
                    </motion.div>

                </motion.div>
            </main>
        </div>
    );
}
