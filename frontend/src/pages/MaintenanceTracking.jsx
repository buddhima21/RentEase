import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MaintenanceTracking() {
    const { requestId } = useParams();

    const trackingSteps = [
        { status: "Request Submitted", time: "Jan 15, 2024 - 9:30 AM", completed: true },
        { status: "Technician Assigned", time: "Jan 15, 2024 - 9:45 AM", completed: true },
        { status: "Technician Traveling", time: "Jan 15, 2024 - 10:15 AM", completed: true },
        { status: "Repair In Progress", time: "Jan 15, 2024 - 10:45 AM", completed: true },
        { status: "Repair Completed", time: "Pending", completed: false }
    ];

    const technician = {
        name: "Maria Fernando",
        specialty: "Plumbing Expert",
        rating: 4.9,
        phone: "+94 77 123 4567",
        photo: ""
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Track Request</h1>
                <p className="text-slate-600 mb-8">Request ID: {requestId}</p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Tracking Timeline */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
                        <h2 className="text-xl font-bold mb-6">Request Status</h2>
                        <div className="space-y-6">
                            {trackingSteps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            step.completed ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            {step.completed ? (
                                                <span className="material-symbols-outlined">check</span>
                                            ) : (
                                                <span className="material-symbols-outlined">schedule</span>
                                            )}
                                        </div>
                                        {i < trackingSteps.length - 1 && (
                                            <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary' : 'bg-slate-200'}`}></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <p className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {step.status}
                                        </p>
                                        <p className="text-sm text-slate-500">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Issue Details */}
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="font-bold mb-3">Issue Description</h3>
                            <p className="text-slate-600 mb-4">Kitchen sink is leaking from the pipe connection underneath. Water drips continuously.</p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">High Priority</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Plumbing</span>
                            </div>
                        </div>
                    </div>

                    {/* Technician Card */}
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Technician</h2>
                        <div className="text-center mb-4">
                            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-3"></div>
                            <h3 className="font-bold text-lg">{technician.name}</h3>
                            <p className="text-sm text-slate-600">{technician.specialty}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-semibold">{technician.rating}</span>
                            </div>
                        </div>
                        <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">call</span>
                            Contact Technician
                        </button>

                        {/* Estimated Arrival */}
                        <div className="mt-6 p-4 bg-teal-50 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Estimated Completion</p>
                            <p className="font-bold text-lg">Today, 12:30 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
