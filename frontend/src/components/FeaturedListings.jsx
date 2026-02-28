import mockListings from "../data/mockListings";
import ListingCard from "./ListingCard";

/**
 * FeaturedListings – Section that renders all featured property cards.
 * Maps over the mockListings data array.
 */
export default function FeaturedListings() {
    return (
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
                        <p className="text-slate-500">
                            Handpicked stays for the best student experience
                        </p>
                    </div>
                    <a
                        href="#"
                        className="text-primary font-bold flex items-center gap-1 hover:underline"
                    >
                        View All{" "}
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>

                {/* Responsive Card Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </div>
        </section>
    );
}
