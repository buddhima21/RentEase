import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createAgreement, getEligibleAgreementBookings } from "../services/api";

export default function CreateAgreement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [rentAmount, setRentAmount] = useState("");
    const [rulesNotes, setRulesNotes] = useState("");
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== "TENANT") {
            navigate("/login");
            return;
        }
        (async () => {
            try {
                const res = await getEligibleAgreementBookings(user.id);
                const rows = res.data?.data || [];
                setBookings(rows);
                if (rows.length === 1) {
                    setBookingId(rows[0].id);
                    if (rows[0].monthlyRent) setRentAmount(String(rows[0].monthlyRent));
                }
            } catch (e) {
                setFormError(e.response?.data?.message || "Could not load eligible bookings.");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, navigate]);

    const selectedBooking = bookings.find((b) => b.id === bookingId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!bookingId) {
            setFormError("Select an approved booking.");
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                bookingId,
                startDate,
                endDate,
                rulesNotes: rulesNotes.trim() || undefined,
            };
            const ra = parseFloat(rentAmount, 10);
            if (!Number.isNaN(ra) && ra > 0) payload.rentAmount = ra;

            const res = await createAgreement(payload);
            const created = res.data?.data;
            if (created?.id) navigate(`/tenant/agreements/${created.id}`);
            else navigate("/tenant/agreements");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                (err.response?.data?.errors && Object.values(err.response.data.errors).join(", ")) ||
                "Failed to create agreement.";
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50">
            <Navbar />
            <div className="max-w-xl mx-auto px-4 py-8">
                <Link to="/tenant/agreements" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mb-6">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to agreements
                </Link>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Create rental agreement</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                    Only bookings approved by the owner appear here. Dates must be today or in the future; end date must be after start date.
                </p>

                {loading && <p className="text-slate-500 dark:text-slate-400">Loading…</p>}
                {!loading && bookings.length === 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-5 text-sm">
                        You have no eligible bookings. Request a property and wait for the owner to approve your booking first.
                        <Link to="/tenant/dashboard" className="block mt-3 font-bold text-primary">
                            Go to my bookings
                        </Link>
                    </div>
                )}
                {!loading && bookings.length > 0 && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-sm">
                        {formError && (
                            <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm p-3 font-medium">{formError}</div>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Booking</label>
                            <select
                                required
                                value={bookingId}
                                onChange={(e) => {
                                    setBookingId(e.target.value);
                                    const b = bookings.find((x) => x.id === e.target.value);
                                    if (b?.monthlyRent) setRentAmount(String(b.monthlyRent));
                                }}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            >
                                <option value="">Select booking</option>
                                {bookings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.propertyTitle || b.propertyCity || "Property"} — {b.status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Start date</label>
                                <input
                                    type="date"
                                    required
                                    min={today}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">End date</label>
                                <input
                                    type="date"
                                    required
                                    min={startDate || today}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                                Monthly rent (LKR) <span className="font-normal normal-case text-slate-400">— optional; defaults to booking</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={rentAmount}
                                onChange={(e) => setRentAmount(e.target.value)}
                                placeholder={selectedBooking?.monthlyRent ? String(selectedBooking.monthlyRent) : "e.g. 50000"}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Rules / notes</label>
                            <textarea
                                value={rulesNotes}
                                onChange={(e) => setRulesNotes(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 resize-none"
                                placeholder="Optional notes for this agreement…"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-60"
                        >
                            {submitting ? "Creating…" : "Create agreement"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
