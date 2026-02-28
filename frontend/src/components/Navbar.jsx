import { Link } from "react-router-dom";

/**
 * Navbar – Sticky top navigation bar.
 * Contains the RentEase logo, desktop nav links, and auth buttons.
 */
export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">
                            home_work
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            RentEase
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/search"
                            className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                            Search
                        </Link>
                        <Link
                            to="/map"
                            className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                            Map
                        </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="hidden sm:block px-4 py-2 text-sm font-semibold hover:text-primary transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
