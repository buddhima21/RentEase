import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import {
    assignMaintenanceTechnician,
    closeMaintenance,
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
    updateMaintenancePriority,
} from "../services/api";

const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    { value: "REPORTED", label: "Reported" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "DECLINED", label: "Declined" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "CLOSED", label: "Closed" },
];

const PRIORITY_OPTIONS = [
    { value: "", label: "All priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "EMERGENCY", label: "Emergency" },
];

export default function AdminMaintenanceDashboard() {
    const [adminUser, setAdminUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [queue, setQueue] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedTechByRequest, setSelectedTechByRequest] = useState({});
    const [technicianSearchByRequest, setTechnicianSearchByRequest] = useState({});
    const [filters, setFilters] = useState({ status: "", priority: "", technicianId: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [priorityDrafts, setPriorityDrafts] = useState({});
    const [closeNotes, setCloseNotes] = useState({});
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");

    const filterParams = useMemo(
        () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        [filters]
    );

    const queueStats = useMemo(() => ({
        requests: queue.length,
        emergency: queue.filter((item) => item.priority === "EMERGENCY").length,
        assigned: queue.filter((item) => item.assignedTechnicianId).length,
        openTechs: techs.length,
    }), [queue, techs]);

    const techniciansById = useMemo(() => {
        const map = new Map();
        techs.forEach((tech) => map.set(tech.id, tech));
        return map;
    }, [techs]);

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredQueue = useMemo(() => {
        if (!normalizedSearch) {
            return queue;
        }

        return queue.filter((item) => {
            const assignedTechnician = techniciansById.get(item.assignedTechnicianId);
            const technicianText = [
                item.technicianName,
                item.technicianEmail,
                assignedTechnician?.fullName,
                assignedTechnician?.email,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const queueText = [
                item.id,
                item.title,
                item.status,
                item.priority,
                item.propertyId,
                item.tenantId,
                technicianText,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return queueText.includes(normalizedSearch);
        });
    }, [normalizedSearch, queue, techniciansById]);

    const technicianAssignments = useMemo(() => {
        const counts = new Map();
        queue.forEach((item) => {
            if (!item.assignedTechnicianId) return;
            counts.set(item.assignedTechnicianId, (counts.get(item.assignedTechnicianId) || 0) + 1);
        });
        return counts;
    }, [queue]);

    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                } else {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                }
            } else {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
            }
        } catch {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const load = async (params = filterParams) => {
        try {
            setLoading(true);
            setLoadError("");
            const [queueRes, techRes] = await Promise.all([
                getAdminMaintenanceQueue(params),
                getMaintenanceTechnicians(),
            ]);
            setQueue(queueRes.data?.data || []);
            setTechs(techRes.data?.data || []);
        } catch (err) {
            setQueue([]);
            setTechs([]);
            setLoadError(err?.response?.data?.message || "Unable to load maintenance queue right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !adminUser) {
            return;
        }
        load(filterParams);
    }, [authLoading, adminUser, filterParams]);

    const runAction = async (handler, fallbackMessage) => {
        try {
            setActionError("");
            await handler();
            load(filterParams);
        } catch (err) {
            setActionError(err?.response?.data?.message || fallbackMessage);
        }
    };

    const assign = async (requestId) => {
        const technicianId = selectedTechByRequest[requestId];
        if (!technicianId) return;
        await runAction(() => assignMaintenanceTechnician(requestId, { technicianId }), "Unable to assign technician.");
    };

    const savePriority = async (requestId) => {
        const priority = priorityDrafts[requestId];
        if (!priority) return;
        await runAction(() => updateMaintenancePriority(requestId, priority), "Unable to update priority.");
    };

    const closeRequest = async (requestId) => {
        await runAction(async () => {
            await closeMaintenance(requestId, closeNotes[requestId] || undefined);
            setCloseNotes((prev) => ({ ...prev, [requestId]: "" }));
        }, "Unable to close request.");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100">
                        Maintenance Control Center
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            to="/admin/maintenance/calendar"
                            className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            Open Calendar
                        </Link>
                        <AdminNotificationsBell />
                        <div className="pl-2 flex">
                            <AdminProfileDropdown adminUser={adminUser} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <div className="flex justify-between items-end gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Maintenance Operations</span>
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">Maintenance Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-[15px]">Review requests, tune priorities, and dispatch technicians with one operational view.</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <MaintenanceStatCard label="Requests" value={queueStats.requests} accent="blue" />
                        <MaintenanceStatCard label="Emergency" value={queueStats.emergency} accent="red" />
                        <MaintenanceStatCard label="Assigned" value={queueStats.assigned} accent="emerald" />
                        <MaintenanceStatCard label="Open techs" value={queueStats.openTechs} accent="slate" />
                    </div>

                    <MaintenanceSectionCard eyebrow="Queue" title="Maintenance requests" description="Search and filter requests, then assign technicians and update priorities in one workspace.">
                        <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <input
                                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3"
                                placeholder="Search request or technician"
                                aria-label="Search maintenance requests"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3"
                                aria-label="Filter by status"
                                value={filters.status}
                                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <select
                                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3"
                                aria-label="Filter by priority"
                                value={filters.priority}
                                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                            >
                                {PRIORITY_OPTIONS.map((option) => (
                                    <option key={option.label} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <select
                                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3"
                                aria-label="Filter by technician"
                                value={filters.technicianId}
                                onChange={(e) => setFilters((prev) => ({ ...prev, technicianId: e.target.value }))}
                            >
                                <option value="">All technicians</option>
                                {techs.map((tech) => (
                                    <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                ))}
                            </select>
                        </div>

                        {loadError ? <p className="mb-4 text-sm font-medium text-red-600">{loadError}</p> : null}
                        {actionError ? <p className="mb-4 text-sm font-medium text-red-600">{actionError}</p> : null}
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left p-3">Title</th>
                                        <th className="text-left p-3">Priority</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Technician</th>
                                        <th className="text-left p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900">
                                    {loading ? (
                                        <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>Loading queue...</td></tr>
                                    ) : filteredQueue.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                            <td className="p-3 font-medium text-slate-900 dark:text-white">{item.title}</td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <MaintenanceBadge kind="priority" value={item.priority} />
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                                                            aria-label={`Priority for ${item.title}`}
                                                            value={priorityDrafts[item.id] || item.priority}
                                                            onChange={(e) => setPriorityDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                            <option value="EMERGENCY">Emergency</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            aria-label={`Save priority for ${item.title}`}
                                                            className="rounded-xl border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200"
                                                            onClick={() => savePriority(item.id)}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs"
                                                        placeholder="Search technician"
                                                        aria-label={`Search technician for ${item.title}`}
                                                        value={technicianSearchByRequest[item.id] || ""}
                                                        onChange={(e) => setTechnicianSearchByRequest((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                    />
                                                    <select
                                                        className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
                                                        aria-label={`Technician for ${item.title}`}
                                                        value={selectedTechByRequest[item.id] || item.assignedTechnicianId || ""}
                                                        onChange={(e) => setSelectedTechByRequest((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                    >
                                                        <option value="">Select technician</option>
                                                        {techs
                                                            .filter((tech) => {
                                                                const query = (technicianSearchByRequest[item.id] || "").trim().toLowerCase();
                                                                if (!query) return true;
                                                                return `${tech.fullName} ${tech.email || ""}`.toLowerCase().includes(query);
                                                            })
                                                            .map((tech) => (
                                                                <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        className="rounded-xl bg-primary px-3 py-2 font-semibold text-white"
                                                        aria-label={`Assign technician for ${item.title}`}
                                                        onClick={() => assign(item.id)}
                                                    >
                                                        Assign
                                                    </button>
                                                    {item.status === "RESOLVED" ? (
                                                        <>
                                                            <input
                                                                className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs"
                                                                placeholder="Closure note"
                                                                maxLength={1000}
                                                                value={closeNotes[item.id] || ""}
                                                                onChange={(e) => setCloseNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                            />
                                                            <button
                                                                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                                                                aria-label={`Close ${item.title}`}
                                                                onClick={() => closeRequest(item.id)}
                                                            >
                                                                Close
                                                            </button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filteredQueue.length === 0 ? <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>{loadError ? "Unable to load queue." : normalizedSearch ? "No matching requests." : "No requests in queue."}</td></tr> : null}
                                </tbody>
                            </table>
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Technicians" title="Available technicians" description="Current staff available for assignment.">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {techs.map((tech) => (
                                <div key={tech.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{tech.fullName}</p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tech.email}</p>
                                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Assigned requests</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{technicianAssignments.get(tech.id) || 0}</p>
                                </div>
                            ))}
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </main>
        </div>
    );
}
