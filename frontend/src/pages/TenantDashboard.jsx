import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTenantBookings, tenantCancelBooking } from "../services/api";
import Navbar from "../components/Navbar";

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "hourglass_top",
        iconColor: "text-amber-500",
        description: "Awaiting owner review",
    },
    ALLOCATED: {
        label: "Allocated",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: "check_circle",
        iconColor: "text-emerald-500",
        description: "You have been allocated to this property",
    },
    REJECTED: {
        label: "Rejected",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: "cancel",
        iconColor: "text-red-500",
        description: "Your request was not approved",
    },
    CANCELLED: {
        label: "Cancelled",
        bg: "bg-slate-50",
        text: "text-slate-500",
        border: "border-slate-200",
        icon: "do_not_disturb_on",
        iconColor: "text-slate-400",
        description: "This allocation was cancelled",
    },
    APPROVED: {
        label: "Approved",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "thumb_up",
        iconColor: "text-blue-500",
        description: "Approved by owner",
    },
    EXPIRED: {
        label: "Expired",
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-300",
        icon: "timer_off",
        iconColor: "text-slate-500",
        description: "Request expired due to inactivity",
    },
};

function BookingCard({ booking, onCancelClick }) {
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG["PENDING"];
    const formattedDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "N/A";

    const formattedPrice = booking.propertyPrice
        ? new Intl.NumberFormat("en-LK").format(booking.propertyPrice)
        : "N/A";

    return (
        <div className={`bg-white rounded-2xl border ${cfg.border} shadow-sm overflow-hidden hover:shadow-md transition-all duration-200`}>
            <div className="flex flex-col sm:flex-row">
                {/* Property Image */}
                <div className="sm:w-48 h-40 sm:h-auto shrink-0 relative overflow-hidden bg-slate-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 absolute z-0">home_work</span>
                    {booking.propertyImageUrl && (
                        <img
                            src={booking.propertyImageUrl}
                            alt={booking.propertyTitle}
                            className="relative z-10 w-full h-full object-cover text-transparent"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <div className={`absolute z-20 top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
                        <span className={`material-symbols-outlined text-[14px] ${cfg.iconColor}`}>{cfg.icon}</span>
                        {cfg.label}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-0.5">
                                {booking.propertyTitle || "Property"}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                {booking.propertyAddress ? `${booking.propertyAddress}, ` : ""}{booking.propertyCity || ""}
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-primary font-bold text-lg">LKR {formattedPrice}</p>
                            <p className="text-xs text-slate-400 uppercase font-semibold">per month</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-3">
                        {booking.propertyType && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                <span className="material-symbols-outlined text-[14px]">home</span>
                                {booking.propertyType}
                            </span>
                        )}
                        {booking.propertyBedrooms > 0 && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                <span className="material-symbols-outlined text-[14px]">bed</span>
                                {booking.propertyBedrooms} Bedroom{booking.propertyBedrooms > 1 ? "s" : ""}
                            </span>
                        )}
                        {booking.startDate && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                From {new Date(booking.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        )}
                    </div>

                    <div className={`p-3 rounded-xl flex items-center gap-2.5 ${cfg.bg}`}>
                        <span className={`material-symbols-outlined text-xl ${cfg.iconColor}`}>{cfg.icon}</span>
                        <div>
                            <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
                            <p className={`text-xs ${cfg.text} opacity-80`}>{cfg.description}</p>
                        </div>
                        <p className="ml-auto text-xs text-slate-400">Requested {formattedDate}</p>
                    </div>

                    {booking.cancellationReason && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">info</span>
                            <div>
                                <p className="text-xs font-bold text-slate-700">Cancellation/Rejection Reason:</p>
                                <p className="text-sm text-slate-600">{booking.cancellationReason}</p>
                            </div>
                        </div>
                    )}

                    {(booking.status === "PENDING" || booking.status === "ALLOCATED") && onCancelClick && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => onCancelClick(booking.id)}
                                className="text-sm text-red-600 font-bold hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-200 flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                Cancel Request
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TenantDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedCancelId, setSelectedCancelId] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getTenantBookings(user.id);
            setBookings(res.data.data || []);
        } catch (err) {
            setError("Failed to load your bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCancelId) return;

        try {
            setCancelling(true);
            await tenantCancelBooking(selectedCancelId, {
                tenantId: user.id,
                reason: cancelReason,
            });
            // Close modal and refresh
            setCancelModalOpen(false);
            setCancelReason("");
            setSelectedCancelId(null);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel booking.");
        } finally {
            setCancelling(false);
        }
    };

    const tabs = [
        { id: "all", label: "All Requests", icon: "list_alt" },
        { id: "PENDING", label: "Pending", icon: "hourglass_top" },
        { id: "ALLOCATED", label: "Allocated", icon: "check_circle" },
        { id: "REJECTED", label: "Rejected", icon: "cancel" },
        { id: "EXPIRED", label: "Expired", icon: "timer_off" },
    ];

    const filtered = activeTab === "all"
        ? bookings
        : bookings.filter((b) => b.status === activeTab);

    const counts = {
        all: bookings.length,
        PENDING: bookings.filter((b) => b.status === "PENDING").length,
        ALLOCATED: bookings.filter((b) => b.status === "ALLOCATED").length,
        REJECTED: bookings.filter((b) => b.status === "REJECTED").length,
        EXPIRED: bookings.filter((b) => b.status === "EXPIRED").length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Cancel Booking Request</h2>
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCancelSubmit} className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Are you sure you want to cancel this booking request? This action cannot be undone.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Reason for Cancellation <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g., Found another place, changed my mind..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCancelModalOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm"
                                >
                                    Keep Request
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelling}
                                    className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    {cancelling ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    )}
                                    Yes, Cancel It
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 mb-1">My Bookings</h1>
                        <p className="text-slate-500 text-sm">
                            {user?.fullName ? `Welcome back, ${user.fullName.split(" ")[0]}!` : "Track your rental booking requests"}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/tenant/agreements"
                            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">description</span>
                            Agreements
                        </Link>
                        <Link
                            to="/listings"
                            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            Browse Properties
                        </Link>
                    </div>
                </div>



                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center
                                ${activeTab === tab.id
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            {tab.label}
                            {counts[tab.id] > 0 && (
                                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab.id ? "bg-white/20" : "bg-slate-100 text-slate-600"
                                }`}>
                                    {counts[tab.id]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-500">Loading your bookings...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <span className="material-symbols-outlined text-5xl text-red-300 mb-3">error</span>
                        <p className="text-slate-600 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                        >
                            Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inbox</span>
                        <h3 className="text-lg font-bold text-slate-600 mb-2">
                            {activeTab === "all" ? "No bookings yet" : `No ${STATUS_CONFIG[activeTab]?.label || ""} bookings`}
                        </h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-sm">
                            {activeTab === "all"
                                ? "Browse available properties and submit a booking request to get started."
                                : "Switch to 'All Requests' to see all your bookings."}
                        </p>
                        {activeTab === "all" && (
                            <Link
                                to="/listings"
                                className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                            >
                                Browse Properties
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancelClick={(id) => {
                                    setSelectedCancelId(id);
                                    setCancelModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
