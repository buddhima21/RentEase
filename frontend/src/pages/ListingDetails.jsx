import { useParams, Link } from "react-router-dom";
import properties from "../data/properties";
import Navbar from "../components/Navbar";
import BookingCard from "../components/BookingCard";

const FALLBACK_IMAGE = "https://placehold.co/800x500/f1f5f9/94a3b8?text=No+Image";

const AMENITY_DETAILS = {
    WiFi: { icon: "wifi", label: "High-speed Wi-Fi" },
    AC: { icon: "ac_unit", label: "Air Conditioning" },
    Parking: { icon: "local_parking", label: "Secure Parking" },
    Furnished: { icon: "chair", label: "Fully Furnished" },
    "Hot Water": { icon: "water_drop", label: "Hot Water" },
    CCTV: { icon: "security", label: "CCTV Surveillance" },
};

const HOUSE_RULES = [
    { icon: "schedule", text: "Check-in after 2:00 PM" },
    { icon: "smoke_free", text: "No smoking inside the premises" },
    { icon: "pets", text: "No pets allowed" },
    { icon: "volume_off", text: "Quiet hours after 10:00 PM" },
];

const REVIEWS = [
    {
        name: "Kasun Silva",
        date: "September 2023",
        text: "Stayed here for my final semester at SLIIT. The place is very quiet, and the host is wonderful. Very safe for students!",
    },
    {
        name: "Dilini Fernando",
        date: "July 2023",
        text: "Clean, tidy, and has all the basics needed. The separate entrance is a big plus for privacy. Highly recommend!",
    },
];

