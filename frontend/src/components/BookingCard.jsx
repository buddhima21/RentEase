import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBookingRequest } from "../services/api";

// Returns today's date as YYYY-MM-DD string (local timezone)
function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// Add N months to a YYYY-MM-DD string
function addMonths(dateStr, n) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + n);
    return d.toISOString().split("T")[0];
}

// Format YYYY-MM-DD to human readable
function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function BookingCard({ property, user, availableSlots }) {
    const navigate = useNavigate();

    const today = todayStr();

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Date state
    const [startDate, setStartDate] = useState(today);
    const [dateError, setDateError] = useState("");

    const formattedPrice = new Intl.NumberFormat("en-LK").format(property.price);
    const deposit = new Intl.NumberFormat("en-LK").format(property.price * 2);
    const total = new Intl.NumberFormat("en-LK").format(property.price * 2 + property.price);

    const isTenant = user?.role === "TENANT" || user?.role === "tenant";
    const isOwner =
        user?.id && property?.ownerId && String(user.id) === String(property.ownerId);

    // Slot availability
    const isSlotsLoading = availableSlots === null;
    const isFullyBooked = availableSlots === 0;

    // Compute end date dynamically (6 months from selected start)
    const endDate = startDate ? addMonths(startDate, 6) : "";

    // ── Handlers ──────────────────────────────────────────

    const handleBookingClick = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!isTenant) return;
        if (isFullyBooked) return; // guard — should not reach here due to disabled button
        setErrorMsg("");
        setSuccessMsg("");
        setDateError("");
        setStartDate(today);
        setShowModal(true);
    };

    const handleStartDateChange = (e) => {
        const val = e.target.value;
        setStartDate(val);
        if (!val) {
            setDateError("Please select a move-in date.");
        } else if (val < today) {
            setDateError("Move-in date cannot be in the past. Please choose today or a future date.");
        } else {
            setDateError("");
        }
    };

    const validateDate = () => {
        if (!startDate) {
            setDateError("Please select a move-in date.");
            return false;
        }
        if (startDate < today) {
            setDateError("Move-in date cannot be in the past. Please choose today or a future date.");
            return false;
        }
        setDateError("");
        return true;
    };

    const handleConfirmBooking = async () => {
        if (!validateDate()) return;

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const payload = {
                propertyId: property.id,
                tenantId: user.id,
                ownerId: property.ownerId,
                startDate: startDate,
                endDate: endDate,
                monthlyRent: property.price,
            };

            await createBookingRequest(payload);
            setSuccessMsg("Booking request sent! The owner will review your request.");
            setShowModal(false);

            setTimeout(() => {
                navigate("/tenant/dashboard");
            }, 2000);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                "Failed to submit booking request. Please try again.";
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setErrorMsg("");
        setDateError("");
    };

    const buttonLabel = !user
        ? "Log in to Book"
        : isFullyBooked
        ? "Fully Booked"
        : isSlotsLoading
        ? "Checking availability..."
        : !isTenant
        ? isOwner
            ? "You own this property"
            : "Not available for your role"
        : "Request Booking";

    const buttonDisabled = !user || (!isTenant && !isOwner) || isOwner || isFullyBooked || isSlotsLoading;

    return (
        <>
            <div className="lg:w-[400px] shrink-0">
                <div className="sticky top-24 border border-slate-200 bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-primary">LKR {formattedPrice}</span>
                                <span className="text-slate-500 text-sm">/ month</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <span
                                    className="material-symbols-outlined text-primary text-sm"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    star
                                </span>
                                <span className="font-bold">{property.rating || 0}</span>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl mb-4 overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-slate-200">
                                <div className="p-3">
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Available From</p>
                                    <p className="text-sm font-medium">
                                        {new Date(property.availableFrom).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Min Stay</p>
                                    <p className="text-sm font-medium">6 Months</p>
                                </div>
                            </div>
                            <div className="p-3 border-t border-slate-200">
                                <p className="text-[10px] font-bold uppercase text-slate-500">Occupants</p>
                                <p className="text-sm font-medium">1 Person</p>
                            </div>
                        </div>

                        {/* Availability badge */}
                        {isSlotsLoading ? (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                <span className="text-xs text-slate-400 font-medium">Checking availability...</span>
                            </div>
                        ) : isFullyBooked ? (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                <span className="material-symbols-outlined text-red-500 text-[18px]">block</span>
                                <div>
                                    <p className="text-xs font-bold text-red-700">No rooms available</p>
                                    <p className="text-[10px] text-red-500">All bedrooms are currently occupied</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <span className="material-symbols-outlined text-emerald-500 text-[18px]">bed</span>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700">
                                        {availableSlots} bedroom{availableSlots !== 1 ? "s" : ""} available
                                    </p>
                                    <p className="text-[10px] text-emerald-600">Request now to secure your spot</p>
                                </div>
                            </div>
                        )}

                        {/* Success message */}
                        {successMsg && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5">check_circle</span>
                                <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
                            </div>
                        )}

                        {/* Error message */}
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
                                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                            </div>
                        )}

                        <button
                            onClick={handleBookingClick}
                            disabled={buttonDisabled}
                            className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all mb-4 active:scale-[0.98]
                                ${isFullyBooked
                                    ? "bg-red-100 text-red-400 cursor-not-allowed shadow-none"
                                    : buttonDisabled
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                    : "bg-primary text-white shadow-primary/30 hover:bg-primary/90 cursor-pointer"
                                }`}
                        >
                            {isFullyBooked && (
                                <span className="material-symbols-outlined text-lg align-middle mr-1">block</span>
                            )}
                            {buttonLabel}
                        </button>
                        <p className="text-center text-xs text-slate-500 mb-6">You won't be charged yet</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Monthly Rent</span>
                                <span className="font-medium">LKR {formattedPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Security Deposit</span>
                                <span className="font-medium">LKR {deposit}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-4 flex justify-between font-black text-lg">
                                <span>Total to pay now</span>
                                <span className="text-primary">LKR {total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                            <span className="text-xs font-bold">Secure Payment Protection</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                            info
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 text-slate-400 text-sm hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">flag</span>
                        Report this listing
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl">home</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Confirm Booking Request</h3>
                                <p className="text-xs text-slate-500">This sends a request to the owner for approval</p>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">event</span>
                                    Move-in Date <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={today}
                                onChange={handleStartDateChange}
                                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all
                                    ${dateError
                                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                                        : "border-slate-200 focus:ring-primary/30 focus:border-primary bg-slate-50"
                                    }`}
                            />
                            {dateError && (
                                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {dateError}
                                </p>
                            )}
                            {startDate && !dateError && (
                                <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Move-in: {formatDate(startDate)} — End: {formatDate(endDate)}
                                </p>
                            )}
                        </div>

                        {/* Booking Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2.5 border border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Property</span>
                                <span className="font-semibold text-slate-800 text-right max-w-[200px] line-clamp-1">{property.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Monthly Rent</span>
                                <span className="font-semibold text-primary">LKR {formattedPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Start Date</span>
                                <span className="font-semibold">{startDate ? formatDate(startDate) : "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">End Date</span>
                                <span className="font-semibold">{endDate ? formatDate(endDate) : "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-semibold">6 months (min)</span>
                            </div>
                        </div>

                        {/* API error inside modal */}
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-500 text-base mt-0.5">error</span>
                                <p className="text-sm text-red-700">{errorMsg}</p>
                            </div>
                        )}

                        <p className="text-xs text-slate-400 mb-6 text-center">
                            The owner will review your request. You won't be charged until approved.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting || !!dateError || !startDate}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                                    ${isSubmitting || dateError || !startDate
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                        : "bg-primary text-white shadow-primary/25 hover:bg-primary/90"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        Confirm Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
