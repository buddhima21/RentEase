import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SERVICES = [
    "Electrical",
    "Plumbing",
    "HVAC",
    "Appliance",
    "Painting",
    "Handyman",
];

export default function ServiceInformation() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />
            <main className="max-w-6xl mx-auto w-full px-4 py-12 flex-1">
                <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Maintenance Service Information</h1>
                    <p className="mt-3 text-slate-600">Choose a service category and submit a request with details and photos.</p>
                    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SERVICES.map((service) => (
                            <article key={service} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <h3 className="font-bold text-slate-900">{service}</h3>
                                <p className="mt-2 text-sm text-slate-600">Average turnaround: 24-72 hours depending on issue severity.</p>
                                <Link
                                    to="/tenant/maintenance/request"
                                    className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    Request {service}
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
