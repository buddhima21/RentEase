import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
    acceptAgreement,
    downloadAgreementPdf,
    getAgreementById,
    rejectAgreement,
    terminateAgreementEarly,
    acceptEarlyTermination,
    rejectEarlyTermination
} from "../services/api";

// Status badge config — covers all possible states
const STATUS_CONFIG = {
    PENDING:               { cls: "bg-amber-100 text-amber-800",   icon: "hourglass_top",  label: "Pending — Awaiting Your Response" },
    ACTIVE:                { cls: "bg-emerald-100 text-emerald-800", icon: "check_circle", label: "Active"     },
    CANCELLED:             { cls: "bg-red-100 text-red-700",       icon: "cancel",         label: "Cancelled"  },
    EXPIRED:               { cls: "bg-slate-100 text-slate-600",   icon: "schedule",       label: "Expired"    },
    TERMINATION_REQUESTED: { cls: "bg-orange-100 text-orange-800", icon: "assignment_late", label: "Termination Requested" },
    TERMINATED:            { cls: "bg-amber-50 text-amber-800",    icon: "highlight_off",  label: "Terminated" },
};

export default function AgreementDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Terminate early state
    const [terminating, setTerminating] = useState(false);
    const [showTerminate, setShowTerminate] = useState(false);
    const [termReason, setTermReason] = useState("");

    // Tenant accept/reject state
    const [actionLoading, setActionLoading] = useState(null); // "accept" | "reject" | null
    const [actionMsg, setActionMsg] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        loadAgreement();
    }, [id, user, navigate]);

    const loadAgreement = async () => {
        try {
            setLoading(true);
            const res = await getAgreementById(id);
            setAgreement(res.data?.data || null);
        } catch (e) {
            setError(e.response?.data?.message || "Could not load agreement.");
        } finally {
            setLoading(false);
        }
    };

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
        if (isOwner && (!termReason || termReason.trim() === "")) {
            alert("Owners must provide a reason to terminate the agreement early.");
            return;
        }

        try {
            setTerminating(true);
            const res = await terminateAgreementEarly(id, { reason: termReason || undefined });
            setAgreement(res.data?.data);
            setShowTerminate(false);
            if (isTenant) {
                setActionMsg({ type: "info", text: "Early termination requested. Awaiting owner approval." });
            } else {
                setActionMsg({ type: "success", text: "Agreement terminated early." });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Could not terminate agreement.");
        } finally {
            setTerminating(false);
        }
    };

    /** Owner accepts early termination request */
    const handleAcceptTermination = async () => {
        if (!confirm("Are you sure you want to approve this early termination? The agreement will be terminated immediately and a penalty will be enforced.")) return;
        setActionLoading("accept-term");
        try {
            const res = await acceptEarlyTermination(id);
            setAgreement(res.data?.data);
            setActionMsg({ type: "success", text: "Early termination approved. Agreement is now TERMINATED." });
        } catch (err) {
            setActionMsg({ type: "error", text: err.response?.data?.message || "Could not approve termination." });
        } finally {
            setActionLoading(null);
        }
    };

    /** Owner rejects early termination request */
    const handleRejectTermination = async () => {
        if (!confirm("Are you sure you want to reject this early termination? The agreement will remain active.")) return;
        setActionLoading("reject-term");
        try {
            const res = await rejectEarlyTermination(id);
            setAgreement(res.data?.data);
            setActionMsg({ type: "info", text: "Early termination rejected. Agreement remains ACTIVE." });
        } catch (err) {
            setActionMsg({ type: "error", text: err.response?.data?.message || "Could not reject termination." });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Tenant accepts the PENDING agreement → becomes ACTIVE.
     */
    const handleAccept = async () => {
        if (!confirm("Are you sure you want to ACCEPT this rental agreement? It will become active immediately.")) return;
        setActionLoading("accept");
        try {
            const res = await acceptAgreement(id);
            setAgreement(res.data?.data);
            setActionMsg({ type: "success", text: "Agreement accepted! It is now ACTIVE." });
        } catch (err) {
            setActionMsg({ type: "error", text: err.response?.data?.message || "Could not accept agreement." });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Tenant rejects the PENDING agreement → becomes CANCELLED.
     */
    const handleReject = async () => {
        if (!confirm("Are you sure you want to REJECT this rental agreement? It will be cancelled and cannot be undone.")) return;
        setActionLoading("reject");
        try {
            const res = await rejectAgreement(id);
            setAgreement(res.data?.data);
            setActionMsg({ type: "info", text: "Agreement rejected. Status is now CANCELLED." });
        } catch (err) {
            setActionMsg({ type: "error", text: err.response?.data?.message || "Could not reject agreement." });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (error || !agreement) {
        return (
            <div className="min-h-screen bg-slate-50">
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

    const isTenant = user?.id === agreement.tenantId;
    const isOwner  = user?.id === agreement.ownerId;
    const canTerminate = agreement.status === "ACTIVE";
    // Show Accept/Reject ONLY to tenant AND only when status is PENDING
    const showTenantActions = isTenant && agreement.status === "PENDING";
    const showOwnerTermActions = isOwner && agreement.status === "TERMINATION_REQUESTED";
    const statusCfg = STATUS_CONFIG[agreement.status] || STATUS_CONFIG["PENDING"];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back link — context-aware for owner vs tenant */}
                <Link
                    to={isOwner ? "/owner/agreements" : "/tenant/agreements"}
                    className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mb-6"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    {isOwner ? "All agreements (owner)" : "All agreements"}
                </Link>

                {/* Toast message */}
                {actionMsg && (
                    <div className={`mb-4 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold
                        ${actionMsg.type === "error" ? "bg-red-100 text-red-800" :
                          actionMsg.type === "info"  ? "bg-slate-100 text-slate-800" :
                          "bg-emerald-100 text-emerald-800"}`}>
                        <span className="material-symbols-outlined text-lg">
                            {actionMsg.type === "error" ? "error" : actionMsg.type === "info" ? "info" : "check_circle"}
                        </span>
                        {actionMsg.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900">{agreement.agreementNumber}</h1>
                            <p className="text-slate-500 text-sm mt-1">{agreement.propertyTitle}</p>
                        </div>
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusCfg.cls}`}>
                            <span className="material-symbols-outlined text-[14px]">{statusCfg.icon}</span>
                            {statusCfg.label}
                        </span>
                    </div>

                    {/* PENDING banner — shown only to tenant */}
                    {showTenantActions && (
                        <div className="mx-6 mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50">
                            <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                Action required: Review and respond to this agreement
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                                The owner has approved your booking and generated this rental agreement.
                                Please review the details below and choose to Accept or Reject.
                            </p>
                        </div>
                    )}

                    {/* TERMINATION_REQUESTED banner */}
                    {agreement.status === "TERMINATION_REQUESTED" && (
                        <div className="mx-6 mt-5 p-4 rounded-xl border border-orange-200 bg-orange-50">
                            <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">assignment_late</span>
                                Early Termination Requested
                            </p>
                            <p className="text-xs text-orange-700 mt-1 mb-2">
                                {isTenant ? "You have requested to terminate this agreement early. Awaiting owner approval." : "The tenant has requested to terminate this agreement early."}
                            </p>
                            {agreement.terminationReason && (
                                <div className="bg-white/60 p-3 rounded-lg text-xs text-orange-900 border border-orange-100">
                                    <span className="font-bold">Reason provided: </span>{agreement.terminationReason}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Agreement details */}
                    <div className="p-6 space-y-5 text-sm">
                        {/* Dates & rent */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slateate-400 uppercase text-slate-400">Start date</p>
                                <p className="font-semibold text-slate-800">{agreement.startDate}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">End date</p>
                                <p className="font-semibold text-slate-800">{agreement.endDate}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Duration</p>
                                <p className="font-semibold text-slate-800">{agreement.durationMonths} months</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Monthly rent</p>
                                <p className="font-semibold text-slate-800">LKR {Number(agreement.rentAmount).toLocaleString()}</p>
                            </div>
                            {agreement.deposit > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Security deposit</p>
                                    <p className="font-semibold text-slate-800">LKR {Number(agreement.deposit).toLocaleString()}</p>
                                </div>
                            )}
                            {agreement.paymentDueDate > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Payment due</p>
                                    <p className="font-semibold text-slate-800">Day {agreement.paymentDueDate} of each month</p>
                                </div>
                            )}
                        </div>

                        {/* Approval status indicators */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Approval status</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`material-symbols-outlined text-[18px] ${agreement.ownerApproved ? "text-emerald-600" : "text-slate-300"}`}>
                                    {agreement.ownerApproved ? "check_circle" : "radio_button_unchecked"}
                                </span>
                                <span className={agreement.ownerApproved ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                                    Owner approved
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`material-symbols-outlined text-[18px] ${
                                    agreement.tenantApproved ? "text-emerald-600" :
                                    agreement.status === "CANCELLED" ? "text-red-500" : "text-slate-300"}`}>
                                    {agreement.tenantApproved ? "check_circle" :
                                     agreement.status === "CANCELLED" ? "cancel" : "radio_button_unchecked"}
                                </span>
                                <span className={
                                    agreement.tenantApproved ? "text-emerald-700 font-semibold" :
                                    agreement.status === "CANCELLED" ? "text-red-600 font-semibold" : "text-slate-400"}>
                                    {agreement.tenantApproved ? "Tenant accepted" :
                                     agreement.status === "CANCELLED" ? "Tenant rejected" : "Tenant — pending decision"}
                                </span>
                            </div>
                        </div>

                        {/* Optional notes */}
                        {agreement.rulesNotes && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notes</p>
                                <p className="text-slate-600 whitespace-pre-wrap">{agreement.rulesNotes}</p>
                            </div>
                        )}

                        {/* Property terms */}
                        {agreement.propertyTermsSnapshot && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Property terms &amp; conditions</p>
                                <p className="text-slate-600 whitespace-pre-wrap text-xs leading-relaxed border border-slate-100 rounded-xl p-3 bg-slate-50">
                                    {agreement.propertyTermsSnapshot}
                                </p>
                            </div>
                        )}

                        {/* Early termination penalty */}
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

                    {/* Action footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
                        {/* ── TENANT: Accept / Reject (only when PENDING) ── */}
                        {showTenantActions && (
                            <>
                                <button
                                    id="btn-accept-agreement"
                                    type="button"
                                    onClick={handleAccept}
                                    disabled={!!actionLoading}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all text-sm"
                                >
                                    {actionLoading === "accept" ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    )}
                                    Accept Agreement
                                </button>
                                <button
                                    id="btn-reject-agreement"
                                    type="button"
                                    onClick={handleReject}
                                    disabled={!!actionLoading}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 font-bold px-6 py-2.5 rounded-xl hover:bg-red-100 disabled:opacity-60 transition-all text-sm"
                                >
                                    {actionLoading === "reject" ? (
                                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    )}
                                    Reject Agreement
                                </button>
                            </>
                        )}

                        {/* Download PDF — available to both parties always */}
                        <button
                            id="btn-download-agreement-pdf"
                            type="button"
                            onClick={handlePdf}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-800"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download PDF
                        </button>

                        {/* Early termination — only for ACTIVE agreements */}
                        {canTerminate && (
                            <button
                                id="btn-terminate-agreement"
                                type="button"
                                onClick={() => setShowTerminate(true)}
                                className="inline-flex items-center gap-2 border border-red-200 text-red-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-50"
                            >
                                End agreement early
                            </button>
                        )}
                        
                        {/* Owner Actions for Termination Request */}
                        {showOwnerTermActions && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleAcceptTermination}
                                    disabled={!!actionLoading}
                                    className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-700 disabled:opacity-60"
                                >
                                    {actionLoading === "accept-term" ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    )}
                                    Approve Termination
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRejectTermination}
                                    disabled={!!actionLoading}
                                    className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-60"
                                >
                                    {actionLoading === "reject-term" ? (
                                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    )}
                                    Reject Request
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Early terminate modal ── */}
            {showTerminate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <form onSubmit={handleTerminate} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <h3 className="font-black text-slate-900">Terminate early?</h3>
                        <p className="text-sm text-slate-600">
                            {isTenant 
                                ? "This will send an early termination request to the owner. A penalty of remaining months × monthly rent × 50% may apply upon approval." 
                                : "As the owner, you must provide a reason. The agreement will be terminated immediately and a penalty enforced."}
                        </p>
                        <textarea
                            value={termReason}
                            onChange={(e) => setTermReason(e.target.value)}
                            placeholder={isOwner ? "Reason (Required)" : "Optional reason for termination"}
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px]"
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowTerminate(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-slate-600">
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
