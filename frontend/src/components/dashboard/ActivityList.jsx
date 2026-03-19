import { recentActivity } from "../../data/ownerDashboardData";

/**
 * ActivityList — Timeline-style recent activity feed.
 */
export default function ActivityList() {
    return (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
            {/* Header */}
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">history</span>
                Recent Activity
            </h3>

            {/* Timeline */}
            <div className="space-y-5">
                {recentActivity.map((item, index) => (
                    <div key={item.id} className="flex gap-3.5 group">
                        {/* Dot + Vertical line */}
                        <div className="flex flex-col items-center pt-1.5">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${item.dotColor} ring-4 ring-white shrink-0`}
                            />
                            {index < recentActivity.length - 1 && (
                                <div className="w-px flex-1 bg-slate-100 mt-1.5" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-5 min-w-0">
                            <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            <button className="w-full mt-2 py-2.5 text-[11px] font-bold text-slate-400 border-t border-slate-100 pt-4 hover:text-primary transition-colors uppercase tracking-widest">
                Load More Activity
            </button>
        </div>
    );
}
