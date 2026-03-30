import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { revenueData } from "../../../data/ownerDashboardData";

/**
 * Custom gradient tooltip for the revenue chart
 */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10"
        >
            <p className="text-[11px] text-slate-400 font-medium mb-1">{label}</p>
            <p className="text-lg font-bold">
                LKR {(payload[0].value / 1000).toFixed(0)}K
            </p>
        </motion.div>
    );
}

/**
 * RevenueChart — Modern area chart with gradient fills using Recharts.
 */
export default function RevenueChart() {
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.amount, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6 hover:shadow-xl transition-shadow duration-500"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                            <span className="material-symbols-outlined text-lg">trending_up</span>
                        </div>
                        Monthly Revenue
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 ml-11">Last 6 months performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                        <span className="text-[11px] text-slate-500 font-medium">Revenue</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={revenueData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                            tickFormatter={(v) => `${v / 1000}K`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="url(#strokeGradient)"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                            dot={{ r: 5, fill: "#fff", stroke: "#10b981", strokeWidth: 2.5 }}
                            activeDot={{
                                r: 7,
                                fill: "#10b981",
                                stroke: "#fff",
                                strokeWidth: 3,
                                className: "drop-shadow-lg",
                            }}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-medium">Total Revenue (6 months)</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                        LKR {(totalRevenue / 1000).toFixed(0)}K
                    </p>
                </div>
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100"
                >
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span className="text-xs font-bold">+12.4% vs prior</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
