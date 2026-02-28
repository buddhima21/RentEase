import { useState } from "react";

/**
 * ListingCard – A single property listing card.
 * Displays image, optional badge, wishlist heart, details, and price.
 *
 * @param {{ listing: object }} props
 */
export default function ListingCard({ listing }) {
    const [liked, setLiked] = useState(false);

    return (
        <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={listing.image}
                    alt={listing.title}
                />

                {/* Optional Badge */}
                {listing.badge && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-primary">
                        {listing.badge}
                    </div>
                )}

                {/* Wishlist / Favorite Button */}
                <button
                    onClick={() => setLiked(!liked)}
                    aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                    className={`absolute top-4 right-4 bg-white/90 p-2 rounded-full transition-colors ${liked ? "text-red-500" : "text-slate-900 hover:text-red-500"
                        }`}
                >
                    <span className="material-symbols-outlined">favorite</span>
                </button>
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Title & Rating */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-sm">star</span>
                        {listing.rating}
                    </div>
                </div>

                {/* Location */}
                <p className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {listing.location}
                </p>

                {/* Amenities */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bed</span>
                        {listing.beds} Bed
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">shower</span>
                        {listing.baths} Bath
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">{listing.amenityIcon}</span>
                        {listing.amenity}
                    </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                        <span className="text-2xl font-black text-slate-900">
                            {listing.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/month</span>
                    </div>
                    <button
                        aria-label={`View details for ${listing.title}`}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
