import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BaseMapContainer from "../components/map/BaseMapContainer";
import PropertyMapMarker from "../components/map/PropertyMapMarker";
import { getApprovedProperties } from "../services/api";
import { geocodeAddress, searchAddresses } from "../services/nominatim";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLOMBO_CENTER = [6.9271, 79.8612];

function normaliseProperty(p) {
    return {
        id: p.id,
        title: p.title || "Unnamed Property",
        address: p.address || "",
        city: p.city || "",
        price: p.price || 0,
        type: p.propertyType || "Property",
        image: p.imageUrls?.[0] || null,
        imageUrls: p.imageUrls || [],
        lat: p.latitude || null,
        lng: p.longitude || null,
    };
}

/** Helper component: pans the map to a new center */
function FlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 14, { duration: 1.2 });
    }, [center, map]);
    return null;
}

export default function MapView() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [geocodedProps, setGeocodedProps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);
    const [activeType, setActiveType] = useState("All");
    const debounceRef = useRef(null);
    const searchRef = useRef(null);

    const TYPES = ["All", "Apartment", "Annex", "House", "Single Room"];

    // Load properties
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getApprovedProperties();
                if (res.data.success) {
                    setProperties(res.data.data.map(normaliseProperty));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Two-pass geocoding: instant cache → then network (1 req/sec fair-use)
    useEffect(() => {
        if (!properties.length) return;

        let cancelled = false;
        const geocodeAll = async () => {
            setGeocoding(true);

            // Pass 1: instantly resolve cached addresses
            const withCoords = [];
            const needsNetwork = [];

            for (const p of properties) {
                if (p.lat && p.lng) {
                    withCoords.push(p);
                    continue;
                }
                const cacheKey = `${p.address}, ${p.city}`.trim().toLowerCase();
                const cached = JSON.parse(localStorage.getItem(`rentease_geo_${cacheKey}`) || "null");
                if (cached && cached.lat) {
                    withCoords.push({ ...p, lat: cached.lat, lng: cached.lng });
                } else {
                    needsNetwork.push(p);
                }
            }

            if (!cancelled) setGeocodedProps(withCoords.filter((p) => p.lat && p.lng));

            // Pass 2: network-fetch uncached addresses one by one
            for (const p of needsNetwork) {
                if (cancelled) break;
                const geo = await geocodeAddress(`${p.address}, ${p.city}`);
                if (!cancelled && geo) {
                    setGeocodedProps((prev) => [...prev, { ...p, lat: geo.lat, lng: geo.lng }]);
                }
                if (needsNetwork.indexOf(p) < needsNetwork.length - 1) {
                    await new Promise((r) => setTimeout(r, 1100));
                }
            }

            if (!cancelled) setGeocoding(false);
        };

        geocodeAll();
        return () => { cancelled = true; };
    }, [properties]);

    // Nominatim address search autocomplete
    const handleSearchInput = useCallback((val) => {
        setSearchQuery(val);
        clearTimeout(debounceRef.current);
        if (val.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
        debounceRef.current = setTimeout(async () => {
            const results = await searchAddresses(val, 5);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        }, 500);
    }, []);

    const handleSuggestionSelect = (suggestion) => {
        setSearchQuery(suggestion.shortName);
        setShowSuggestions(false);
        setSuggestions([]);
        setFlyTarget([suggestion.lat, suggestion.lng]);
    };

    const filteredProps = activeType === "All"
        ? geocodedProps
        : geocodedProps.filter((p) =>
            p.type?.toLowerCase().includes(activeType.toLowerCase())
        );

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white">
            <Navbar />

            {/* Search + filter bar */}
            <div className="relative z-[1000] bg-white dark:bg-slate-900 shadow-lg border-b border-slate-100 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {/* Nominatim search */}
                    <div className="relative flex-1" ref={searchRef}>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Search any location in Sri Lanka…"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                        {showSuggestions && (
                            <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-primary/5 border-b border-slate-50 last:border-0"
                                        onMouseDown={() => handleSuggestionSelect(s)}
                                    >
                                        <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">location_on</span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{s.shortName}</p>
                                            <p className="text-xs text-slate-400 line-clamp-1">{s.displayName}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Type filter chips */}
                    <div className="flex gap-2 overflow-x-auto pb-0.5 shrink-0">
                        {TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                    activeType === type
                                        ? "bg-primary text-white border-primary shadow-md"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {(loading || geocoding) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {loading ? "Loading properties…" : `Locating ${geocodedProps.length}/${properties.length} properties…`}
                        </span>
                    </div>
                )}

                {/* Stats badge */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Showing</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                        {filteredProps.length} {activeType !== "All" ? activeType : ""} Properties
                    </p>
                    <p className="text-xs text-slate-400">across Sri Lanka</p>
                </div>

                {/* Back to listings */}
                <div className="absolute bottom-6 right-6 z-[1000]">
                    <button
                        onClick={() => navigate("/listings")}
                        className="bg-white/95 backdrop-blur-sm text-slate-700 dark:text-slate-200 font-bold text-sm px-4 py-2.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">view_list</span>
                        List View
                    </button>
                </div>

                <BaseMapContainer
                    center={COLOMBO_CENTER}
                    zoom={11}
                    style={{ width: "100%", height: "100%" }}
                >
                    {flyTarget && <FlyTo center={flyTarget} />}
                    {filteredProps.map((p) => (
                        <PropertyMapMarker key={p.id} property={p} />
                    ))}
                </BaseMapContainer>
            </div>
        </div>
    );
}
