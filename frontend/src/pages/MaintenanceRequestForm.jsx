import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createMaintenanceRequest } from "../services/api";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

export default function MaintenanceRequestForm() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isEmergency = location.pathname.includes("/emergency");
    const fileInputRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        propertyId: "",
        title: "",
        description: "",
        serviceType: "",
        priority: isEmergency ? "EMERGENCY" : "MEDIUM",
        imageUrls: [],
    });

    const canChoosePriority = useMemo(() => !isEmergency, [isEmergency]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = 5 - form.imageUrls.length;
        const selected = files.slice(0, remaining);
        selected.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((prev) => ({
                    ...prev,
                    imageUrls: [...prev.imageUrls, reader.result],
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setForm((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user?.id) {
            setError("Please login as a tenant to submit a request.");
            return;
        }

        try {
            setSubmitting(true);
            await createMaintenanceRequest({
                ...form,
                tenantId: user.id,
                priority: isEmergency ? "EMERGENCY" : form.priority,
            });
            navigate("/tenant/maintenance/dashboard");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to submit maintenance request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                    {isEmergency ? "Emergency Maintenance Request" : "Maintenance Request"}
                </h1>
                <p className="mt-2 text-slate-600">Submit issue details and optional photos for faster triage.</p>

                <form className="mt-8 space-y-4" onSubmit={submit}>
                    <input className="w-full rounded-xl border border-slate-300 p-3" placeholder="Property ID" value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required />
                    <input className="w-full rounded-xl border border-slate-300 p-3" placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    <input className="w-full rounded-xl border border-slate-300 p-3" placeholder="Service type (e.g. Plumbing)" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required />
                    {canChoosePriority && (
                        <select className="w-full rounded-xl border border-slate-300 p-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    )}
                    <textarea className="w-full rounded-xl border border-slate-300 p-3 min-h-36" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">Photos ({form.imageUrls.length}/5)</p>
                            <button type="button" className="text-sm text-emerald-700 font-semibold" onClick={() => fileInputRef.current?.click()}>Add Photos</button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                        <div className="mt-3 grid grid-cols-3 gap-3">
                            {form.imageUrls.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt="request" className="h-24 w-full object-cover rounded-lg border border-slate-200" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">x</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button disabled={submitting} className="px-5 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-60" type="submit">
                            {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                        <button type="button" className="px-5 py-3 rounded-xl border border-slate-300 font-semibold" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