export default function ListingDetails() {
    const { id } = useParams();
    const property = properties.find((p) => p.id === Number(id));

    if (!property) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <span className="material-symbols-outlined text-7xl text-slate-300 mb-4">home_work</span>
                    <h1 className="text-2xl font-bold text-slate-700 mb-2">Property Not Found</h1>
                    <p className="text-slate-500 mb-8 max-w-md">
                        The property you are looking for does not exist or may have been removed.
                    </p>
                    <Link
                        to="/listings"
                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm"
                    >
                        Back to Listings
                    </Link>
                </div>
            </div>
        );
    }

    const formattedPrice = new Intl.NumberFormat("en-LK").format(property.price);
    const galleryImages = [property.image, property.image, property.image, property.image, property.image];

    return (
        <div className="min-h-screen bg-background-light">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background-light/80 backdrop-blur-md px-4 md:px-20 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-3xl font-bold">diamond</span>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">RentEase</h2>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center p-2 rounded-xl bg-slate-200/50 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-xl">share</span>
                        </button>
                        <button className="flex items-center justify-center p-2 rounded-xl bg-slate-200/50 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-xl">favorite</span>
                        </button>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary">
                            <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-20 py-6">
                <Link
                    to="/listings"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-6"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Listings
                </Link>

                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
                    <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
                        <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            src={galleryImages[0]}
                            alt={property.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                            {property.featured && (
                                <span className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                                    Featured
                                </span>
                            )}
                            {property.verified && (
                                <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                    {galleryImages.slice(1).map((img, i) => (
                        <div key={i} className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                src={img}
                                alt={`${property.title} view ${i + 2}`}
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
                    <div className="flex-1 space-y-10">
                        <section>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{property.title}</h1>
                                    <p className="text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                        {property.address}, {property.city}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-3xl font-bold text-primary">LKR {formattedPrice}</span>
                                    <span className="text-slate-500">/mo</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 border-y border-slate-200 py-6">
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">bed</span>
                                    <span className="font-medium">{property.bedrooms} Bedroom{property.bedrooms > 1 ? "s" : ""}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">bathtub</span>
                                    <span className="font-medium">{property.bathrooms} Bathroom{property.bathrooms > 1 ? "s" : ""}</span>
                                </div>
                                {property.amenities.includes("Furnished") && (
                                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                        <span className="material-symbols-outlined text-primary">chair</span>
                                        <span className="font-medium">Furnished</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">directions_walk</span>
                                    <span className="font-medium">{property.distanceKm} km to campus</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span> Rent Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Security Deposit</p>
                                    <p className="text-lg font-bold">LKR {new Intl.NumberFormat("en-LK").format(property.price * 2)}</p>
                                    <p className="text-[10px] text-slate-400">Refundable at end of stay</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Utilities</p>
                                    <p className="text-lg font-bold">LKR 5,000</p>
                                    <p className="text-[10px] text-slate-400">Average monthly estimate</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Broker Fee</p>
                                    <p className="text-lg font-bold">LKR 0</p>
                                    <p className="text-[10px] text-slate-400">Directly from owner</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Description</h3>
                            <p className="text-slate-600 leading-relaxed">{property.description}</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-6">What this place offers</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5">
                                {property.amenities.map((amenity) => {
                                    const detail = AMENITY_DETAILS[amenity] || { icon: "check_circle", label: amenity };
                                    return (
                                        <div key={amenity} className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-500">{detail.icon}</span>
                                            <span>{detail.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Availability</h3>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <span className="material-symbols-outlined text-primary">event_available</span>
                                    <p className="text-sm">
                                        Available from{" "}
                                        <span className="font-bold text-slate-900">
                                            {new Date(property.availableFrom).toLocaleDateString("en-GB", {
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
                            <h3 className="text-xl font-bold mb-4">House Rules</h3>
                            <ul className="space-y-3">
                                {HOUSE_RULES.map((rule) => (
                                    <li key={rule.icon} className="flex items-center gap-3 text-slate-600">
                                        <span className="material-symbols-outlined text-sm">{rule.icon}</span>
                                        {rule.text}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">Where you'll be</h3>
                            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-200 relative">
                                <div
                                    className="w-full h-full bg-[radial-gradient(circle_at_center,_#e2e8f0,_#cbd5e1)]"
                                    style={{
                                        backgroundImage: "radial-gradient(#221610 1px, transparent 1px)",
                                        backgroundSize: "20px 20px",
                                        opacity: 0.1,
                                        position: "absolute",
                                        inset: 0,
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-primary p-3 rounded-full shadow-2xl animate-bounce">
                                        <span className="material-symbols-outlined text-white text-3xl">location_on</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg max-w-xs">
                                    <p className="font-bold text-sm">{property.city}</p>
                                    <p className="text-xs text-slate-500 mt-1">{property.distanceKm} km from nearby campuses.</p>
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col md:flex-row gap-6 items-center p-8 bg-slate-100 rounded-2xl border border-slate-200">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
                                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xs font-bold">verified</span>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-bold">Hosted by Amara Perera</h4>
                                <p className="text-slate-500 text-sm">Host for 3 years • Verified Owner</p>
                                <p className="mt-2 text-slate-600 text-sm italic">
                                    "I value cleanliness and student safety. Looking for long-term tenants who respect the space."
                                </p>
                            </div>
                            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-colors shrink-0">
                                Contact Owner
                            </button>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-8">
                                <span
                                    className="material-symbols-outlined text-primary"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    star
                                </span>
                                <span className="text-2xl font-bold">{property.rating}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-2xl font-bold">{property.reviewsCount} reviews</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {REVIEWS.map((review) => (
                                    <div key={review.name} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                            </div>
                                            <div>
                                                <p className="font-bold">{review.name}</p>
                                                <p className="text-xs text-slate-500">{review.date}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-8 px-6 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-50 transition-colors">
                                Show all {property.reviewsCount} reviews
                            </button>
                        </section>
                    </div>

                    <BookingCard property={property} />
                </div>
            </main>

            <footer className="mt-20 border-t border-slate-200 bg-white py-12 px-4 md:px-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
                    <div className="max-w-xs">
                        <Link to="/" className="flex items-center gap-2 text-primary mb-4">
                            <span className="material-symbols-outlined text-3xl font-bold">diamond</span>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">RentEase</h2>
                        </Link>
                        <p className="text-slate-500 text-sm">
                            Find your perfect home near campus. RentEase connects verified property owners with students and
                            professionals.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-20">
                        <div>
                            <h5 className="font-bold mb-4">Explore</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-primary transition-colors" href="#">Apartments</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Annexes</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Studios</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Shared Rooms</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">Support</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Cancellation Policy</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Safety Guidelines</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Report a Scam</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">Company</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 uppercase tracking-widest font-bold">
                    <p>© 2025 RentEase Lanka (PVT) LTD. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Facebook</a>
                        <a className="hover:text-primary transition-colors" href="#">Instagram</a>
                        <a className="hover:text-primary transition-colors" href="#">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

