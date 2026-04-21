import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { downloadAgreementPdf, getOwnerAgreements } from "../services/api";
import { ownerProfile } from "../data/ownerDashboardData";

// Status badge config — covers all workflow states
const STATUS_CONFIG = {
    PENDING:               { cls: "bg-amber-50 text-amber-800 border-amber-200",     icon: "hourglass_top",  label: "Pending"    },
    ACTIVE:                { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: "check_circle", label: "Active"     },
    CANCELLED:             { cls: "bg-red-50 text-red-700 border-red-200",           icon: "cancel",         label: "Cancelled"  },
    EXPIRED:               { cls: "bg-slate-100 text-slate-600 border-slate-200",    icon: "schedule",       label: "Expired"    },
    TERMINATION_REQUESTED: { cls: "bg-orange-50 text-orange-800 border-orange-200",  icon: "assignment_late",label: "Term Request" },
    TERMINATED:            { cls: "bg-amber-50 text-amber-800 border-amber-200",     icon: "highlight_off",  label: "Terminated" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${cfg.cls}`}>
            <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
            {cfg.label}
        </span>
    );
}

export default function OwnerAgreements() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== "OWNER") {
            navigate("/login");
            return;
        }
        (async () => {
            try {
                const res = await getOwnerAgreements(user.id);
                setList(res.data?.data || []);
            } catch {
                setList([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, navigate]);

    const handlePdf = async (agreementId, agreementNumber) => {
        try {
            const res = await downloadAgreementPdf(agreementId);
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${agreementNumber || agreementId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Could not download PDF.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-emerald-100 px-6 flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 pl-12 lg:pl-0">Rental Agreements</h1>
                    {user ? (
                        <UserDropdown user={user} onLogout={logout} />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-full border-2 border-primary bg-cover shrink-0"
                            style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                        />
                    )}
                </header>
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 pl-12 lg:pl-8 max-w-4xl">
                    <p className="text-sm text-slate-500 mb-6">
                        Agreements are auto-created when you approve a tenant booking.
                        Tenants must Accept or Reject the agreement; once accepted it becomes{" "}
                        <span className="font-semibold text-emerald-700">Active</span>.
                    </p>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
                            <span className="material-symbols-outlined text-5xl text-slate-200">description</span>
                            <p className="mt-4 text-slate-600 font-medium">No agreements yet</p>
                            <p className="text-xs text-slate-400 mt-2">Agreements will appear here after you approve a tenant booking.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {list.map((a) => (
                                <li
                                    key={a.id}
                                    className="bg-white rounded-xl border border-emerald-100 p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <p className="font-bold text-slate-900">{a.agreementNumber}</p>
                                            {/* Status badge with full colour coding */}
                                            <StatusBadge status={a.status} />
                                            {/* Highlight agreements awaiting tenant response */}
                                            {a.status === "PENDING" && (
                                                <span className="text-xs text-amber-600 font-semibold animate-pulse">
                                                    Awaiting tenant
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{a.propertyTitle || a.propertyId}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Tenant: {a.tenantName || a.tenantId} ·{" "}
                                            {a.startDate} → {a.endDate} · LKR {Number(a.rentAmount).toLocaleString()}/mo
                                        </p>
                                        {/* Approval status indicators */}
                                        <div className="flex gap-4 mt-2">
                                            <span className={`text-xs flex items-center gap-1 ${a.ownerApproved ? "text-emerald-600" : "text-slate-400"}`}>
                                                <span className="material-symbols-outlined text-[13px]">
                                                    {a.ownerApproved ? "check_circle" : "radio_button_unchecked"}
                                                </span>
                                                Owner
                                            </span>
                                            <span className={`text-xs flex items-center gap-1 ${
                                                a.tenantApproved ? "text-emerald-600" :
                                                a.status === "CANCELLED" ? "text-red-500" : "text-slate-400"}`}>
                                                <span className="material-symbols-outlined text-[13px]">
                                                    {a.tenantApproved ? "check_circle" :
                                                     a.status === "CANCELLED" ? "cancel" : "radio_button_unchecked"}
                                                </span>
                                                Tenant
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* View Agreement Detail */}
                                        <Link
                                            to={`/owner/agreements/${a.id}`}
                                            className="text-sm font-bold text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                                            View
                                        </Link>
                                        {/* Download PDF */}
                                        <button
                                            type="button"
                                            onClick={() => handlePdf(a.id, a.agreementNumber)}
                                            className="text-sm font-bold text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 inline-flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">download</span>
                                            PDF
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
