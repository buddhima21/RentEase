import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceQueueTable from "../components/maintenance/MaintenanceQueueTable";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import {
    assignMaintenanceTechnician,
    closeMaintenance,
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
    updateMaintenancePriority,
    createTechnicianAccount,
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

    // Technician Creation Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ fullName: "", email: "", phone: "", password: "" });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");

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

    const handleCreateTechnician = async (e) => {
        e.preventDefault();
        setCreateError("");
        setCreateLoading(true);
        try {
            await createTechnicianAccount({
                fullName: createForm.fullName.trim(),
                email: createForm.email.trim(),
                password: createForm.password,
                phone: createForm.phone.trim() || undefined,
            });
            setShowCreateModal(false);
            setCreateForm({ fullName: "", email: "", phone: "", password: "" });
            load(filterParams);
        } catch (err) {
            setCreateError(err?.response?.data?.message || "Failed to create technician account.");
        } finally {
            setCreateLoading(false);
        }
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
                        <MaintenanceQueueTable
                            loading={loading}
                            data={filteredQueue}
                            emptyMessage={loadError ? "Unable to load queue." : normalizedSearch ? "No matching requests." : "No requests in queue."}
                            columns={[
                                {
                                    header: "Title",
                                    sortable: true,
                                    sortKey: "title",
                                    render: (item) => (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                                            <span className="text-xs text-slate-500 font-medium tracking-wide">#{item.id.slice(0, 6).toUpperCase()}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: "Priority",
                                    sortable: true,
                                    sortKey: "priority",
                                    render: (item) => (
                                        <div className="relative inline-block group/priority">
                                            <MaintenanceBadge kind="priority" value={item.priority} />
                                            <select
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                value={item.priority}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    runAction(() => updateMaintenancePriority(item.id, val), "Unable to update priority.");
                                                }}
                                                title="Change Priority"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="EMERGENCY">Emergency</option>
                                            </select>
                                        </div>
                                    )
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
                                        <div className="relative flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400">
                                                {(item.technicianName || item.assignedTechnicianId || "U")[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-white font-semibold">
                                                    {item.technicianName || "Unassigned"}
                                                </span>
                                                {!item.assignedTechnicianId && (
                                                    <span className="text-[11px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Click to assign
                                                    </span>
                                                )}
                                            </div>
                                            {!item.assignedTechnicianId && (
                                                <select
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    value={""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val) {
                                                            runAction(() => assignMaintenanceTechnician(item.id, { technicianId: val }), "Unable to assign technician.");
                                                        }
                                                    }}
                                                    title="Assign Technician"
                                                >
                                                    <option value="">Assign tech...</option>
                                                    {techs.map((tech) => (
                                                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    header: "",
                                    className: "text-right w-48",
                                    render: (item) => (
                                        <div className="flex items-center justify-end">
                                            {item.status === "RESOLVED" && (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <input
                                                        className="w-32 rounded-lg bg-slate-100 dark:bg-slate-800 border-none px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all"
                                                        placeholder="Closure note..."
                                                        value={closeNotes[item.id] || ""}
                                                        onChange={(e) => setCloseNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                    />
                                                    <button
                                                        className="rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                                                        onClick={() => closeRequest(item.id)}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard 
                        eyebrow="Technicians" 
                        title="Available technicians" 
                        description="Current staff available for assignment."
                        action={
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Technician
                            </button>
                        }
                    >
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

            {/* Create Technician Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">New Technician</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Provision a new staff account.</p>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateTechnician} className="p-6 space-y-5">
                            {createError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                                    {createError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    value={createForm.fullName}
                                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@rentease.com"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={createForm.phone}
                                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                                <input
                                    required
                                    minLength={8}
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {createLoading ? (
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
