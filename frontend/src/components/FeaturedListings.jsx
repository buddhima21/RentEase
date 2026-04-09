import { useEffect, useState, useRef, useLayoutEffect } from "react";
import ListingCard from "./ListingCard";
import { getApprovedProperties } from "../services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=RentEase+Property";

const AMENITY_ICONS = {
    wifi: "wifi",
    ac: "ac_unit",
    parking: "local_parking",
    furnished: "chair",
    "hot water": "water_drop",
    cctv: "videocam",
    electricity: "bolt",
    water: "water_drop",
    kitchen: "kitchen",
    laundry: "local_laundry_service"
};

/**
 * FeaturedListings – Section that renders all featured property cards.
 * Fetches real properties from the backend API.
 */
export default function FeaturedListings({ activeCategory }) {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const sectionRef = useRef(null);
    const headerRef = useRef(null);

    // GSAP Animation for Entrance & Stagger
    useLayoutEffect(() => {
        if (isLoading || filteredListings.length === 0) return;

        let ctx = gsap.context(() => {
            // Animate Header
            gsap.fromTo(headerRef.current, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 85%",
                    }
                }
            );

            // Animate Cards (Staggered)
            gsap.fromTo(".listing-card-wrapper",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, filteredListings, activeCategory]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await getApprovedProperties();
                if (response.data && response.data.data) {
                    const mappedListings = response.data.data.map(property => {
                        const firstAmenity = property.amenities && property.amenities.length > 0 ? property.amenities[0] : "WiFi";
                        const amenityKey = String(firstAmenity).toLowerCase();
                        const icon = AMENITY_ICONS[amenityKey] || "wifi";

                        return {
                            id: property.id,
                            title: property.title,
                            image: (property.imageUrls && property.imageUrls.length > 0) ? property.imageUrls[0] : FALLBACK_IMAGE,
                            rating: 4.8, // Default rating as backend doesn't aggregate it yet in list view
                            location: `${property.city}`,
                            beds: property.bedrooms,
                            baths: property.bathrooms,
                            amenity: firstAmenity,
                            amenityIcon: icon,
                            // Store raw price for filtering
                            rawPrice: property.price,
                            price: `LKR ${new Intl.NumberFormat("en-LK").format(property.price)}`,
                            badge: property.propertyType === "Apartment" ? "Featured" : null
                        };
                    });
                    setListings(mappedListings);
                    setFilteredListings(mappedListings);
                }
            } catch (error) {
                console.error("Failed to fetch featured listings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);

    // Effect for filtering based on category
    useEffect(() => {
        if (!listings.length) return;

        let filtered = [...listings];

        if (activeCategory === "Budget Friendly") {
            filtered = listings.filter(item => item.rawPrice <= 15000);
        } else if (activeCategory === "Luxury Apartments") {
            // "Upper 100000 LKR" logic
            filtered = listings.filter(item => item.rawPrice >= 100000);
        } else {
            // "Near Universities" or default -> Show all (limited)
            filtered = [...listings];
        }

        // "show only three properties not all"
        setFilteredListings(filtered.slice(0, 3));
    }, [activeCategory, listings]);

    if (isLoading) {
        return (
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto text-center" ref={sectionRef}>
                    <p className="text-slate-500">Loading featured listings...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 relative overflow-hidden" ref={sectionRef}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-10" ref={headerRef}>
                    <div>
                        <h2 className="text-3xl font-bold mb-2">
                            {activeCategory === "Near Universities" ? "Featured Listings" : activeCategory}
                        </h2>
                        <p className="text-slate-500">
                            {activeCategory === "Budget Friendly" 
                                ? "Great places under LKR 15,000" 
                                : activeCategory === "Luxury Apartments"
                                    ? "Premium living over LKR 100,000"
                                    : "Handpicked stays for the best student experience"}
                        </p>
                    </div>
                    <a
                        href="/listings"
                        className="text-primary font-bold flex items-center gap-1 hover:underline group"
                    >
                        View All{" "}
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </a>
                </div>

                {/* Responsive Card Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.length > 0 ? (
                        filteredListings.map((listing) => (
                            <div key={listing.id} className="listing-card-wrapper">
                                <ListingCard listing={listing} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl listing-card-wrapper">
                            <p className="text-slate-500 font-medium">
                                No properties found for this category.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
