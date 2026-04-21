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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <MaintenanceSectionCard
                    eyebrow="Maintenance Tracking"
                    title="Track your request as it moves through maintenance"
                    description="This view follows the request from submitted to closed and shows who is assigned to the work."
                >
                    {!request ? (
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Unable to load request details.</p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Request {request.id}</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{request.title}</h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <MaintenanceBadge kind="priority" value={request.priority} />
                                        <MaintenanceBadge value={request.status} />
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{request.description || "No description provided."}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status timeline</p>
                                    <div className="mt-4 space-y-3">
                                        {MAINTENANCE_TIMELINE.map((stage, index) => {
                                            const active = index <= completedIndex;
                                            return (
                                                <div key={stage.key} className={`rounded-2xl border px-4 py-3 ${active ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em]">{stage.label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Assignment</p>
                                    <p className="mt-3 text-slate-700 dark:text-slate-200"><span className="font-semibold text-slate-900 dark:text-white">Technician:</span> {request.assignedTechnicianId || "Not assigned"}</p>
                                    <p className="mt-2 text-slate-700 dark:text-slate-200"><span className="font-semibold text-slate-900 dark:text-white">Scheduled:</span> {formatMaintenanceDate(request.scheduledAt)}</p>
                                    <p className="mt-2 text-slate-700 dark:text-slate-200"><span className="font-semibold text-slate-900 dark:text-white">Preferred:</span> {formatMaintenanceDate(request.preferredAt)}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Issue details</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Service: {request.serviceType}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Property: {request.propertyId}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Created: {formatMaintenanceDate(request.createdAt)}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Contact</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <a className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200" href={`mailto:${request.technicianEmail || "support@rentease.com"}`}>
                                            Email technician
                                        </a>
                                        <a className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200" href={`tel:${request.technicianPhone || "+94110000000"}`}>
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
