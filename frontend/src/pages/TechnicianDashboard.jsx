import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TECHNICIANS } from "../constants/maintenanceConstants";

export default function TechnicianDashboard() {
    const [activeTab, setActiveTab] = useState("today");

    const currentTechnician = TECHNICIANS[1]; // John Silva

    const todayJobs = [
        { id: "MR-2024-001", issue: "Kitchen sink leak", property: "Unit 3B, Colombo 04", priority: "High", time: "10:45 AM", status: "In Progress" },
        { id: "MR-2024-003", issue: "AC not cooling", property: "Unit 5A, Malabe", priority: "Medium", time: "2:00 PM", status: "Scheduled" }
    ];

    const emergencyJobs = [
        { id: "MR-2024-004", issue: "Power outage in unit", property: "Unit 7C, Colombo 03", priority: "Emergency", time: "Now", status: "Pending" }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
                        <p className="text-slate-600">Welcome back, {currentTechnician.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold">Available</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-primary">{currentTechnician.tasksToday}</p>
                        <p className="text-slate-600">Today's Jobs</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-yellow-600">{currentTechnician.tasksToday}/5</p>
                        <p className="text-slate-600">Workload ({currentTechnician.workload})</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-green-600">96</p>
                        <p className="text-slate-600">Completed Jobs</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-blue-600">{currentTechnician.rating}</p>
                        <p className="text-slate-600">Average Rating</p>
                    </div>
                </div>

                {/* Emergency Alert */}
                {emergencyJobs.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-xl mb-6" role="alert">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-symbols-outlined text-red-600 text-3xl" aria-hidden="true">emergency</span>
                            <h3 className="font-bold text-lg">Emergency Request</h3>
                        </div>
                        {emergencyJobs.map(job => (
                            <div key={job.id} className="bg-white p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold">{job.issue}</p>
                                        <p className="text-sm text-slate-600">{job.property}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                        {job.priority}
                                    </span>
                                </div>
                                <button className="w-full bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-700">
                                    Accept Emergency Job
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {["today", "scheduled", "pending"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl font-semibold capitalize ${
                                activeTab === tab ? 'bg-primary text-white' : 'bg-white hover:bg-slate-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Job Queue */}
                <div className="space-y-4">
                    {todayJobs.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg">{job.issue}</p>
                                    <p className="text-slate-600">{job.property}</p>
                                    <p className="text-sm text-slate-500 mt-1">Request ID: {job.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        job.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {job.priority}
                                    </span>
                                    <p className="text-sm text-slate-600 mt-2">{job.time}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                {job.status === "Scheduled" && (
                                    <>
                                        <button className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary/90">
                                            Accept Job
                                        </button>
                                        <Link to={`/technician/job/${job.id}`} className="px-6 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-center">
                                            View Details
                                        </Link>
                                    </>
                                )}
                                {job.status === "In Progress" && (
                                    <>
                                        <button className="flex-1 bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700">
                                            Finish Repair
                                        </button>
                                        <button className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200">
                                            Pause Work
                                        </button>
                                        <Link to={`/technician/job/${job.id}`} className="px-6 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-center">
                                            View Checklist
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
