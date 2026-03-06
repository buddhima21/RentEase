import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SERVICE_TYPES, PRIORITY_LEVELS } from "../constants/maintenanceConstants";

export default function MaintenanceRequestForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const isEmergency = location.pathname.includes("emergency");
    
    const [formData, setFormData] = useState({
        serviceType: "",
        property: "",
        description: "",
        priority: isEmergency ? PRIORITY_LEVELS.EMERGENCY : PRIORITY_LEVELS.MEDIUM,
        preferredDate: "",
        photos: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.serviceType) newErrors.serviceType = "Service type is required";
        if (!formData.property) newErrors.property = "Property is required";
        if (!formData.description || formData.description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + uploadedFiles.length > 5) {
            setErrors({ ...errors, photos: "Maximum 5 photos allowed" });
            return;
        }
        setUploadedFiles([...uploadedFiles, ...files]);
        setFormData({ ...formData, photos: [...formData.photos, ...files.map(f => f.name)] });
    };

    const removeFile = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        setFormData({ ...formData, photos: newFiles.map(f => f.name) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            // TODO: API call to backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate("/tenant/maintenance/dashboard");
        } catch (error) {
            setErrors({ submit: "Failed to submit request. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                {isEmergency && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl mb-6" role="alert">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600">emergency</span>
                            <p className="font-bold text-red-900">Emergency Request - Priority Response</p>
                        </div>
                    </div>
                )}
                <h1 className="text-3xl font-bold mb-8">{isEmergency ? "Emergency" : "Request"} Maintenance</h1>
                
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
                        {errors.submit}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
                    <div>
                        <label htmlFor="serviceType" className="block font-semibold mb-2">Service Type *</label>
                        <select 
                            id="serviceType"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.serviceType ? 'border-red-500' : ''}`}
                            value={formData.serviceType}
                            onChange={(e) => {
                                setFormData({...formData, serviceType: e.target.value});
                                setErrors({...errors, serviceType: ''});
                            }}
                            required
                            aria-invalid={errors.serviceType ? "true" : "false"}
                            aria-describedby={errors.serviceType ? "serviceType-error" : undefined}
                        >
                            <option value="">Select service type</option>
                            {SERVICE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {errors.serviceType && (
                            <p id="serviceType-error" className="text-red-500 text-sm mt-1" role="alert">{errors.serviceType}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="property" className="block font-semibold mb-2">Property / Unit *</label>
                        <select 
                            id="property"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.property ? 'border-red-500' : ''}`}
                            value={formData.property}
                            onChange={(e) => {
                                setFormData({...formData, property: e.target.value});
                                setErrors({...errors, property: ''});
                            }}
                            required
                            aria-invalid={errors.property ? "true" : "false"}
                            aria-describedby={errors.property ? "property-error" : undefined}
                        >
                            <option value="">Select property</option>
                            <option value="Unit 3B">Unit 3B - Colombo 04</option>
                            <option value="Unit 5A">Unit 5A - Malabe</option>
                        </select>
                        {errors.property && (
                            <p id="property-error" className="text-red-500 text-sm mt-1" role="alert">{errors.property}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Priority Level *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[PRIORITY_LEVELS.LOW, PRIORITY_LEVELS.MEDIUM, PRIORITY_LEVELS.HIGH].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({...formData, priority: level})}
                                    disabled={isEmergency}
                                    className={`py-3 rounded-xl font-semibold border-2 transition-all ${
                                        formData.priority === level 
                                            ? 'border-primary bg-primary text-white' 
                                            : 'border-slate-200 hover:border-primary'
                                    } ${isEmergency ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    aria-pressed={formData.priority === level}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        {isEmergency && (
                            <p className="text-sm text-red-600 mt-2">Emergency priority is automatically set</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block font-semibold mb-2">Describe the Issue *</label>
                        <textarea 
                            id="description"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.description ? 'border-red-500' : ''}`}
                            rows="5"
                            placeholder="Please provide details about the maintenance issue..."
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({...formData, description: e.target.value});
                                setErrors({...errors, description: ''});
                            }}
                            required
                            minLength={10}
                            aria-invalid={errors.description ? "true" : "false"}
                            aria-describedby={errors.description ? "description-error" : undefined}
                        ></textarea>
                        {errors.description && (
                            <p id="description-error" className="text-red-500 text-sm mt-1" role="alert">{errors.description}</p>
                        )}
                    </div>

                    {!isEmergency && (
                        <div>
                            <label htmlFor="preferredDate" className="block font-semibold mb-2">Preferred Date & Time</label>
                            <input 
                                id="preferredDate"
                                type="datetime-local"
                                className="w-full px-4 py-3 border rounded-xl"
                                value={formData.preferredDate}
                                onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="photos" className="block font-semibold mb-2">Upload Photos (Optional)</label>
                        <div className="border-2 border-dashed rounded-xl p-8 text-center">
                            <input 
                                id="photos"
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleFileUpload}
                                className="hidden"
                                aria-label="Upload maintenance issue photos"
                            />
                            <label htmlFor="photos" className="cursor-pointer">
                                <span className="material-symbols-outlined text-slate-400 text-5xl mb-2">cloud_upload</span>
                                <p className="text-slate-600">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-500 mt-1">Maximum 5 photos</p>
                            </label>
                        </div>
                        {errors.photos && (
                            <p className="text-red-500 text-sm mt-1" role="alert">{errors.photos}</p>
                        )}
                        {uploadedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                        <span className="text-sm truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-800"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className="px-8 py-3 border rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
