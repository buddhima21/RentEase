import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Login – Placeholder page for the /login route.
 */
export default function Login() {
    return (
        <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
                <span className="material-symbols-outlined text-primary text-7xl mb-6">login</span>
                <h1 className="text-3xl font-bold mb-4">Login</h1>
                <p className="text-slate-500 mb-8 text-center max-w-md">
                    Sign in to your RentEase account to manage your listings and saved properties.
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
