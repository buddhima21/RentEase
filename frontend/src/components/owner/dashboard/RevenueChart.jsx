import { useState } from "react";
import { revenueData, revenueMax } from "../../../data/ownerDashboardData";

/**
 * RevenueChart — Pure Tailwind bar chart with hover tooltips and proportional scaling.
 */
export default function RevenueChart() {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const lastIndex = revenueData.length - 1;

    // Y-axis labels (evenly spaced)
    const yLabels = ["500K", "400K", "300K", "200K", "100K", "0"];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Monthly Revenue</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Last 6 months performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-primary/20" />
                        <span className="text-[11px] text-slate-500">Previous</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-primary" />
                        <span className="text-[11px] text-slate-500">Current</span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex gap-2">
                {/* Y-axis Labels */}
                <div className="flex flex-col justify-between h-52 py-1 pr-2 shrink-0">
                    {yLabels.map((label) => (
                        <span key={label} className="text-[10px] text-slate-400 font-medium text-right w-8">
                            {label}
                        </span>
                    ))}
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end justify-between gap-2 sm:gap-3 h-52 border-l border-b border-slate-100 pl-2 pb-0 relative">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-t border-dashed border-slate-100 w-full" />
                        ))}
                        <div />
                    </div>

                    {revenueData.map((item, index) => {
                        const heightPercent = (item.amount / revenueMax) * 100;
                        const isCurrent = index === lastIndex;
                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={item.month}
                                className="flex-1 flex flex-col items-center justify-end relative z-10"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20">
                                        LKR {item.label}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
                                    </div>
                                )}

                                {/* Bar */}
                                <div
                                    className={`w-full max-w-[48px] rounded-t-lg cursor-pointer transition-all duration-300 ease-out ${isCurrent
                                            ? "bg-primary shadow-md shadow-primary/20"
                                            : isHovered
                                                ? "bg-primary"
                                                : "bg-primary/15"
                                        }`}
                                    style={{ height: `${heightPercent}%` }}
                                />

                                {/* Month label */}
                                <p
                                    className={`text-[11px] text-center mt-2.5 font-medium ${isCurrent ? "text-primary font-bold" : "text-slate-500"
                                        }`}
                                >
                                    {item.month}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-medium">Total Revenue (6 months)</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                        LKR {(revenueData.reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}K
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span className="text-xs font-bold">+12.4% vs prior</span>
                </div>
            </div>
        </div>
    );
}

