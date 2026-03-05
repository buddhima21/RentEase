import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MaintenanceRequestForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        serviceType: "",
        property: "",
        description: "",
        priority: "Medium",
        preferredDate: "",
        photos: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: API call to backend
        alert("Request submitted successfully!");
        navigate("/tenant/maintenance/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Request Maintenance</h1>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
                    <div>
                        <label className="block font-semibold mb-2">Service Type *</label>
                        <select 
                            className="w-full px-4 py-3 border rounded-xl"
                            value={formData.serviceType}
                            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                            required
                        >
                            <option value="">Select service type</option>
                            <option value="Electrical">Electrical Repairs</option>
                            <option value="Plumbing">Plumbing Services</option>
                            <option value="HVAC">HVAC Maintenance</option>
                            <option value="Appliance">Appliance Repair</option>
                            <option value="Painting">Painting</option>
                            <option value="Handyman">General Handyman</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Property / Unit *</label>
                        <select 
                            className="w-full px-4 py-3 border rounded-xl"
                            value={formData.property}
                            onChange={(e) => setFormData({...formData, property: e.target.value})}
                            required
                        >
                            <option value="">Select property</option>
                            <option value="Unit 3B">Unit 3B - Colombo 04</option>
                            <option value="Unit 5A">Unit 5A - Malabe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Priority Level *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["Low", "Medium", "High"].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({...formData, priority: level})}
                                    className={`py-3 rounded-xl font-semibold border-2 transition-all ${
                                        formData.priority === level 
                                            ? 'border-primary bg-primary text-white' 
                                            : 'border-slate-200 hover:border-primary'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Describe the Issue *</label>
                        <textarea 
                            className="w-full px-4 py-3 border rounded-xl"
                            rows="5"
                            placeholder="Please provide details about the maintenance issue..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Preferred Date & Time</label>
                        <input 
                            type="datetime-local"
                            className="w-full px-4 py-3 border rounded-xl"
                            value={formData.preferredDate}
                            onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Upload Photos (Optional)</label>
                        <div className="border-2 border-dashed rounded-xl p-8 text-center">
                            <span className="material-symbols-outlined text-slate-400 text-5xl mb-2">cloud_upload</span>
                            <p className="text-slate-600">Click to upload or drag and drop</p>
                            <input type="file" multiple accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="submit"
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90"
                        >
                            Submit Request
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 border rounded-xl font-semibold hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
