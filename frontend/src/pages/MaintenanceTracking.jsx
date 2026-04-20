import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { MAINTENANCE_TIMELINE, formatMaintenanceDate } from "../constants/maintenance";
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

    const completedIndex = Math.max(MAINTENANCE_TIMELINE.findIndex((stage) => stage.key === request?.status), 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <MaintenanceSectionCard
                    eyebrow="Maintenance Tracking"
                    title="Track your request as it moves through maintenance"
                    description="This view follows the request from submitted to closed and shows who is assigned to the work."
                >
                    {!request ? (
                        <p className="mt-4 text-slate-500">Unable to load request details.</p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Request {request.id}</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{request.title}</h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <MaintenanceBadge kind="priority" value={request.priority} />
                                        <MaintenanceBadge value={request.status} />
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-slate-600">{request.description || "No description provided."}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Status timeline</p>
                                    <div className="mt-4 space-y-3">
                                        {MAINTENANCE_TIMELINE.map((stage, index) => {
                                            const active = index <= completedIndex;
                                            return (
                                                <div key={stage.key} className={`rounded-2xl border px-4 py-3 ${active ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em]">{stage.label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {Array.isArray(request.workflowEvents) && request.workflowEvents.length > 0 ? (
                                        <div className="mt-5 border-t border-slate-200 pt-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Event history</p>
                                            <div className="mt-3 space-y-2">
                                                {request.workflowEvents
                                                    .slice()
                                                    .sort((a, b) => new Date(b.occurredAt || 0).getTime() - new Date(a.occurredAt || 0).getTime())
                                                    .map((event, idx) => (
                                                        <div key={`${event.action || "event"}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                                            <p className="text-xs font-semibold text-slate-700">{event.action || "Workflow update"}</p>
                                                            <p className="mt-1 text-xs text-slate-500">{formatMaintenanceDate(event.occurredAt)}</p>
                                                            {event.note ? <p className="mt-1 text-xs text-slate-600">{event.note}</p> : null}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Assignment</p>
                                    <p className="mt-3 text-slate-700"><span className="font-semibold text-slate-900">Technician:</span> {request.technicianName || request.assignedTechnicianId || "Not assigned"}</p>
                                    <p className="mt-2 text-slate-700"><span className="font-semibold text-slate-900">Scheduled:</span> {formatMaintenanceDate(request.scheduledAt)}</p>
                                    <p className="mt-2 text-slate-700"><span className="font-semibold text-slate-900">Preferred:</span> {formatMaintenanceDate(request.preferredAt)}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Issue details</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">Service: {request.serviceType}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">Property: {request.propertyId}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">Created: {formatMaintenanceDate(request.createdAt)}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Contact</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href={`mailto:${request.technicianEmail || "support@rentease.com"}`}>
                                            Email technician
                                        </a>
                                        <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href={`tel:${request.technicianPhone || "+94110000000"}`}>
                                            Call technician
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
