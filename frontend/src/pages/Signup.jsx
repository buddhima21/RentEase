import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Signup – Full registration page with split layout.
 * Left panel: hero image + brand. Right panel: role toggle + form.
 */
export default function Signup() {
    const { login } = useAuth();
    const [role, setRole] = useState("TENANT");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field as user types
        if (submitted) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Please enter a valid email address.";
        if (!formData.phone || formData.phone.replace(/\D/g, "").length < 9)
            newErrors.phone = "Phone number must be at least 9 digits.";
        if (formData.password.length < 8)
            newErrors.password = "Password must be at least 8 characters.";
        if (!agreeTerms)
            newErrors.agreeTerms = "You must agree to the terms.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        setApiError("");
        setSuccessMsg("");

        try {
            const res = await signupUser({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role,
            });

            // Store user in localStorage via Context
            login(res.data.data);
            setSuccessMsg("Account created successfully! Redirecting to login...");

            // Redirect to login after short delay
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Something went wrong. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    /* ─── Reusable SVG icons for social buttons ─── */
    const GoogleIcon = () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    const AppleIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.11-.02-1.48-.71-2.76-.71-1.3 0-1.71.69-2.76.73-1.1.03-2.11-.74-3.14-1.78C3.03 18.11 1.5 14.36 1.5 10.74c0-3.5 2.27-5.36 4.47-5.36 1.11 0 2.16.4 2.83.84.66.44 1.71.9 2.83.9 1.13 0 1.93-.46 2.83-.9.68-.44 1.89-.84 3.03-.84 1.13 0 2.37.47 3.19 1.48-2.61 1.56-2.18 5.37.42 6.44-.95 2.4-2.22 4.79-4.1 6.67zM15 3.17c0-1.84-1.54-3.17-3.17-3.17-1.63 0-3.17 1.33-3.17 3.17 0 1.84 1.54 3.17 3.17 3.17 1.63 0 3.17-1.33 3.17-3.17z" />
        </svg>
    );

    return (
        <div className="flex min-h-screen w-full font-['Inter']">
            {/* ═══════════════ Left Panel: Form ═══════════════ */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto bg-[#f8f6f6]">
                <div className="w-full max-w-md space-y-8">
                    {/* ── Mobile Header ── */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <span className="material-symbols-outlined text-[#13ec6d] text-3xl">home_work</span>
                        <h2 className="text-slate-900 text-2xl font-bold">RentEase</h2>
                    </div>

                    {/* ── Heading ── */}
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900">Create account</h2>
                        <p className="text-slate-500">Join thousands of users managing properties today.</p>
                    </div>

                    {/* ── Success / Error Messages ── */}
                    {successMsg && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {successMsg}
                        </div>
                    )}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {apiError}
                        </div>
                    )}

                    {/* ── Role Selector ── */}
                    <div className="flex p-1 bg-slate-200/50 rounded-xl" role="radiogroup" aria-label="Account type">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === "TENANT"}
                            onClick={() => setRole("TENANT")}
                            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${role === "TENANT"
                                ? "bg-white text-[#13ec6d] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined mr-2 text-lg">person</span>
                            Tenant
                        </button>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === "OWNER"}
                            onClick={() => setRole("OWNER")}
                            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${role === "OWNER"
                                ? "bg-white text-[#13ec6d] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined mr-2 text-lg">real_estate_agent</span>
                            Owner
                        </button>
                    </div>

                    {/* ── Social Sign Up ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => console.log("Google signup clicked")}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <GoogleIcon />
                            <span className="text-sm font-semibold">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => console.log("Apple signup clicked")}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <AppleIcon />
                            <span className="text-sm font-semibold">Apple</span>
                        </button>
                    </div>

                    {/* ── Divider ── */}
                    <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-slate-200" />
                        <span className="shrink mx-4 text-slate-400 text-xs uppercase tracking-widest font-bold">
                            Or with email
                        </span>
                        <div className="flex-grow border-t border-slate-200" />
                    </div>

                    {/* ── Registration Form ── */}
                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label htmlFor="fullName" className="text-sm font-semibold text-slate-700 ml-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        person
                                    </span>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/20 focus:border-[#13ec6d] ${submitted && errors.fullName ? "border-red-400" : "border-slate-200"
                                            }`}
                                    />
                                </div>
                                {submitted && errors.fullName && (
                                    <p className="text-red-500 text-xs ml-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        mail
                                    </span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/20 focus:border-[#13ec6d] ${submitted && errors.email ? "border-red-400" : "border-slate-200"
                                            }`}
                                    />
                                </div>
                                {submitted && errors.email && (
                                    <p className="text-red-500 text-xs ml-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label htmlFor="phone" className="text-sm font-semibold text-slate-700 ml-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        call
                                    </span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/20 focus:border-[#13ec6d] ${submitted && errors.phone ? "border-red-400" : "border-slate-200"
                                            }`}
                                    />
                                </div>
                                {submitted && errors.phone && (
                                    <p className="text-red-500 text-xs ml-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        lock
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#13ec6d]/20 focus:border-[#13ec6d] ${submitted && errors.password ? "border-red-400" : "border-slate-200"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {submitted && errors.password && (
                                    <p className="text-red-500 text-xs ml-1">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    if (submitted) setErrors((prev) => ({ ...prev, agreeTerms: "" }));
                                }}
                                className="mt-1 rounded text-[#13ec6d] focus:ring-[#13ec6d] border-slate-300 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-500 leading-tight">
                                I agree to the{" "}
                                <a href="#" className="text-[#13ec6d] font-semibold hover:underline">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-[#13ec6d] font-semibold hover:underline">
                                    Privacy Policy
                                </a>
                                .
                            </label>
                        </div>
                        {submitted && errors.agreeTerms && (
                            <p className="text-red-500 text-xs ml-1">{errors.agreeTerms}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!agreeTerms || loading}
                            className="w-full bg-[#13ec6d] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#13ec6d]/20 hover:bg-[#13ec6d]/90 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="w-5 h-5 animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* ── Login link ── */}
                    <p className="text-center text-slate-500 pt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#13ec6d] font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>

            {/* ═══════════════ Right Panel: Image + Brand ═══════════════ */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#13ec6d]/10">
                {/* Background image with gradient fallback */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-[#13ec6d]/30 to-emerald-900/60"
                    style={{ backgroundImage: "url('/images/signup.jpg')" }}
                    role="img"
                    aria-label="Modern luxury apartment building"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#221610]/80 to-transparent" />

                {/* Brand content at bottom */}
                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#13ec6d] p-2 rounded-lg">
                            <span className="material-symbols-outlined text-white">home_work</span>
                        </div>
                        <h1 className="text-white text-3xl font-bold tracking-tight">RentEase</h1>
                    </div>
                    <h2 className="text-white text-4xl font-black leading-tight mb-4">
                        Find your next chapter, or manage your best assets.
                    </h2>
                    <p className="text-slate-200 text-lg max-w-md">
                        The modern platform for seamless property management and effortless renting.
                    </p>
                </div>
            </div>
        </div>
    );
}
