/**
 * QuickCategoryChips – Row of category pill buttons.
 * The first chip is visually "active" (filled primary).
 */

const categories = [
    { label: "Near Universities", icon: "school", active: true },
    { label: "Budget Friendly", icon: "payments", active: false },
    { label: "Luxury Apartments", icon: "apartment", active: false },
];

export default function QuickCategoryChips() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap gap-4 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat.label}
                            aria-label={`Filter by ${cat.label}`}
                            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${cat.active
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white border border-slate-200 hover:border-primary"
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {cat.icon}
                            </span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
