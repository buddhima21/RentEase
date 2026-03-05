import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminMaintenanceDashboard() {
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const priorityAlerts = [
        { id: "MR-2024-004", issue: "Power outage", property: "Unit 7C", time: "5 mins ago", priority: "Emergency" },
        { id: "MR-2024-005", issue: "Water leak", property: "Unit 2A", time: "15 mins ago", priority: "High" }
    ];

    const requests = [
        { id: "MR-2024-001", property: "Unit 3B", service: "Plumbing", priority: "High", technician: "Maria Fernando", status: "In Progress", date: "2024-01-15" },
        { id: "MR-2024-002", property: "Unit 5A", service: "Electrical", priority: "Medium", technician: "John Silva", status: "Assigned", date: "2024-01-16" },
        { id: "MR-2024-003", property: "Unit 8D", service: "HVAC", priority: "Low", technician: "Unassigned", status: "Pending", date: "2024-01-16" }
    ];

    const technicians = [
        { name: "John Silva", specialty: "Electrical", rating: 4.8, workload: "Low", tasksToday: 2 },
        { name: "Maria Fernando", specialty: "Plumbing", rating: 4.9, workload: "Medium", tasksToday: 4 },
        { name: "Kasun Perera", specialty: "HVAC", rating: 4.7, workload: "Low", tasksToday: 1 }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Maintenance Management</h1>
                    <Link to="/admin/maintenance/calendar" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2">
                        <span className="material-symbols-outlined">calendar_month</span>
                        View Calendar
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-red-600">2</p>
                        <p className="text-slate-600">Emergency</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-orange-600">4</p>
                        <p className="text-slate-600">High Priority</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-primary">12</p>
                        <p className="text-slate-600">Active Requests</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-blue-600">8</p>
                        <p className="text-slate-600">Technicians</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-green-600">156</p>
                        <p className="text-slate-600">Completed</p>
                    </div>
                </div>

                {/* Priority Alerts */}
                {priorityAlerts.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-red-600 text-3xl">emergency</span>
                            <h2 className="text-xl font-bold">Priority Alerts</h2>
                        </div>
                        <div className="space-y-3">
                            {priorityAlerts.map(alert => (
                                <div key={alert.id} className="bg-white p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{alert.issue}</p>
                                        <p className="text-sm text-slate-600">{alert.property} • {alert.time}</p>
                                    </div>
                                    <button className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700">
                                        Assign Technician
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters & Actions */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-3">
                            <select className="px-4 py-2 border rounded-xl">
                                <option>All Priorities</option>
                                <option>Emergency</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                            <select className="px-4 py-2 border rounded-xl">
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Assigned</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                            <select className="px-4 py-2 border rounded-xl">
                                <option>All Technicians</option>
                                <option>John Silva</option>
                                <option>Maria Fernando</option>
                            </select>
                        </div>
                        {selectedRequests.length > 0 && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowAssignModal(true)}
                                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
                                >
                                    Assign Technician
                                </button>
                                <button className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50">
                                    Change Priority
                                </button>
                                <button className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50">
                                    Export
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Requests Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="pb-3 px-2">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="pb-3 px-2 font-semibold">Request ID</th>
                                    <th className="pb-3 px-2 font-semibold">Property</th>
                                    <th className="pb-3 px-2 font-semibold">Service</th>
                                    <th className="pb-3 px-2 font-semibold">Priority</th>
                                    <th className="pb-3 px-2 font-semibold">Technician</th>
                                    <th className="pb-3 px-2 font-semibold">Status</th>
                                    <th className="pb-3 px-2 font-semibold">Date</th>
                                    <th className="pb-3 px-2 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id} className="border-b hover:bg-slate-50">
                                        <td className="py-4 px-2">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="py-4 px-2 font-semibold">{req.id}</td>
                                        <td className="py-4 px-2">{req.property}</td>
                                        <td className="py-4 px-2">{req.service}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                req.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2">{req.technician}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                req.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-sm">{req.date}</td>
                                        <td className="py-4 px-2">
                                            <button className="text-primary hover:underline text-sm font-semibold">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Technician Workload */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Technician Workload</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {technicians.map((tech, i) => (
                            <div key={i} className="border rounded-xl p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold">{tech.name}</p>
                                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                                    </div>
                                    <span className="text-yellow-500">⭐ {tech.rating}</span>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Tasks Today: {tech.tasksToday} / 5</span>
                                        <span className={`font-semibold ${
                                            tech.workload === 'Low' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                            {tech.workload}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                tech.workload === 'Low' ? 'bg-green-600' : 'bg-yellow-600'
                                            }`}
                                            style={{ width: `${(tech.tasksToday / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">Assign Technician</h2>
                        <p className="text-slate-600 mb-6">Recommended based on skill match and workload</p>
                        <div className="space-y-3 mb-6">
                            {technicians.filter(t => t.workload === 'Low').map((tech, i) => (
                                <div key={i} className="border-2 border-primary rounded-xl p-4 cursor-pointer hover:bg-teal-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold">{tech.name}</p>
                                            <p className="text-sm text-slate-600">{tech.specialty}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                            {tech.workload} Workload
                                        </span>
                                    </div>
                                    <p className="text-sm">⭐ {tech.rating} • {tech.tasksToday} tasks today</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 border py-3 rounded-xl font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    alert("Technician assigned!");
                                    setShowAssignModal(false);
                                }}
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
