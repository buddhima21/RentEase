import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTenantMaintenance } from "../services/api";

export default function TenantMaintenanceDashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex flex-wrap gap-3 justify-between items-center">
                    <h1 className="text-3xl font-black tracking-tight">Tenant Maintenance Dashboard</h1>
                    <div className="flex gap-2">
                        <Link to="/tenant/maintenance/request" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">New Request</Link>
                        <Link to="/tenant/maintenance/history" className="px-4 py-2 rounded-lg border border-slate-300 font-semibold">History</Link>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="text-left p-3">Title</th>
                                <th className="text-left p-3">Service</th>
                                <th className="text-left p-3">Priority</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200">
                                    <td className="p-3">{item.title}</td>
                                    <td className="p-3">{item.serviceType}</td>
                                    <td className="p-3">{item.priority}</td>
                                    <td className="p-3">{item.status}</td>
                                    <td className="p-3">
                                        <Link className="text-emerald-700 font-semibold" to={`/tenant/maintenance/track/${item.id}`}>Track</Link>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td className="p-6 text-center text-slate-500" colSpan={5}>No maintenance requests yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
