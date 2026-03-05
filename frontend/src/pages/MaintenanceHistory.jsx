import { useState } from "react";
import Navbar from "../components/Navbar";

export default function MaintenanceHistory() {
    const [filter, setFilter] = useState("all");

    const history = [
        { id: "MR-2024-001", service: "Plumbing", date: "2024-01-15", technician: "Maria Fernando", status: "Completed", rating: 5 },
        { id: "MR-2023-098", service: "Electrical", date: "2023-12-20", technician: "John Silva", status: "Completed", rating: 4 },
        { id: "MR-2023-087", service: "HVAC", date: "2023-11-10", technician: "Kasun Perera", status: "Completed", rating: 5 },
        { id: "MR-2023-076", service: "Painting", date: "2023-10-05", technician: "Amal Silva", status: "Completed", rating: 4 }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Maintenance History</h1>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <div className="flex gap-3">
                        <select 
                            className="px-4 py-2 border rounded-xl"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Services</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="HVAC">HVAC</option>
                        </select>
                        <input 
                            type="date"
                            className="px-4 py-2 border rounded-xl"
                            placeholder="From Date"
                        />
                        <input 
                            type="date"
                            className="px-4 py-2 border rounded-xl"
                            placeholder="To Date"
                        />
                        <button className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-left">
                                <th className="py-4 px-6 font-semibold">Request ID</th>
                                <th className="py-4 px-6 font-semibold">Service Type</th>
                                <th className="py-4 px-6 font-semibold">Date</th>
                                <th className="py-4 px-6 font-semibold">Technician</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Rating</th>
                                <th className="py-4 px-6 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="py-4 px-6 font-semibold">{item.id}</td>
                                    <td className="py-4 px-6">{item.service}</td>
                                    <td className="py-4 px-6">{item.date}</td>
                                    <td className="py-4 px-6">{item.technician}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="font-semibold">{item.rating}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button className="text-primary hover:underline font-semibold">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-primary">12</p>
                        <p className="text-slate-600">Total Requests</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-green-600">10</p>
                        <p className="text-slate-600">Completed</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-yellow-600">4.6</p>
                        <p className="text-slate-600">Avg Rating</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-3xl font-bold text-blue-600">2.5h</p>
                        <p className="text-slate-600">Avg Response Time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
