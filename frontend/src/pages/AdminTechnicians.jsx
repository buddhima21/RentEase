import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import { createTechnicianAccount, getMaintenanceTechnicians } from "../services/api";

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    phone: "",
};

export default function AdminTechnicians() {
    const [adminUser, setAdminUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                } else {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                }
            }
        } catch {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const loadTechnicians = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMaintenanceTechnicians();
            setTechnicians(response.data?.data || []);
        } catch (err) {
            setTechnicians([]);
            setError(err?.response?.data?.message || "Unable to load technicians right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !adminUser) {
            return;
        }
        loadTechnicians();
    }, [authLoading, adminUser]);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setSuccess("");
        setError("");

        if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
            setError("Full name, email, and password are required.");
            return;
        }

        try {
            setSubmitting(true);
            await createTechnicianAccount({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.trim() || undefined,
            });
            setSuccess("Technician account created successfully.");
            setForm({ ...initialForm, password: "" });
            await loadTechnicians();
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to create technician account.");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100">
                        Technician Management
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            to="/admin/maintenance"
                            className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">construction</span>
                            Maintenance Queue
                        </Link>
                        <div className="pl-2 flex">
                            <AdminProfileDropdown adminUser={adminUser} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="mb-4">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-600">Create technician</p>
                            <h1 className="text-2xl font-black text-slate-900 mt-1">New Technician Account</h1>
                            <p className="text-sm text-slate-500 mt-1">Use this form to provision maintenance technician access.</p>
                        </div>

                        {error ? (
                            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{error}</p>
                        ) : null}
                        {success ? (
                            <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{success}</p>
                        ) : null}

                        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
                            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Full name
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={onChange}
                                    className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900"
                                    placeholder="Technician full name"
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Email
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900"
                                    placeholder="tech@rentease.com"
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Password
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900"
                                    placeholder="Temporary password"
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Phone (optional)
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={onChange}
                                    className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900"
                                    placeholder="+94 7X XXX XXXX"
                                />
                            </label>

                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {submitting ? "Creating..." : "Create Technician"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-xl font-black text-slate-900">Existing Technicians</h2>
                            <span className="text-sm font-semibold text-slate-500">{technicians.length} total</span>
                        </div>

                        {loading ? <p className="text-sm text-slate-500">Loading technicians...</p> : null}
                        {!loading && technicians.length === 0 ? (
                            <p className="text-sm text-slate-500">No technicians available yet.</p>
                        ) : null}

                        {!loading && technicians.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b border-slate-200">
                                            <th className="py-2 pr-4">Name</th>
                                            <th className="py-2 pr-4">Email</th>
                                            <th className="py-2 pr-4">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {technicians.map((technician) => (
                                            <tr key={technician.id} className="border-b border-slate-100">
                                                <td className="py-3 pr-4 font-semibold text-slate-800">{technician.fullName}</td>
                                                <td className="py-3 pr-4 text-slate-600">{technician.email || "-"}</td>
                                                <td className="py-3 pr-4 text-slate-600">{technician.phone || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </section>
                </div>
            </main>
        </div>
    );
}
