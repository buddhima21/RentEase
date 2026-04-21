import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTechnicianMaintenance } from "../services/api";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";

export default function TechnicianDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [tab, setTab] = useState("TODAY");

    useEffect(() => {
        if (!user?.id) return;
        getTechnicianMaintenance(user.id)
            .then((res) => setJobs(res.data?.data || []))
            .catch(() => setJobs([]));
    }, [user?.id]);

    const filteredJobs = jobs.filter((job) => {
        if (tab === "TODAY") return true;
        if (tab === "SCHEDULED") return Boolean(job.scheduledAt) && job.status !== "IN_PROGRESS";
        if (tab === "PENDING") return job.status === "REPORTED" || job.status === "PAUSED";
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Technician Dashboard</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Review your queue, switch between job buckets, and open a request to start work.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <MaintenanceStatCard label="Jobs" value={jobs.length} accent="blue" />
                    <MaintenanceStatCard label="Pending" value={jobs.filter((job) => job.status === "REPORTED").length} accent="amber" />
                    <MaintenanceStatCard label="In progress" value={jobs.filter((job) => job.status === "IN_PROGRESS").length} accent="emerald" />
                    <MaintenanceStatCard label="Emergency" value={jobs.filter((job) => job.priority === "EMERGENCY").length} accent="red" />
                </div>

                <MaintenanceSectionCard eyebrow="Queue" title="Work buckets" description="Use the tabs to focus on the jobs that matter right now.">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: "TODAY", label: "Today" },
                            { key: "SCHEDULED", label: "Scheduled" },
                            { key: "PENDING", label: "Pending" },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setTab(item.key)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item.key ? "bg-slate-900 text-white" : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="text-left p-3">Job</th>
                                    <th className="text-left p-3">Priority</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900">
                                {filteredJobs.map((job) => (
                                    <tr key={job.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-slate-900 dark:text-white">{job.title}</td>
                                        <td className="p-3"><MaintenanceBadge kind="priority" value={job.priority} /></td>
                                        <td className="p-3"><MaintenanceBadge value={job.status} /></td>
                                        <td className="p-3">
                                            <Link to={`/technician/job/${job.id}`} className="font-semibold text-emerald-700">
                                                Open
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredJobs.length === 0 && <tr><td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={4}>No assigned jobs.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </MaintenanceSectionCard>
            </div>
        </div>
    );
}
