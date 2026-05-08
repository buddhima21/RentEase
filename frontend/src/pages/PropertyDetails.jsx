import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewSection from "../components/reviews/ReviewSection";
import BookingCard from "../components/BookingCard";
import { getApprovedPropertyById, getPropertyReviews, getPropertyAvailableSlots } from "../services/api";
import { useAuth } from "../context/AuthContext";

const FALLBACK_IMAGE = "https://placehold.co/1200x800/f1f5f9/94a3b8?text=No+Image";

const AMENITY_DETAILS = {
    wifi: { icon: "wifi", label: "Wi‑Fi" },
    ac: { icon: "ac_unit", label: "Air conditioning" },
    parking: { icon: "local_parking", label: "Parking" },
    furnished: { icon: "chair", label: "Furnished" },
    "hot water": { icon: "water_drop", label: "Hot water" },
    cctv: { icon: "videocam", label: "CCTV" },
    electricity: { icon: "bolt", label: "Electricity" },
    water: { icon: "water_drop", label: "Water supply" },
    kitchen: { icon: "kitchen", label: "Kitchen" },
    laundry: { icon: "local_laundry_service", label: "Laundry" },
};

function normalizeAmenityKey(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase();
}

export default function PropertyDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [isLoadingProperty, setIsLoadingProperty] = useState(true);
    const [propertyError, setPropertyError] = useState("");

    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [showContact, setShowContact] = useState(false);
    const [availableSlots, setAvailableSlots] = useState(null); // null = loading

    const propertyImages = Array.isArray(property?.imageUrls) && property.imageUrls.length > 0
        ? property.imageUrls
        : [];

    useEffect(() => {
        const loadProperty = async () => {
            setIsLoadingProperty(true);
            setPropertyError("");
            try {
                const res = await getApprovedPropertyById(id);
                setProperty(res.data?.data || null);
            } catch (err) {
                setProperty(null);
                setPropertyError(err.response?.data?.message || "Failed to load property details");
            } finally {
                setIsLoadingProperty(false);
            }
        };

        loadProperty();
    }, [id]);

    // Fetch available bedroom slots whenever the property id changes
    useEffect(() => {
        setAvailableSlots(null);
        getPropertyAvailableSlots(id)
            .then((res) => {
                const slots = res.data?.data?.availableSlots;
                setAvailableSlots(typeof slots === "number" ? slots : null);
            })
            .catch(() => setAvailableSlots(null));
    }, [id]);

    useEffect(() => {
        if (!property) return;

        setIsLoadingReviews(true);
        getPropertyReviews(id)
            .then((res) => {
                const fetchedReviews = res.data?.data || [];
                setReviews(fetchedReviews);

                if (fetchedReviews.length > 0) {
                    const total = fetchedReviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0);
                    setAverageRating((total / fetchedReviews.length).toFixed(1));
                } else {
                    setAverageRating(0);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch reviews:", err);
                setReviews([]);
                setAverageRating(0);
            })
            .finally(() => setIsLoadingReviews(false));
    }, [id, property]);

    if (isLoadingProperty) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-slate-900 flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading property details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!property || propertyError) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-slate-900 flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100">Property Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md px-6">
                        {propertyError || "The property you are looking for does not exist or may have been removed."}
                    </p>
                    <Link to="/listings" className="text-primary hover:underline">Return to Listings</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const formattedPrice = new Intl.NumberFormat("en-LK").format(Number(property.price) || 0);
    const gallerySource = propertyImages.length > 0 ? propertyImages : [FALLBACK_IMAGE];
    const galleryImages = Array.from({ length: Math.min(5, Math.max(5, gallerySource.length)) }, (_, idx) => gallerySource[idx] || gallerySource[0]);
    const propertyForBooking = {
        ...property,
        rating: Number(averageRating) || 0,
        availableFrom: property.availableFrom || new Date().toISOString(),
    };

    const isOwner = user?.id && property?.ownerId && String(user.id) === String(property.ownerId);
    const displayOwnerName = isOwner ? user.fullName : (property.ownerName || "Property Owner");
    const displayOwnerImage = isOwner 
        ? (user.profileImageUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D9488&color=fff&size=128`) 
        : (property.ownerProfileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.ownerName || 'Host')}&background=0D9488&color=fff&size=128`);
    const displayOwnerPhone = isOwner ? user.phone : property.ownerPhone;
    const displayOwnerEmail = isOwner ? user.email : property.ownerEmail;

    return (
        <div className="bg-background-light dark:bg-slate-900 min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
                <Link
                    to="/listings"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mb-6"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Listings
                </Link>

                {/* Gallery */}
                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
                        <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            src={galleryImages[0]}
                            alt={property.title}
                            loading="lazy"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                        />
                    </div>
                    {galleryImages.slice(1).map((img, i) => (
                        <div key={i} className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                src={img}
                                alt={`${property.title} view ${i + 2}`}
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                            />
                            {i === 3 && (
                                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                                    <span className="material-symbols-outlined text-sm">grid_view</span> Show all photos
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left column */}
                    <div className="flex-1 space-y-10">
                        <section>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                                        {property.title}{" "}
                                        <span className="text-primary font-black">LKR {formattedPrice}</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                        {property.address}, {property.city}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md font-bold">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            {Number(averageRating) || 0}
                                        </div>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-600 dark:text-slate-300 font-semibold">{reviews.length} reviews</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-600 dark:text-slate-300 font-semibold">{property.propertyType || "Property"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 border-y border-slate-200 dark:border-slate-700 py-6">
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">bed</span>
                                    <span className="font-medium">{property.bedrooms ?? 0} Bedroom{Number(property.bedrooms) > 1 ? "s" : ""}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">bathtub</span>
                                    <span className="font-medium">{property.bathrooms ?? 0} Bathroom{Number(property.bathrooms) > 1 ? "s" : ""}</span>
                                </div>
                                {Array.isArray(property.amenities) && property.amenities.includes("Furnished") && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                        <span className="material-symbols-outlined text-primary">chair</span>
                                        <span className="font-medium">Furnished</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                    <span className="font-medium">Verified listing</span>
                                </div>
                            </div>
                        </section>

                        {/* Rent Breakdown */}
                        <section className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span> Rent Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Monthly Rent</p>
                                    <p className="text-lg font-bold">LKR {formattedPrice}</p>
                                    <p className="text-[10px] text-slate-400">Billed monthly</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Security Deposit</p>
                                    <p className="text-lg font-bold">
                                        LKR {new Intl.NumberFormat("en-LK").format(Number(property.securityDeposit ?? (Number(property.price) || 0) * 2))}
                                    </p>
                                    <p className="text-[10px] text-slate-400">Refundable at end of stay</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Description</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{property.description || "No description provided."}</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-6">What this place offers</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5">
                                {(property.amenities || [])
                                    .map((amenity) => {
                                        const key = normalizeAmenityKey(amenity);
                                        return { raw: amenity, key, detail: AMENITY_DETAILS[key] };
                                    })
                                    .filter((item) => item.detail)
                                    .map(({ raw, key, detail }) => {
                                        return (
                                            <div key={`${key}-${raw}`} className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">{detail.icon}</span>
                                                <span className="text-slate-700 dark:text-slate-200 font-medium">{detail.label}</span>
                                            </div>
                                        );
                                    })}
                                {(property.amenities || []).length === 0 && (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">No amenities listed.</p>
                                )}
                                {(property.amenities || []).length > 0 &&
                                    (property.amenities || []).every((a) => !AMENITY_DETAILS[normalizeAmenityKey(a)]) && (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">No recognizable amenities found.</p>
                                    )}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Availability</h3>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-primary">event_available</span>
                                    <p className="text-sm">
                                        Available from{" "}
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {new Date(propertyForBooking.availableFrom).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Terms &amp; conditions</h3>
                            {property.termsAndConditions ? (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 p-5 text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                    {property.termsAndConditions}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 text-sm">The owner has not added custom terms for this listing yet.</p>
                            )}
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Where you'll be</h3>
                            <PropertyLocationMap address={property.address} city={property.city} />
                        </section>

                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                             <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                 <div className="flex-1">
                                     <h3 className="text-xl font-bold mb-6">Meet your host</h3>
                                     <div className="flex items-center gap-4 mb-6">
                                         <div className="relative">
                                             <img 
                                                 src={displayOwnerImage} 
                                                 alt={displayOwnerName}
                                                 className="w-16 h-16 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                                             />
                                             <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 p-1 rounded-full shadow-sm">
                                                 <span className="material-symbols-outlined text-primary text-xl filled">verified_user</span>
                                             </div>
                                         </div>
                                         <div>
                                             <h4 className="text-lg font-bold text-slate-900 dark:text-white">Hosted by {displayOwnerName}</h4>
                                             <p className="text-slate-500 dark:text-slate-400 text-sm">Joined May 2024</p>
                                         </div>
                                     </div>
                                     
                                     <div className="space-y-3 mb-6">
                                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                             <span className="material-symbols-outlined text-amber-500">star</span>
                                             <span>12 Reviews</span>
                                             <span className="text-slate-300">|</span>
                                             <span className="material-symbols-outlined text-primary">verified</span>
                                             <span>Identity verified</span>
                                         </div>
                                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                             <span className="material-symbols-outlined text-slate-400">schedule</span>
                                             <span>Response rate: 100%</span>
                                         </div>
                                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                             <span className="material-symbols-outlined text-slate-400">chat</span>
                                             <span>Response time: within an hour</span>
                                         </div>
                                     </div>

                                     <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                         {isOwner && user.bio ? user.bio : (
                                            <>
                                                Hi there! I'm {displayOwnerName?.split(' ')[0] || "the host"}, and I love welcoming guests to my properties. 
                                                I'm committed to providing you with a great stay and am always available to answer any questions.
                                            </>
                                         )}
                                     </p>

                                     {!showContact ? (
                                         <button 
                                             onClick={() => setShowContact(true)}
                                             className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 transition-all flex items-center gap-2"
                                         >
                                             Contact Host
                                         </button>
                                     ) : (
                                         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
                                             <div className="flex justify-between items-start mb-4">
                                                 <h4 className="font-bold text-slate-900 dark:text-white">Contact Information</h4>
                                                 <button onClick={() => setShowContact(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                                                     <span className="material-symbols-outlined">close</span>
                                                 </button>
                                             </div>
                                             <div className="space-y-4">
                                                 {displayOwnerPhone && (
                                                     <div className="flex items-center gap-3">
                                                         <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                             <span className="material-symbols-outlined">call</span>
                                                         </div>
                                                         <div>
                                                             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Phone</p>
                                                             <a href={`tel:${displayOwnerPhone}`} className="text-slate-900 dark:text-white font-semibold hover:text-primary hover:underline">
                                                                 {displayOwnerPhone}
                                                             </a>
                                                         </div>
                                                     </div>
                                                 )}
                                                 
                                                 {displayOwnerEmail && (
                                                     <div className="flex items-center gap-3">
                                                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                             <span className="material-symbols-outlined">mail</span>
                                                         </div>
                                                         <div>
                                                             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Email</p>
                                                             <a href={`mailto:${displayOwnerEmail}`} className="text-slate-900 dark:text-white font-semibold hover:text-primary hover:underline">
                                                                 {displayOwnerEmail}
                                                             </a>
                                                         </div>
                                                     </div>
                                                 )}
                                                 
                                                 {(!displayOwnerPhone && !displayOwnerEmail) && (
                                                     <p className="text-slate-500 dark:text-slate-400 text-sm italic">No direct contact details provided. Please use the platform messaging.</p>
                                                 )}
                                             </div>
                                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                 <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                     <span className="material-symbols-outlined text-sm">lock</span>
                                                     To protect your payment, never transfer money or communicate outside of the RentEase website or app.
                                                 </p>
                                             </div>
                                         </div>
                                     )}
                                 </div>

                                 {/* Trust Badges */}
                                 <div className="flex flex-col gap-4 min-w-[200px] text-sm bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100/50">
                                     <div className="flex gap-3">
                                         <span className="material-symbols-outlined text-primary">security</span>
                                         <div>
                                             <p className="font-bold text-slate-900 dark:text-white">Secure payments</p>
                                             <p className="text-slate-500 dark:text-slate-400 text-xs">Your payment is held until check-in.</p>
                                         </div>
                                     </div>
                                     <div className="flex gap-3">
                                         <span className="material-symbols-outlined text-primary">support_agent</span>
                                         <div>
                                             <p className="font-bold text-slate-900 dark:text-white">24/7 Support</p>
                                             <p className="text-slate-500 dark:text-slate-400 text-xs">Help whenever you need it.</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </section>

                        {/* Reviews */}
                        {isLoadingReviews ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 flex flex-col items-center justify-center min-h-[320px]">
                                <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Loading reviews...</p>
                            </div>
                        ) : (
                            <ReviewSection
                                propertyId={id}
                                reviews={reviews}
                                rating={averageRating}
                            />
                        )}
                    </div>

                    {/* Right column */}
                    <BookingCard property={propertyForBooking} user={user} availableSlots={availableSlots} />
                </div>
            </main>
            <Footer />
        </div>
    );
}

/**
 * PropertyLocationMap — geocodes the property address via Nominatim and renders a Leaflet map.
 */
function PropertyLocationMap({ address, city }) {
    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(false);
    const [MapReady, setMapReady] = useState(false);
    const [BaseMapContainer, setBaseMapContainer] = useState(null);
    const didGeocode = useRef(false);

    useEffect(() => {
        if (didGeocode.current) return;
        didGeocode.current = true;

        // Lazy-load Leaflet components
        import("../components/map/BaseMapContainer").then((mod) => {
            setBaseMapContainer(() => mod.default);
            setMapReady(true);
        });

        // Geocode the property address
        import("../services/nominatim").then(({ geocodeAddress }) => {
            geocodeAddress(`${address}, ${city}`).then((result) => {
                if (result) {
                    setCoords([result.lat, result.lng]);
                } else {
                    setGeoError(true);
                }
            });
        });
    }, [address, city]);

    if (!MapReady || !BaseMapContainer || !coords) {
        return (
            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {geoError ? (
                    <div className="flex flex-col items-center gap-2 text-center px-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Could not locate this property on the map.</p>
                        <p className="text-xs text-slate-400">{address}, {city}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Locating property…</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <PropertyMapDisplay
            BaseMapContainer={BaseMapContainer}
            coords={coords}
            address={address}
            city={city}
        />
    );
}

/** Separated so Hooks aren't called conditionally */
function PropertyMapDisplay({ BaseMapContainer, coords, address, city }) {
    const [MapMarkers, setMapMarkers] = useState(null);

    useEffect(() => {
        Promise.all([
            import("react-leaflet"),
            import("leaflet"),
            import("leaflet/dist/leaflet.css"),
        ]).then(([rl, L]) => {
            const icon = L.default.divIcon({
                html: `<div style="background:#26C289;color:white;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;font-family:Inter,sans-serif;white-space:nowrap;">📍 Here</div>`,
                className: "",
                iconAnchor: [35, 16],
                popupAnchor: [0, -22],
            });
            setMapMarkers({ Marker: rl.Marker, Popup: rl.Popup, icon });
        });
    }, []);

    return (
        <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <BaseMapContainer center={coords} zoom={15} style={{ width: "100%", height: "100%" }}>
                {MapMarkers && (
                    <MapMarkers.Marker position={coords} icon={MapMarkers.icon}>
                        <MapMarkers.Popup>
                            <div style={{ fontFamily: "Inter, sans-serif", minWidth: "160px" }}>
                                <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", fontSize: "13px" }}>{city}</p>
                                <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>{address}</p>
                            </div>
                        </MapMarkers.Popup>
                    </MapMarkers.Marker>
                )}
            </BaseMapContainer>
        </div>
    );
}

