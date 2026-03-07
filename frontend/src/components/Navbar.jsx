import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ showSearch = false, searchQuery = "", onSearchChange = () => { } }) {
    const { user, logout } = useAuth();
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
                    {user ? (
                        <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="font-bold text-sm">{user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}</span>
                                )}
                            </div>
                            <span className="text-sm font-semibold max-w-[120px] truncate text-slate-700 hidden md:block">{user.fullName}</span>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-[110%] w-48 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden flex flex-col">
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin/dashboard" className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                        Admin Dashboard
                                    </Link>
                                )}
                                {user.role === 'OWNER' && (
                                    <Link to="/owner/dashboard" className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-b border-slate-100">
                                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                        Owner Dashboard
                                    </Link>
                                )}
                                <button onClick={logout} className="px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
