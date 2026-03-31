import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mockTestimonials from "../data/mockTestimonials";
import TestimonialCard from "./TestimonialCard";

/**
 * TestimonialsSection – "What Our Students Say" grid.
 * Maps over the mockTestimonials data array.
 */
export default function TestimonialsSection() {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Header Animation
            gsap.from(headerRef.current, {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: "top 85%"
                }
            });

            // Card Stagger Animation
            gsap.from(gridRef.current.children, {
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 75%"
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 bg-primary/5">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div ref={headerRef} className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
                    <p className="text-slate-500">
                        Real experiences from students who found their home with us
                    </p>
                </div>

                {/* Testimonial Grid */}
                <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
                    {mockTestimonials.map((t) => (
                        <div key={t.id} className="h-full">
                            <TestimonialCard testimonial={t} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
