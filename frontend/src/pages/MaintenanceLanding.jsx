import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MaintenanceLanding() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />
            <main className="max-w-6xl mx-auto w-full px-4 py-12 flex-1">
                <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold">Maintenance Services</p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Fast, tracked home maintenance for tenants</h1>
                    <p className="mt-4 text-slate-600 max-w-3xl">
                        Report issues, track technician progress, and get timely updates through the RentEase maintenance workflow.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/maintenance/services" className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">
                            Browse Services
                        </Link>
                        <Link to="/tenant/maintenance/request" className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                            Submit Request
                        </Link>
                        <Link to="/tenant/maintenance/emergency" className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                            Emergency Request
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
