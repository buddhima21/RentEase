import { useEffect, useMemo, useState } from "react";
import { getAdminMaintenanceQueue } from "../services/api";

export default function MaintenanceCalendar() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        getAdminMaintenanceQueue()
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));
    }, []);

    const scheduled = useMemo(
        () => items.filter((x) => x.scheduledAt).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
        [items]
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
                <h1 className="text-3xl font-black tracking-tight">Maintenance Calendar</h1>
                <p className="mt-2 text-slate-600">Scheduled maintenance visits</p>
                <div className="mt-6 space-y-3">
                    {scheduled.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-600">{item.serviceType} • {item.scheduledAt}</p>
                            <p className="text-sm text-slate-600">Technician: {item.assignedTechnicianId || "Unassigned"}</p>
                        </div>
                    ))}
                    {scheduled.length === 0 && <p className="text-slate-500">No scheduled visits yet.</p>}
                </div>
            </div>
        </div>
    );
}
