import { useEffect, useState, useMemo } from "react";
import { getAdminPropertyById } from "../../../services/api";

export default function ListingDetailsModal({ isOpen, onClose, propertyId }) {
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    /* ── Fetch Data ─────────────────────────────────────── */
    useEffect(() => {
        if (isOpen && propertyId) {
            setIsLoading(true);
            getAdminPropertyById(propertyId)
                .then((res) => setProperty(res.data.data))
                .catch((err) => console.error(err))
                .finally(() => setIsLoading(false));
        } else {
            setProperty(null);
        }
    }, [isOpen, propertyId]);

    /* ── Reset Image Index on New Property ──────────────── */
    useEffect(() => {
        setActiveImageIndex(0);
    }, [propertyId]);

    /* ── Helpers ────────────────────────────────────────── */
    const formatLkr = (value) =>
        new Intl.NumberFormat("en-LK").format(Number(value) || 0);

    /* ── Compute Data ───────────────────────────────────── */
    const images = useMemo(() => {
        if (!property) return [];
        const combined = [
            ...(property.imageUrls || []),
            ...(property.images || []).map((img) => (typeof img === "string" ? img : img.url)),
        ].filter(Boolean);
        return Array.from(new Set(combined));
    }, [property]);

    const activeAmenities = useMemo(() => {
        if (!property?.amenities) return [];
        const defs = [
            { key: "electricity", icon: "bolt", label: "Electricity" },
            { key: "wifi", icon: "wifi", label: "WiFi" },
            { key: "ac", icon: "ac_unit", label: "A/C" },
            { key: "furnished", icon: "chair", label: "Furnished" },
            { key: "parking", icon: "local_parking", label: "Parking" },
            { key: "kitchen", icon: "countertops", label: "Kitchen" },
            { key: "laundry", icon: "local_laundry_service", label: "Laundry" },
            { key: "water", icon: "water_drop", label: "Water" },
        ];
        return defs.filter((def) =>
            property.amenities.map((a) => a.toLowerCase()).includes(def.key)
        );
    }, [property]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* ── Header ────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900 z-10 sticky top-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Property Details</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xl">close</span>
                    </button>
                </div>

                {/* ── Body (Scrollable) ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#f8fafc]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-4xl mb-3">progress_activity</span>
                            <p className="text-sm font-medium">Loading property data...</p>
                        </div>
                    ) : property ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* ── Column 1: Images & Description ───── */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Image Gallery */}
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {images.length > 0 ? (
                                        <>
                                            <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-3 group">
                                                <img
                                                    src={images[activeImageIndex]}
                                                    alt="Property"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                                                    {activeImageIndex + 1} / {images.length}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                                {images.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveImageIndex(idx)}
                                                        className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                                            activeImageIndex === idx
                                                                ? "border-emerald-500 ring-2 ring-emerald-100"
                                                                : "border-transparent opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                            <p className="text-sm">No images available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                        Description
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                        {property.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Amenities */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                        Amenities
                                    </h3>
                                    {activeAmenities.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {activeAmenities.map((amenity) => (
                                                <div
                                                    key={amenity.key}
                                                    className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 text-center"
                                                >
                                                    <span className="material-symbols-outlined text-emerald-500 mb-1">
                                                        {amenity.icon}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                        {amenity.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">No specific amenities listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Column 2: At-a-Glance & Fees ─────── */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Key Details */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="mb-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            property.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            property.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{property.title}</h1>
                                    <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
                                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">location_on</span>
                                        {property.address}, {property.city}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Type</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {property.propertyType || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Bedrooms</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {property.bedrooms || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials */}
                                <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">
                                        Financial Terms
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Monthly Rent</p>
                                            <p className="text-3xl font-bold">LKR {formatLkr(property.price)}</p>
                                        </div>
                                        <div className="h-px bg-slate-700"></div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Security Deposit</p>
                                            <p className="text-xl font-semibold text-slate-200">
                                                LKR {formatLkr(property.securityDeposit)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        Owner Information
                                    </h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                                            {property.ownerName?.charAt(0) || "O"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {property.ownerName || "Unknown Owner"}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Property Owner</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            <span className="truncate">{property.ownerEmail || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">error</span>
                            <p>Property not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}