import { useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AgreementPDFButton({ agreementId, mode = "download" }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!agreementId) return null;

    const handleClick = async () => {
        setLoading(true);
        setError(null);

        try {
            if (mode === "download") {
                const res = await fetch(
                    `${API_BASE_URL}/api/v2/booking-agreements/${agreementId}/pdf`
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        body.message || "Failed to download agreement PDF"
                    );
                }
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `agreement-${agreementId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else if (mode === "email") {
                const email = window.prompt(
                    "Enter email address to send the agreement to:"
                );
                if (!email) {
                    setLoading(false);
                    return;
                }
                const res = await fetch(
                    `${API_BASE_URL}/api/v2/booking-agreements/${agreementId}/email`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ toEmail: email }),
                    }
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        body.message || "Failed to trigger agreement email"
                    );
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const label =
        mode === "download" ? "Download PDF" : "Email PDF to tenant";

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span className="material-symbols-outlined text-base">
                    {mode === "download" ? "file_download" : "send"}
                </span>
                {loading ? "Processing..." : label}
            </button>
            {error && (
                <span className="text-[11px] text-red-600 max-w-xs text-right">
                    {error}
                </span>
            )}
        </div>
    );
}

