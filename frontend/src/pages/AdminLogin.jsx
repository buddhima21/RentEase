import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Invalid credentials');
            }

            const userData = result.data;

            // Verify role is ADMIN
            if (userData.role !== 'ADMIN') {
                throw new Error('Unauthorized Access: Admin privileges required.');
            }

            // Save JWT token and admin user details (separate from normal user login)
            localStorage.setItem('adminToken', userData.token);
            localStorage.setItem('adminUser', JSON.stringify({
                id: userData.id,
                fullName: userData.fullName,
                email: userData.email,
                role: userData.role
            }));

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white font-[Inter] text-slate-900 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="flex h-full grow flex-col">
                    {/* Top Navigation Bar */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 px-6 md:px-10 py-3 bg-white">
                        <div className="flex items-center gap-4 text-slate-900">
                            <div className="w-8 h-8 text-[#1DBC60]">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                        d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" 
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
                                RentEase Admin
                            </h2>
                        </div>
                        <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#1DBC60] text-slate-900 text-sm font-bold transition-colors hover:bg-[#1DBC60]/90">
                            <span className="truncate">Support</span>
                        </button>
                    </header>

                    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-100">
                        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-200">
                            {/* Left Side: Hero/Branding */}
                            <div className="hidden lg:flex flex-col justify-between p-12 bg-white border-r border-slate-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-black text-slate-900 mb-4">
                                        The future of property management.
                                    </h1>
                                    <p className="text-slate-600 text-lg">
                                        Streamline your operations, manage listings, and handle tenant requests all in one secure place.
                                    </p>
                                </div>
                                <div className="relative z-10 mt-12">
                                    <div 
                                        className="w-full aspect-video rounded-xl bg-slate-200 bg-cover bg-center shadow-sm border border-slate-200/50" 
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_e1ZQE5O2WMOMKSULb8CActNIbvqOTGb5Iv9e8TpEWHCwhXw2lWzfmtleVZhC_ZKSinttGnAMh35thgtSZDe5ZlxZQmAHH7OgM3x35RhPA68x5oc__VtYnW9OHCxq1M07XCp33QzMJkQH5HnXkn5iQw6YUJKTQFqNX3BmP-QtVXmWSJe4JYELDLG-SB3pNzgvrRf3bZvbbAtplV6JNZxp6bCluTl5pWNmP2qbGtIlsYFYTp7IlpW0URSt9S2npMvZszJQ422ExQXo')" }}
                                    ></div>
                                </div>
                                <div className="relative z-10 flex gap-4 mt-12">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1DBC60]/10 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-sm">verified_user</span>
                                        MFA Protected
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1DBC60]/10 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Encrypted
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Login Form */}
                            <div className="flex flex-col justify-center p-8 md:p-16 bg-white">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Admin Login</h2>
                                    <p className="text-slate-500">Welcome back. Please enter your administrator credentials.</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-600 text-sm font-medium animate-in fade-in zoom-in duration-200">
                                        <span className="material-symbols-outlined text-lg shrink-0">error</span>
                                        <p>{error}</p>
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleLogin}>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Official Email
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                            <input 
                                                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1DBC60] focus:border-transparent transition-all outline-none" 
                                                placeholder="admin@rentease.com" 
                                                required 
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-semibold text-slate-700">Password</label>
                                            <a className="text-xs font-bold text-emerald-600 hover:underline" href="#">Forgot Password?</a>
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                            <input 
                                                className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1DBC60] focus:border-transparent transition-all outline-none" 
                                                placeholder="••••••••" 
                                                required 
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" 
                                            >
                                                <span className="material-symbols-outlined">
                                                    {showPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input 
                                            id="remember" 
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            className="rounded border-slate-300 text-[#1DBC60] focus:ring-[#1DBC60] h-4 w-4 cursor-pointer" 
                                        />
                                        <label className="text-sm text-slate-600 cursor-pointer select-none" htmlFor="remember">
                                            Keep me logged in for 30 days
                                        </label>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#1DBC60] hover:bg-[#1DBC60]/90 text-white font-bold py-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                Authorizing...
                                            </>
                                        ) : (
                                            <>
                                                Login to Admin Dashboard
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Mobile Security Badges */}
                                <div className="lg:hidden flex flex-wrap gap-3 mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm text-[#1DBC60]">verified_user</span>
                                        MFA Protected
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm text-[#1DBC60]">lock</span>
                                        256-bit Encryption
                                    </div>
                                </div>

                                <p className="mt-10 text-center text-sm text-slate-500">
                                    Authorized personnel only. Use of this system is monitored. 
                                    <br className="hidden md:block"/>
                                    <a className="text-emerald-600 hover:underline font-medium ml-1" href="#">Read Security Policy</a>
                                </p>
                            </div>
                        </div>
                    </main>

                    <footer className="p-6 text-center text-slate-500 text-xs bg-slate-100">
                        © 2024 RentEase Property Management Solutions. All rights reserved.
                    </footer>
                </div>
            </div>
        </div>
    );
}
