import React from "react";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { ownerProfile } from "../data/ownerDashboardData";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

import axios from "axios";

// --- Mock Data (Fallbacks for Demo) ---
const revenueData = [
  { name: "Jan", revenue: 150000 },
  { name: "Feb", revenue: 200000 },
  { name: "Mar", revenue: 180000 },
  { name: "Apr", revenue: 250000 },
  { name: "May", revenue: 230000 },
  { name: "Jun", revenue: 280000 },
  { name: "Jul", revenue: 260000 },
  { name: "Aug", revenue: 320000 },
  { name: "Sep", revenue: 300000 },
  { name: "Oct", revenue: 380000 },
  { name: "Nov", revenue: 350000 },
  { name: "Dec", revenue: 420000 },
];

const weeklyBookings = [
  { day: "Mon", bookings: 4 },
  { day: "Tue", bookings: 7 },
  { day: "Wed", bookings: 5 },
  { day: "Thu", bookings: 8 },
  { day: "Fri", bookings: 12 },
  { day: "Sat", bookings: 15 },
  { day: "Sun", bookings: 9 },
];

// --- Components ---

const KPIStatCard = ({ title, value, icon, trend, iconBg, trendColor }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}>
        <span className="material-symbols-outlined text-[24px] text-slate-700" style={{ fontVariationSettings: "'FILL' 0" }}>
          {icon}
        </span>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-black ${trendColor} bg-opacity-10 border border-current border-opacity-20`}>
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          {trend}
        </div>
      )}
    </div>
    
    <div className="relative z-10">
      <h3 className="text-slate-500 font-bold text-sm mb-1">{title}</h3>
      <div className="text-[28px] font-black text-slate-900 tracking-tight leading-none">
        {value}
      </div>
    </div>
  </motion.div>
);

const ChartContainer = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 ${className}`}>
    <div className="mb-8">
      <h3 className="text-xl font-black text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 font-medium">{subtitle}</p>
    </div>
    <div className="h-[300px] w-full">
      {children}
    </div>
  </div>
);

