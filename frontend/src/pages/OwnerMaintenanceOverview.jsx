import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/owner/dashboard/Sidebar";
import OwnerNotificationsBell from "../components/owner/dashboard/OwnerNotificationsBell";
import UserDropdown from "../components/UserDropdown";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceQueueTable from "../components/maintenance/MaintenanceQueueTable";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { getOwnerMaintenance } from "../services/api";

export default function OwnerMaintenanceOverview() {
    const { user, logout } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getOwnerMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 font-sans">
                <header className="sticky top-0 z-30 h-[72px] border-b border-slate-100/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100">
                        Owner Maintenance
                    </h2>

                    <div className="flex items-center gap-3 ml-auto">
                        <Link
                            to="/owner/dashboard"
                            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 transition-all"
                        >
                            Back to Dashboard
                        </Link>
                        <OwnerNotificationsBell />
                        {user ? <UserDropdown user={user} onLogout={logout} /> : null}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Owner Maintenance Overview</h1>
                        <p className="max-w-3xl text-sm md:text-base text-slate-600 dark:text-slate-300 leading-6">
                            Read-only visibility for maintenance requests related to your properties.
                        </p>
                    </div>

                    <MaintenanceSectionCard eyebrow="Overview" title="Property maintenance" description="Monitor the request lifecycle without editing tenant or technician actions.">
                        <MaintenanceQueueTable
                            data={items}
                            emptyMessage="No requests found."
                            columns={[
                                {
                                    header: "Request",
                                    sortable: true,
                                    sortKey: "title",
                                    render: (item) => <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
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
                                    header: "Technician",
                                    render: (item) => <span className="text-slate-600 dark:text-slate-300">{item.technicianName || item.assignedTechnicianId || "Unassigned"}</span>
                                },
                                {
                                    header: "Resolution",
                                    render: (item) => <span className="text-slate-600 dark:text-slate-300">{item.completionSummary || "Pending"}</span>
                                }
                            ]}
                        />
                    </MaintenanceSectionCard>
                </div>
            </main>
        </div>
    );
}
