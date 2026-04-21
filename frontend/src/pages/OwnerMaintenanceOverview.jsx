import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { getOwnerMaintenance } from "../services/api";

export default function OwnerMaintenanceOverview() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getOwnerMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Owner Maintenance Overview</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Read-only visibility for maintenance requests related to your properties.</p>
                </div>

                <MaintenanceSectionCard eyebrow="Overview" title="Property maintenance" description="Monitor the request lifecycle without editing tenant or technician actions.">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="text-left p-3">Request</th>
                                    <th className="text-left p-3">Priority</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Technician</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900">
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-slate-900 dark:text-white">{item.title}</td>
                                        <td className="p-3"><MaintenanceBadge kind="priority" value={item.priority} /></td>
                                        <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-300">{item.assignedTechnicianId || "Unassigned"}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={4}>No requests found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
