import { useEffect, useState } from "react";
import AgreementPreview from "./AgreementPreview.jsx";
import AgreementPDFButton from "./AgreementPDFButton.jsx";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AgreementDetails({ agreement }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!agreement?.id) {
            setDetails(null);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/v2/booking-agreements/${agreement.id}/details`
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        body.message || "Failed to load agreement details"
                    );
                }
                const body = await res.json();
                setDetails(body.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [agreement]);

    if (!agreement) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Select an agreement to see full details and preview.
            </div>
        );
    }

    const metaStatus = details?.status ?? "ACTIVE";
    const agreementNumber = details?.agreementNumber ?? agreement.id;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        Agreement {agreementNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                        Status: {metaStatus} • Booking: {agreement.bookingId}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <AgreementPDFButton agreementId={agreement.id} />
                    <AgreementPDFButton
                        agreementId={agreement.id}
                        mode="email"
                    />
                </div>
            </div>

            {loading && (
                <p className="text-sm text-slate-500">Loading details…</p>
            )}
            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                </p>
            )}

            <AgreementPreview
                contractId={agreementNumber}
                status={metaStatus}
                landlord={{
                    name: agreement.ownerId,
                    role: "Owner",
                    initials: initialsFromId(agreement.ownerId),
                }}
                tenant={{
                    name: agreement.tenantId,
                    role: "Tenant",
                    initials: initialsFromId(agreement.tenantId),
                }}
                propertyAddress={agreement.propertyId}
                startDate={agreement.startDate}
                endDate={agreement.endDate}
                monthlyRent={`Rs. ${
                    agreement.monthlyRent?.toLocaleString?.() ??
                    agreement.monthlyRent
                }`}
            />
        </div>
    );
}

function initialsFromId(id) {
    if (!id) return "NA";
    const parts = id.split(/[-_]/).filter(Boolean);
    if (parts.length === 0) return id.slice(0, 2).toUpperCase();
    return parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase?.() ?? "")
        .join("");
}

