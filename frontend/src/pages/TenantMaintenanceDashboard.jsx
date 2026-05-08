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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [user?.id]);

    const activeItems = items.filter((item) => !["RESOLVED", "CLOSED", "CANCELLED"].includes(item.status));

    // Next upcoming scheduled visit across all active requests
    const upcomingVisit = activeItems
        .filter((item) => item.scheduledAt && new Date(item.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full mx-auto max-w-7xl p-6 md:p-10 space-y-6">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Maintenance
                        </h1>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            Track active requests, upcoming visits, and completed work.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/tenant/maintenance/request"
                            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            New Request
                        </Link>
                        <Link
                            to="/tenant/maintenance/history"
                            className="flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">history</span>
                            History
                        </Link>
                    </div>
                </div>

                {/* Upcoming visit banner */}
                {upcomingVisit && (
                    <div className="flex items-center gap-4 rounded-3xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20 px-6 py-4">
                        <span className="material-symbols-outlined text-2xl text-blue-500 dark:text-blue-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                            event_upcoming
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Upcoming visit</p>
                            <p className="mt-0.5 text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                                {upcomingVisit.title}
                            </p>
                            <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                                {formatMaintenanceDate(upcomingVisit.scheduledAt)}
                                {upcomingVisit.technicianName && ` · ${upcomingVisit.technicianName}`}
                            </p>
                        </div>
                        <Link
                            to={`/tenant/maintenance/track/${upcomingVisit.id}`}
                            className="shrink-0 rounded-full border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900/30 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                        >
                            Track
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <MaintenanceStatCard
                        label="Active"
                        value={activeItems.length}
                        accent="blue"
                    />
                    <MaintenanceStatCard
                        label="Completed"
                        value={items.filter((item) => item.status === "RESOLVED" || item.status === "CLOSED").length}
                        accent="emerald"
                    />
                    <MaintenanceStatCard
                        label="Scheduled"
                        value={items.filter((item) => item.scheduledAt && new Date(item.scheduledAt) > new Date()).length}
                        accent="amber"
                    />
                    <MaintenanceStatCard
                        label="Emergency"
                        value={items.filter((item) => item.priority === "EMERGENCY").length}
                        accent="red"
                    />
                </div>

                {/* Requests table */}
                <MaintenanceSectionCard
                    eyebrow="Requests"
                    title="Your maintenance requests"
                    description="Open any request to follow the live status timeline and technician details."
                >
                    {loading ? (
                        <div className="space-y-2 mt-4">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 py-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600" style={{ fontVariationSettings: "'FILL' 0" }}>
                                construction
                            </span>
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">No maintenance requests yet</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Submit a request and it will appear here.
                                </p>
                            </div>
                            <Link
                                to="/tenant/maintenance/request"
                                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                            >
                                Submit a request
                            </Link>
                        </div>
                    ) : (
                        <MaintenanceQueueTable
                            data={items}
                            emptyMessage="No maintenance requests yet."
                            columns={[
                                {
                                    header: "Title",
                                    sortable: true,
                                    sortKey: "title",
                                    render: (item) => (
                                        <div className="flex items-center gap-2">
                                            {item.priority === "EMERGENCY" && (
                                                <span className="material-symbols-outlined text-sm text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    emergency
                                                </span>
                                            )}
                                            <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
                                        </div>
                                    )
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
                                    render: (item) => (
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {item.scheduledAt ? formatMaintenanceDate(item.scheduledAt) : "—"}
                                        </span>
                                    )
                                },
                                {
                                    header: "",
                                    className: "text-right",
                                    render: (item) => (
                                        <Link
                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-colors"
                                            to={`/tenant/maintenance/track/${item.id}`}
                                        >
                                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                                            Track
                                        </Link>
                                    )
                                }
                            ]}
                        />
                    )}
                </MaintenanceSectionCard>
            </div>
            <Footer />
        </div>
    );
}
