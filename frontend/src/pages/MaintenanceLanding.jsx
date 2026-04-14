import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import MaintenanceStatCard from "../components/maintenance/MaintenanceStatCard";
import { MAINTENANCE_SERVICES } from "../constants/maintenance";

export default function MaintenanceLanding() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="p-8 md:p-12">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Maintenance Services</p>
                                <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                                    Fast, tracked home maintenance for tenants
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                                    Report issues, follow technician progress, and choose the right service path before you submit a request.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link to="/maintenance/services" className="rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                                        Browse Services
                                    </Link>
                                    <Link to="/tenant/maintenance/request" className="rounded-full bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                                        Submit Request
                                    </Link>
                                    <Link to="/tenant/maintenance/emergency" className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700">
                                        Emergency Request
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-slate-950 p-8 text-white md:p-12">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Service Snapshot</p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <MaintenanceStatCard label="Completed" value="1.2K" hint="Requests handled this year" accent="emerald" />
                                    <MaintenanceStatCard label="Response" value="2h 14m" hint="Average first response" accent="blue" />
                                    <MaintenanceStatCard label="Technicians" value="18" hint="Verified maintenance staff" accent="amber" />
                                    <MaintenanceStatCard label="Rating" value="4.8/5" hint="Tenant satisfaction average" accent="slate" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <MaintenanceSectionCard
                        eyebrow="How It Works"
                        title="A maintenance flow tenants can follow without guessing"
                        description="Pick a service, submit the request, track it while it moves through the queue, and review the result when the work is done."
                    >
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { step: "01", title: "Choose a service", body: "Browse the catalog and pick the issue category that best matches the problem." },
                                { step: "02", title: "Submit the request", body: "Add the unit, description, priority, and photos so the team can triage quickly." },
                                { step: "03", title: "Track completion", body: "Watch the request move from submitted to resolved and closed in the tenant flow." },
                            ].map((item) => (
                                <div key={item.step} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Step {item.step}</p>
                                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard
                        eyebrow="Service Categories"
                        title="Every request starts with the right category"
                        description="The service catalog below mirrors the request form, so tenants can jump straight into the right path."
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {MAINTENANCE_SERVICES.map((service) => (
                                <article key={service.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">{service.key}</p>
                                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">{service.label}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                                    <Link to="/maintenance/services" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                        Open service details
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </main>
            <Footer />
        </div>
    );
}
