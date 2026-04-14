import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminActivityList from "../components/admin/dashboard/AdminActivityList";
import ReviewModeration from "../components/admin/ReviewModeration";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import { getAllPropertiesForAdmin, getSystemAnalytics } from "../services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        );
    }

    // Redirect to admin login if not authenticated
    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            {/* ── Sidebar ─────────────────────────────────────── */}
            <AdminSidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
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
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 shadow-sm transition-all outline-none"
                                placeholder="Search platform data..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="bg-white border border-slate-100 p-2.5 rounded-full shadow-sm text-slate-400 hover:text-blue-600 cursor-pointer transition-colors relative">
                             <AdminNotificationsBell />
                        </div>

                        {/* Admin Avatar & Dropdown */}
                        <div className="pl-4 flex">
                            {adminUser && <AdminProfileDropdown adminUser={adminUser} />}
                        </div>
                    </div>
                </header>

                {/* ── Dashboard Content ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">

                    {/* Header Banner Area */}
                    <div className="flex justify-between items-end">
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
                           
                           {/* Flagged Content */}
                           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 flex flex-col items-center justify-between flex-1 text-center group hover:bg-red-50/30 transition-colors">
                              <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex flex-col items-center justify-center mb-6 border border-red-100/50">
                                 <span className="material-symbols-outlined text-[28px]">error</span>
                              </div>
                              <div className="mb-8">
                                 <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">Flagged Content</h3>
                                 <div className="text-[48px] font-black text-red-600 leading-none">12</div>
                                 <p className="text-sm font-medium text-slate-500 mt-2">Priority Queue</p>
                              </div>
                              <button className="w-full bg-red-600 text-white font-bold py-3.5 rounded-full hover:bg-red-700 shadow-md shadow-red-600/20 transition-all active:scale-[0.98]">
                                 Manage Stream
                              </button>
                           </div>

                           {/* Active Nodes */}
                           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 flex flex-col items-center justify-between flex-1 text-center group hover:bg-emerald-50/30 transition-colors">
                              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex flex-col items-center justify-center mb-6 border border-emerald-100/50">
                                 <span className="material-symbols-outlined text-[28px]">group</span>
                              </div>
                              <div className="mb-8">
                                 <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">Active Nodes</h3>
                                 <div className="text-[48px] font-black text-emerald-600 leading-none">{analytics?.totalUsers?.toLocaleString() || '1,420'}</div>
                                 <p className="text-sm font-medium text-slate-500 mt-2">User Connection</p>
                              </div>
                              <div className="w-full h-[52px] bg-slate-50 rounded-full border border-slate-100/50 mt-auto"></div>
                           </div>

                           {/* System Uptime */}
                           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 flex flex-col items-center justify-between flex-1 text-center group hover:bg-blue-50/30 transition-colors">
                              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center mb-6 border border-blue-100/50">
                                 <span className="material-symbols-outlined text-[28px]">verified_user</span>
                              </div>
                              <div className="mb-8">
                                 <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">System Uptime</h3>
                                 <div className="text-[48px] font-black text-blue-600 leading-none">99.9%</div>
                                 <p className="text-sm font-medium text-slate-500 mt-2">Live Infrastructure</p>
                              </div>
                              <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]">
                                 Manage System
                              </button>
                           </div>

                       </div>

                       {/* Right side - can be used for extra activity if needed, but in wireframe The charts take up full width below */}
                       <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 md:p-8">
                          <AdminActivityList />
                       </div>

                    </div>

                    {/* Global Platform Velocity Chart */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="bg-[#F3E8FF] text-[#9333EA] p-2 rounded-xl">
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
                                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 600 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
                              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                              />
                              <Area type="monotone" dataKey="volume" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorVelocity)" activeDot={{ r: 8, strokeWidth: 0, fill: '#8B5CF6' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-8">
                        <ReviewModeration />
                    </div>

                </div>
            </main>
        </div>
    );
}
