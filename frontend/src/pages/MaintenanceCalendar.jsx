import { useState } from "react";
import Navbar from "../components/Navbar";
import { TECHNICIANS } from "../constants/maintenanceConstants";

export default function MaintenanceCalendar() {
    const [selectedDate, setSelectedDate] = useState("2024-01-15");
    const [currentMonth] = useState(new Date(2024, 0, 1));

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(currentMonth);

    const schedule = {
        "2024-01-15": [
            { time: "10:00 AM", service: "AC Repair", unit: "Unit 3B", technician: "Kasun Perera", status: "Scheduled" },
            { time: "1:00 PM", service: "Electrical Repair", unit: "Unit 5A", technician: "John Silva", status: "In Progress" },
            { time: "3:00 PM", service: "Plumbing", unit: "Unit 2C", technician: "Maria Fernando", status: "Scheduled" }
        ],
        "2024-01-16": [
            { time: "9:00 AM", service: "HVAC Maintenance", unit: "Unit 7D", technician: "Kasun Perera", status: "Scheduled" }
        ]
    };

    const handleDateClick = (day) => {
        const newDate = `2024-01-${String(day).padStart(2, '0')}`;
        setSelectedDate(newDate);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Maintenance Calendar</h1>
                    <div className="flex gap-3">
                        <select className="px-4 py-2 border rounded-xl">
                            <option>All Technicians</option>
                            {technicians.map(tech => (
                                <option key={tech}>{tech}</option>
                            ))}
                        </select>
                        <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90">
                            + Schedule Visit
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Mini Calendar */}
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="font-bold mb-4">January 2024</h3>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">
                            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                                <div key={i} className="font-semibold text-slate-600">{day}</div>
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                const dateStr = `2024-01-${String(day).padStart(2, '0')}`;
                                const hasSchedule = schedule[dateStr];
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`p-2 rounded-lg hover:bg-teal-50 relative ${
                                            selectedDate === dateStr ? 'bg-primary text-white' : ''
                                        }`}
                                        aria-label={`Select ${dateStr}`}
                                        aria-pressed={selectedDate === dateStr}
                                    >
                                        {day}
                                        {hasSchedule && (
                                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" aria-hidden="true"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Schedule View */}
                    <div className="md:col-span-3 bg-white rounded-2xl shadow p-6">
                        <h2 className="text-xl font-bold mb-6">{formatDate(selectedDate)}</h2>
                        
                        {/* Timeline */}
                        {schedule[selectedDate] && schedule[selectedDate].length > 0 ? (
                            <div className="space-y-4">
                                {schedule[selectedDate].map((item, i) => (
                                    <div key={i} className="flex gap-4 border-l-4 border-primary pl-4 py-3">
                                        <div className="w-24 flex-shrink-0">
                                            <p className="font-bold text-primary">{item.time}</p>
                                        </div>
                                        <div className="flex-1 bg-teal-50 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">{item.service}</p>
                                                    <p className="text-sm text-slate-600">{item.unit}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="material-symbols-outlined text-slate-600 text-sm" aria-hidden="true">person</span>
                                                <span className="text-slate-600">{item.technician}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <span className="material-symbols-outlined text-6xl mb-4">event_busy</span>
                                <p>No scheduled maintenance for this date</p>
                            </div>
                        )}

                        {/* Empty slots */}
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-slate-500 text-sm">Available time slots: 9:00 AM, 11:00 AM, 2:00 PM, 4:00 PM</p>
                        </div>
                    </div>
                </div>

                {/* Technician Availability */}
                <div className="mt-6 bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Technician Availability</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {TECHNICIANS.map(tech => (
                            <div key={tech.id} className="border rounded-xl p-4">
                                <p className="font-bold mb-2">{tech.name}</p>
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <span className={`w-3 h-3 rounded-full ${
                                        tech.workload === 'High' ? 'bg-red-500' : 'bg-green-500'
                                    }`} aria-hidden="true"></span>
                                    <span className="text-slate-600">{tech.workload === 'High' ? 'Busy' : 'Available'}</span>
                                </div>
                                <p className="text-sm text-slate-500">{tech.tasksToday} appointments today</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
