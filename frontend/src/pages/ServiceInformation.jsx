import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { MAINTENANCE_SERVICES } from "../constants/maintenance";

export default function ServiceInformation() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white flex flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
                    <MaintenanceSectionCard
                        eyebrow="Service Information"
                        title="Maintenance service information"
                        description="Choose the right category, review the common issues, and then jump into the request form with confidence."
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {MAINTENANCE_SERVICES.map((service) => (
                                <article key={service.key} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-transform hover:-translate-y-0.5">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">{service.key}</p>
                                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">{service.label}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p>
                                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
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
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/tenant/maintenance/request" className="rounded-full bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                                Get started
                            </Link>
                            <Link to="/maintenance" className="rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-5 py-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800/50">
                                Back to maintenance
                            </Link>
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </main>
            <Footer />
        </div>
    );
}
