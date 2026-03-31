import { adminRecentActivity } from "../../../data/adminDashboardData";

/**
 * AdminActivityList — Recent platform-wide activity feed for the admin dashboard.
 */
export default function AdminActivityList() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                    history
                </span>
                Platform Activity
                <span className="ml-auto text-xs font-medium text-slate-400">
                    Last 7 days
                </span>
            </h3>

            <div className="space-y-4">
                {adminRecentActivity.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 group"
                    >
                        {/* Icon dot */}
                        <span
                            className={`material-symbols-outlined mt-0.5 text-[18px] p-1.5 rounded-lg ${item.dotColor === "bg-emerald-500"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : item.dotColor === "bg-red-500"
                                        ? "bg-red-50 text-red-600"
                                        : item.dotColor === "bg-blue-500"
                                            ? "bg-blue-50 text-blue-600"
                                            : item.dotColor === "bg-amber-500"
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-purple-50 text-purple-600"
                                }`}
                        >
                            {item.icon}
                        </span>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {item.text.split(item.highlight).map((part, i, arr) =>
                                    i < arr.length - 1 ? (
                                        <span key={i}>
                                            {part}
                                            <span className="font-semibold text-slate-900">
                                                {item.highlight}
                                            </span>
                                        </span>
                                    ) : (
                                        <span key={i}>{part}</span>
                                    )
                                )}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
