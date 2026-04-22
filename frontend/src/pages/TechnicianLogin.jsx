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

            const userData = res.data?.data;
            if (userData?.role !== "TECHNICIAN") {
                setApiError("This portal is for technicians only.");
                return;
            }

            login(userData);
            navigate("/technician/dashboard", { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f6f8f7] min-h-screen flex items-center justify-center p-4 font-['Inter']">
            <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
                <div className="hidden md:block md:w-1/2 relative">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-[#13ec6d]/30 to-emerald-900/60"
                        style={{ backgroundImage: "url('/images/login.jpg')" }}
                        role="img"
                        aria-label="Maintenance technician at work"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        <h1 className="text-white text-3xl font-bold leading-tight mb-2">Technician Portal</h1>
                        <p className="text-slate-200 text-lg">Access assigned maintenance jobs and update request progress.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Technician Login</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sign in with your technician account to continue.</p>
                    </div>

                    {apiError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {apiError}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                            className="w-full bg-[#13ec6d] hover:bg-[#13ec6d]/90 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#13ec6d]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Looking for tenant or owner access?{" "}
                        <Link to="/login" className="font-bold text-[#13ec6d] hover:underline">
                            Go to main login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
