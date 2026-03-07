import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewManager from "../components/owner/ReviewManager";

/**
 * OwnerDashboard – The central hub for property owners.
 */
export default function OwnerDashboard() {
    return (
        <div className="bg-background-light text-slate-900 min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full flex flex-col items-center px-4 py-12 md:py-20">
                <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-slate-900">Owner Dashboard</h1>
                        <p className="text-slate-500 font-medium text-lg">
                            Manage your property listings, track inquiries, and view your reviews.
                        </p>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        <Link
                            to="/owner/analytics"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-[0_8px_20px_rgba(236,91,19,0.2)]"
                        >
                            <span className="material-symbols-outlined text-xl">analytics</span>
                            System Analytics
                        </Link>
                        <Link
                            to="/"
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* The new Premium Review Component */}
                <ReviewManager />

            </main>
            <Footer />
        </div>
    );
}
