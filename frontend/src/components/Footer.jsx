import { Link } from "react-router-dom";

/**
 * Footer – Site-wide footer with links, contact info, and social icons.
 */
export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">
                                home_work
                            </span>
                            <span className="text-2xl font-bold tracking-tight text-slate-900">
                                RentEase
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            The most trusted accommodation marketplace for students and young
                            professionals in Sri Lanka.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="#"
                                aria-label="Website"
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">public</span>
                            </a>
                            <a
                                href="#"
                                aria-label="Share"
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">share</span>
                            </a>
                        </div>
                    </div>

                    {/* Popular Areas */}
                    <div>
                        <h4 className="font-bold mb-6">Popular Areas</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li><a href="#" className="hover:text-primary">Malabe</a></li>
                            <li><a href="#" className="hover:text-primary">Kaduwela</a></li>
                            <li><a href="#" className="hover:text-primary">Colombo 03/07</a></li>
                            <li><a href="#" className="hover:text-primary">Bambalapitiya</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li><a href="#" className="hover:text-primary">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary">Safety Guide</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">mail</span>
                                hello@rentease.lk
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">phone</span>
                                +94 11 234 5678
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
                    <p>&copy; 2024 RentEase Sri Lanka. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
