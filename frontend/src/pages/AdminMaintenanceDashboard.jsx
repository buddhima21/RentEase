import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import PageLoader from "../components/PageLoader";
import {
    assignMaintenanceTechnician,
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
    updateMaintenancePriority,
} from "../services/api";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

export default function AdminMaintenanceDashboard() {
    const [adminUser, setAdminUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [queue, setQueue] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedTechByRequest, setSelectedTechByRequest] = useState({});
    const [filters, setFilters] = useState({ status: "", priority: "", technicianId: "" });
    const [loading, setLoading] = useState(false);
    const [priorityDrafts, setPriorityDrafts] = useState({});

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
            const [queueRes, techRes] = await Promise.all([
                getAdminMaintenanceQueue(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))),
                getMaintenanceTechnicians(),
            ]);
            setQueue(queueRes.data?.data || []);
            setTechs(techRes.data?.data || []);
        } catch {
            setQueue([]);
            setTechs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [filters.status, filters.priority, filters.technicianId]);

    const assign = async (requestId) => {
        const technicianId = selectedTechByRequest[requestId];
        if (!technicianId) return;
        await assignMaintenanceTechnician(requestId, { technicianId });
        load();
    };

    const savePriority = async (requestId) => {
        const priority = priorityDrafts[requestId];
        if (!priority) return;
        await updateMaintenancePriority(requestId, priority);
        load();
    };

    if (authLoading) {
        return <PageLoader />;
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
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans selection:bg-emerald-100" style={{ "--color-primary": "#26C289" }}>
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <motion.header 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-30 h-[88px] bg-white/70 backdrop-blur-2xl border-b border-slate-100/80 px-8 flex items-center justify-between gap-4 shrink-0"
                >
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800">
                        Maintenance Control Center
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            to="/admin/maintenance/calendar"
                            className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(5,150,105,0.2)]"
                            className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            Open Calendar
                        </Link>
                        <div className="bg-white border border-slate-100 p-2.5 rounded-full shadow-sm text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors relative">
                             <AdminNotificationsBell />
                        </div>
                        <AdminNotificationsBell />
                        <div className="pl-2 flex">
                            <AdminProfileDropdown adminUser={adminUser} />
                        </div>
                    </div>
                </motion.header>

                <motion.div 
                    className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent p-6 md:p-8 space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex justify-between items-end gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <div className="flex justify-between items-end gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Maintenance Operations</span>
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">Maintenance Dashboard</h1>
                            <p className="text-slate-500 font-medium mt-2 text-[15px]">Review requests, tune priorities, and dispatch technicians with one operational view.</p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </div>
                            <Link
                                to="/admin/maintenance/calendar"
                                className="bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm transition-all text-sm flex items-center gap-2"
                                className="bg-white border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:border-emerald-300 hover:text-emerald-700 transition-all text-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">event_available</span>
                                Schedule Visits
                            </Link>
                        </div>
                    </div>

                    <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <MaintenanceStatCard label="Requests" value={queue.length} accent="blue" />
                        <MaintenanceStatCard label="Emergency" value={queue.filter((item) => item.priority === "EMERGENCY").length} accent="red" />
                        <MaintenanceStatCard label="Assigned" value={queue.filter((item) => item.assignedTechnicianId).length} accent="emerald" />
                        <MaintenanceStatCard label="Open techs" value={techs.length} accent="slate" />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <MaintenanceSectionCard eyebrow="Filters" title="Queue filters" description="Filter the request queue by status, priority, or assigned technician.">
                            <div className="grid gap-4 md:grid-cols-3">
                                <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                                    <option value="">All statuses</option>
                                    <option value="REPORTED">Reported</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
                                    <option value="">All priorities</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="EMERGENCY">Emergency</option>
                                </select>
                                <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.technicianId} onChange={(e) => setFilters((prev) => ({ ...prev, technicianId: e.target.value }))}>
                                    <option value="">All technicians</option>
                                    {techs.map((tech) => (
                                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </MaintenanceSectionCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <MaintenanceSectionCard eyebrow="Queue" title="Maintenance requests" description="Assign technicians directly from the request list.">
                            <div className="overflow-hidden rounded-3xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="text-left p-3">Title</th>
                                            <th className="text-left p-3">Priority</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-left p-3">Technician</th>
                                            <th className="text-left p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {loading ? (
                                            <tr><td className="p-6 text-center text-slate-500" colSpan={5}>Loading queue...</td></tr>
                                        ) : queue.map((item) => (
                                            <tr key={item.id} className="border-t border-slate-200">
                                                <td className="p-3 font-medium text-slate-900">{item.title}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-2">
                                                        <MaintenanceBadge kind="priority" value={item.priority} />
                                                        <div className="flex gap-2">
                                                            <select
                                                                className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs"
                                                                value={priorityDrafts[item.id] || item.priority}
                                                                onChange={(e) => setPriorityDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                            >
                                                                <option value="LOW">Low</option>
                                                                <option value="MEDIUM">Medium</option>
                                                                <option value="HIGH">High</option>
                                                                <option value="EMERGENCY">Emergency</option>
                                                            </select>
                                                            <button type="button" className="rounded-xl border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700" onClick={() => savePriority(item.id)}>
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                                <td className="p-3">
                                                    <select
                                                        className="rounded-xl border border-slate-300 bg-white p-2"
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
                                                    <button className="rounded-xl bg-primary px-3 py-2 font-semibold text-white" onClick={() => assign(item.id)}>
                                                        Assign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!loading && queue.length === 0 ? <tr><td className="p-6 text-center text-slate-500" colSpan={5}>No requests in queue.</td></tr> : null}
                                    </tbody>
                                </table>
                            </div>
                        </MaintenanceSectionCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <MaintenanceSectionCard eyebrow="Technicians" title="Available technicians" description="Current staff available for assignment.">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {techs.map((tech) => {
                                    const assignedCount = queue.filter((item) => item.assignedTechnicianId === tech.id).length;
                                    return (
                                        <div key={tech.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-bold text-slate-900">{tech.fullName}</p>
                                            <p className="mt-1 text-sm text-slate-600">{tech.email}</p>
                                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Assigned requests</p>
                                            <p className="mt-1 text-2xl font-black text-slate-900">{assignedCount}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </MaintenanceSectionCard>
                    </motion.div>
                </motion.div>
                    </div>

                    <MaintenanceSectionCard eyebrow="Filters" title="Queue filters" description="Filter the request queue by status, priority, or assigned technician.">
                        <div className="grid gap-4 md:grid-cols-3">
                            <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                                <option value="">All statuses</option>
                                <option value="REPORTED">Reported</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
                                <option value="">All priorities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                            <select className="rounded-xl border border-slate-300 bg-white p-3" value={filters.technicianId} onChange={(e) => setFilters((prev) => ({ ...prev, technicianId: e.target.value }))}>
                                <option value="">All technicians</option>
                                {techs.map((tech) => (
                                    <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                ))}
                            </select>
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Queue" title="Maintenance requests" description="Assign technicians directly from the request list.">
                        <div className="overflow-hidden rounded-3xl border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="text-left p-3">Title</th>
                                        <th className="text-left p-3">Priority</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Technician</th>
                                        <th className="text-left p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {loading ? (
                                        <tr><td className="p-6 text-center text-slate-500" colSpan={5}>Loading queue...</td></tr>
                                    ) : queue.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-200">
                                            <td className="p-3 font-medium text-slate-900">{item.title}</td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-2">
                                                    <MaintenanceBadge kind="priority" value={item.priority} />
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs"
                                                            value={priorityDrafts[item.id] || item.priority}
                                                            onChange={(e) => setPriorityDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                            <option value="EMERGENCY">Emergency</option>
                                                        </select>
                                                        <button type="button" className="rounded-xl border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700" onClick={() => savePriority(item.id)}>
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                            <td className="p-3">
                                                <select
                                                    className="rounded-xl border border-slate-300 bg-white p-2"
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
                                                <button className="rounded-xl bg-primary px-3 py-2 font-semibold text-white" onClick={() => assign(item.id)}>
                                                    Assign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && queue.length === 0 ? <tr><td className="p-6 text-center text-slate-500" colSpan={5}>No requests in queue.</td></tr> : null}
                                </tbody>
                            </table>
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Technicians" title="Available technicians" description="Current staff available for assignment.">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {techs.map((tech) => {
                                const assignedCount = queue.filter((item) => item.assignedTechnicianId === tech.id).length;
                                return (
                                    <div key={tech.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-sm font-bold text-slate-900">{tech.fullName}</p>
                                        <p className="mt-1 text-sm text-slate-600">{tech.email}</p>
                                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Assigned requests</p>
                                        <p className="mt-1 text-2xl font-black text-slate-900">{assignedCount}</p>
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
