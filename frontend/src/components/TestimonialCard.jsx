/**
 * TestimonialCard – A single student review card.
 *
 * @param {{ testimonial: object }} props
 */
export default function TestimonialCard({ testimonial }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-4 text-primary opacity-20">
                <span className="material-symbols-outlined text-6xl">format_quote</span>
            </div>

            {/* Quote Text */}
            <p className="text-slate-600 italic mb-6">"{testimonial.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                    <img
                        className="w-full h-full object-cover"
                        src={testimonial.avatar}
                        alt={`${testimonial.name} profile picture`}
                    />
                </div>
                <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-xs text-primary font-semibold">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );
}
