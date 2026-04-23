import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    getAllPropertiesForAdmin,
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
    const [filters, setFilters] = useState({ status: "", priority: "", technicianId: "", propertyId: "" });
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [priorityDrafts, setPriorityDrafts] = useState({});
    const [closeNotes, setCloseNotes] = useState({});
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");

    // Create Technician State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createForm, setCreateForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });

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

    const load = async () => {
        try {
            setLoading(true);
            setLoadError("");
            const [queueRes, techRes, propRes] = await Promise.all([
                getAdminMaintenanceQueue(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))),
                getMaintenanceTechnicians(),
                getAllPropertiesForAdmin(),
            ]);
            setQueue(queueRes.data?.data || []);
            setTechs(techRes.data?.data || []);
            setAllProperties(propRes.data?.data || []);
        } catch (err) {
            setQueue([]);
            setTechs([]);
            setLoadError(err?.response?.data?.message || "Unable to load maintenance queue right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser) load();
    }, [adminUser, filters.status, filters.priority, filters.technicianId, filters.propertyId]);

    const savePriority = async (requestId) => {
        const priority = priorityDrafts[requestId];
        if (!priority) return;
        try {
            setActionError("");
            await updateMaintenancePriority(requestId, priority);
            load();
        } catch (err) {
            setActionError(err?.response?.data?.message || "Unable to update priority.");
        }
    };

    const closeRequest = async (requestId) => {
        try {
            setActionError("");
            await closeMaintenance(requestId, closeNotes[requestId] || undefined);
            setCloseNotes((prev) => ({ ...prev, [requestId]: "" }));
            load();
        } catch (err) {
            setActionError(err?.response?.data?.message || "Unable to close request.");
        }
    };

    const handleCreateTechnician = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError("");
        try {
            await createTechnicianAccount(createForm);
            setShowCreateModal(false);
            setCreateForm({ fullName: "", email: "", phone: "", password: "" });
            load();
        } catch (err) {
            setCreateError(err?.response?.data?.message || "Failed to create technician account.");
        } finally {
            setCreateLoading(false);
        }
    };

    // Derived Stats
    const queueStats = useMemo(() => {
        return {
            requests: queue.length,
            emergency: queue.filter((i) => i.priority === "EMERGENCY").length,
            assigned: queue.filter((i) => i.assignedTechnicianId || i.technicianName).length,
            openTechs: techs.length,
        };
    }, [queue, techs]);

    const technicianAssignments = useMemo(() => {
        const map = new Map();
        queue.forEach((item) => {
            if (item.assignedTechnicianId) {
                map.set(item.assignedTechnicianId, (map.get(item.assignedTechnicianId) || 0) + 1);
            }
        });
        return map;
    }, [queue]);

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

                    <MaintenanceSectionCard eyebrow="Filters" title="Operational filters" description="Filter the request queue by status, priority, or assigned technician.">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">rule</span>
                                <select 
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1" 
                                    value={filters.status} 
                                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                                >
                                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">priority_high</span>
                                <select 
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1" 
                                    value={filters.priority} 
                                    onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                                >
                                    {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">engineering</span>
                                <select 
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1" 
                                    value={filters.technicianId} 
                                    onChange={(e) => setFilters((prev) => ({ ...prev, technicianId: e.target.value }))}
                                >
                                    <option value="">All Technicians</option>
                                    {techs.map((tech) => (
                                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button 
                                onClick={load}
                                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all text-sm flex items-center gap-2 shadow-sm active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Refresh Queue
                            </button>
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Queue" title="Maintenance requests" description="Assign technicians directly from the request list.">
                        {loadError ? <p className="mb-4 text-sm font-medium text-red-600">{loadError}</p> : null}
                        {actionError ? <p className="mb-4 text-sm font-medium text-red-600">{actionError}</p> : null}
                        
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <MaintenanceQueueTable
                                data={queue}
                                loading={loading}
                                columns={[
                                    {
                                        header: "Request",
                                        render: (item) => (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.serviceType}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Priority",
                                        render: (item) => (
                                            <div className="flex items-center gap-3">
                                                <MaintenanceBadge kind="priority" value={item.priority} />
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <select
                                                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold"
                                                        value={priorityDrafts[item.id] || item.priority}
                                                        onChange={(e) => setPriorityDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                    >
                                                        <option value="LOW">Low</option>
                                                        <option value="MEDIUM">Medium</option>
                                                        <option value="HIGH">High</option>
                                                        <option value="EMERGENCY">Emergency</option>
                                                    </select>
                                                    <button onClick={() => savePriority(item.id)} className="p-1 rounded-lg bg-slate-900 text-white hover:bg-emerald-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[14px]">done</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Status",
                                        render: (item) => <MaintenanceBadge value={item.status} />
                                    },
                                    {
                                        header: "Technician",
                                        render: (item) => (
                                            <div className="relative group/tech min-w-[160px]">
                                                <div className="flex items-center gap-2 py-1 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent group-hover/tech:border-slate-200 transition-all">
                                                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                        <span className="material-symbols-outlined text-[16px]">engineering</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {item.technicianName || "Unassigned"}
                                                    </span>
                                                </div>
                                                <select
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    value={""}
                                                    onChange={async (e) => {
                                                        const val = e.target.value;
                                                        if (val) {
                                                            try {
                                                                await assignMaintenanceTechnician(item.id, { technicianId: val });
                                                                load();
                                                            } catch (err) {
                                                                setActionError(err?.response?.data?.message || "Failed to assign.");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <option value="">Choose technician...</option>
                                                    {techs.map((tech) => (
                                                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Control",
                                        render: (item) => (
                                            <div className="flex items-center gap-2">
                                                {item.status === "RESOLVED" ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium"
                                                            placeholder="Closure note..."
                                                            value={closeNotes[item.id] || ""}
                                                            onChange={(e) => setCloseNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        />
                                                        <button onClick={() => closeRequest(item.id)} className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors">
                                                            Close
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase italic">Auto-Monitoring</span>
                                                )}
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard 
                        eyebrow="Staff" 
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
                                <div key={tech.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 group hover:border-emerald-500/50 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[24px]">engineering</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignments</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{technicianAssignments.get(tech.id) || 0}</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{tech.fullName}</p>
                                    <p className="text-sm text-slate-500 font-medium mb-4">{tech.email}</p>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4" />
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Active Status</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </main>

            {/* Create Technician Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative z-10"
                        >
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">New Technician</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Provision a new staff account.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateTechnician} className="p-8 space-y-6">
                                {createError && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {createError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Michael Chen"
                                            value={createForm.fullName}
                                            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="michael@rentease.com"
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+94..."
                                                value={createForm.phone}
                                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Password</label>
                                            <input
                                                required
                                                minLength={8}
                                                type="password"
                                                placeholder="••••••••"
                                                value={createForm.password}
                                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-4 font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-2xl transition-colors text-sm uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 px-6 py-4 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-widest"
                                    >
                                        {createLoading ? (
                                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        ) : (
                                            "Provision Account"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
