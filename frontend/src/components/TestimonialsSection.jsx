import mockTestimonials from "../data/mockTestimonials";
import TestimonialCard from "./TestimonialCard";

/**
 * TestimonialsSection – "What Our Students Say" grid.
 * Maps over the mockTestimonials data array.
 */
export default function TestimonialsSection() {
    return (
        <section className="py-20 bg-primary/5">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
                    <p className="text-slate-500">
                        Real experiences from students who found their home with us
                    </p>
                </div>

                {/* Testimonial Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {mockTestimonials.map((t) => (
                        <TestimonialCard key={t.id} testimonial={t} />
                    ))}
                </div>
            </div>
        </section>
    );
}
