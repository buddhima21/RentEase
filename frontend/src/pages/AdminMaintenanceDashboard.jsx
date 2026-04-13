import { useEffect, useState } from "react";
import {
    assignMaintenanceTechnician,
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
} from "../services/api";

export default function AdminMaintenanceDashboard() {
    const [queue, setQueue] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedTechByRequest, setSelectedTechByRequest] = useState({});

    const load = async () => {
        try {
            const [queueRes, techRes] = await Promise.all([
                getAdminMaintenanceQueue(),
                getMaintenanceTechnicians(),
            ]);
            setQueue(queueRes.data?.data || []);
            setTechs(techRes.data?.data || []);
        } catch {
            setQueue([]);
            setTechs([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const assign = async (requestId) => {
        const technicianId = selectedTechByRequest[requestId];
        if (!technicianId) return;
        await assignMaintenanceTechnician(requestId, { technicianId });
        load();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Admin Maintenance Dashboard</h1>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
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
                        <tbody>
                            {queue.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200">
                                    <td className="p-3">{item.title}</td>
                                    <td className="p-3">{item.priority}</td>
                                    <td className="p-3">{item.status}</td>
                                    <td className="p-3">
                                        <select
                                            className="rounded-lg border border-slate-300 p-2"
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
                                        <button className="px-3 py-2 rounded-lg bg-primary text-white font-semibold" onClick={() => assign(item.id)}>
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {queue.length === 0 && <tr><td className="p-6 text-center text-slate-500" colSpan={5}>No requests in queue.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
