import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { MAINTENANCE_SERVICES } from "../constants/maintenance";

export default function ServiceInformation() {
    return (
        <div className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-[#0b1120] dark:text-white flex flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="p-8 md:p-12 lg:p-14">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Service Information</p>
                                <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
                                    Choose the right maintenance path with confidence.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                                    Review the most common service categories, what they cover, and how quickly each type of issue typically moves through the queue before you submit a request.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link to="/tenant/maintenance/request" className="rounded-full bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                                        Start a request
                                    </Link>
                                    <Link to="/maintenance" className="rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/50">
                                        Back to maintenance
                                    </Link>
                                </div>

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {[
                                        "Common issues are grouped the same way as the request form",
                                        "Repair timelines and cost ranges are shown upfront",
                                        "Service categories mirror the queue and technician workflow",
                                        "Helpful if you need to compare an issue before submitting",
                                    ].map((item) => (
                                        <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 bg-slate-950 p-8 text-white dark:border-slate-700 lg:border-l lg:border-t-0 md:p-12 lg:p-14">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Quick stats</p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <MaintenanceStatCard label="Categories" value={`${MAINTENANCE_SERVICES.length}`} hint="Service types in the catalog" accent="emerald" />
                                    <MaintenanceStatCard label="Guidance" value="Clear" hint="Common issues and expectations" accent="blue" />
                                    <MaintenanceStatCard label="Routing" value="Fast" hint="Designed for quick triage" accent="amber" />
                                    <MaintenanceStatCard label="Access" value="24/7" hint="Available before and after signup" accent="slate" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <MaintenanceSectionCard
                        eyebrow="Service Catalog"
                        title="Common issues, typical timelines, and cost guidance all in one place"
                        description="This catalog is designed to help tenants choose the right request path before they submit, which improves triage speed and reduces unnecessary back-and-forth."
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {MAINTENANCE_SERVICES.map((service) => (
                                <article key={service.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">{service.key}</p>
                                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">{service.label}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p>
                                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Common issues</p>
                                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{service.commonIssues.join(" • ")}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Repair time</p>
                                                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{service.averageRepairTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Cost range</p>
                                                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{service.costRange}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/tenant/maintenance/request"
                                        className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                        Request this service
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </MaintenanceSectionCard>

                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700">
                        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="p-8 text-white md:p-12 lg:p-14">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Next step</p>
                                <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight md:text-4xl">
                                    Ready to submit? Start with the request form and keep the same clean flow.
                                </h2>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                                    The service catalog is intentionally aligned with the maintenance landing page, so the public maintenance journey feels like one continuous experience.
                                </p>
                            </div>
                            <div className="flex flex-col justify-center gap-3 border-t border-white/10 bg-white/5 p-8 md:p-12 lg:border-l lg:border-t-0">
                                <Link to="/tenant/maintenance/request" className="rounded-full bg-primary px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-primary/90">
                                    Start a request
                                </Link>
                                <Link to="/maintenance" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-white/15">
                                    Back to maintenance
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
