import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { downloadAgreementPdf, getAgreementById, terminateAgreementEarly } from "../services/api";

export default function AgreementDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [terminating, setTerminating] = useState(false);
    const [showTerminate, setShowTerminate] = useState(false);
    const [termReason, setTermReason] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        (async () => {
            try {
                const res = await getAgreementById(id);
                setAgreement(res.data?.data || null);
            } catch (e) {
                setError(e.response?.data?.message || "Could not load agreement.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, user, navigate]);

    const handlePdf = async () => {
        try {
            const res = await downloadAgreementPdf(id);
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${agreement?.agreementNumber || "agreement"}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert(e.response?.data?.message || "Download failed.");
        }
    };

    const handleTerminate = async (e) => {
        e.preventDefault();
        try {
            setTerminating(true);
            const res = await terminateAgreementEarly(id, { reason: termReason || undefined });
            setAgreement(res.data?.data);
            setShowTerminate(false);
        } catch (err) {
            alert(err.response?.data?.message || "Could not terminate agreement.");
        } finally {
            setTerminating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (error || !agreement) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <p className="text-red-600 font-medium">{error || "Not found"}</p>
                    <Link to="/tenant/agreements" className="text-primary font-bold text-sm mt-4 inline-block">
                        Back to list
                    </Link>
                </div>
            </div>
        );
    }

    const canTerminate = agreement.status === "ACTIVE";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link to="/tenant/agreements" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mb-6">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    All agreements
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">{agreement.agreementNumber}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{agreement.propertyTitle}</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{agreement.status}</span>
                    </div>
                    <div className="p-6 space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Start</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{agreement.startDate}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">End</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{agreement.endDate}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Duration</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{agreement.durationMonths} months</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Rent / month</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">LKR {Number(agreement.rentAmount).toLocaleString()}</p>
                            </div>
                        </div>
                        {agreement.rulesNotes && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your notes</p>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{agreement.rulesNotes}</p>
                            </div>
                        )}
                        {agreement.propertyTermsSnapshot && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Property terms (at signing)</p>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-xs leading-relaxed border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                                    {agreement.propertyTermsSnapshot}
                                </p>
                            </div>
                        )}
                        {agreement.status === "TERMINATED" && agreement.earlyTerminationPenalty != null && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-xs font-bold text-amber-800 uppercase">Early termination penalty</p>
                                <p className="text-lg font-black text-amber-900">LKR {Number(agreement.earlyTerminationPenalty).toLocaleString()}</p>
                                {agreement.terminationReason && (
                                    <p className="text-xs text-amber-800 mt-2">Reason: {agreement.terminationReason}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handlePdf}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-800"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download PDF
                        </button>
                        {canTerminate && (
                            <button
                                type="button"
                                onClick={() => setShowTerminate(true)}
                                className="inline-flex items-center gap-2 border border-red-200 text-red-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-50"
                            >
                                End agreement early
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showTerminate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <form onSubmit={handleTerminate} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <h3 className="font-black text-slate-900 dark:text-white">Terminate early?</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            A penalty may apply: remaining months × monthly rent × 50%, as calculated by the system.
                        </p>
                        <textarea
                            value={termReason}
                            onChange={(e) => setTermReason(e.target.value)}
                            placeholder="Optional reason"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm min-h-[80px]"
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowTerminate(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-slate-600 dark:text-slate-300">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={terminating}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold disabled:opacity-60"
                            >
                                {terminating ? "…" : "Confirm"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
