import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTechnicianMaintenance } from "../services/api";

export default function TechnicianDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getTechnicianMaintenance(user.id)
            .then((res) => setJobs(res.data?.data || []))
            .catch(() => setJobs([]));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Technician Dashboard</h1>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="text-left p-3">Job</th>
                                <th className="text-left p-3">Priority</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-t border-slate-200">
                                    <td className="p-3">{job.title}</td>
                                    <td className="p-3">{job.priority}</td>
                                    <td className="p-3">{job.status}</td>
                                    <td className="p-3">
                                        <Link to={`/technician/job/${job.id}`} className="text-emerald-700 font-semibold">Open</Link>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && <tr><td className="p-6 text-center text-slate-500" colSpan={4}>No assigned jobs.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
