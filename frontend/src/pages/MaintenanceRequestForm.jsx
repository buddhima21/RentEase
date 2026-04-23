import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createMaintenanceRequest, getTenantAgreements } from "../services/api";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MAINTENANCE_PRIORITIES, MAINTENANCE_SERVICES, MAX_MAINTENANCE_IMAGES, isEmergencyPriority, toLocalDateInputValue } from "../constants/maintenance";

export default function MaintenanceRequestForm() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isEmergency = location.pathname.includes("/emergency");
    const fileInputRef = useRef(null);
    const today = useMemo(() => toLocalDateInputValue(), []);

    const [submitting, setSubmitting] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [propertyOptions, setPropertyOptions] = useState([]);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        propertyId: "",
        title: "",
        description: "",
        serviceType: "",
        priority: isEmergency ? "EMERGENCY" : "MEDIUM",
        imageUrls: [],
        preferredDate: "",
        preferredTime: "",
    });

    const canChoosePriority = useMemo(() => !isEmergency, [isEmergency]);

    useEffect(() => {
        if (!user?.id) return;
        const loadProperties = async () => {
            try {
                setLoadingProperties(true);
                const res = await getTenantAgreements(user.id);
                const agreements = res.data?.data || [];
                const uniqueByProperty = new Map();
                agreements
                    .filter((agreement) => agreement.status === "ACTIVE" && agreement.propertyId)
                    .forEach((agreement) => {
                        if (!uniqueByProperty.has(agreement.propertyId)) {
                            uniqueByProperty.set(agreement.propertyId, {
                                id: agreement.propertyId,
                                label: agreement.propertyTitle || agreement.propertyId,
                                subtitle: agreement.propertyAddress || agreement.agreementNumber || "Active tenancy",
                            });
                        }
                    });
                const options = Array.from(uniqueByProperty.values());
                setPropertyOptions(options);
                if (!form.propertyId && options.length > 0) {
                    setForm((prev) => ({ ...prev, propertyId: options[0].id }));
                }
            } catch {
                setPropertyOptions([]);
            } finally {
                setLoadingProperties(false);
            }
        };
        loadProperties();
    }, [user?.id]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_MAINTENANCE_IMAGES - form.imageUrls.length;
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

        if (!form.propertyId) {
            setError("Select an active property before submitting the request.");
            return;
        }

        if (form.preferredDate) {
            const preferredDate = new Date(`${form.preferredDate}T00:00:00`);
            const currentDate = new Date(`${today}T00:00:00`);
            if (preferredDate < currentDate) {
                setError("Preferred date cannot be in the past.");
                return;
            }
        }

        try {
            setSubmitting(true);
            await createMaintenanceRequest({
                ...form,
                tenantId: user.id,
                priority: isEmergency ? "EMERGENCY" : form.priority,
                preferredAt: form.preferredDate && form.preferredTime ? `${form.preferredDate}T${form.preferredTime}:00` : null,
            });
            navigate("/tenant/maintenance/dashboard");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to submit maintenance request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full mx-auto max-w-4xl p-6 md:p-10 space-y-6">
                <MaintenanceSectionCard
                    eyebrow={isEmergency ? "Emergency Request" : "Maintenance Request"}
                    title={isEmergency ? "Emergency maintenance request" : "Maintenance request"}
                    description="Submit issue details and photos so the maintenance team can triage the request without additional back-and-forth."
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <MaintenanceBadge kind="priority" value={form.priority} />
                        {isEmergency ? (
                            <span className="text-sm font-semibold text-red-700">Emergency mode locks the priority to Emergency.</span>
                        ) : (
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Standard requests can choose Low, Medium, or High priority.</span>
                        )}
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={submit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required>
                                <option value="">{loadingProperties ? "Loading properties..." : "Select a property"}</option>
                                {propertyOptions.map((property) => (
                                    <option key={property.id} value={property.id}>{property.label} - {property.subtitle}</option>
                                ))}
                            </select>
                            <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required>
                                <option value="">Select a service type</option>
                                {MAINTENANCE_SERVICES.map((service) => (
                                    <option key={service.key} value={service.label}>
                                        {service.label}
                                    </option>
                                ))}
                            </select>
                            {canChoosePriority ? (
                                <select className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    {MAINTENANCE_PRIORITIES.filter((priority) => priority !== "EMERGENCY").map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 text-slate-500 dark:text-slate-400" value="EMERGENCY" disabled readOnly />
                            )}
                        </div>

                        <textarea className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3 min-h-36" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                        {!isEmergencyPriority(form.priority) ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" type="date" min={today} aria-label="Preferred date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
                                <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 p-3" type="time" aria-label="Preferred time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Photos ({form.imageUrls.length}/{MAX_MAINTENANCE_IMAGES})</p>
                                <button type="button" className="text-sm font-semibold text-emerald-700" onClick={() => fileInputRef.current?.click()}>
                                    Add photos
                                </button>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                                {form.imageUrls.map((img, idx) => (
                                    <div key={idx} className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <img src={img} alt="request" className="h-28 w-full object-cover" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {form.imageUrls.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No photos attached yet.</p> : null}
                            </div>
                        </div>

                        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                        {!loadingProperties && propertyOptions.length === 0 ? (
                            <p className="text-sm font-medium text-amber-700">No active agreements found. You need an active tenancy before submitting maintenance requests.</p>
                        ) : null}

                        <div className="flex gap-3 pt-2">
                            <button disabled={submitting || loadingProperties || propertyOptions.length === 0} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60" type="submit">
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                            <button type="button" className="rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-3 font-semibold" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </MaintenanceSectionCard>
            </div>
            <Footer />
        </div>
    );
}
