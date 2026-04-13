import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTenantMaintenance } from "../services/api";

export default function MaintenanceHistory() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("ALL");

    useEffect(() => {
        if (!user?.id) return;
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    const filtered = useMemo(() => {
        const base = items.filter((x) => x.status === "RESOLVED" || x.status === "CLOSED");
        if (status === "ALL") return base;
        return base.filter((x) => x.status === status);
    }, [items, status]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black tracking-tight">Maintenance History</h1>
                    <select className="rounded-lg border border-slate-300 p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="ALL">All</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="text-left p-3">Request ID</th>
                                <th className="text-left p-3">Service</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200">
                                    <td className="p-3">{item.id}</td>
                                    <td className="p-3">{item.serviceType}</td>
                                    <td className="p-3">{item.updatedAt || item.createdAt}</td>
                                    <td className="p-3">{item.status}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td className="p-6 text-center text-slate-500" colSpan={4}>No completed maintenance records.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
