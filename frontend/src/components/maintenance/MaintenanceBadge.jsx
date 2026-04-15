import { getMaintenancePriorityMeta, getMaintenanceStatusMeta, isEmergencyPriority } from "../../constants/maintenance";

const toneClasses = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function MaintenanceBadge({ kind = "status", value, className = "" }) {
    const meta = kind === "priority" ? getMaintenancePriorityMeta(value) : getMaintenanceStatusMeta(value);
    const tone = toneClasses[meta.tone] || toneClasses.slate;

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone} ${className}`}>
            {kind === "priority" && isEmergencyPriority(value) ? "Emergency" : meta.label}
        </span>
    );
}