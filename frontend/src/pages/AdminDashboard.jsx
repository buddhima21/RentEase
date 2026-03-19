import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewModeration from "../components/admin/ReviewModeration";
import { useAuth } from "../context/AuthContext";

/**
 * AdminDashboard – The central hub for administrators.
 */
export default function AdminDashboard() {
    const { user } = useAuth();

    // Redirect non-admins
    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="bg-[#f0f9ff]/50 text-slate-900 min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full flex flex-col items-center px-4 py-12 md:py-20">
                <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-slate-900 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-xl text-3xl">admin_panel_settings</span>
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 font-medium text-lg lg:ml-12">
                            Oversee platform operations, moderate reviews, and maintain community standards.
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <Link
                            to="/"
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xl">home</span>
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Moderation Component */}
                <ReviewModeration />

            </main>
            <Footer />
        </div>
    );
}
