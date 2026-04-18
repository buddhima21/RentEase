import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOwnerBookings, approveBooking, rejectBooking, removeAllocation, hardDeleteBooking, getAgreementByBookingId } from "../services/api";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";

const STATUS_CONFIG = {
    PENDING: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    ALLOCATED: { label: "Allocated", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    REJECTED: { label: "Rejected", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    CANCELLED: { label: "Removed/Cancelled", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
    APPROVED: { label: "Approved", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    EXPIRED: { label: "Expired", bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function TenantDetails({ booking }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                Tenant Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-0.5">Name</p>
                    <p className="font-semibold text-slate-800">{booking.tenantName || "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-0.5">Email</p>
                    <p className="font-semibold text-slate-800 break-all">{booking.tenantEmail || "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-0.5">Phone</p>
                    <p className="font-semibold text-slate-800">{booking.tenantPhone || "N/A"}</p>
                </div>
            </div>
            {booking.startDate && (
                <div className="pt-1 border-t border-slate-200">
                    <p className="text-xs text-slate-400">
                        Requested move-in:{" "}
                        <span className="font-semibold text-slate-700">
                            {new Date(booking.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                    </p>
                </div>
            )}
            {booking.cancellationReason && (
                <div className="pt-3 mt-1 border-t border-red-100">
                    <p className="text-xs text-red-400 uppercase font-bold tracking-wide mb-1">Reason Provided</p>
                    <p className="text-sm font-medium text-slate-700 italic border-l-2 border-red-200 pl-3">
                        "{booking.cancellationReason}"
                    </p>
                </div>
            )}
        </div>
    );
}

function BookingRow({ booking, onApprove, onReject, onRemove, onDelete, onViewAgreement, actionLoading }) {
    const [expanded, setExpanded] = useState(false);
    const formattedDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "N/A";
    const formattedPrice = booking.propertyPrice
        ? `LKR ${new Intl.NumberFormat("en-LK").format(booking.propertyPrice)}`
        : "N/A";
    const isLoading = actionLoading === booking.id;

    return (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
            <div
                className="flex flex-col sm:flex-row gap-4 p-5 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Property Image */}
                <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-200 flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-3xl text-slate-300 absolute z-0">home_work</span>
                    {booking.propertyImageUrl && (
                        <img
                            src={booking.propertyImageUrl}
                            alt={booking.propertyTitle}
                            className="relative z-10 w-full h-full object-cover text-transparent"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{booking.propertyTitle || "Property"}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {booking.propertyCity || "N/A"}
                            </p>
                        </div>
                        <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                            {booking.tenantName || "Unknown tenant"}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">payments</span>
                            {formattedPrice}/mo
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                            {formattedDate}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <div className="flex items-center shrink-0">
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}>
                        expand_more
                    </span>
                </div>
            </div>

            {/* Expanded Panel */}
            {expanded && (
                <div className="border-t border-emerald-50 px-5 pb-5 pt-4 space-y-4">
                    <TenantDetails booking={booking} />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {booking.status === "PENDING" && (
                            <>
                                <button
                                    onClick={() => onApprove(booking.id)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all text-sm"
                                >
                                    {isLoading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    )}
                                    Approve & Allocate
                                </button>
                                <button
                                    onClick={() => onReject(booking.id)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 font-bold px-5 py-2.5 rounded-xl hover:bg-red-100 disabled:opacity-60 transition-all text-sm"
                                >
                                    {isLoading ? (
                                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    )}
                                    Reject
                                </button>
                            </>
                        )}
                        {booking.status === "ALLOCATED" && (
                            <>
                                <button
                                    onClick={() => onRemove(booking.id)}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 font-bold px-5 py-2.5 rounded-xl hover:bg-amber-100 hover:text-amber-800 disabled:opacity-60 transition-all text-sm"
                                >
                                    {isLoading ? (
                                        <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                    )}
                                    Remove Tenant
                                </button>
                                {/* View Agreement — only visible after owner approval creates an agreement */}
                                <button
                                    onClick={() => onViewAgreement(booking.id)}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-100 disabled:opacity-60 transition-all text-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                    View Agreement
                                </button>
                            </>
                        )}
                        {booking.status !== "PENDING" && (
                            <button
                                onClick={() => onDelete(booking.id)}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center gap-2 bg-slate-50 text-red-600 border border-slate-200 font-bold px-4 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-200 disabled:opacity-60 transition-all text-sm ml-auto"
                                title="Delete from history"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                )}
                                Delete Record
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OwnerBookings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState("pending");


    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getOwnerBookings(user.id);
            setBookings(res.data.data || []);
        } catch {
            setError("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await approveBooking(id, user.id);
            showToast("Booking approved! Tenant has been allocated.");
            await fetchBookings();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to approve booking.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            await rejectBooking(id, user.id);
            showToast("Booking rejected.", "info");
            await fetchBookings();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to reject booking.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (id) => {
        if (!confirm("Are you sure you want to remove this tenant? This will free up the bedroom slot.")) return;
        setActionLoading(id);
        try {
            await removeAllocation(id, user.id);
            showToast("Tenant removed. Bedroom slot is now available.", "info");
            await fetchBookings();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to remove tenant.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to permanently delete this record from your history? This action cannot be undone.")) return;
        setActionLoading(id);
        try {
            await hardDeleteBooking(id);
            showToast("Record permanently deleted from database.", "info");
            await fetchBookings();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to delete record.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Owner clicks "View Agreement" on an ALLOCATED booking.
     * Tries to fetch the linked agreement and navigate to its detail page.
     * Falls back to the owner's agreement list if the lookup fails.
     */
    const handleViewAgreement = async (bookingId) => {
        try {
            const res = await getAgreementByBookingId(bookingId);
            const agreement = res.data?.data;
            if (agreement?.id) {
                // Navigate to the agreement detail page (accessible to owner via AgreementDetail)
                navigate(`/tenant/agreements/${agreement.id}`);
            } else {
                navigate("/owner/agreements");
            }
        } catch {
            // Agreement may not exist yet — go to the agreements list
            navigate("/owner/agreements");
        }
    };

    const pendingBookings = bookings.filter((b) => b.status === "PENDING");
    const historyBookings = bookings.filter((b) => b.status !== "PENDING");

    const displayed = activeTab === "pending" ? pendingBookings : historyBookings;

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#13ec6d" }}>
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight pl-12 lg:pl-0">Bookings</h2>
                    <div className="flex items-center gap-3 ml-auto">
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            {pendingBookings.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                        </button>
                        {user && <UserDropdown user={user} onLogout={logout} />}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {/* Toast */}
                    {toast && (
                        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in
                            ${toast.type === "error" ? "bg-red-600 text-white" : toast.type === "info" ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"}`}>
                            <span className="material-symbols-outlined text-lg">
                                {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
                            </span>
                            {toast.message}
                        </div>
                    )}

                    {/* Stat summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Total Requests", value: bookings.length, icon: "calendar_month", bg: "bg-white", color: "text-slate-700" },
                            { label: "Pending", value: pendingBookings.length, icon: "hourglass_top", bg: "bg-amber-50", color: "text-amber-600" },
                            { label: "Allocated", value: bookings.filter((b) => b.status === "ALLOCATED").length, icon: "check_circle", bg: "bg-emerald-50", color: "text-emerald-600" },
                            { label: "Rejected", value: bookings.filter((b) => b.status === "REJECTED").length, icon: "cancel", bg: "bg-red-50", color: "text-red-500" },
                        ].map((s) => (
                            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-emerald-100 shadow-sm`}>
                                <span className={`material-symbols-outlined text-xl ${s.color} mb-2 block`}>{s.icon}</span>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-emerald-100 p-1 mb-6 w-fit">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
                                ${activeTab === "pending" ? "bg-primary text-slate-900 shadow-sm" : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                            Pending Requests
                            {pendingBookings.length > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "pending" ? "bg-black/15" : "bg-amber-100 text-amber-700"}`}>
                                    {pendingBookings.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
                                ${activeTab === "history" ? "bg-primary text-slate-900 shadow-sm" : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                            Allocation History
                            {historyBookings.length > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "history" ? "bg-black/15" : "bg-slate-100 text-slate-600"}`}>
                                    {historyBookings.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-500">Loading bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <span className="material-symbols-outlined text-5xl text-red-300 mb-3">error</span>
                            <p className="text-slate-600 font-medium mb-4">{error}</p>
                            <button onClick={fetchBookings} className="bg-primary text-slate-900 font-bold px-6 py-2.5 rounded-xl hover:brightness-105 transition-all text-sm">
                                Retry
                            </button>
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
                                {activeTab === "pending" ? "hourglass_empty" : "history"}
                            </span>
                            <h3 className="text-lg font-bold text-slate-500 mb-2">
                                {activeTab === "pending" ? "No pending requests" : "No booking history yet"}
                            </h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                {activeTab === "pending"
                                    ? "When tenants submit booking requests for your properties, they will appear here."
                                    : "Approved and rejected bookings will appear here as a historical record."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayed.map((booking) => (
                                <BookingRow
                                    key={booking.id}
                                    booking={booking}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onRemove={handleRemove}
                                    onDelete={handleDelete}
                                    onViewAgreement={handleViewAgreement}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
