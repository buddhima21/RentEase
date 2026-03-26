"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Star, Users, TrendingUp } from 'lucide-react';

const revenueData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
  { name: 'Jul', revenue: 72000 },
  { name: 'Aug', revenue: 69000 },
  { name: 'Sep', revenue: 84000 },
  { name: 'Oct', revenue: 91000 },
  { name: 'Nov', revenue: 88000 },
  { name: 'Dec', revenue: 105000 },
];

const ratingDistribution = [
  { name: '5 Stars', count: 1450 },
  { name: '4 Stars', count: 820 },
  { name: '3 Stars', count: 140 },
  { name: '2 Stars', count: 45 },
  { name: '1 Star', count: 12 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

const StatCard = ({ title, value, icon: Icon, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: 'spring' }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl shadow-blue-500/10 group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
        <Icon size={24} />
      </div>
    </div>
    <div className="relative z-10 mt-4 flex items-center text-sm">
      <TrendingUp size={16} className="text-emerald-400 mr-1" />
      <span className="text-emerald-400 font-medium">{trend}</span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </motion.div>
);

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 font-sans text-slate-100 selection:bg-blue-500/30">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              System Analytics
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Real-time insights and performance metrics.</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Rent Collected" value="Rs. 2,845,900" icon={DollarSign} trend="+18.2%" delay={0.1} />
          <StatCard title="Average Rating" value="4.85/5.0" icon={Star} trend="+0.15" delay={0.2} />
          <StatCard title="Active Tenants" value="1,248" icon={Users} trend="+8.4%" delay={0.3} />
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          {/* Revenue Trends Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/20 transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
              <div className="w-2 h-6 md:h-8 rounded-full bg-blue-500 mr-3 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              Revenue Trends
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0f172a' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#60a5fa', shadow: '0 0 10px #60a5fa' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Rating Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/20 transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
              <div className="w-2 h-6 md:h-8 rounded-full bg-emerald-500 mr-3 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              Rating Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
