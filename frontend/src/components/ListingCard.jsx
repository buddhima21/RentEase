import { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

/**
 * ListingCard – A single property listing card.
 * Displays image, optional badge, wishlist heart, details, and price.
 *
 * @param {{ listing: object }} props
 */
export default function ListingCard({ listing }) {
    const [liked, setLiked] = useState(false);
    const cardRef = useRef(null);

    useLayoutEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            // Hover Animation: Scale & Float
            el.addEventListener("mouseenter", () => {
                gsap.to(el, { 
                    y: -8, 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    duration: 0.4, 
                    ease: "power3.out" 
                });
            });
            
            el.addEventListener("mouseleave", () => {
                gsap.to(el, { 
                    y: 0, 
                    scale: 1,
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    duration: 0.4, 
                    ease: "power3.out" 
                });
            });
        }, cardRef);

        return () => ctx.revert();
    }, []);

    return (
        <div 
            ref={cardRef} 
            className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-colors duration-300"
        >
            {/* Image Container */}
            <Link to={`/property/${listing.id}`} className="block relative h-64 overflow-hidden">
                <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={listing.image}
                    alt={listing.title}
                    loading="lazy"
                />

                {/* Optional Badge */}
                {listing.badge && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-primary">
                        {listing.badge}
                    </div>
                )}
            </Link>

            {/* Wishlist / Favorite Button (Positioned over image but independent of the link) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setLiked(!liked);
                }}
                aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                className={`absolute top-4 right-4 bg-white/90 p-2 rounded-full transition-colors ${liked ? "text-red-500" : "text-slate-900 hover:text-red-500"
                    }`}
                style={{ zIndex: 10 }}
            >
                <span className="material-symbols-outlined">favorite</span>
            </button>

            {/* Card Body */}
            <Link to={`/property/${listing.id}`} className="block p-6">
                {/* Title & Rating */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
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
                        role="link"
                        aria-label={`View details for ${listing.title}`}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </Link>
        </div>
    );
}
