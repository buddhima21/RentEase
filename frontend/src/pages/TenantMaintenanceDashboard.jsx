import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTenantMaintenance } from "../services/api";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceQueueTable from "../components/maintenance/MaintenanceQueueTable";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import { formatMaintenanceDate } from "../constants/maintenance";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full mx-auto max-w-7xl p-6 md:p-10 space-y-6">
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
                    <MaintenanceQueueTable
                        data={items}
                        emptyMessage="No maintenance requests yet."
                        columns={[
                            {
                                header: "Title",
                                sortable: true,
                                sortKey: "title",
                                render: (item) => <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
                            },
                            {
                                header: "Service",
                                sortable: true,
                                sortKey: "serviceType",
                                render: (item) => <span className="text-slate-600 dark:text-slate-300">{item.serviceType}</span>
                            },
                            {
                                header: "Priority",
                                sortable: true,
                                sortKey: "priority",
                                render: (item) => <MaintenanceBadge kind="priority" value={item.priority} />
                            },
                            {
                                header: "Status",
                                sortable: true,
                                sortKey: "status",
                                render: (item) => <MaintenanceBadge value={item.status} />
                            },
                            {
                                header: "Scheduled",
                                render: (item) => <span className="text-slate-600 dark:text-slate-300">{formatMaintenanceDate(item.scheduledAt)}</span>
                            },
                            {
                                header: "",
                                className: "text-right",
                                render: (item) => (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                        <Link className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" to={`/tenant/maintenance/track/${item.id}`}>
                                            Track Status
                                        </Link>
                                    </div>
                                )
                            }
                        ]}
                    />
                </MaintenanceSectionCard>
            </div>
            <Footer />
        </div>
    );
}
