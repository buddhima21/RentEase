import { useState, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import SortBar from "../components/SortBar";
import properties from "../data/properties";

const INITIAL_FILTERS = {
    search: "",
    priceMin: "",
    priceMax: "",
    types: [],
    gender: "Any",
    amenities: [],
    distance: Infinity,
};

export default function Listings() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [sortBy, setSortBy] = useState("featured");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleClearAll = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const filteredAndSorted = useMemo(() => {
        let result = properties.filter((p) => {
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const match =
                    p.title.toLowerCase().includes(q) ||
                    p.address.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q);
                if (!match) return false;
            }

            if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
            if (filters.priceMax && p.price > Number(filters.priceMax)) return false;

            if (filters.types.length > 0 && !filters.types.includes(p.type)) return false;

            if (filters.gender !== "Any" && p.genderPreference !== "Any" && p.genderPreference !== filters.gender) {
                return false;
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
    }, [filters, sortBy]);

    const mapPins = useMemo(() => {
        return filteredAndSorted.slice(0, 12).map((p, i) => ({
            id: p.id,
            label: `${Math.round(p.price / 1000)}k`,
            top: `${15 + ((i * 37 + 23) % 65)}%`,
            left: `${10 + ((i * 47 + 13) % 75)}%`,
        }));
    }, [filteredAndSorted]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">
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
                    <div className="w-full md:w-[480px] lg:w-[560px] overflow-y-auto shrink-0 flex flex-col bg-slate-50">
                        <SortBar
                            count={filteredAndSorted.length}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            onToggleFilters={() => setSidebarOpen(true)}
                        />

                        {filteredAndSorted.length > 0 ? (
                            <div className="p-6 space-y-6">
                                {filteredAndSorted.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                                    search_off
                                </span>
                                <h2 className="text-xl font-bold text-slate-600 mb-2">No properties found</h2>
                                <p className="text-sm text-slate-400 mb-6 max-w-md">
                                    Try adjusting your filters or search query to find what you are looking for.
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

                    <div className="hidden md:block flex-1 relative bg-slate-300 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#e2e8f0,_#cbd5e1)]">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: "radial-gradient(#221610 1px, transparent 1px)",
                                    backgroundSize: "20px 20px",
                                }}
                            />

                            {mapPins.map((pin) => (
                                <div
                                    key={pin.id}
                                    className="absolute flex flex-col items-center cursor-pointer group"
                                    style={{ top: pin.top, left: pin.left }}
                                >
                                    <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 shadow-lg group-hover:scale-110 transition-transform">
                                        {pin.label}
                                    </div>
                                    <span
                                        className="material-symbols-outlined text-primary text-3xl drop-shadow-md"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        location_on
                                    </span>
                                </div>
                            ))}

                            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase">Viewing Area</p>
                                <p className="text-sm font-bold">Malabe, Sri Lanka</p>
                            </div>

                            <div className="absolute top-6 right-6 flex flex-col gap-2">
                                <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                                <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">remove</span>
                                </button>
                                <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">my_location</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

