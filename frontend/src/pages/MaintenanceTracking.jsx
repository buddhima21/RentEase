import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaintenanceById } from "../services/api";

export default function MaintenanceTracking() {
    const { requestId } = useParams();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        if (!requestId) return;
        getMaintenanceById(requestId)
            .then((res) => setRequest(res.data?.data || null))
            .catch(() => setRequest(null));
    }, [requestId]);

    const stages = ["REPORTED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
                <h1 className="text-2xl font-black tracking-tight">Maintenance Tracking</h1>
                {!request ? (
                    <p className="mt-4 text-slate-500">Unable to load request details.</p>
                ) : (
                    <>
                        <p className="mt-3 text-slate-700"><span className="font-bold">Title:</span> {request.title}</p>
                        <p className="text-slate-700"><span className="font-bold">Service:</span> {request.serviceType}</p>
                        <p className="text-slate-700"><span className="font-bold">Technician:</span> {request.assignedTechnicianId || "Not assigned"}</p>
                        <p className="text-slate-700"><span className="font-bold">Scheduled:</span> {request.scheduledAt || "Not scheduled"}</p>

                        <div className="mt-6 grid gap-2">
                            {stages.map((stage) => {
                                const active = stages.indexOf(stage) <= stages.indexOf(request.status);
                                return (
                                    <div key={stage} className={`p-3 rounded-lg border ${active ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                                        {stage}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
