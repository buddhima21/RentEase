import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTenantMaintenance } from "../services/api";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import { formatMaintenanceDate } from "../constants/maintenance";

export default function TenantMaintenanceDashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tenant Maintenance Dashboard</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Keep track of active requests, upcoming visits, and completed work.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/tenant/maintenance/request" className="rounded-full bg-primary px-4 py-2 font-semibold text-white">
                            New Request
                        </Link>
                        <Link to="/tenant/maintenance/history" className="rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200">
                            History
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <MaintenanceStatCard label="Active" value={items.filter((item) => !["RESOLVED", "CLOSED"].includes(item.status)).length} accent="blue" />
                    <MaintenanceStatCard label="Completed" value={items.filter((item) => item.status === "RESOLVED" || item.status === "CLOSED").length} accent="emerald" />
                    <MaintenanceStatCard label="Scheduled" value={items.filter((item) => item.scheduledAt).length} accent="amber" />
                    <MaintenanceStatCard label="Emergency" value={items.filter((item) => item.priority === "EMERGENCY").length} accent="slate" />
                </div>

                <MaintenanceSectionCard eyebrow="Requests" title="Maintenance requests" description="Open each request to follow the live status timeline.">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                <tr>
                                    <th className="text-left p-3">Title</th>
                                    <th className="text-left p-3">Service</th>
                                    <th className="text-left p-3">Priority</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Scheduled</th>
                                    <th className="text-left p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900">
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-slate-900 dark:text-white">{item.title}</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-300">{item.serviceType}</td>
                                        <td className="p-3"><MaintenanceBadge kind="priority" value={item.priority} /></td>
                                        <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-300">{formatMaintenanceDate(item.scheduledAt)}</td>
                                        <td className="p-3">
                                            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to={`/tenant/maintenance/track/${item.id}`}>
                                                Track
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={6}>No maintenance requests yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
