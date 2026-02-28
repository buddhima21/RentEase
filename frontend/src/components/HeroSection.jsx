import SearchBar from "./SearchBar";

/**
 * HeroSection – Split hero with headline, subtext, search bar, and feature image.
 * Desktop: side-by-side layout. Mobile: stacked vertically.
 */
export default function HeroSection() {
    return (
        <section className="relative py-12 lg:py-20 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column – Text & Search */}
                    <div className="z-10">
                        <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
                            Find Your Perfect Stay in{" "}
                            <span className="text-primary">Colombo &amp; Malabe</span>
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 max-w-lg">
                            Affordable rooms, annexes, and apartments tailored for students
                            and professionals. Near SLIIT, CINEC, and HORIZON.
                        </p>

                        {/* Embedded Search Bar */}
                        <SearchBar />
                    </div>

                    {/* Right Column – Hero Image & Badge */}
                    <div className="relative">
                        <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3">
                            <img
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc6VjP4WFS5O7IaLePakFkOGKTXLsVGAB3KwrnDKpfiZJAwGdX4ww8zug0coAEeudSakreS5iZNuJ9d0Z35xPFunAWI8JXNXuzUvdZPUr4Kb_jVdqEputg9-sqmA8Hv9ZVTOJbI2SJZYDjNtQEKRFleELgsio29r8P3tCVT0St54Lvb0YmaUXftnqERzCzb9wbXsLyz6ligM2p2JgHx3i0o37CNONIOrAXqS6fZHuje6ffj0L5VeNiK0hl6XelgSX5jxSzTrxejQFp"
                                alt="Modern minimalist studio apartment interior design"
                            />
                        </div>

                        {/* Verified Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 -rotate-3 border border-slate-100">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">100% Verified</p>
                                <p className="text-xs text-slate-500">Safe listings for students</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
