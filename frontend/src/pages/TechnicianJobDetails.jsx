import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { useAuth } from "../context/AuthContext";
import {
    acceptMaintenance,
    getMaintenanceById,
    pauseMaintenance,
    resolveMaintenance,
    resumeMaintenance,
} from "../services/api";
import { MAX_MAINTENANCE_IMAGES } from "../constants/maintenance";

const CHECKLIST_ITEMS = [
    "Inspect issue",
    "Test repaired component",
    "Clean work area",
    "Confirm tenant follow-up",
];

export default function TechnicianJobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [summary, setSummary] = useState("");
    const [notes, setNotes] = useState("");
    const [partsUsed, setPartsUsed] = useState("");
    const [completionImages, setCompletionImages] = useState([]);
    const [checklist, setChecklist] = useState([false, false, false, false]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const load = async () => {
        if (!jobId) {
            setError("Invalid job link. Please open the request from your dashboard.");
            setJob(null);
            return;
        }
        const res = await getMaintenanceById(jobId);
        const data = res.data?.data || null;
        if (!data) {
            setError("Unable to find this maintenance request.");
            setJob(null);
            return;
        }
        if (user?.role === "TECHNICIAN" && data.assignedTechnicianId && data.assignedTechnicianId !== user.id) {
            navigate("/technician/dashboard", { replace: true });
            return;
        }
        setError("");
        setJob(data);
    };

    useEffect(() => {
        load().catch(() => {
            setError("Unable to load this job right now. Please try again.");
            setJob(null);
        });
    }, [jobId, user?.id, user?.role]);

    const runAction = async (action, fallbackMessage, reloadAfter = true) => {
        setBusy(true);
        setError("");
        try {
            await action();
            if (reloadAfter) {
                await load();
            }
            return true;
        } catch (err) {
            setError(err?.response?.data?.message || fallbackMessage);
            return false;
        } finally {
            setBusy(false);
        }
    };

    const accept = async () => {
        await runAction(() => acceptMaintenance(jobId), "Unable to accept this request.");
    };

    const pause = async () => {
        await runAction(() => pauseMaintenance(jobId), "Unable to pause this request.");
    };

    const resume = async () => {
        await runAction(() => resumeMaintenance(jobId), "Unable to resume this request.");
    };

    const resolve = async () => {
        if (!summary.trim()) {
            setError("Completion summary is required before resolving.");
            return;
        }

        const success = await runAction(() => resolveMaintenance(jobId, {
            completionSummary: summary,
            technicianNotes: [
                notes,
                partsUsed ? `Parts used: ${partsUsed}` : "",
                `Checklist complete: ${checklist.every(Boolean) ? "yes" : "no"}`,
            ].filter(Boolean).join("\n"),
            completionImageUrls: completionImages,
        }), "Unable to resolve this request.", false);

        if (success) {
            navigate("/technician/dashboard");
        }
    };

    const handleChecklistToggle = (index) => {
        setChecklist((prev) => prev.map((checked, itemIndex) => (itemIndex === index ? !checked : checked)));
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        files.slice(0, MAX_MAINTENANCE_IMAGES - completionImages.length).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => setCompletionImages((prev) => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
    };

    const removeCompletionImage = (index) => {
        setCompletionImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
    };

    if (!job) {
        return <div className="min-h-screen bg-slate-50 p-8 text-slate-600">{error || "Unable to load job."}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <MaintenanceSectionCard
                    eyebrow="Technician Job"
                    title={job.title}
                    description="Review the issue, capture completion details, and move the request forward when the work is done."
                >
                    <div className="flex flex-wrap gap-2">
                        <MaintenanceBadge kind="priority" value={job.priority} />
                        <MaintenanceBadge value={job.status} />
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Issue details</p>
                                <p className="mt-3 text-slate-700"><span className="font-semibold text-slate-900">Service:</span> {job.serviceType}</p>
                                <p className="mt-2 text-slate-700"><span className="font-semibold text-slate-900">Description:</span> {job.description || "-"}</p>
                                <p className="mt-2 text-slate-700"><span className="font-semibold text-slate-900">Tenant:</span> {job.tenantName || job.tenantId || "-"}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Repair checklist</p>
                                <div className="mt-4 space-y-2">
                                    {CHECKLIST_ITEMS.map((item, index) => (
                                        <label key={`${item}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                            <input type="checkbox" checked={checklist[index]} onChange={() => handleChecklistToggle(index)} />
                                            <span className={checklist[index] ? "line-through text-slate-400" : ""}>{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Completion notes</p>
                                <div className="mt-4 space-y-3">
                                    <textarea className="w-full rounded-xl border border-slate-300 p-3 min-h-24" placeholder="Completion summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
                                    <textarea className="w-full rounded-xl border border-slate-300 p-3 min-h-24" placeholder="Technician notes" value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} />
                                    <input className="w-full rounded-xl border border-slate-300 p-3" placeholder="Parts used (optional)" maxLength={250} value={partsUsed} onChange={(e) => setPartsUsed(e.target.value)} />
                                </div>
                                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-semibold text-slate-700">Completion photos ({completionImages.length}/{MAX_MAINTENANCE_IMAGES})</p>
                                        <button type="button" className="text-sm font-semibold text-emerald-700" onClick={() => fileInputRef.current?.click()}>
                                            Add photos
                                        </button>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {completionImages.map((image, index) => (
                                            <div key={index} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                <img src={image} alt="completion" className="h-24 w-full object-cover" />
                                                <button type="button" onClick={() => removeCompletionImage(index)} className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {["REPORTED", "ASSIGNED", "SCHEDULED"].includes(job.status) ? (
                                        <button disabled={busy} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold disabled:opacity-60" onClick={accept}>Accept</button>
                                    ) : null}
                                    {job.status === "PAUSED" ? (
                                        <button disabled={busy} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold disabled:opacity-60" onClick={resume}>Resume</button>
                                    ) : job.status === "IN_PROGRESS" ? (
                                        <button disabled={busy} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold disabled:opacity-60" onClick={pause}>Pause</button>
                                    ) : null}
                                    <button disabled={busy || (job.status !== "IN_PROGRESS" && job.status !== "PAUSED")} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60" onClick={resolve}>Resolve Request</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Record</p>
                                <p className="mt-3 text-sm text-slate-700"><span className="font-semibold text-slate-900">Request ID:</span> {job.id}</p>
                                <p className="mt-2 text-sm text-slate-700"><span className="font-semibold text-slate-900">Property:</span> {job.propertyId || "-"}</p>
                                <p className="mt-2 text-sm text-slate-700"><span className="font-semibold text-slate-900">Tenant:</span> {job.tenantId || "-"}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Contact tenant</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href={`mailto:${job.tenantEmail || "support@rentease.com"}`}>
                                        Email tenant
                                    </a>
                                    <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href={`tel:${job.tenantPhone || "+94110000000"}`}>
                                        Call tenant
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
