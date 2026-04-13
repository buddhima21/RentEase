import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { milestonesData } from "../data/ownerDashboardData";

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

export default function OwnerMilestones() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBFDFF]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[88px] border-b border-slate-100/80 bg-white/70 backdrop-blur-3xl px-8 lg:px-12 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">System <span className="text-[#F97316]">Milestones</span></h2>
            <p className="text-sm text-slate-400 font-bold italic">2026 Core Platform Achievements</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-[#F97316]">verified_user</span>
              <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Industry Standard Compliance</span>
            </div>
            {user && <UserDropdown user={user} onLogout={logout} />}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
          
          {/* Animated Tab Switcher */}
          <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-2">
            {milestonesData.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-3 text-sm font-black transition-all relative ${
                  activeTab === idx ? "text-[#F97316]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {category.category}
                {activeTab === idx && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#F97316] rounded-t-full shadow-[0_-4px_10px_rgba(249,115,22,0.4)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            <AnimatePresence mode="wait">
              {milestonesData && milestonesData.length > 0 && milestonesData[activeTab]?.items.map((milestone, idx) => (
                <MilestoneCard key={milestone.id} milestone={milestone} index={idx} />
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Summary Plate */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] rounded-[3rem] p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center lg:text-left">
                <h3 className="text-3xl font-black mb-4">The <span className="text-orange-400">2026</span> Vision</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Every milestone listed here represents a core layer of the RentEase infrastructure. 
                  By combining high-performance API design with reactive frontend architectures, we deliver a 
                  platform experience that exceeds current global IT standards.
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">100%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uptime Design</div>
                </div>
                <div className="w-px h-12 bg-slate-700/50"></div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-400">95%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Code Coverage</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
