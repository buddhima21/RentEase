/**
 * AgreementPreview – Read-only preview of a residential lease agreement.
 * Matches the RentEase design with a main content panel and a right sidebar
 * for parties and e-signature.
 *
 * This is purely a presentational component – pass real data via props
 * and handle the `onSign` callback to integrate with your flow.
 */
export default function AgreementPreview({
    contractId = "RE-2023-9942",
    status = "Draft",
    landlord = { name: "Alex Johnson", role: "Landlord", initials: "AJ" },
    tenant = { name: "Jordan Smith", role: "Tenant", initials: "JS" },
    propertyAddress = "4522 Oakwood Avenue, Unit 4B, Seattle, WA 98101",
    startDate = "June 1, 2024",
    endDate = "May 31, 2025",
    monthlyRent = "$2,450.00",
    onSign,
}) {
    const handleSignClick = () => {
        if (onSign) {
            onSign();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-6xl">
                {/* Top bar – breadcrumb + actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                            Rentals
                        </button>
                        <span className="material-symbols-outlined text-base text-slate-400">
                            chevron_right
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            Agreement Preview
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <span className="material-symbols-outlined text-base">file_download</span>
                            Download PDF
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <span className="material-symbols-outlined text-base">print</span>
                            Print
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <span className="material-symbols-outlined text-base">share</span>
                            Share
                        </button>
                    </div>
                </div>

                {/* Main layout */}
                <div className="grid gap-8 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)]">
                    {/* Agreement content */}
                    <section className="relative rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Residential Lease Agreement
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Contract ID:{" "}
                                    <span className="font-semibold text-slate-900">
                                        {contractId}
                                    </span>
                                </p>
                            </div>

                            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                {status}
                            </span>
                        </header>

                        <div className="space-y-7 text-sm leading-relaxed text-slate-700">
                            {/* 1. The Parties */}
                            <section>
                                <h2 className="mb-2 text-sm font-black tracking-wide text-slate-900">
                                    1. THE PARTIES
                                </h2>
                                <p className="text-sm text-slate-700">
                                    This Lease Agreement is made on this 24th day of May, 2024, by and
                                    between{" "}
                                    <span className="font-semibold">{landlord.name}</span> (hereinafter
                                    referred to as the &quot;Landlord&quot;) and{" "}
                                    <span className="font-semibold">{tenant.name}</span> (hereinafter
                                    referred to as the &quot;Tenant&quot;).
                                </p>
                            </section>

                            {/* 2. The Property */}
                            <section>
                                <h2 className="mb-2 text-sm font-black tracking-wide text-slate-900">
                                    2. THE PROPERTY
                                </h2>
                                <p className="text-sm text-slate-700">
                                    The Landlord agrees to lease the residential premises located at{" "}
                                    <span className="font-semibold">{propertyAddress}</span> to the
                                    Tenant for residential use only.
                                </p>
                            </section>

                            {/* 3. Term of Lease */}
                            <section>
                                <h2 className="mb-2 text-sm font-black tracking-wide text-slate-900">
                                    3. TERM OF LEASE
                                </h2>
                                <p className="text-sm text-slate-700">
                                    The term of this lease shall be for a period of 12 months,
                                    commencing on {startDate}, and ending on {endDate}.
                                </p>
                            </section>

                            {/* 4. Rent Payments */}
                            <section>
                                <h2 className="mb-2 text-sm font-black tracking-wide text-slate-900">
                                    4. RENT PAYMENTS
                                </h2>
                                <p className="text-sm text-slate-700">
                                    The Tenant agrees to pay a monthly rent of{" "}
                                    <span className="font-semibold">{monthlyRent}</span>. Payments are
                                    due on the 1st of each month. A late fee of $50.00 shall be
                                    applied if rent is not received within 5 days of the due date.
                                </p>
                            </section>

                            {/* More sections placeholder */}
                            <section>
                                <h2 className="mb-2 text-sm font-black tracking-wide text-slate-900">
                                    5. SECURITY DEPOSIT
                                </h2>
                                <p className="text-sm text-slate-700">
                                    Additional terms such as security deposit, maintenance
                                    responsibilities, utilities, and house rules can be detailed here
                                    as needed. This section is intentionally brief and can be expanded
                                    based on your legal template.
                                </p>
                            </section>
                        </div>
                    </section>

                    {/* Right sidebar */}
                    <aside className="space-y-4 lg:space-y-6">
                        {/* Parties Involved */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Parties Involved
                                </h3>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    Lease
                                </span>
                            </div>

                            <div className="space-y-4">
                                <PartyRow
                                    label="Landlord"
                                    name={landlord.name}
                                    initials={landlord.initials}
                                />
                                <PartyRow
                                    label="Tenant"
                                    name={tenant.name}
                                    initials={tenant.initials}
                                />
                            </div>
                        </section>

                        {/* E-Signature */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h3 className="text-sm font-semibold text-slate-900">
                                E-Signature
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Draw your signature below to sign this agreement electronically.
                            </p>

                            <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400">
                                Signature
                            </div>

                            <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span>
                                    I agree to the legally binding nature of this electronic
                                    signature.
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleSignClick}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                            >
                                Sign Agreement
                            </button>

                            <p className="mt-3 flex items-start gap-2 text-[11px] text-slate-500">
                                <span className="material-symbols-outlined text-base text-amber-500">
                                    info
                                </span>
                                <span>
                                    Once signed, a copy will be sent to both parties&apos; registered
                                    email addresses.
                                </span>
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function PartyRow({ label, name, initials }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                    {initials}
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                    </p>
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                </div>
            </div>
        </div>
    );
}

