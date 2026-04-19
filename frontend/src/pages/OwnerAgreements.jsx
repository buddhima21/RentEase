import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { downloadAgreementPdf, getOwnerAgreements } from "../services/api";
import { ownerProfile } from "../data/ownerDashboardData";
import { motion } from "framer-motion";

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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans selection:bg-emerald-100" style={{ "--color-primary": "#26C289" }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 font-sans">
                <motion.header 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0"
                >
                    <h1 className="text-xl font-bold text-slate-900 pl-12 lg:pl-0">Rental agreements</h1>
                    {user ? (
                        <UserDropdown user={user} onLogout={logout} />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-full border-2 border-primary bg-cover shrink-0"
                            style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                        />
                    )}
                </motion.header>
                <motion.div 
                    className="flex-1 overflow-y-auto p-6 lg:p-8 pl-12 lg:pl-8 max-w-4xl scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <p className="text-sm text-slate-500 mb-6">
                        Agreements created by your tenants after approving their bookings. Set property terms under{" "}
                        <Link to="/owner/properties" className="text-primary font-bold">
                            My Properties → Edit
                        </Link>
                        .
                    </p>
                    {loading ? (
                        <p className="text-slate-500">Loading…</p>
                    ) : list.length === 0 ? (
                        <p className="text-slate-500 text-sm">No agreements yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {list.map((a) => (
                                <li
                                    key={a.id}
                                    className="bg-white rounded-xl border border-emerald-100 p-5 flex flex-wrap items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-bold text-slate-900">{a.agreementNumber}</p>
                                        <p className="text-sm text-slate-500">{a.propertyTitle || a.propertyId}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Tenant: {a.tenantName || a.tenantId} · {a.status}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePdf(a.id, a.agreementNumber)}
                                        className="text-sm font-bold text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5"
                                    >
                                        PDF
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
