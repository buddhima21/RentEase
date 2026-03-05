import { Link } from "react-router-dom";

export default function Navbar({ showSearch = false, searchQuery = "", onSearchChange = () => { } }) {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0 z-20">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-3xl font-bold">diamond</span>
                    <h2 className="text-xl font-bold tracking-tight">RentEase</h2>
                </Link>
                {showSearch && (
                    <div className="hidden md:flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-1.5 w-80">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
                            placeholder="Search by title, address, city..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden lg:flex items-center gap-6">
                    <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/listings" className="text-sm font-semibold text-primary">
                        Listings
                    </Link>
                    <Link to="/favorites" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                        Favorites
                    </Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    );
}
