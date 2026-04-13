import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    acceptMaintenance,
    getMaintenanceById,
    resolveMaintenance,
    startMaintenance,
} from "../services/api";

export default function TechnicianJobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [summary, setSummary] = useState("");
    const [notes, setNotes] = useState("");

    const load = async () => {
        if (!jobId) return;
        const res = await getMaintenanceById(jobId);
        setJob(res.data?.data || null);
    };

    useEffect(() => {
        load().catch(() => setJob(null));
    }, [jobId]);

    const accept = async () => {
        await acceptMaintenance(jobId);
        await load();
    };

    const start = async () => {
        await startMaintenance(jobId);
        await load();
    };

    const resolve = async () => {
        if (!summary.trim()) return;
        await resolveMaintenance(jobId, { completionSummary: summary, technicianNotes: notes, completionImageUrls: [] });
        navigate("/technician/dashboard");
    };

    if (!job) {
        return <div className="min-h-screen bg-slate-50 p-8 text-slate-600">Unable to load job.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Technician Job Details</h1>
                <p><span className="font-bold">Title:</span> {job.title}</p>
                <p><span className="font-bold">Service:</span> {job.serviceType}</p>
                <p><span className="font-bold">Description:</span> {job.description || "-"}</p>
                <p><span className="font-bold">Status:</span> {job.status}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                    <button className="px-4 py-2 rounded-lg border border-slate-300 font-semibold" onClick={accept}>Accept</button>
                    <button className="px-4 py-2 rounded-lg border border-slate-300 font-semibold" onClick={start}>Start</button>
                </div>

                <div className="space-y-2 pt-4">
                    <textarea className="w-full rounded-xl border border-slate-300 p-3 min-h-24" placeholder="Completion summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
                    <textarea className="w-full rounded-xl border border-slate-300 p-3 min-h-24" placeholder="Technician notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <button className="px-5 py-3 rounded-xl bg-primary text-white font-semibold" onClick={resolve}>Resolve Request</button>
                </div>
            </div>
        </div>
    );
}
