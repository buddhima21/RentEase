import { sortOptions } from "../data/filterOptions";

export default function SortBar({ count, sortBy, onSortChange, onToggleFilters }) {
    return (
        <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleFilters}
                    className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all"
                >
                    <span className="material-symbols-outlined">tune</span>
                </button>
                <div>
                    <h1 className="text-lg font-bold">Listings</h1>
                    <p className="text-sm text-slate-500">{count} properties found</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase">
                    Sort by:
                </span>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
