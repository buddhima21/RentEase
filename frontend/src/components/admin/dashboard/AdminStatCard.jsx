/**
 * AdminStatCard — Reusable KPI card for the admin dashboard overview.
 * Same pattern as the owner StatCard but scoped to the admin namespace.
 *
 * Props: icon, iconBg, iconColor, label, value, badge, badgeBg, badgeColor
 */
export default function AdminStatCard({
    icon,
    iconBg=bg-red-100,
    iconColor=text-red-500,
    label,
    value,
    badge,
    badgeBg,
    badgeColor,
}) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col min-h-[140px]">
            {/* Top row: icon + badge */}
            <div className="flex items-center justify-between mb-4">
                <span
                    className={`material-symbols-outlined p-2.5 rounded-xl text-xl ${iconBg} ${iconColor}`}
                >
                    {icon}
                </span>
                {badge && (
                    <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg} ${badgeColor}`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            {/* Label + Value */}
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{value}</h3>
        </div>
    );
}
