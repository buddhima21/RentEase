import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserDropdown from "../../UserDropdown";
import OwnerNotificationsBell from "./OwnerNotificationsBell";
import { useAuth } from "../../../context/AuthContext";
import { ownerProfile } from "../../../data/ownerDashboardData";
import { getOwnerPropertyById } from "../../../services/api";

export default function ViewPropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const formatLkr = useMemo(() => {
        const formatter = new Intl.NumberFormat("en-LK");
        return (value) => formatter.format(Number(value) || 0);
    }, []);

    const propertyImages = useMemo(() => {
        const imageUrls = Array.isArray(property?.imageUrls) ? property.imageUrls : [];
        const images = Array.isArray(property?.images) ? property.images : [];
        const imageObjUrls = images
            .map((img) => (typeof img === "string" ? img : img?.url))
            .filter(Boolean);

        const merged = [...imageUrls, ...imageObjUrls]
            .filter((url) => typeof url === "string" && url.trim().length > 0);

        return Array.from(new Set(merged));
    }, [property]);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [id]);

    useEffect(() => {
        if (activeImageIndex >= propertyImages.length) {
            setActiveImageIndex(0);
        }
    }, [activeImageIndex, propertyImages.length]);

    useEffect(() => {
        const loadProperty = async () => {
            try {
                const response = await getOwnerPropertyById(id);
                setProperty(response.data?.data || null);
            } catch (error) {
                alert(error.response?.data?.message || "Failed to load property details");
                navigate("/owner/properties");
            } finally {
                setIsLoading(false);
            }
        };

        loadProperty();
    }, [id, navigate]);

    const statusLabel = useMemo(() => {
        if (!property?.status) return "Draft";
        switch (property.status) {
            case "APPROVED":
                return "Published";
            case "PENDING_APPROVAL":
                return "Pending";
            case "PENDING_DELETE":
                return "Pending Delete";
            case "REJECTED":
                return "Rejected";
            default:
                return "Draft";
        }
    }, [property]);

    const amenityDefinitions = [
        { key: "electricity", icon: "bolt", label: "Electricity" },
        { key: "wifi", icon: "wifi", label: "WiFi" },
        { key: "ac", icon: "ac_unit", label: "A/C" },
        { key: "furnished", icon: "chair", label: "Furnished" },
        { key: "parking", icon: "local_parking", label: "Parking" },
        { key: "kitchen", icon: "countertops", label: "Kitchen" },
        { key: "laundry", icon: "local_laundry_service", label: "Laundry" },
        { key: "water", icon: "water_drop", label: "Water" },
    ];

    const activeAmenities = useMemo(() => {
        const existing = (property?.amenities || []).map((item) => item.toLowerCase());
        return amenityDefinitions.filter((item) => existing.includes(item.key));
    }, [property]);

    if (isLoading) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#f6f8f7]">
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Loading property details...</p>
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#26C289" }}>
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* ── Top Bar ───────────────────────────────────── */}
                <header className="h-20 bg-white dark:bg-slate-900 border-b border-emerald-100 flex items-center justify-between px-6 lg:px-8 shrink-0 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <Link 
                            to="/owner/properties"
                            className="flex items-center gap-2 text-primary font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors active:scale-95 duration-150 pl-12 lg:pl-3"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            <span className="text-sm uppercase tracking-wider font-label">Back to List</span>
                        </Link>
                        <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 hidden sm:block">Property Details</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <OwnerNotificationsBell />
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                            />
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="max-w-7xl mx-auto pl-12 lg:pl-0">
                        {/* Header Section (Bento Style) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Title Card */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 pointer-events-none"></div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">{statusLabel}</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">ID: {property.id}</span>
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{property.title}</h1>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-start sm:items-center gap-2 text-sm sm:text-base">
                                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">location_on</span>
                                        {property.address}
                                    </p>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                                    {user?.role !== "ADMIN" && (
                                        <>
                                            <button 
                                                onClick={() => navigate(`/edit-property/${id}`)}
                                                className="bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                                Edit Property
                                            </button>
                                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all w-full sm:w-auto justify-center">
                                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                                Manage Bookings
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Financial Snapshot */}
                            <div className="bg-slate-900 text-white rounded-xl p-6 lg:p-8 flex flex-col justify-center shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                                <div className="relative z-10">
                                    <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                                        Financial Terms
                                    </p>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1 font-medium">Monthly Rent</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-black tracking-tight text-white">LKR {formatLkr(property.price)}</span>
                                            </div>
                                        </div>
                                        <div className="h-[1px] bg-slate-800"></div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1 font-medium">Security Deposit</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-bold tracking-tight text-slate-200">LKR {formatLkr(property.securityDeposit ?? 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100 mb-8">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                                    Property Photos
                                </p>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                    {propertyImages.length} photos
                                </span>
                            </div>

                            {propertyImages.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-slate-300 text-6xl">image</span>
                                    <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">No photos uploaded for this property.</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add photos from “Edit Property” to improve your listing.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-[16/10]">
                                            <img
                                                src={propertyImages[activeImageIndex]}
                                                alt={`${property.title || "Property"} photo ${activeImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-white text-sm">photo</span>
                                                <span className="text-[11px] text-white font-bold tracking-wide">
                                                    {activeImageIndex + 1} / {propertyImages.length}
                                                </span>
                                            </div>

                                            {propertyImages.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length)}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-[0.98]"
                                                        aria-label="Previous photo"
                                                    >
                                                        <span className="material-symbols-outlined">chevron_left</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveImageIndex((prev) => (prev + 1) % propertyImages.length)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-[0.98]"
                                                        aria-label="Next photo"
                                                    >
                                                        <span className="material-symbols-outlined">chevron_right</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
                                            {propertyImages.slice(0, 8).map((url, idx) => {
                                                const isActive = idx === activeImageIndex;
                                                return (
                                                    <button
                                                        key={`${url}-${idx}`}
                                                        type="button"
                                                        onClick={() => setActiveImageIndex(idx)}
                                                        className={[
                                                            "relative rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 aspect-square transition-all",
                                                            isActive ? "border-primary ring-2 ring-emerald-200" : "border-slate-200 dark:border-slate-700 hover:border-emerald-200",
                                                        ].join(" ")}
                                                        aria-label={`View photo ${idx + 1}`}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`${property.title || "Property"} thumbnail ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {propertyImages.length > 8 && (
                                            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                Showing 8 of {propertyImages.length} photos. Use arrows to browse.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Main Details Col (Left) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Description & Category */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">info</span>
                                        Property Information
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[24px]">apartment</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Category</p>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{property.propertyType}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[24px]">holiday_village</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Type</p>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{property.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">Description</p>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                            {property.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Amenities Bento */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">star</span>
                                        Premium Amenities
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {activeAmenities.length === 0 && (
                                            <p className="col-span-full text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                No amenities listed for this property.
                                            </p>
                                        )}
                                        {activeAmenities.map((amenity) => {
                                            return (
                                                <div key={amenity.key} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 transition-colors border border-slate-100 dark:border-slate-700/50 hover:border-emerald-200">
                                                    <span className="material-symbols-outlined text-primary text-[28px]">{amenity.icon}</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{amenity.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Info Cards Col (Right) */}
                            <div className="space-y-6">
                                {/* Owner Profile Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-emerald-100">
                                    <div className="h-20 bg-slate-900 flex items-end px-6 pb-4 relative">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #26C289 0%, transparent 100%)" }}></div>
                                        <p className="text-primary text-[10px] font-bold tracking-widest uppercase relative z-10">Verified Owner</p>
                                    </div>
                                    <div className="px-6 pb-6 -mt-10 relative z-10">
                                        <div className="w-20 h-20 rounded-2xl border-4 border-white mb-4 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                                            {(user?.profileImageUrl || user?.avatar) ? (
                                                <img 
                                                    src={user.profileImageUrl || user.avatar} 
                                                    alt={user.fullName || "Owner"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                                    {user?.fullName?.charAt(0) || "O"}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName || property.ownerName || "Property Owner"}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">RentEase Partner</p>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate" title={user?.email || property.ownerEmail}>
                                                    {user?.email || property.ownerEmail || "Email not available"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                                    {user?.phone || "Phone not available"}
                                                </span>
                                            </div>
                                            
                                            <button className="w-full mt-4 py-3 rounded-lg border border-emerald-200 text-primary font-bold text-sm hover:bg-emerald-50 transition-colors active:scale-[0.98]">
                                                Contact Owner
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Location / Map Preview */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-emerald-100">
                                    <div className="p-6">
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">map</span>
                                            Map Location
                                        </p>
                                        <div className="rounded-lg overflow-hidden h-48 relative border border-slate-200 dark:border-slate-700">
                                            <img 
                                                alt="Location Map" 
                                                className="w-full h-full object-cover" 
                                                src={propertyImages?.[0] || "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center animate-pulse">
                                                    <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-slate-200 dark:border-slate-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{property.address}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{property.city}</p>
                                            <button className="mt-4 flex items-center gap-1.5 text-primary text-xs font-bold hover:text-emerald-700 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                Open in Google Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
