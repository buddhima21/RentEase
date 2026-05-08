import { Link } from "react-router-dom";
import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Modal from "./Modal";

/**
 * OwnerCTASection – "Are You a Property Owner?" call-to-action banner
 * with decorative blurred background circles.
 */
export default function OwnerCTASection() {
    const sectionRef = useRef(null);
    const cardRef = useRef(null);
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from(cardRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 50,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%"
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 px-4">
            <div ref={cardRef} className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                {/* Decorative Blurred Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse delay-1000" />

                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10">
                    Are You a Property Owner?
                </h2>

                {/* Subtext */}
                <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                    List your room, annex, or apartment and reach thousands of students
                    and professionals searching for a place to stay.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <Link
                        to="/owner/dashboard"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all scale-100 hover:scale-105 active:scale-95"
                    >
                        List Your Property
                    </Link>
                    <button 
                        onClick={() => setIsHowItWorksOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur transition-all border border-white/10 hover:border-white/30"
                    >
                        How it works
                    </button>
                </div>
            </div>

            <Modal 
                isOpen={isHowItWorksOpen} 
                onClose={() => setIsHowItWorksOpen(false)} 
                title="Hosting on RentEase"
            >
                <div className="p-4 md:p-8 space-y-12">
                    {/* Hero Text */}
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                            Earn money doing what you love
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Whether you're opening up an extra room or an entire home, hosting with RentEase is a simple way to earn extra income and meet people from all over the world.
                        </p>
                    </div>

                    {/* 3 Steps */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-2xl">real_estate_agent</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">1. Publish your listing</h4>
                            <p className="text-slate-600 dark:text-slate-400">
                                It's free and easy to create a listing. Describe your space, tell how many guests you can accommodate, and add photos and details.
                            </p>
                        </div>
                        {/* Step 2 */}
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-2xl">settings_account_box</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">2. Control your availability</h4>
                            <p className="text-slate-600 dark:text-slate-400">
                                You are in charge of your schedule, prices, and requirements for guests. You can set house rules and connect with guests before they stay.
                            </p>
                        </div>
                        {/* Step 3 */}
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-2xl">waving_hand</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">3. Welcome your guests</h4>
                            <p className="text-slate-600 dark:text-slate-400">
                                Once your listing is live, qualified guests can reach out. You can message them with questions and then accept their requests to stay.
                            </p>
                        </div>
                    </div>

                    {/* Trust & Safety Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1 space-y-4">
                                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    RentEase Cover for Hosts
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Every booking comes with comprehensive protection. We verify guest identities and provide 24/7 global support to ensure your peace of mind while hosting securely.
                                </p>
                                <ul className="space-y-2 mt-4 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        Guest identity verification
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        Reservation screening technology
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        Damage protection & Host liability insurance
                                    </li>
                                </ul>
                            </div>
                            <div className="shrink-0">
                                <div className="w-full max-w-xs mx-auto text-center">
                                    <span className="material-symbols-outlined text-[8rem] text-primary/20 block mb-4">gpp_good</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom CTA */}
                    <div className="text-center pt-4">
                        <Link
                            to="/owner/dashboard"
                            className="inline-flex bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all scale-100 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                            onClick={() => setIsHowItWorksOpen(false)}
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
