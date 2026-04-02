import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPropertyById, getPropertyAvailableSlots, createBookingRequest, getTenantBookings } from "../services/api";
import Navbar from "../components/Navbar";

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

function BookingModal({ property, onClose, onSubmit, submitting, error }) {
    const [startDate, setStartDate] = useState("");

    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!startDate) return;
        onSubmit(startDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black text-slate-900">Request Booking</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Property Summary */}
                <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                        {property.address}, {property.city}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary text-base">
                            LKR {new Intl.NumberFormat("en-LK").format(property.price)}
                            <span className="text-slate-400 font-normal text-xs">/mo</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                            <span className="material-symbols-outlined text-sm">bed</span>
                            {property.bedrooms} Bedroom{property.bedrooms > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Requested Move-in Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            min={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">info</span>
                        <p className="text-xs text-amber-700">
                            Your request will be sent to the property owner for review. You'll see the status on your dashboard.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !startDate}
                            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            )}
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ListingDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState(null);
    const [existingBooking, setExistingBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    useEffect(() => {
        if (property && user?.role === "TENANT") {
            fetchSlots();
            checkExistingBooking();
        }
    }, [property, user]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const res = await getPropertyById(id);
            setProperty(res.data.data);
        } catch {
            setProperty(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const res = await getPropertyAvailableSlots(id);
            setAvailableSlots(res.data.data.availableSlots);
        } catch {
            setAvailableSlots(null);
        }
    };

    const checkExistingBooking = async () => {
        try {
            const res = await getTenantBookings(user.id);
            const bookings = res.data.data || [];
            const active = bookings.find(
                (b) => b.propertyId === id && ["PENDING", "APPROVED", "ALLOCATED"].includes(b.status)
            );
            setExistingBooking(active || null);
        } catch {
            // ignore
        }
    };

    const handleBookingSubmit = async (startDate) => {
        setSubmitting(true);
        setBookingError(null);
        try {
            await createBookingRequest({
                propertyId: id,
                tenantId: user.id,
                ownerId: property.ownerId,
                monthlyRent: property.price,
                startDate: startDate,
            });
            setShowModal(false);
            setSuccessMsg("Booking request submitted! Check your dashboard for updates.");
            setExistingBooking({ status: "PENDING" });
            fetchSlots();
        } catch (err) {
            setBookingError(
                err?.response?.data?.message || "Failed to submit booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500">Loading property...</p>
                    </div>
                </div>
            </div>
        );
    }

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
    const galleryImages = property.imageUrls && property.imageUrls.length > 0
        ? property.imageUrls
        : [null, null, null, null, null];
    while (galleryImages.length < 5) galleryImages.push(null);

    const isTenant = user?.role === "TENANT";
    const isFullyBooked = availableSlots !== null && availableSlots === 0;
    const hasActiveBooking = !!existingBooking;

    const renderBookingButton = () => {
        if (!isTenant) return null;

        if (hasActiveBooking) {
            const statusLabels = {
                PENDING: { label: "Request Pending", icon: "hourglass_top", cls: "bg-amber-100 text-amber-700 border-amber-200" },
                APPROVED: { label: "Booking Approved", icon: "thumb_up", cls: "bg-blue-100 text-blue-700 border-blue-200" },
                ALLOCATED: { label: "You are Allocated", icon: "check_circle", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            };
            const cfg = statusLabels[existingBooking.status] || statusLabels["PENDING"];
            return (
                <div className={`flex items-center gap-2 px-5 py-3 rounded-xl border ${cfg.cls} font-bold text-sm`}>
                    <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                    {cfg.label}
                </div>
            );
        }

        if (isFullyBooked) {
            return (
                <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">bed_off</span>
                    Fully Booked — All Rooms Occupied
                </div>
            );
        }

        return (
            <button
                onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    setShowModal(true);
                }}
                className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-md"
            >
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Request Booking
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-background-light">
            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    property={property}
                    onClose={() => { setShowModal(false); setBookingError(null); }}
                    onSubmit={handleBookingSubmit}
                    submitting={submitting}
                    error={bookingError}
                />
            )}

            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-background-light/80 backdrop-blur-md px-4 md:px-20 py-3">
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

                {/* Success Alert */}
                {successMsg && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                        <p className="text-emerald-800 font-medium text-sm flex-1">{successMsg}</p>
                        <Link to="/tenant/dashboard" className="text-emerald-700 font-bold text-sm underline hover:no-underline">
                            View Dashboard
                        </Link>
                    </div>
                )}

                {/* Gallery */}
                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
                    <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden bg-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 absolute z-0">home_work</span>
                        {galleryImages[0] && (
                            <img
                                className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 text-transparent"
                                src={galleryImages[0]}
                                alt={property.title}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        {property.status && property.status !== "AVAILABLE" && (
                            <div className="absolute z-20 top-3 left-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${
                                    property.status === "BOOKED" ? "bg-amber-500 text-white" :
                                    property.status === "UNDER_MAINTENANCE" ? "bg-orange-500 text-white" :
                                    "bg-slate-500 text-white"
                                }`}>
                                    {property.status.replace("_", " ")}
                                </span>
                            </div>
                        )}
                    </div>
                    {galleryImages.slice(1, 5).map((img, i) => (
                        <div key={i} className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden bg-slate-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 absolute z-0">home_work</span>
                            {img && (
                                <img
                                    className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 text-transparent"
                                    src={img}
                                    alt={`${property.title} view ${i + 2}`}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            {i === 3 && (
                                <div className="absolute z-20 bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                                    <span className="material-symbols-outlined text-sm">grid_view</span> Show all photos
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-10">
                        {/* Title + Booking Button */}
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
                                {property.area > 0 && (
                                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                        <span className="material-symbols-outlined text-primary">square_foot</span>
                                        <span className="font-medium">{property.area} sq ft</span>
                                    </div>
                                )}
                                {property.propertyType && (
                                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                        <span className="material-symbols-outlined text-primary">home</span>
                                        <span className="font-medium">{property.propertyType}</span>
                                    </div>
                                )}
                            </div>

                            {/* Availability Info */}
                            {isTenant && availableSlots !== null && (
                                <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
                                    isFullyBooked
                                        ? "bg-red-50 border-red-200"
                                        : "bg-emerald-50 border-emerald-200"
                                }`}>
                                    <span className={`material-symbols-outlined ${isFullyBooked ? "text-red-500" : "text-emerald-600"}`}>
                                        {isFullyBooked ? "bed_off" : "bed"}
                                    </span>
                                    <div>
                                        <p className={`font-bold text-sm ${isFullyBooked ? "text-red-700" : "text-emerald-700"}`}>
                                            {isFullyBooked
                                                ? "Fully Booked — No rooms available"
                                                : `${availableSlots} bedroom${availableSlots > 1 ? "s" : ""} available`}
                                        </p>
                                        <p className={`text-xs ${isFullyBooked ? "text-red-500" : "text-emerald-600"}`}>
                                            {isFullyBooked
                                                ? `All ${property.bedrooms} rooms are currently allocated`
                                                : `Out of ${property.bedrooms} total bedrooms`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Booking CTA */}
                            {isTenant && (
                                <div className="mt-5">
                                    {renderBookingButton()}
                                </div>
                            )}
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

                        {property.amenities && property.amenities.length > 0 && (
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
                        )}

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
                                <h4 className="text-xl font-bold">Property Owner</h4>
                                <p className="text-slate-500 text-sm">Verified Owner</p>
                                <p className="mt-2 text-slate-600 text-sm italic">
                                    "Looking for long-term tenants who respect the space."
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Booking Panel */}
                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-5">
                            <div>
                                <p className="text-3xl font-black text-primary">LKR {formattedPrice}<span className="text-base font-normal text-slate-400">/mo</span></p>
                                <p className="text-sm text-slate-500 mt-1">{property.propertyType} · {property.bedrooms} Bed · {property.bathrooms} Bath</p>
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Security Deposit</span>
                                    <span className="font-bold">LKR {new Intl.NumberFormat("en-LK").format(property.price * 2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Est. Utilities</span>
                                    <span className="font-bold">LKR 5,000</span>
                                </div>
                            </div>

                            {isTenant && availableSlots !== null && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                                    isFullyBooked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                                }`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {isFullyBooked ? "bed_off" : "meeting_room"}
                                    </span>
                                    {isFullyBooked
                                        ? "No rooms available"
                                        : `${availableSlots} room${availableSlots > 1 ? "s" : ""} available`}
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-4">
                                {isTenant ? (
                                    renderBookingButton()
                                ) : !user ? (
                                    <Link
                                        to="/login"
                                        className="block w-full text-center bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all text-sm"
                                    >
                                        Login to Book
                                    </Link>
                                ) : (
                                    <div className="text-center text-slate-500 text-sm py-2">
                                        Booking is for tenants only.
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-xs text-slate-400">No fees charged until confirmed</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-20 border-t border-slate-200 bg-white py-12 px-4 md:px-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
                    <div className="max-w-xs">
                        <Link to="/" className="flex items-center gap-2 text-primary mb-4">
                            <span className="material-symbols-outlined text-3xl font-bold">diamond</span>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">RentEase</h2>
                        </Link>
                        <p className="text-slate-500 text-sm">Find your perfect home. RentEase connects verified property owners with tenants.</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex justify-center items-center text-xs text-slate-400 uppercase tracking-widest font-bold">
                    <p>© 2025 RentEase Lanka (PVT) LTD. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

