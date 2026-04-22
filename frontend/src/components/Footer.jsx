import { Link } from "react-router-dom";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Footer – Site-wide footer with links, contact info, and social icons.
 */
export default function Footer() {
    const footerRef = useRef(null);
    const gridRef = useRef(null);
    
    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from(gridRef.current.children, {
                y: 50,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 95%"
                }
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                            {/* Brand Logo - Footer Version */}
                            <div className="relative flex items-center justify-center w-10 h-10 bg-emerald-50/50 rounded-xl transition-transform group-hover:scale-110">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 10L12 4L20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900 dark:text-white"/>
                                    <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" className="text-emerald-500"/>
                                    <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500"/>
                                </svg>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Rent<span className="text-primary">Ease</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                            The most trusted accommodation marketplace for students and young
                            professionals in Sri Lanka.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="#"
                                aria-label="Website"
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all hover:-translate-y-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-xl">public</span>
                            </a>
                            <a
                                href="#"
                                aria-label="Share"
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all hover:-translate-y-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-xl">share</span>
                            </a>
                        </div>
                    </div>

                    {/* Popular Areas */}
                    <div>
                        <h4 className="font-bold mb-6">Popular Areas</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <li><a href="#" className="hover:text-primary transition-colors">Malabe</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Kaduwela</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Colombo 03/07</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Bambalapitiya</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Safety Guide</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
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
                <div className="pt-8 border-t border-slate-100 dark:border-slate-700/50 text-center text-sm text-slate-400">
                    <p>&copy; 2026 RentEase Sri Lanka. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
