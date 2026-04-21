export default function MaintenanceStatCard({ label, value, hint, accent = "emerald" }) {
    const accentClasses = {
        emerald: "from-emerald-500 to-teal-500 text-white",
        blue: "from-blue-500 to-cyan-500 text-white",
        amber: "from-amber-500 to-orange-500 text-white",
        slate: "from-slate-700 to-slate-900 text-white",
    };

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className={`inline-flex rounded-2xl bg-gradient-to-br px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${accentClasses[accent] || accentClasses.emerald}`}>
                {label}
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
            {hint ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </div>
    );
}