import { useState, useMemo, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import SortBar from "../components/SortBar";
import { getApprovedProperties } from "../services/api";

const INITIAL_FILTERS = {
    search: "",
    priceMin: "",
    priceMax: "",
    types: [],
    amenities: [],
    distance: Infinity,
};

/**
 * Normalise a backend Property into the shape PropertyCard expects.
 */
function normaliseProperty(p) {
    return {
        id: p.id,
        title: p.title || "Unnamed Property",
        address: p.address || "",
        city: p.city || "",
        price: p.price || 0,
        type: p.propertyType || "Property",
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        area: p.area || 0,
        amenities: p.amenities || [],
        image: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : null,
        imageUrls: p.imageUrls || [],
        ownerId: p.ownerId,
        status: p.status,
        distanceKm: 0,
        featured: false,
        verified: true,
        rating: 0,
        reviewsCount: 0,
        genderPreference: "Any",
        availableFrom: p.createdAt || new Date().toISOString(),
        description: p.description || "",
        lat: p.latitude || null,
        lng: p.longitude || null,
    };
}

export default function Listings() {
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [sortBy, setSortBy] = useState("featured");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
    const [geocodedProps, setGeocodedProps] = useState([]);
    const [geocoding, setGeocoding] = useState(false);

    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const response = await getApprovedProperties();
            if (response.data.success) {
                const mapped = response.data.data.map(normaliseProperty);
                setAllProperties(mapped);
            } else {
                setAllProperties([]);
            }
        } catch (error) {
            console.error("Failed to fetch public properties:", error);
            setFetchError("Failed to load properties. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Geocode properties progressively — pins appear one by one as they resolve.
    // Cached addresses (localStorage) return instantly with no network delay.
    useEffect(() => {
        if (!allProperties.length) return;
        let cancelled = false;

        const geocodeAll = async () => {
            setGeocoding(true);
            const { geocodeAddress } = await import("../services/nominatim");

            // First pass: resolve cached addresses instantly (no delay needed)
            const withCoords = [];
            const needsNetwork = [];

            for (const p of allProperties) {
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

            // Show cached pins immediately
            if (!cancelled) setGeocodedProps([...withCoords]);

            // Second pass: fetch uncached properties one by one (1 req/sec)
            for (const p of needsNetwork) {
                if (cancelled) break;
                const geo = await geocodeAddress(`${p.address}, ${p.city}`);
                if (!cancelled) {
                    const result = geo ? { ...p, lat: geo.lat, lng: geo.lng } : p;
                    // Progressive update: add pin as soon as it resolves
                    setGeocodedProps((prev) => [...prev, result]);
                }
                // Only delay if there are more uncached requests
                if (needsNetwork.indexOf(p) < needsNetwork.length - 1) {
                    await new Promise((r) => setTimeout(r, 1100));
                }
            }

            if (!cancelled) setGeocoding(false);
        };

        geocodeAll();
        return () => { cancelled = true; };
    }, [allProperties]);

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleClearAll = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const filteredAndSorted = useMemo(() => {
        let result = allProperties.filter((p) => {
            const priceValue = Number(p.price) || 0;
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const match =
                    p.title.toLowerCase().includes(q) ||
                    p.address.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q);
                if (!match) return false;
            }
            const min = filters.priceMin !== "" ? Number(filters.priceMin) : null;
            const max = filters.priceMax !== "" ? Number(filters.priceMax) : null;
            if (min !== null && !Number.isNaN(min) && priceValue < min) return false;
            if (max !== null && !Number.isNaN(max) && priceValue > max) return false;
            if (filters.types.length > 0) {
                const normalizedType = String(p.type || "").trim().toLowerCase();
                const selected = filters.types.map((t) => String(t).trim().toLowerCase());
                if (!selected.includes(normalizedType)) return false;
            }
            if (filters.amenities.length > 0) {
                const hasAll = filters.amenities.every((a) => p.amenities.includes(a));
                if (!hasAll) return false;
            }
            if (filters.distance !== Infinity && p.distanceKm > filters.distance) return false;
            return true;
        });

        switch (sortBy) {
            case "featured":
                result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "distance":
                result.sort((a, b) => a.distanceKm - b.distanceKm);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
                break;
            default:
                break;
        }
        return result;
    }, [filters, sortBy, allProperties]);

    // Merge geocoded coords into filtered list for the map
    const filteredWithCoords = useMemo(() => {
        const coordMap = new Map(
            geocodedProps.filter((p) => p.lat && p.lng).map((p) => [p.id, { lat: p.lat, lng: p.lng }])
        );
        return filteredAndSorted
            .map((p) => ({ ...p, ...(coordMap.get(p.id) || {}) }))
            .filter((p) => p.lat && p.lng);
    }, [filteredAndSorted, geocodedProps]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-800/50">
            <Navbar
                showSearch
                searchQuery={filters.search}
                onSearchChange={(val) => handleFilterChange("search", val)}
            />

            <div className="flex flex-1 overflow-hidden">
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAll}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left — Property cards list */}
                    <div className="w-full md:w-[480px] lg:w-[560px] overflow-y-auto shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                        <SortBar
                            count={filteredAndSorted.length}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            onToggleFilters={() => setSidebarOpen(true)}
                        />

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading properties...</p>
                            </div>
                        ) : fetchError ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <span className="material-symbols-outlined text-5xl text-red-300 mb-3">wifi_off</span>
                                <p className="text-slate-600 dark:text-slate-300 font-medium mb-4">{fetchError}</p>
                                <button
                                    onClick={fetchProperties}
                                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredAndSorted.length > 0 ? (
                            <div className="p-6 space-y-6">
                                {filteredAndSorted.map((property) => (
                                    <div
                                        key={property.id}
                                        onMouseEnter={() => setHoveredPropertyId(property.id)}
                                        onMouseLeave={() => setHoveredPropertyId(null)}
                                    >
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No properties found</h2>
                                <p className="text-sm text-slate-400 mb-6 max-w-md">
                                    {allProperties.length === 0
                                        ? "No available properties right now. Check back soon!"
                                        : "Try adjusting your filters or search query."}
                                </p>
                                <button
                                    onClick={handleClearAll}
                                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right — Real Leaflet Map */}
                    <div className="hidden md:block flex-1 relative overflow-hidden">
                        {geocoding && (
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Locating {geocodedProps.filter((p) => p.lat).length}/{allProperties.length} properties…
                                </span>
                            </div>
                        )}

                        <ListingsMap properties={filteredWithCoords} hoveredId={hoveredPropertyId} />

                        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Map</p>
                            <p className="text-sm font-bold">{filteredWithCoords.length} pins shown</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/** Lazy-loads Leaflet map components to avoid SSR/import issues */
function ListingsMap({ properties, hoveredId }) {
    const [MapComponents, setMapComponents] = useState(null);

    useEffect(() => {
        Promise.all([
            import("../components/map/BaseMapContainer"),
            import("../components/map/PropertyMapMarker"),
            import("leaflet/dist/leaflet.css"),
        ]).then(([bmc, pmm]) => {
            setMapComponents({ BaseMapContainer: bmc.default, PropertyMapMarker: pmm.default });
        });
    }, []);

    if (!MapComponents) {
        return (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading map…</p>
                </div>
            </div>
        );
    }

    const { BaseMapContainer, PropertyMapMarker } = MapComponents;
    return (
        <BaseMapContainer center={[6.9271, 79.8612]} zoom={12} style={{ width: "100%", height: "100%" }}>
            {properties.map((p) => (
                <PropertyMapMarker key={p.id} property={p} highlighted={hoveredId === p.id} />
            ))}
        </BaseMapContainer>
    );
}
