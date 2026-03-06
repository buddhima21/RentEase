import { useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AgreementForm({ bookingId, onCreated }) {
    const [form, setForm] = useState({
        tenantId: "",
        ownerId: "",
        propertyId: "",
        rentAmount: "",
        startDate: "",
        endDate: "",
        rules: "",
        status: "ACTIVE",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                bookingId,
                tenantId: form.tenantId,
                ownerId: form.ownerId,
                propertyId: form.propertyId,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                monthlyRent: Number(form.rentAmount) || 0,
                terms: form.rules,
            };

            const res = await fetch(`${API_BASE_URL}/api/v1/agreements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Failed to create agreement");
            }

            const body = await res.json();
            if (onCreated) {
                onCreated(body.data);
            }

            setForm((prev) => ({
                ...prev,
                rentAmount: "",
                startDate: "",
                endDate: "",
                rules: "",
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Tenant ID
                    </label>
                    <input
                        type="text"
                        name="tenantId"
                        value={form.tenantId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="TENANT-123"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Property ID
                    </label>
                    <input
                        type="text"
                        name="propertyId"
                        value={form.propertyId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="PROP-456"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Owner ID
                    </label>
                    <input
                        type="text"
                        name="ownerId"
                        value={form.ownerId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="OWNER-789"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Rent amount (per month)
                    </label>
                    <input
                        type="number"
                        name="rentAmount"
                        value={form.rentAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="50000.00"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Start date
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        End date
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Status
                    </label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="TERMINATED">Terminated</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Rules / Terms
                </label>
                <textarea
                    name="rules"
                    value={form.rules}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe house rules, payment conditions, maintenance responsibilities, etc."
                />
            </div>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
            >
                {submitting ? "Creating agreement..." : "Create agreement"}
            </button>
        </form>
    );
}

