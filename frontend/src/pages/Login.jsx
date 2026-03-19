import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Login – Card-based login page with left image + right form.
 */
export default function Login() {
    const { login } = useAuth();
    const [role, setRole] = useState("TENANT");
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (submitted) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errs.email = "Please enter a valid email address.";
        if (formData.password.length < 8)
            errs.password = "Password must be at least 8 characters.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        setApiError("");

        try {
            const res = await loginUser({
                email: formData.email,
                password: formData.password,
            });

            // Store user in localStorage via Context
            login(res.data.data);

            // Redirect to home
            navigate("/");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Something went wrong. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    /* ─── SVG icons ─── */
    const GoogleIcon = () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    const AppleIcon = () => (
        <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
    );

    const DiamondLogo = () => (
        <svg className="size-8 text-[#13ec6d]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
        </svg>
    );

    return (
        <div className="bg-[#f6f8f7] min-h-screen flex items-center justify-center p-4 font-['Inter']">
            <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
                {/* ═══════════════ Left Panel: Image ═══════════════ */}
                <div className="hidden md:block md:w-1/2 relative">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-[#13ec6d]/30 to-emerald-900/60"
                        style={{ backgroundImage: "url('/images/login.jpg')" }}
                        role="img"
                        aria-label="Luxury modern villa with pool and tropical garden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        <div className="flex items-center gap-2 mb-4">
                            <DiamondLogo />
                            <span className="text-white text-2xl font-bold tracking-tight">RentEase</span>
                        </div>
                        <h1 className="text-white text-3xl font-bold leading-tight mb-2">
                            Find your next island getaway.
                        </h1>
                        <p className="text-slate-200 text-lg">
                            Seamless rentals for modern living in Sri Lanka.
                        </p>
                    </div>
                </div>

                {/* ═══════════════ Right Panel: Form ═══════════════ */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please enter your details to sign in to your account.</p>
                    </div>

                    {/* ── Error Message ── */}
                    {apiError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {apiError}
                        </div>
                    )}

                    {/* Role Toggle */}
                    <div className="mb-8">
                        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => setRole("TENANT")}
                                className={`flex h-full grow items-center justify-center rounded-lg px-2 font-semibold transition-all cursor-pointer ${role === "TENANT"
                                    ? "bg-white text-[#13ec6d] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                Tenant
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("OWNER")}
                                className={`flex h-full grow items-center justify-center rounded-lg px-2 font-semibold transition-all cursor-pointer ${role === "OWNER"
                                    ? "bg-white text-[#13ec6d] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                Owner
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                                </div>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/50 focus:border-[#13ec6d] ${submitted && errors.email ? "border-red-400" : "border-slate-200"
                                        }`}
                                />
                            </div>
                            {submitted && errors.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                                </div>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-11 pr-12 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/50 focus:border-[#13ec6d] ${submitted && errors.password ? "border-red-400" : "border-slate-200"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {submitted && errors.password && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember me & Forgot password */}
                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-[#13ec6d] focus:ring-[#13ec6d] cursor-pointer"
                                />
                                <span className="text-sm text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-[#13ec6d] hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#13ec6d] hover:bg-[#13ec6d]/90 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-[#13ec6d]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-200" />
                            <span className="shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Or continue with
                            </span>
                            <div className="flex-grow border-t border-slate-200" />
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => console.log("Google login clicked")}
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                <GoogleIcon />
                                <span className="text-sm font-semibold text-slate-700">Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => console.log("Apple login clicked")}
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                <AppleIcon />
                                <span className="text-sm font-semibold text-slate-700">Apple</span>
                            </button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="font-bold text-[#13ec6d] hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