const MilestoneCard = ({ milestone, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.01 }}
    className="relative group h-full"
  >
    {/* Animated background glow */}
    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
    
    <div className="relative h-full bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors duration-700"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">terminal</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{milestone.status}</span>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{milestone.title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
          {milestone.description}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span>Progress Efficiency</span>
            <span className="text-slate-900">{milestone.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${milestone.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function OwnerAnalytics() {
  const { user, logout } = useAuth();
  
  // States for dynamic data
  const [realStats, setRealStats] = React.useState(null);
  const [period, setPeriod] = React.useState("This Year");
  const [isPeriodOpen, setIsPeriodOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [isExported, setIsExported] = React.useState(false);

  // Fetch real-time analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/analytics/overview");
        if (response.data && response.data.data) {
          setRealStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = () => {
    setExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setExporting(false);
      setIsExported(true);

      // --- Prepare CSV Data ---
      const headers = ["Category", "Metric", "Value", "Trend"];
      const kpis = [
        ["KPIs", "Total Revenue", `Rs. ${realStats?.totalRevenue / 1000 || 2845.9}k`, "+12.5%"],
        ["KPIs", "Active Bookings", `${realStats?.activeBookings || 24}`, "+8.2%"],
        ["KPIs", "Avg. Rating", "4.8", "+0.3"],
        ["KPIs", "Total Properties", `${realStats?.totalProperties || 12}`, "N/A"],
      ];

      const revenueHeader = ["", "Month", "Revenue (LKR)"];
      const revenueRows = revenueData.map(d => ["Revenue", d.name, d.revenue]);

      const bookingsHeader = ["", "Day", "Bookings Count"];
      const bookingsRows = weeklyBookings.map(d => ["Weekly Bookings", d.day, d.bookings]);

      // Combine into a single CSV string
      const csvRows = [
        ["RENT-EASE SYSTEM ANALYTICS REPORT"],
        ["Generated on: " + new Date().toLocaleString()],
        [],
        headers,
        ...kpis,
        [],
        revenueHeader,
        ...revenueRows,
        [],
        bookingsHeader,
        ...bookingsRows
      ];

      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      
      // Generate download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `RentEase_Analytics_Report_${period.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clear success message after 3 seconds
      setTimeout(() => setIsExported(false), 3000);
    }, 2000);
  };

  // Dynamic Occupancy Calculation
  const occupancyPercentage = realStats?.totalProperties > 0 
    ? Math.round((realStats.rentedProperties / realStats.totalProperties) * 100) 
    : 72; // Fallback for empty DB

  const occupancyData = [
    { name: "Occupied", value: occupancyPercentage, color: "#10b981" },
    { name: "Vacant", value: 100 - occupancyPercentage, color: "#1E293B" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBFDFF] relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {isExported && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/20 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div>
              <p className="font-black text-sm">Report Exported!</p>
              <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest">Ready for download</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[88px] border-b border-slate-100/80 bg-white/70 backdrop-blur-3xl px-8 lg:px-12 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">System <span className="text-emerald-500">Analytics</span></h2>
            <p className="text-sm text-slate-400 font-bold">Monitor your platform's performance and growth.</p>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Period Selector */}
            <div className="relative">
              <div 
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                className={`bg-white border ${isPeriodOpen ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'} px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm font-black text-slate-700 shadow-sm cursor-pointer hover:border-slate-300 transition-all active:scale-95`}
              >
                <span className={`material-symbols-outlined ${isPeriodOpen ? 'text-emerald-500' : 'text-slate-400'}`}>calendar_today</span>
                {period}
                <motion.span 
                  animate={{ rotate: isPeriodOpen ? 180 : 0 }}
                  className="material-symbols-outlined text-slate-400 text-[20px]"
                >
                  expand_more
                </motion.span>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isPeriodOpen && (
                  <>
                    {/* Overlay to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsPeriodOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                    >
                      {["This Month", "Last 6 Months", "This Year"].map((opt) => (
                        <div
                          key={opt}
                          onClick={() => { setPeriod(opt); setIsPeriodOpen(false); }}
                          className={`px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between group ${
                            period === opt ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {opt}
                          {period === opt && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              disabled={exporting}
              className={`min-w-[160px] bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:grayscale disabled:cursor-wait`}
            >
              {exporting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">file_export</span>
                  Export Report
                </>
              )}
            </button>

            <div className="h-8 w-px bg-slate-200" />
            {user && <UserDropdown user={user} onLogout={logout} />}
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {/* KPI Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KPIStatCard 
              title="Total Revenue" 
              value={realStats ? `Rs. ${realStats.totalRevenue / 1000}k` : "Rs. 2845.9k"} 
              icon="payments" 
              trend="+12.5%" 
              iconBg="bg-emerald-50"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <KPIStatCard 
              title="Active Bookings" 
              value={realStats ? realStats.activeBookings : "24"} 
              icon="calendar_month" 
              trend="+8.2%" 
              iconBg="bg-teal-50"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <KPIStatCard 
              title="Avg. Rating" 
              value="4.8" 
              icon="star" 
              trend="+0.3" 
              iconBg="bg-emerald-50"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <KPIStatCard 
              title="Total Properties" 
              value={realStats ? realStats.totalProperties : "12"} 
              icon="apartment" 
              iconBg="bg-slate-50"
            />
          </div>

          {/* Main Visuals Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Revenue Overview */}
            <ChartContainer 
              title="Revenue Overview" 
              subtitle="Monthly revenue for current active properties" 
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }}
                    tickFormatter={(val) => `Rs.${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Property Status */}
            <ChartContainer 
              title="Property Status" 
              subtitle="Current occupancy rates"
            >
              <div className="relative h-full w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[36px] font-black text-slate-900 leading-none">{occupancyPercentage}%</span>
                  <span className="text-sm font-bold text-slate-400">Occupied</span>
                </div>
              </div>
            </ChartContainer>
          </div>

          {/* Lower Grid: Weekly Bookings & Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Weekly Bookings */}
            <ChartContainer title="Weekly Bookings" subtitle="Bookings activity this week">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: "#F8FAFC", radius: 8 }}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 700 }}
                  />
                  <Bar dataKey="bookings" fill="#1E293B" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* System Alerts */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">System <span className="text-emerald-500">Alerts</span></h3>
                <span className="material-symbols-outlined text-slate-300">notifications</span>
              </div>
              
              <div className="space-y-4 flex-1">
                {/* Maintenance Alert */}
                <div className="flex gap-4 p-5 rounded-3xl bg-amber-50 border border-amber-100 items-start group hover:scale-[1.01] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">build</span>
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 text-[15px] mb-1">Maintenance Required</h4>
                    <p className="text-sm text-amber-700 font-medium leading-normal">
                      {realStats?.pendingMaintenanceRequests || 0} properties have pending maintenance requests that require immediate attention.
                    </p>
                  </div>
                </div>

                {/* High Engagement Alert */}
                <div className="flex gap-4 p-5 rounded-3xl bg-emerald-50 border border-emerald-100 items-start group hover:scale-[1.01] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">auto_graph</span>
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 text-[15px] mb-1">High Engagement</h4>
                    <p className="text-sm text-emerald-700 font-medium leading-normal">
                      Active bookings ({realStats?.activeBookings || 24}) are up {realStats ? "calculated" : "12%"} this week compared to last week.
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-8 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                View All Alerts
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
