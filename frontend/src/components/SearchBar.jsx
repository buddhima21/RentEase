import { useNavigate } from "react-router-dom";

/**
 * SearchBar – Location & Type dropdowns with a Search button.
 * Reusable search widget used inside the HeroSection.
 */
export default function SearchBar() {
    const navigate = useNavigate();

    /** Navigate to the search page when the user clicks "Search Now" */
    const handleSearch = () => {
        navigate("/search");
    };

    return (
        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Location Dropdown */}
                <div className="p-3">
                    <label
                        htmlFor="location-select"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
                    >
                        Location
                    </label>
                    <select
                        id="location-select"
                        className="w-full border-none bg-transparent focus:ring-0 text-slate-900 font-medium p-0"
                    >
                        <option>Colombo / Malabe</option>
                        <option>Near SLIIT</option>
                        <option>Kaduwela</option>
                    </select>
                </div>

                {/* Type Dropdown */}
                <div className="p-3 border-t md:border-t-0 md:border-l border-slate-100">
                    <label
                        htmlFor="type-select"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
                    >
                        Type
                    </label>
                    <select
                        id="type-select"
                        className="w-full border-none bg-transparent focus:ring-0 text-slate-900 font-medium p-0"
                    >
                        <option>Room / Annex</option>
                        <option>Apartment</option>
                        <option>Studio</option>
                    </select>
                </div>

                {/* Search Button */}
                <div className="p-2">
                    <button
                        onClick={handleSearch}
                        aria-label="Search properties"
                        className="w-full h-full bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all py-3"
                    >
                        <span className="material-symbols-outlined">search</span>
                        <span>Search Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
