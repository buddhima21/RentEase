import {
    propertyTypes,
    genderOptions,
    amenityOptions,
    distanceOptions,
} from "../data/filterOptions";

export default function FilterSidebar({ filters, onFilterChange, onClearAll, isOpen, onClose }) {
    const handleTypeToggle = (type) => {
        const current = filters.types;
        const updated = current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type];
        onFilterChange("types", updated);
    };

    const handleAmenityToggle = (amenity) => {
        const current = filters.amenities;
        const updated = current.includes(amenity)
            ? current.filter((a) => a !== amenity)
            : [...current, amenity];
        onFilterChange("amenities", updated);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200
          overflow-y-auto p-6 z-40 transform transition-transform duration-300
          md:static md:translate-x-0 md:shrink-0 md:block md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Filters</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClearAll}
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            Clear all
                        </button>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold mb-4 uppercase tracking-wider text-slate-500">
                        Price Range (LKR)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceMin}
                            onChange={(e) => onFilterChange("priceMin", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="text-slate-400">–</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceMax}
                            onChange={(e) => onFilterChange("priceMax", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold mb-4 uppercase tracking-wider text-slate-500">
                        Property Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {propertyTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTypeToggle(type)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${filters.types.includes(type)
                                        ? "border-primary bg-primary text-white"
                                        : "border-slate-200 hover:border-primary"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>



                <div className="mb-8">
                    <label className="block text-xs font-bold mb-4 uppercase tracking-wider text-slate-500">
                        Amenities
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {amenityOptions.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={() => handleAmenityToggle(amenity)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm group-hover:text-primary transition-colors">
                                    {amenity}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold mb-4 uppercase tracking-wider text-slate-500">
                        Distance to Campus
                    </label>
                    <select
                        value={filters.distance}
                        onChange={(e) => onFilterChange("distance", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-primary focus:border-primary py-2.5"
                    >
                        {distanceOptions.map((opt) => (
                            <option key={opt.label} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </aside>
        </>
    );
}
