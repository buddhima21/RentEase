import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function TechnicianJobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState([
        { task: "Inspect Issue", completed: true },
        { task: "Shut Off Utilities", completed: true },
        { task: "Repair Component", completed: false },
        { task: "Test Functionality", completed: false }
    ]);

    const toggleChecklistItem = (index) => {
        const updated = [...checklist];
        updated[index].completed = !updated[index].completed;
        setChecklist(updated);
    };

    const handleFinishRepair = () => {
        // TODO: API call
        alert("Repair completed successfully!");
        navigate("/technician/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-primary mb-6">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-2">Job Details</h1>
                <p className="text-slate-600 mb-8">Request ID: {jobId}</p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Issue Details */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Issue Description</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-slate-600">Service Type</p>
                                    <p className="font-semibold">Plumbing</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Property</p>
                                    <p className="font-semibold">Unit 3B, Colombo 04</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Issue</p>
                                    <p className="font-semibold">Kitchen sink is leaking from the pipe connection underneath. Water drips continuously.</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Tenant Notes</p>
                                    <p className="text-slate-700">Started leaking yesterday evening. Getting worse.</p>
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 mb-2">Photos</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="aspect-square bg-slate-200 rounded-xl"></div>
                                    <div className="aspect-square bg-slate-200 rounded-xl"></div>
                                </div>
                            </div>
                        </div>

                        {/* Repair Checklist */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Repair Checklist</h2>
                            <div className="space-y-3">
                                {checklist.map((item, i) => (
                                    <label key={i} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={() => toggleChecklistItem(i)}
                                            className="w-5 h-5 text-primary rounded"
                                        />
                                        <span className={item.completed ? 'line-through text-slate-400' : 'font-semibold'}>
                                            {item.task}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Completion Form */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Complete Repair</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-semibold mb-2">Repair Summary</label>
                                    <textarea 
                                        className="w-full px-4 py-3 border rounded-xl"
                                        rows="4"
                                        placeholder="Describe what was done..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Parts Used</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-3 border rounded-xl"
                                        placeholder="List parts and materials..."
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Upload Photos</label>
                                    <div className="border-2 border-dashed rounded-xl p-6 text-center">
                                        <span className="material-symbols-outlined text-slate-400 text-4xl">cloud_upload</span>
                                        <p className="text-sm text-slate-600">Upload completion photos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h3 className="font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Start Travel
                                </button>
                                <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">build</span>
                                    Start Repair
                                </button>
                                <button className="w-full bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold hover:bg-yellow-200 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">pause</span>
                                    Pause Work
                                </button>
                                <button 
                                    onClick={handleFinishRepair}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Finish Repair
                                </button>
                            </div>
                        </div>

                        {/* Tenant Info */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h3 className="font-bold mb-4">Tenant Contact</h3>
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-2"></div>
                                <p className="font-semibold">Kasun Perera</p>
                                <p className="text-sm text-slate-600">+94 77 123 4567</p>
                            </div>
                            <button className="w-full border py-2 rounded-xl font-semibold hover:bg-slate-50">
                                Call Tenant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
