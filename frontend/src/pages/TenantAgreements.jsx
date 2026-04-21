import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getTenantAgreements } from "../services/api";

// Status badge styles — updated to include PENDING and CANCELLED
const STATUS_STYLE = {
    PENDING:               { cls: "bg-amber-50 text-amber-800 border-amber-200",     icon: "hourglass_top",    label: "Pending"   },
    ACTIVE:                { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: "check_circle",  label: "Active"    },
    CANCELLED:             { cls: "bg-red-50 text-red-700 border-red-200",             icon: "cancel",           label: "Cancelled" },
    EXPIRED:               { cls: "bg-slate-100 text-slate-600 border-slate-200",      icon: "schedule",         label: "Expired"   },
    TERMINATION_REQUESTED: { cls: "bg-orange-50 text-orange-800 border-orange-200",    icon: "assignment_late",  label: "Term Request"},
    TERMINATED:            { cls: "bg-amber-50 text-amber-800 border-amber-200",       icon: "highlight_off",    label: "Terminated"},
};

function StatusBadge({ status }) {
    const cfg = STATUS_STYLE[status] || STATUS_STYLE["PENDING"];
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${cfg.cls}`}>
            <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
            {cfg.label}
        </span>
    );
}

export default function TenantAgreements() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role !== "TENANT") {
            navigate("/");
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const res = await getTenantAgreements(user.id);
                setList(res.data?.data || []);
            } catch (e) {
                setError(e.response?.data?.message || "Could not load agreements.");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Rental Agreements</h1>
                        {/* Agreements are auto-created by the owner accepting a booking — no manual creation needed */}
                        <p className="text-slate-500 text-sm mt-1">
                            Your agreements appear here after an owner approves your booking request.
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4 text-sm font-medium">{error}</div>
                )}
                {!loading && !error && list.length === 0 && (
                    <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
                        <span className="material-symbols-outlined text-5xl text-slate-200">description</span>
                        <p className="mt-4 text-slate-600 font-medium">No agreements yet</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                            Once an owner approves your booking request, a rental agreement will appear here for you to review and accept.
                        </p>
                        <Link to="/tenant/bookings" className="inline-block mt-6 text-primary font-bold text-sm hover:underline">
                            View my bookings
                        </Link>
                    </div>
                )}
                {!loading && !error && list.length > 0 && (
                    <ul className="space-y-3">
                        {list.map((a) => (
                            <li key={a.id}>
                                <Link
                                    to={`/tenant/agreements/${a.id}`}
                                    className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-black text-slate-900">{a.agreementNumber}</p>
                                            <p className="text-sm text-slate-500 mt-1">{a.propertyTitle || "Property"}</p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {a.startDate} → {a.endDate} · LKR {Number(a.rentAmount).toLocaleString()} / mo
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <StatusBadge status={a.status} />
                                            {/* Highlight pending agreements that need action */}
                                            {a.status === "PENDING" && (
                                                <span className="text-xs font-semibold text-amber-700 animate-pulse">
                                                    Action required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
