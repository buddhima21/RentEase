import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import {
    MAINTENANCE_STEPS,
    MAINTENANCE_TERMINAL_STATES,
    formatMaintenanceDate,
} from "../constants/maintenance";
import { getMaintenanceById } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Helpers ─────────────────────────────────────────────────────────────────

function isFutureDate(value) {
    if (!value) return false;
    return new Date(value) > new Date();
}

function isOverdue(slaDueAt, status) {
    if (!slaDueAt) return false;
    if (["RESOLVED", "CLOSED", "CANCELLED"].includes(status)) return false;
    return new Date(slaDueAt) < new Date();
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }) {
    return (
        <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700 ${className}`} />
    );
}

function TrackerSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
                <SkeletonBlock className="h-40" />
                <SkeletonBlock className="h-72" />
            </div>
            <div className="space-y-4">
                <SkeletonBlock className="h-40" />
                <SkeletonBlock className="h-32" />
                <SkeletonBlock className="h-28" />
            </div>
        </div>
    );
}

// ── Step tracker ─────────────────────────────────────────────────────────────

function StepTracker({ status }) {
    // Find the last completed step index in the linear flow
    // PAUSED is a special case: it interrupts IN_PROGRESS, so we treat it as IN_PROGRESS level
    const effectiveStatus = status === "PAUSED" ? "IN_PROGRESS" : status;
    const activeIdx = MAINTENANCE_STEPS.findIndex((s) => s.key === effectiveStatus);
    const clampedActive = activeIdx === -1 ? 0 : activeIdx;

    return (
        <div className="relative mt-4">
            {/* Vertical connecting line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

            <ol className="space-y-0">
                {MAINTENANCE_STEPS.map((step, idx) => {
                    const done = idx < clampedActive;
                    const current = idx === clampedActive;
                    const future = idx > clampedActive;

                    return (
                        <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Icon circle */}
                            <div
                                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors
                                    ${done ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                                    ${current ? "border-emerald-500 bg-white dark:bg-slate-900 text-emerald-600" : ""}
                                    ${future ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-400" : ""}
                                `}
                            >
                                {done ? (
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: current ? "'FILL' 1" : "'FILL' 0" }}>
                                        {step.icon}
                                    </span>
                                )}
                            </div>

                            {/* Text */}
                            <div className="pt-1.5">
                                <p className={`text-sm font-bold ${current ? "text-emerald-700 dark:text-emerald-400" : done ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                                    {step.label}
                                    {current && status === "PAUSED" && (
                                        <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                            <span className="material-symbols-outlined text-xs">pause_circle</span>
                                            Paused
                                        </span>
                                    )}
                                </p>
                                {(done || current) && (
                                    <p className={`mt-0.5 text-xs leading-5 ${current ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

// ── Terminal state banner ─────────────────────────────────────────────────────

function TerminalBanner({ status, adminNotes }) {
    const meta = MAINTENANCE_TERMINAL_STATES[status];
    if (!meta) return null;

    const colorMap = {
        red:   "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20 text-red-700 dark:text-red-300",
        slate: "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        amber: "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    };

    return (
        <div className={`rounded-3xl border p-5 ${colorMap[meta.color] || colorMap.slate}`}>
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {meta.icon}
                </span>
                <div>
                    <p className="font-bold">{meta.label}</p>
                    <p className="mt-0.5 text-sm leading-5">{meta.description}</p>
                </div>
            </div>
            {adminNotes && (
                <div className="mt-4 rounded-2xl border border-current/20 bg-white/40 dark:bg-black/10 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">Admin note</p>
                    <p className="mt-1 text-sm leading-6">{adminNotes}</p>
                </div>
            )}
        </div>
    );
}

// ── Image gallery ─────────────────────────────────────────────────────────────

function ImageGallery({ images, label }) {
    if (!images || images.length === 0) return null;
    return (
        <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                    <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                    >
                        <img
                            src={src}
                            alt={`${label} ${i + 1}`}
                            className="h-20 w-20 rounded-xl border border-slate-200 dark:border-slate-700 object-cover hover:opacity-80 transition-opacity"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MaintenanceTracking() {
    const { requestId } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!requestId) return;
        setLoading(true);
        setError(false);
        getMaintenanceById(requestId)
            .then((res) => setRequest(res.data?.data || null))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [requestId]);

    const isTerminal = request && MAINTENANCE_TERMINAL_STATES[request.status];
    const isDone = request && (request.status === "RESOLVED" || request.status === "CLOSED");
    const overdue = request && isOverdue(request.slaDueAt, request.status);
    const upcomingVisit = request?.scheduledAt && isFutureDate(request.scheduledAt);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 space-y-6">

                {/* ── Back link + heading ── */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/tenant/maintenance/dashboard"
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to dashboard
                    </Link>
                </div>

                {/* ── Loading state ── */}
                {loading && <TrackerSkeleton />}

                {/* ── Error state ── */}
                {!loading && (error || !request) && (
                    <div className="rounded-3xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                        <p className="mt-3 font-semibold text-red-700 dark:text-red-300">Unable to load this request.</p>
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">It may have been removed or you may not have access.</p>
                    </div>
                )}

                {/* ── Main content ── */}
                {!loading && request && (
                    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

                        {/* ══ LEFT COLUMN ══ */}
                        <div className="space-y-5">

                            {/* Request card */}
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                                    {request.serviceType} · #{request.id?.slice(-8)}
                                </p>
                                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {request.title}
                                </h1>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <MaintenanceBadge kind="priority" value={request.priority} />
                                    <MaintenanceBadge value={request.status} />
                                    {overdue && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400">
                                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                            SLA Overdue
                                        </span>
                                    )}
                                </div>
                                {request.description && (
                                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                        {request.description}
                                    </p>
                                )}

                                {/* Submitted photos */}
                                <ImageGallery images={request.imageUrls} label="Submitted photos" />
                            </div>

                            {/* Terminal state banner (DECLINED / CANCELLED / PAUSED) */}
                            {isTerminal && (
                                <TerminalBanner status={request.status} adminNotes={request.adminNotes} />
                            )}

                            {/* Progress stepper — only when NOT fully terminal */}
                            {!isTerminal && (
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                                        Request progress
                                    </p>
                                    <StepTracker status={request.status} />
                                </div>
                            )}

                            {/* Completion card — only when RESOLVED or CLOSED */}
                            {isDone && (
                                <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                                            Work completed
                                        </p>
                                    </div>
                                    {request.completionSummary && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-500">Summary</p>
                                            <p className="mt-1.5 text-sm leading-6 text-emerald-900 dark:text-emerald-200">
                                                {request.completionSummary}
                                            </p>
                                        </div>
                                    )}
                                    {request.technicianNotes && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-500">Technician notes</p>
                                            <p className="mt-1.5 text-sm leading-6 text-emerald-900 dark:text-emerald-200">
                                                {request.technicianNotes}
                                            </p>
                                        </div>
                                    )}
                                    {/* Completion images */}
                                    <ImageGallery images={request.completionImageUrls} label="Completion photos" />
                                </div>
                            )}

                            {/* Workflow event log */}
                            {Array.isArray(request.workflowEvents) && request.workflowEvents.length > 0 && (
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Activity log</p>
                                    <div className="mt-4 space-y-2">
                                        {[...request.workflowEvents]
                                            .sort((a, b) => new Date(b.occurredAt || 0) - new Date(a.occurredAt || 0))
                                            .map((event, idx) => (
                                                <div key={`${event.action}-${idx}`} className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                                                    <span className="material-symbols-outlined mt-0.5 text-base text-slate-400" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                            {event.action || "Workflow update"}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                            {formatMaintenanceDate(event.occurredAt)}
                                                        </p>
                                                        {event.note && (
                                                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{event.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ══ RIGHT COLUMN ══ */}
                        <div className="space-y-4">

                            {/* Upcoming visit highlight */}
                            {upcomingVisit && (
                                <div className="rounded-3xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20 p-5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>event_upcoming</span>
                                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Upcoming visit</p>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                                        {formatMaintenanceDate(request.scheduledAt)}
                                    </p>
                                    {request.technicianName && (
                                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                            Technician: {request.technicianName}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Dispatch details */}
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Dispatch details</p>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined mt-0.5 text-base text-slate-400">person</span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Technician</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {request.technicianName || "Not yet assigned"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined mt-0.5 text-base text-slate-400">calendar_today</span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {request.scheduledAt ? formatMaintenanceDate(request.scheduledAt) : "Not yet scheduled"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined mt-0.5 text-base text-slate-400">schedule</span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Your preferred time</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {request.preferredAt ? formatMaintenanceDate(request.preferredAt) : "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    {request.slaDueAt && (
                                        <div className="flex items-start gap-2">
                                            <span className={`material-symbols-outlined mt-0.5 text-base ${overdue ? "text-red-500" : "text-slate-400"}`}>
                                                {overdue ? "warning" : "timer"}
                                            </span>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">SLA deadline</p>
                                                <p className={`text-sm font-semibold ${overdue ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
                                                    {formatMaintenanceDate(request.slaDueAt)}
                                                    {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {request.adminNotes && !isTerminal && (
                                        <div className="mt-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin note</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{request.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact card — only if technician assigned */}
                            {request.assignedTechnicianId && (
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Contact technician</p>
                                    <div className="mt-4 flex flex-col gap-2">
                                        {request.technicianEmail && (
                                            <a
                                                href={`mailto:${request.technicianEmail}`}
                                                className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                                                {request.technicianEmail}
                                            </a>
                                        )}
                                        {request.technicianPhone && (
                                            <a
                                                href={`tel:${request.technicianPhone}`}
                                                className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base text-slate-400">call</span>
                                                {request.technicianPhone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Issue details */}
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Issue details</p>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Service type</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{request.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatMaintenanceDate(request.createdAt)}</span>
                                    </div>
                                    {request.resolvedAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Resolved</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatMaintenanceDate(request.resolvedAt)}</span>
                                        </div>
                                    )}
                                    {request.closedAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Closed</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatMaintenanceDate(request.closedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
