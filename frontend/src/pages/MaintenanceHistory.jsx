import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { formatMaintenanceDate, MAINTENANCE_SERVICES, toLocalDateInputValue } from "../constants/maintenance";
import { getTenantMaintenance } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MaintenanceHistory() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("ALL");
    const [service, setService] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        getTenantMaintenance(user.id)
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [user?.id]);

    const filtered = useMemo(() => {
        // Only show resolved/closed items in history
        const base = items.filter((x) => x.status === "RESOLVED" || x.status === "CLOSED");
        return base.filter((x) => {
            const matchesStatus = status === "ALL" || x.status === status;
            // Match against the key (e.g. "ELECTRICAL") — backend stores enum key
            const matchesService = service === "ALL" || x.serviceType === service;
            const createdAt = x.createdAt ? new Date(x.createdAt) : null;
            const createdKey = createdAt ? toLocalDateInputValue(createdAt) : "";
            const matchesFrom = !fromDate || !createdKey || createdKey >= fromDate;
            const matchesTo = !toDate || !createdKey || createdKey <= toDate;
            return matchesStatus && matchesService && matchesFrom && matchesTo;
        });
    }, [items, status, service, fromDate, toDate]);

    const hasFilters = status !== "ALL" || service !== "ALL" || fromDate || toDate;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full mx-auto max-w-6xl p-6 md:p-10 space-y-6">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/tenant/maintenance/dashboard"
                                className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                            </Link>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Maintenance History
                            </h1>
                        </div>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            Review all resolved and closed requests.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <select
                        className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                    >
                        <option value="ALL">All services</option>
                        {/* Use keys from MAINTENANCE_SERVICES to match backend enum values */}
                        {MAINTENANCE_SERVICES.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400">From</label>
                        <input
                            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 outline-none"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400">To</label>
                        <input
                            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 outline-none"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={() => { setStatus("ALL"); setService("ALL"); setFromDate(""); setToDate(""); }}
                            className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Table */}
                <MaintenanceSectionCard
                    eyebrow="Archive"
                    title="Completed maintenance records"
                    description={`${filtered.length} record${filtered.length !== 1 ? "s" : ""} match your filters.`}
                >
                    {loading ? (
                        <div className="space-y-2 mt-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-300">Title</th>
                                        <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-300">Service</th>
                                        <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-300">Completed</th>
                                        <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                        <th className="text-right p-3 font-semibold text-slate-600 dark:text-slate-300"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 font-medium text-slate-900 dark:text-white">
                                                {item.title || `Request #${item.id?.slice(-8)}`}
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{item.serviceType}</td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">
                                                {formatMaintenanceDate(item.resolvedAt || item.updatedAt || item.createdAt)}
                                            </td>
                                            <td className="p-3">
                                                <MaintenanceBadge value={item.status} />
                                            </td>
                                            <td className="p-3 text-right">
                                                <Link
                                                    to={`/tenant/maintenance/track/${item.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td className="p-8 text-center text-slate-400 dark:text-slate-500" colSpan={5}>
                                                No completed maintenance records match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </MaintenanceSectionCard>
            </div>
            <Footer />
        </div>
    );
}
