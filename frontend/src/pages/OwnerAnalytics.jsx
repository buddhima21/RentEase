import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { 
  Building2, Users, CalendarCheck, DollarSign, 
  TrendingUp, Activity, Wrench, ArrowUpRight
} from "lucide-react";

// Mock Data
const stats = {
  totalProperties: 120,
  availableProperties: 35,
  rentedProperties: 85,
  totalUsers: 420,
  totalBookings: 310,
  activeBookings: 60,
  pendingMaintenanceRequests: 7,
  totalRevenue: 1250000,
  revenueGrowth: "+14.5%",
};

const revenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 75000 },
  { name: "Jun", revenue: 82000 },
  { name: "Jul", revenue: 79000 },
  { name: "Aug", revenue: 95000 },
  { name: "Sep", revenue: 105000 },
  { name: "Oct", revenue: 110000 },
  { name: "Nov", revenue: 115000 },
  { name: "Dec", revenue: 125000 },
];

const propertyStatusData = [
  { name: "Rented", value: 85, color: "#ec5b13" },
  { name: "Available", value: 35, color: "#1e293b" },
];

const bookingTrendsData = [
  { name: "Mon", bookings: 12 },
  { name: "Tue", bookings: 19 },
  { name: "Wed", bookings: 15 },
  { name: "Thu", bookings: 22 },
  { name: "Fri", bookings: 28 },
  { name: "Sat", bookings: 35 },
  { name: "Sun", bookings: 30 },
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(236,91,19,0.1)] transition-all duration-300"
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#ec5b13]/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#ec5b13] border border-slate-100 z-10 relative">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      {trend && (
        <span className="flex items-center text-sm font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full z-10 relative">
          <TrendingUp size={14} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div className="z-10 relative">
      <h3 className="text-slate-500 font-medium mb-1">{title}</h3>
      <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default function OwnerAnalytics() {
  return (
    <div className="bg-[#f8f6f6] min-h-screen flex flex-col font-display selection:bg-[#ec5b13]/20">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              System <span className="text-[#ec5b13]">Analytics</span>
            </h1>
            <p className="text-slate-500 text-lg">Monitor your platform's performance and growth.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <CalendarCheck size={18} />
              This Year
            </button>
            <button className="bg-[#ec5b13] text-white px-5 py-2 rounded-xl font-bold shadow-md shadow-[#ec5b13]/20 hover:bg-[#d44c0e] hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <ArrowUpRight size={18} />
              Export Report
            </button>
          </div>
        </motion.div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value={`Rs. ${(stats.totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} trend={stats.revenueGrowth} delay={0.1} />
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} trend="+8.2%" delay={0.2} />
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="+12.4%" delay={0.3} />
          <StatCard title="Total Properties" value={stats.totalProperties} icon={Building2} delay={0.4} />
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Revenue Area Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Revenue Overview</h3>
                <p className="text-sm text-slate-500">Monthly revenue for the current year</p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec5b13" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec5b13" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `Rs.${val/1000}k`} />
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ec5b13" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8, strokeWidth: 0, fill: '#ec5b13' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Property Status Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 flex flex-col"
          >
            <div className="mb-2">
              <h3 className="text-xl font-bold text-slate-800">Property Status</h3>
              <p className="text-sm text-slate-500">Current occupancy rates</p>
            </div>
            <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{Math.round((stats.rentedProperties/stats.totalProperties)*100)}%</span>
                <span className="text-sm font-medium text-slate-500">Occupied</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              {propertyStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Weekly Bookings Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Weekly Bookings</h3>
                <p className="text-sm text-slate-500">Bookings activity this week</p>
              </div>
              <Activity className="text-slate-400" size={24} />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingTrendsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="bookings" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Actionable Insights / Alerts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 flex flex-col"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">System Alerts</h3>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-xl mt-1">
                  <Wrench size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Maintenance Required</h4>
                  <p className="text-amber-700 text-sm mt-1">{stats.pendingMaintenanceRequests} properties have pending maintenance requests that require immediate attention.</p>
                </div>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl mt-1">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">High Engagement</h4>
                  <p className="text-emerald-700 text-sm mt-1">Active bookings ({stats.activeBookings}) are up 12% this week compared to last week.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

