import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getOwnerMaintenance } from "../services/api";

export default function OwnerMaintenanceOverview() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getOwnerMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Owner Maintenance Overview</h1>
                <p className="text-slate-600">Read-only visibility for maintenance requests related to your properties.</p>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="text-left p-3">Request</th>
                                <th className="text-left p-3">Priority</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Technician</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200">
                                    <td className="p-3">{item.title}</td>
                                    <td className="p-3">{item.priority}</td>
                                    <td className="p-3">{item.status}</td>
                                    <td className="p-3">{item.assignedTechnicianId || "Unassigned"}</td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td className="p-6 text-center text-slate-500" colSpan={4}>No requests found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
