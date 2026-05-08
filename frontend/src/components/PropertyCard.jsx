import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FALLBACK_IMAGE = "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image";

const AMENITY_META = {
    wifi: { icon: "wifi", label: "Wi‑Fi" },
    ac: { icon: "ac_unit", label: "AC" },
    parking: { icon: "local_parking", label: "Parking" },
    furnished: { icon: "chair", label: "Furnished" },
    "hot water": { icon: "water_drop", label: "Hot water" },
    cctv: { icon: "videocam", label: "CCTV" },
    electricity: { icon: "bolt", label: "Electricity" },
    water: { icon: "water_drop", label: "Water" },
    kitchen: { icon: "kitchen", label: "Kitchen" },
    laundry: { icon: "local_laundry_service", label: "Laundry" },
};

function normalizeAmenityKey(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase();
}

export default function PropertyCard({ property }) {
    const { user, toggleFavorite } = useAuth();
    const navigate = useNavigate();
    const {
        id,
        title = "Unnamed Property",
        price = 0,
        address = "",
        city = "",
        type,
        propertyType,
        bedrooms = 0,
        bathrooms = 0,
        amenities = [],
        distanceKm = 0,
        featured = false,
        verified = true,
        rating = 0,
        reviewsCount = 0,
        image,
        imageUrls,
        availableFrom,
        createdAt,
    } = property;

    const displayImage = image || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : null);
    const displayType = type || propertyType || "Property";
    const displayDate = availableFrom || createdAt || new Date().toISOString();

    const formattedPrice = new Intl.NumberFormat("en-LK").format(price);

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700/50">
            <div className="relative h-52 w-full bg-slate-200 overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 absolute z-0">home_work</span>
                {displayImage && (
                    <img
                        className="relative z-10 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 text-transparent"
                        src={displayImage}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2">
                    {featured && (
                        <span className="bg-primary text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                            Featured
                        </span>
                    )}
                    {verified && (
                        <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                            Verified
                        </span>
                    )}
                </div>

                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        if (!user) {
                            navigate("/login");
                            return;
                        }
                        toggleFavorite(id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                        user?.favoritePropertyIds?.includes(id)
                            ? 'bg-white text-rose-500 hover:bg-rose-50' 
                            : 'bg-black/20 hover:bg-black/40 text-white'
                    }`}
                >
                    <span 
                        className="material-symbols-outlined text-[20px] transition-all" 
                        style={{ fontVariationSettings: user?.favoritePropertyIds?.includes(id) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        favorite
                    </span>
                </button>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{displayType}</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <div className="text-right shrink-0 ml-3">
                        <p className="text-primary font-bold text-base">LKR {formattedPrice}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Per Month</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-3">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="line-clamp-1">{address}, {city}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">star</span>
                        <span className="text-xs font-bold">{rating}</span>
                        <span className="text-xs text-slate-400">({reviewsCount})</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-slate-400 text-base">bed</span>
                        <span className="text-xs">{bedrooms} Bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-slate-400 text-base">bathtub</span>
                        <span className="text-xs">{bathrooms} Bath</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-slate-400 text-base">directions_walk</span>
                        <span className="text-xs">{distanceKm} km</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                    {(amenities || [])
                        .map((amenity) => {
                            const key = normalizeAmenityKey(amenity);
                            const meta = AMENITY_META[key];
                            return meta ? { key, meta } : null;
                        })
                        .filter(Boolean)
                        .slice(0, 4)
                        .map(({ key, meta }, idx) => (
                            <span
                                key={`${key}-${idx}`}
                                className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[11px] font-medium"
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {meta.icon}
                                </span>
                                {meta.label}
                            </span>
                        ))}
                    {(amenities || []).length > 4 && (
                        <span className="inline-flex items-center bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md text-[11px] font-medium">
                            +{amenities.length - 4} more
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/property/${id}`}
                        className="flex-1 bg-primary text-white text-center font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                    >
                        View Details
                    </Link>
                    <button className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                        <span className="material-symbols-outlined text-primary">chat</span>
                    </button>
                </div>

                <p className="text-[10px] text-slate-400 mt-2">
                    Available from {new Date(displayDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            </div>
        </div>
    );
}
