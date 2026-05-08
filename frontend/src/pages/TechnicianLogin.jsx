import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function TechnicianLogin() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const normalizeRole = (roleValue) =>
        String(roleValue || "")
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");

    useEffect(() => {
        if (user?.role === "TECHNICIAN") {
            navigate("/technician/dashboard", { replace: true });
        }
    }, [user, navigate]);

    if (user?.role === "TECHNICIAN") {
        return <Navigate to="/technician/dashboard" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (submitted) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = "Please enter a valid email address.";
        }
        if (formData.password.length < 8) {
            nextErrors.password = "Password must be at least 8 characters.";
        }
        return nextErrors;
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

            const userData = res.data?.data ?? res.data;
            const normalizedRole = normalizeRole(userData?.role);

            if (!userData || !userData.token) {
                setApiError("Login response was incomplete. Please try again.");
                return;
            }

            if (normalizedRole !== "TECHNICIAN") {
                setApiError("This portal is for technicians only.");
                return;
            }

            // Prevent session pollution by aggressive clearing of stale/conflicting auth
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            localStorage.removeItem("token");
            
            login({ ...userData, role: normalizedRole });
            navigate("/technician/dashboard", { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-[#0b1120] dark:text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-6 md:py-14">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid min-h-[720px] lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="relative flex min-h-[320px] flex-col justify-end overflow-hidden border-b border-slate-200 bg-slate-950 p-8 text-white md:p-12 lg:border-b-0 lg:border-r lg:p-14">
                            <div
                                className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,194,137,0.35),_transparent_45%),linear-gradient(145deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.92))]"
                                aria-hidden="true"
                            />
                            <div className="absolute inset-0 bg-[url('/images/login.jpg')] bg-cover bg-center opacity-20 mix-blend-screen" aria-hidden="true" />
                            <div className="relative max-w-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Technician Portal</p>
                                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                    Access assigned jobs and keep every request moving.
                                </h1>
                                <p className="mt-4 max-w-lg text-base leading-7 text-slate-200 md:text-lg">
                                    The technician portal uses the same clean brand system as the public maintenance pages so the handoff from request to resolution feels consistent.
                                </p>

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {[
                                        "View only jobs assigned to your role",
                                        "Update status, notes, and completion details",
                                        "Track pause and resume workflows clearly",
                                        "Keep maintenance progress visible for tenants and owners",
                                    ].map((item) => (
                                        <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 backdrop-blur-sm">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                            <div className="mb-8 max-w-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Sign in</p>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">Technician login</h2>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    Sign in with your technician account to continue to your assigned maintenance jobs.
                                </p>
                            </div>

                            {apiError && (
                                <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {apiError}
                                </div>
                            )}

                            <form className="space-y-5 max-w-xl" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label htmlFor="tech-login-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                                </div>
                                <input
                                    id="tech-login-email"
                                    name="email"
                                    type="email"
                                    placeholder="technician@rentease.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/50 focus:border-[#13ec6d] ${submitted && errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                                />
                            </div>
                            {submitted && errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="tech-login-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                                </div>
                                <input
                                    id="tech-login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-11 pr-12 py-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/50 focus:border-[#13ec6d] ${submitted && errors.password ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-300 cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {submitted && errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all transform cursor-pointer flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
                            </form>

                            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                                <Link to="/maintenance" className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/50">
                                    Back to maintenance
                                </Link>
                                <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
                                    Looking for tenant or owner access?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
