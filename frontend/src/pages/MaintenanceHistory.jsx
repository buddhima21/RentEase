import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { formatMaintenanceDate, toLocalDateInputValue } from "../constants/maintenance";
import { getTenantMaintenance } from "../services/api";

export default function MaintenanceHistory() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("ALL");
    const [service, setService] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        if (!user?.id) return;
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, [user?.id]);

    const filtered = useMemo(() => {
        const base = items.filter((x) => x.status === "RESOLVED" || x.status === "CLOSED");
        return base.filter((x) => {
            const matchesStatus = status === "ALL" || x.status === status;
            const matchesService = service === "ALL" || x.serviceType === service;
            const createdAt = x.createdAt ? new Date(x.createdAt) : null;
            const createdKey = createdAt ? toLocalDateInputValue(createdAt) : "";
            const matchesFrom = !fromDate || !createdKey || createdKey >= fromDate;
            const matchesTo = !toDate || !createdKey || createdKey <= toDate;
            return matchesStatus && matchesService && matchesFrom && matchesTo;
        });
    }, [items, status, service, fromDate, toDate]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Maintenance History</h1>
                        <p className="mt-2 text-slate-600">Review closed and resolved requests, filtered by status.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <select className="rounded-xl border border-slate-300 bg-white p-3" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="ALL">All statuses</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select className="rounded-xl border border-slate-300 bg-white p-3" value={service} onChange={(e) => setService(e.target.value)}>
                        <option value="ALL">All services</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Appliance">Appliance</option>
                        <option value="Painting">Painting</option>
                        <option value="General Handyman">General Handyman</option>
                    </select>
                    <input className="rounded-xl border border-slate-300 bg-white p-3" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    <input className="rounded-xl border border-slate-300 bg-white p-3" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>

                <div className="flex justify-end">
                    <button type="button" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => { setStatus("ALL"); setService("ALL"); setFromDate(""); setToDate(""); }}>
                        Clear filters
                    </button>
                </div>

                <MaintenanceSectionCard eyebrow="Archive" title="Completed maintenance records" description="Use the filter to review the terminal history for each request.">
                    <div className="overflow-hidden rounded-3xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left p-3">Request ID</th>
                                    <th className="text-left p-3">Service</th>
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-200">
                                        <td className="p-3 font-medium text-slate-900">{item.id}</td>
                                        <td className="p-3 text-slate-600">{item.serviceType}</td>
                                        <td className="p-3 text-slate-600">{formatMaintenanceDate(item.updatedAt || item.createdAt)}</td>
                                        <td className="p-3"><MaintenanceBadge value={item.status} /></td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td className="p-6 text-center text-slate-500" colSpan={4}>No completed maintenance records.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
