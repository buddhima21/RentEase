import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
    const sectionRef = useRef(null);
    const textRef = useRef(null);
    const gridRef = useRef(null);
    const imageRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Text Animate
            gsap.from(textRef.current.children, {
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: textRef.current,
                    start: "top 80%"
                }
            });

            // Grid Cards Animate
            gsap.from(gridRef.current.children, {
                y: 60,
                opacity: 0,
                scale: 0.9,
                stagger: 0.15,
                duration: 0.8,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 75%"
                }
            });

            // Image Parallax Scale
            gsap.fromTo(imageRef.current,
                { scale: 1.1, opacity: 0.8 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: imageRef.current,
                        start: "top 85%",
                        scrub: 1.5 // Adds smooth scrub effect
                    }
                }
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 bg-white overflow-hidden" id="about-us">
            <div className="container mx-auto px-4">
                <div ref={textRef} className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Our Story</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Reimagining How You Rent</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        RentEase was born from a simple idea: renting shouldn't be a hassle. We bridge the gap between property owners and tenants with transparency, trust, and technology.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Listings</h3>
                        <p className="text-slate-600">Every property on our platform is verified by our team to ensure you get exactly what you see. No surprises.</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">handshake</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Communication</h3>
                        <p className="text-slate-600">Connect directly with property owners. Our secure messaging system keeps your conversation private and safe.</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Hassle-free Process</h3>
                        <p className="text-slate-600">From viewing to signing the lease, our digital tools make the entire rental journey smooth and paperless.</p>
                    </div>
                </div>

                <div ref={imageRef} className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
                    <img 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80" 
                        alt="Modern office" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                        <div className="max-w-2xl">
                            <h3 className="text-white text-2xl md:text-3xl font-bold mb-4">Built for Trust & Community</h3>
                            <p className="text-slate-200 text-lg mb-6">
                                We believe that a home is more than just a place to sleep. It's where life happens. That's why we're committed to building a community where both owners and tenants thrive.
                            </p>
                            <div className="flex gap-4">
                                <div className="text-white">
                                    <span className="block text-3xl font-bold">10k+</span>
                                    <span className="text-sm text-slate-300">Active Users</span>
                                </div>
                                <div className="text-white border-l border-white/20 pl-4">
                                    <span className="block text-3xl font-bold">5k+</span>
                                    <span className="text-sm text-slate-300">Properties</span>
                                </div>
                                <div className="text-white border-l border-white/20 pl-4">
                                    <span className="block text-3xl font-bold">4.8</span>
                                    <span className="text-sm text-slate-300">User Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
