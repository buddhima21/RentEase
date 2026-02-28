import { Link } from "react-router-dom";

/**
 * OwnerCTASection – "Are You a Property Owner?" call-to-action banner
 * with decorative blurred background circles.
 */
export default function OwnerCTASection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
                {/* Decorative Blurred Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32" />

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
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                    >
                        List Your Property
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur transition-all border border-white/10">
                        How it works
                    </button>
                </div>
            </div>
        </section>
    );
}
