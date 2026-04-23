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
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        getOwnerMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [user?.id]);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 font-sans selection:bg-emerald-100">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-[88px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight text-slate-800 dark:text-slate-100">
                        Maintenance Oversight
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        <OwnerNotificationsBell />
                        <div className="pl-2 flex">
                            <UserDropdown />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Property Portfolio</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Owner Maintenance Overview</h1>
                        <p className="max-w-3xl text-sm md:text-base text-slate-600 dark:text-slate-300 leading-6">
                            Read-only visibility for maintenance requests related to your properties. Monitor the lifecycle of each request from reporting to resolution.
                        </p>
                    </div>

                    <MaintenanceSectionCard 
                        eyebrow="Lifecycle" 
                        title="Maintenance queue" 
                        description="Track request status, priority levels, and technician assignments without administrative intervention."
                    >
                        <MaintenanceQueueTable
                            data={items}
                            loading={loading}
                            emptyMessage="No maintenance records found for your properties."
                            columns={[
                                {
                                    header: "Request",
                                    sortable: true,
                                    sortKey: "title",
                                    render: (item) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.serviceType}</span>
                                        </div>
                                    )
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
                                    render: (item) => (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                <span className="material-symbols-outlined text-[18px]">engineering</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {item.technicianName || item.assignedTechnicianId || "Unassigned"}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    header: "Resolution",
                                    render: (item) => (
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {item.completionSummary || "Pending resolution..."}
                                        </span>
                                    )
                                }
                            ]}
                        />
                    </MaintenanceSectionCard>
                </div>
            </main>
        </div>
    );
}
