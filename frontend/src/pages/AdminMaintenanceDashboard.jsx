import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    getAllPropertiesForAdmin,
} from "../services/api";

export default function AdminMaintenanceDashboard() {
    const [adminUser, setAdminUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [queue, setQueue] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedTechByRequest, setSelectedTechByRequest] = useState({});
    const [filters, setFilters] = useState({ status: "", priority: "", technicianId: "", propertyId: "" });
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [priorityDrafts, setPriorityDrafts] = useState({});
    const [closeNotes, setCloseNotes] = useState({});
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);

    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                }
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
        load();
    }, [filters.status, filters.priority, filters.technicianId, filters.propertyId]);

    const assign = async (requestId) => {
        const technicianId = selectedTechByRequest[requestId];
        if (!technicianId) return;
        try {
            setActionError("");
            await assignMaintenanceTechnician(requestId, { technicianId });
            load();
        } catch (err) {
            setActionError(err?.response?.data?.message || "Unable to assign technician.");
        }
    };

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

                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </div>
                            <Link
                                to="/admin/maintenance/calendar"
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-xl hover:border-emerald-300 hover:text-emerald-700 transition-all text-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">event_available</span>
                                Schedule Visits
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <MaintenanceStatCard label="Requests" value={queue.length} accent="blue" />
                        <MaintenanceStatCard label="Emergency" value={queue.filter((item) => item.priority === "EMERGENCY").length} accent="red" />
                        <MaintenanceStatCard label="Assigned" value={queue.filter((item) => item.assignedTechnicianId).length} accent="emerald" />
                        <MaintenanceStatCard label="Open techs" value={techs.length} accent="slate" />
                    </div>

                    <MaintenanceSectionCard eyebrow="Filters" title="Operational filters" description="Filter the request queue by status, priority, or assigned technician.">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Status Filter */}
                            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">rule</span>
                                <select 
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1" 
                                    value={filters.status} 
                                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="REPORTED">Reported</option>
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="DECLINED">Declined</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">priority_high</span>
                                <select 
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1" 
                                    value={filters.priority} 
                                    onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="EMERGENCY">Emergency</option>
                                </select>
                            </div>


                            {/* Technician Filter */}
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
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {queue.length} Requests Found
                            </div>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-bold bg-white dark:bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200 group"
                                >
                                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform text-slate-400">sort</span>
                                    <span>{sortBy === "newest" ? "Newest First" : sortBy === "oldest" ? "Oldest First" : sortBy === "az" ? "Title: A-Z" : "Title: Z-A"}</span>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                <AnimatePresence>
                                    {isSortOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[9998]" onClick={() => setIsSortOpen(false)} />
                                            <motion.div 
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-[9999]"
                                            >
                                                {[
                                                    { label: "Newest First", value: "newest", icon: "schedule" },
                                                    { label: "Oldest First", value: "oldest", icon: "history" },
                                                    { label: "Title: A-Z", value: "az", icon: "sort_by_alpha" },
                                                    { label: "Title: Z-A", value: "za", icon: "sort_by_alpha" }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setIsSortOpen(false);
                                                            // client side sort
                                                            const sorted = [...queue].sort((a, b) => {
                                                                if (option.value === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
                                                                if (option.value === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
                                                                if (option.value === "az") return a.title.localeCompare(b.title);
                                                                if (option.value === "za") return b.title.localeCompare(a.title);
                                                                return 0;
                                                            });
                                                            setQueue(sorted);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                                                            sortBy === option.value 
                                                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' 
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px] opacity-70">{option.icon}</span>
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

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
                                    ) : queue.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                            <td className="p-3 font-medium text-slate-900 dark:text-white">{item.title}</td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <MaintenanceBadge kind="priority" value={item.priority} />
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                                                            value={priorityDrafts[item.id] || item.priority}
                                                            onChange={(e) => setPriorityDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                            <option value="EMERGENCY">Emergency</option>
                                                        </select>
                                                        <button type="button" className="rounded-xl border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200" onClick={() => savePriority(item.id)}>
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                            <td className="p-3">
                                                <select
                                                    className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
                                                    value={selectedTechByRequest[item.id] || item.assignedTechnicianId || ""}
                                                    onChange={(e) => setSelectedTechByRequest((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                >
                                                    <option value="">Select technician</option>
                                                    {techs.map((tech) => (
                                                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <button className="rounded-xl bg-primary px-3 py-2 font-semibold text-white" onClick={() => assign(item.id)}>
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
                                                            <button className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700" onClick={() => closeRequest(item.id)}>
                                                                Close
                                                            </button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && queue.length === 0 ? <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>{loadError ? "Unable to load queue." : "No requests in queue."}</td></tr> : null}
                                </tbody>
                            </table>
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Technicians" title="Available technicians" description="Current staff available for assignment.">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {techs.map((tech) => {
                                const assignedCount = queue.filter((item) => item.assignedTechnicianId === tech.id).length;
                                return (
                                    <div key={tech.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{tech.fullName}</p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tech.email}</p>
                                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Assigned requests</p>
                                        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{assignedCount}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </main>
        </div>
    );
}
