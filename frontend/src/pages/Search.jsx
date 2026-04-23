import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Search – Placeholder page for the /search route.
 */
export default function Search() {
    return (
        <div className="bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
                <span className="material-symbols-outlined text-primary text-7xl mb-6">search</span>
                <h1 className="text-3xl font-bold mb-4">Search Properties</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
                    Advanced search with filters for location, price, type, and amenities is coming soon.
                </p>
                <Link
                    to="/"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                    Back to Home
                </Link>
            </main>
            <Footer />
        </div>
    );
}

