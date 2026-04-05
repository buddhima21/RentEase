import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getTenantAgreements } from "../services/api";

const STATUS_STYLE = {
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
    TERMINATED: "bg-amber-50 text-amber-800 border-amber-200",
};

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
                        <h1 className="text-2xl font-black text-slate-900">Rental agreements</h1>
                        <p className="text-slate-500 text-sm mt-1">View and download your digital contracts</p>
                    </div>
                    <Link
                        to="/tenant/agreements/new"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New agreement
                    </Link>
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
                            After your booking is approved by the owner, you can create a rental agreement here.
                        </p>
                        <Link to="/tenant/agreements/new" className="inline-block mt-6 text-primary font-bold text-sm hover:underline">
                            Create agreement
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
                                        <span
                                            className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                                                STATUS_STYLE[a.status] || STATUS_STYLE.ACTIVE
                                            }`}
                                        >
                                            {a.status}
                                        </span>
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
