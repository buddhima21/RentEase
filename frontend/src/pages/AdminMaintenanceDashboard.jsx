import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MAINTENANCE_STATUS, PRIORITY_LEVELS, TECHNICIANS } from "../constants/maintenanceConstants";

export default function AdminMaintenanceDashboard() {
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [technicianFilter, setTechnicianFilter] = useState("all");

    const allRequests = [
        { id: "MR-2024-001", property: "Unit 3B", service: "Plumbing", priority: PRIORITY_LEVELS.HIGH, technician: "Maria Fernando", status: MAINTENANCE_STATUS.IN_PROGRESS, date: "2024-01-15" },
        { id: "MR-2024-002", property: "Unit 5A", service: "Electrical", priority: PRIORITY_LEVELS.MEDIUM, technician: "John Silva", status: MAINTENANCE_STATUS.ASSIGNED, date: "2024-01-16" },
        { id: "MR-2024-003", property: "Unit 8D", service: "HVAC", priority: PRIORITY_LEVELS.LOW, technician: "Unassigned", status: MAINTENANCE_STATUS.PENDING, date: "2024-01-16" }
    ];

    const applyFilters = () => {
        return allRequests.filter(req => {
            const matchesStatus = statusFilter === "all" || req.status === statusFilter;
            const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;
            const matchesTechnician = technicianFilter === "all" || req.technician === technicianFilter;
            return matchesStatus && matchesPriority && matchesTechnician;
        });
    };

    const requests = applyFilters();

    const toggleSelectRequest = (id) => {
        setSelectedRequests(prev => 
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedRequests(prev => 
            prev.length === requests.length ? [] : requests.map(r => r.id)
        );
    };

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
                {requests.filter(r => r.priority === PRIORITY_LEVELS.EMERGENCY || r.priority === PRIORITY_LEVELS.HIGH).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-red-600 text-3xl" aria-hidden="true">emergency</span>
                            <h2 className="text-xl font-bold">Priority Alerts</h2>
                        </div>
                        <div className="space-y-3">
                            {requests.filter(r => r.priority === PRIORITY_LEVELS.EMERGENCY || r.priority === PRIORITY_LEVELS.HIGH).map(alert => (
                                <div key={alert.id} className="bg-white p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{alert.service} - {alert.property}</p>
                                        <p className="text-sm text-slate-600">{alert.date}</p>
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
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <div className="flex gap-3 flex-wrap">
                            <select 
                                className="px-4 py-2 border rounded-xl"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                aria-label="Filter by priority"
                            >
                                <option value="all">All Priorities</option>
                                {Object.values(PRIORITY_LEVELS).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <select 
                                className="px-4 py-2 border rounded-xl"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="Filter by status"
                            >
                                <option value="all">All Status</option>
                                {Object.values(MAINTENANCE_STATUS).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <select 
                                className="px-4 py-2 border rounded-xl"
                                value={technicianFilter}
                                onChange={(e) => setTechnicianFilter(e.target.value)}
                                aria-label="Filter by technician"
                            >
                                <option value="all">All Technicians</option>
                                {TECHNICIANS.map(tech => (
                                    <option key={tech.id} value={tech.name}>{tech.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedRequests.length > 0 && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowAssignModal(true)}
                                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
                                >
                                    Assign Technician ({selectedRequests.length})
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
                                        <input 
                                            type="checkbox" 
                                            className="rounded" 
                                            checked={selectedRequests.length === requests.length && requests.length > 0}
                                            onChange={toggleSelectAll}
                                            aria-label="Select all requests"
                                        />
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
                                            <input 
                                                type="checkbox" 
                                                className="rounded" 
                                                checked={selectedRequests.includes(req.id)}
                                                onChange={() => toggleSelectRequest(req.id)}
                                                aria-label={`Select request ${req.id}`}
                                            />
                                        </td>
                                        <td className="py-4 px-2 font-semibold">{req.id}</td>
                                        <td className="py-4 px-2">{req.property}</td>
                                        <td className="py-4 px-2">{req.service}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                req.priority === PRIORITY_LEVELS.HIGH || req.priority === PRIORITY_LEVELS.EMERGENCY ? 'bg-red-100 text-red-700' :
                                                req.priority === PRIORITY_LEVELS.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2">{req.technician}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                req.status === MAINTENANCE_STATUS.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                                                req.status === MAINTENANCE_STATUS.ASSIGNED ? 'bg-purple-100 text-purple-700' :
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
                        {TECHNICIANS.map((tech) => (
                            <div key={tech.id} className="border rounded-xl p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold">{tech.name}</p>
                                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                                    </div>
                                    <span className="text-yellow-500" aria-label={`Rating ${tech.rating}`}>⭐ {tech.rating}</span>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Tasks Today: {tech.tasksToday} / 5</span>
                                        <span className={`font-semibold ${
                                            tech.workload === 'Low' ? 'text-green-600' : 
                                            tech.workload === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {tech.workload}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                tech.workload === 'Low' ? 'bg-green-600' : 
                                                tech.workload === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                                            }`}
                                            style={{ width: `${(tech.tasksToday / 5) * 100}%` }}
                                            role="progressbar"
                                            aria-valuenow={tech.tasksToday}
                                            aria-valuemin="0"
                                            aria-valuemax="5"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="assign-modal-title">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 id="assign-modal-title" className="text-2xl font-bold mb-4">Assign Technician</h2>
                        <p className="text-slate-600 mb-6">Recommended based on skill match and workload</p>
                        <div className="space-y-3 mb-6">
                            {TECHNICIANS.filter(t => t.workload !== 'High').map((tech) => (
                                <div key={tech.id} className="border-2 border-primary rounded-xl p-4 cursor-pointer hover:bg-teal-50">
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
                                    setShowAssignModal(false);
                                    setSelectedRequests([]);
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
