import { useEffect, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AgreementList({ bookingId, onSelect }) {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bookingId) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/v1/agreements/booking/${bookingId}`
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || "Failed to load agreements");
                }
                const body = await res.json();
                setAgreements(Array.isArray(body.data) ? body.data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [bookingId]);

    if (!bookingId) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Select a booking to see its agreements.
            </div>
        );
    }

    return (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                    Agreements for booking {bookingId}
                </h3>
                {loading && (
                    <span className="text-xs text-slate-500">
                        Loading agreements…
                    </span>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                </p>
            )}

            {!loading && agreements.length === 0 && !error && (
                <p className="text-sm text-slate-500">
                    No agreements found for this booking yet.
                </p>
            )}

            <ul className="space-y-2">
                {agreements.map((agreement) => (
                    <li
                        key={agreement.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                        <div>
                            <p className="font-semibold text-slate-900">
                                {agreement.id}
                            </p>
                            <p className="text-xs text-slate-500">
                                {agreement.startDate} – {agreement.endDate} • Rs.{" "}
                                {agreement.monthlyRent?.toLocaleString?.() ??
                                    agreement.monthlyRent}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelect && onSelect(agreement)}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/20 hover:bg-primary/5"
                        >
                            View details
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

