import { useEffect, useState } from "react";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import {
    assignMaintenanceTechnician,
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
    updateMaintenancePriority,
} from "../services/api";

export default function AdminMaintenanceDashboard() {
    const [queue, setQueue] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedTechByRequest, setSelectedTechByRequest] = useState({});
    const [filters, setFilters] = useState({ status: "", priority: "", technicianId: "" });
    const [loading, setLoading] = useState(false);
    const [priorityDrafts, setPriorityDrafts] = useState({});

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

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Maintenance Dashboard</h1>
                    <p className="mt-2 text-slate-600">Review the queue, assign technicians, and keep the maintenance pipeline moving.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <MaintenanceStatCard label="Requests" value={queue.length} accent="blue" />
                    <MaintenanceStatCard label="Emergency" value={queue.filter((item) => item.priority === "EMERGENCY").length} accent="red" />
                    <MaintenanceStatCard label="Assigned" value={queue.filter((item) => item.assignedTechnicianId).length} accent="emerald" />
                    <MaintenanceStatCard label="Open techs" value={techs.length} accent="slate" />
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
        </div>
    );
}
