import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function TenantMaintenanceDashboard() {
    const activeRequests = [
        { id: "MR-2024-001", service: "Plumbing", property: "Unit 3B", status: "In Progress", priority: "High", technician: "Maria Fernando", date: "2024-01-15" },
        { id: "MR-2024-002", service: "Electrical", property: "Unit 3B", status: "Assigned", priority: "Medium", technician: "John Silva", date: "2024-01-16" }
    ];

    const scheduledVisits = [
        { service: "AC Maintenance", date: "Tomorrow", time: "10:00 AM", technician: "Kasun Perera" }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
                    <Link to="/tenant/maintenance/request" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90">
                        + Request Maintenance
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl">pending</span>
                            <div>
                                <p className="text-2xl font-bold">2</p>
                                <p className="text-sm text-slate-600">Active Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                            <div>
                                <p className="text-2xl font-bold">8</p>
                                <p className="text-sm text-slate-600">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-600 text-3xl">calendar_today</span>
                            <div>
                                <p className="text-2xl font-bold">1</p>
                                <p className="text-sm text-slate-600">Scheduled</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-600 text-3xl">emergency</span>
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-slate-600">Emergency</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Visits */}
                {scheduledVisits.length > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-xl mb-8">
                        <h3 className="font-bold mb-2">Upcoming Visit</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{scheduledVisits[0].service}</p>
                                <p className="text-sm text-slate-600">{scheduledVisits[0].date} at {scheduledVisits[0].time}</p>
                                <p className="text-sm text-slate-600">Technician: {scheduledVisits[0].technician}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 border rounded-xl hover:bg-white">Reschedule</button>
                                <button className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90">Contact</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Requests */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Active Requests</h2>
                    <div className="space-y-4">
                        {activeRequests.map(req => (
                            <div key={req.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg">{req.id}</p>
                                        <p className="text-slate-600">{req.service} - {req.property}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {req.priority}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                    <span>Status: <span className="font-semibold text-primary">{req.status}</span></span>
                                    <span>Technician: {req.technician}</span>
                                    <span>Date: {req.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/tenant/maintenance/track/${req.id}`} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90">
                                        Track Request
                                    </Link>
                                    <button className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-slate-50">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Maintenance History Link */}
                <div className="mt-8 text-center">
                    <Link to="/tenant/maintenance/history" className="text-primary font-semibold hover:underline">
                        View Full Maintenance History →
                    </Link>
                </div>
            </div>
        </div>
    );
}
