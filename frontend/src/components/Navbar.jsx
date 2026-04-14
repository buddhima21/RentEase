import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

export default function Navbar({ showSearch = false, searchQuery = "", onSearchChange = () => { } }) {
    const { user, logout } = useAuth();

    return (
        <header className="relative flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0 z-20">
            {/* Left Section */}
            <div className="flex items-center gap-8 z-10">
                <Link to="/" className="flex items-center gap-3 group">
                    {/* Brand Logo - Black & Green - Modern & Simple */}
                    <div className="relative flex items-center justify-center w-10 h-10 bg-emerald-50/50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 10L12 4L20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"/>
                            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" className="text-emerald-500"/>
                            <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500"/>
                        </svg>
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Rent<span className="text-primary">Ease</span>
                    </span>
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

            {/* Center Navigation */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-8 z-0">
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

            {/* Right Section */}
            <div className="flex items-center gap-6 z-10">
                {user ? (
                    <UserDropdown user={user} onLogout={logout} />
                ) : (
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
                )}
            </div>
        </header>
    );
}
