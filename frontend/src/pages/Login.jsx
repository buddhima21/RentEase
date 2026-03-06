import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Login – Auth page with email/password form.
 */
export default function Login() {
    return (
        <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-4xl grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
                    {/* Left panel – marketing copy */}
                    <section className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <span className="material-symbols-outlined text-sm">shield_person</span>
                            Secure student & owner logins
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                            Welcome back to{" "}
                            <span className="text-primary">RentEase</span>
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-md">
                            Sign in to manage your property listings, track inquiries, and keep
                            your favourite rooms and apartments in one place.
                        </p>

                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-base text-primary mt-0.5">
                                    check_circle
                                </span>
                                <span>Access your saved properties across devices.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-base text-primary mt-0.5">
                                    check_circle
                                </span>
                                <span>Track tenant inquiries and messages in one dashboard.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-base text-primary mt-0.5">
                                    check_circle
                                </span>
                                <span>Stay synced with your latest bookings and agreements.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Right panel – login form */}
                    <section className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Login</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter your details to continue to your account.
                            </p>
                        </div>

                        <form
                            className="space-y-5"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    className="font-semibold text-primary hover:text-primary/80"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
                            >
                                <span className="material-symbols-outlined text-base mr-1">
                                    login
                                </span>
                                Sign in
                            </button>
                        </form>

                        <div className="mt-6">
                            <p className="text-xs text-slate-500 text-center mb-3">Or continue with</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Google
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Facebook
                                </button>
                            </div>
                        </div>

                        <p className="mt-6 text-xs text-slate-600 text-center">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-primary hover:text-primary/80"
                            >
                                Sign up
                            </Link>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
