import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/owner/dashboard/Sidebar";
import { ownerProfile } from "../data/ownerDashboardData";
import { allProperties, getTabCounts, ITEMS_PER_PAGE } from "../data/myPropertiesData";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";
import ActionDropdown from "../components/owner/dashboard/ActionDropdown";
import DeletePropertyModal from "../components/owner/dashboard/DeletePropertyModal";

const statusStyles = {
    Published: "bg-emerald-100 text-emerald-700",
    Draft: "bg-slate-100 text-slate-600",
    Occupied: "bg-blue-100 text-blue-700",
    Archived: "bg-amber-100 text-amber-700",
};

/**
 * MyProperties — Full property management page with tabs, search, table and pagination.
 * Route: /owner/properties
 */
export default function MyProperties() {
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingProperty, setDeletingProperty] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleDeleteConfirm = (reason) => {
        console.log(`Deleting property: ${deletingProperty.name}, Reason: ${reason}`);
        // Typically dispatch an action or API call here
        setDeletingProperty(null);
    };

    const tabCounts = useMemo(() => getTabCounts(allProperties), []);

    // Filter by tab + search
    const filteredProperties = useMemo(() => {
        let result = allProperties;
        if (activeTab !== "All") {
            result = result.filter((p) => p.status === activeTab);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.type.toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeTab, searchQuery]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProperties = filteredProperties.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const tabs = ["All", "Published", "Draft", "Occupied", "Archived"];

    return (
        <div
            className="flex min-h-screen bg-[#f6f8f7]"
            style={{ "--color-primary": "#1DBC60" }}
        >
            {/* ── Sidebar ─────────────────────────────────────── */}
            <Sidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* ── Top Bar ───────────────────────────────────── */}
                <header className="h-20 bg-white border-b border-emerald-100 px-6 lg:px-8 flex items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-6 flex-1 max-w-2xl">
                        <h2 className="text-xl font-bold whitespace-nowrap pl-12 lg:pl-0">My Properties</h2>
                        <div className="relative w-full hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border-none rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all"
                                placeholder="Search properties by name or location..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 lg:ml-8">
                        <button className="p-2 text-slate-500 hover:bg-emerald-50 rounded-full transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
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

                {/* ── Page Content ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {/* ── Tabs ────────────────────────────────────── */}
                    <div className="flex items-center border-b border-emerald-100 mb-8 overflow-x-auto">
                        {tabs.map((tab) => {
                            const count = tabCounts[tab] ?? 0;
                            if (count === 0 && tab !== "All") return null;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-5 lg:px-6 py-4 text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${activeTab === tab
                                            ? "font-bold border-primary text-slate-900"
                                            : "font-medium text-slate-500 border-transparent hover:text-emerald-600"
                                        }`}
                                >
                                    {tab === "All" ? `All Properties (${count})` : `${tab} (${count})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Property Table ──────────────────────────── */}
                    <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[640px]">
                                <thead>
                                    <tr className="bg-emerald-50/50 border-b border-emerald-100">
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                            Monthly Rent
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800 uppercase tracking-wider text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50">
                                    {paginatedProperties.length > 0 ? (
                                        paginatedProperties.map((prop) => (
                                            <tr
                                                key={prop.id}
                                                className="hover:bg-emerald-50/30 transition-colors duration-200 group"
                                            >
                                                {/* Property */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={prop.thumbnail}
                                                            alt={prop.name}
                                                            className="w-14 h-14 rounded-lg object-cover border border-emerald-100 shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                                                                {prop.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                                {prop.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                    {prop.type}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[prop.status] || statusStyles.Draft
                                                            }`}
                                                    >
                                                        {prop.status}
                                                    </span>
                                                </td>

                                                {/* Rent */}
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-emerald-700">{prop.rent}</p>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <ActionDropdown 
                                                        onUpdate={() => navigate(`/owner/properties/${prop.id}/edit`)}
                                                        onView={() => navigate(`/owner/properties/${prop.id}`)}
                                                        onDelete={() => setDeletingProperty(prop)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-16 text-center text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-4xl mb-2 block">
                                                    search_off
                                                </span>
                                                <p className="font-medium">No properties found</p>
                                                <p className="text-xs mt-1">
                                                    Try adjusting your search or filter
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ────────────────────────────── */}
                        {filteredProperties.length > 0 && (
                            <div className="px-6 py-4 bg-emerald-50/20 border-t border-emerald-100 flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-medium tracking-wide">
                                    Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                                    {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProperties.length)} of{" "}
                                    {filteredProperties.length} properties
                                </p>
                                <div className="flex gap-1.5">
                                    {/* Prev */}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={safeCurrentPage === 1}
                                        className="p-1.5 border border-emerald-200 rounded text-slate-400 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>

                                    {/* Page numbers */}
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1.5 border rounded font-bold text-xs transition-all duration-200 ${safeCurrentPage === i + 1
                                                    ? "bg-primary text-slate-900 border-primary shadow-sm"
                                                    : "border-emerald-200 text-slate-500 hover:bg-white"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    {/* Next */}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safeCurrentPage === totalPages}
                                        className="p-1.5 border border-emerald-200 rounded text-slate-400 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Modal */}
            <DeletePropertyModal 
                isOpen={!!deletingProperty}
                onClose={() => setDeletingProperty(null)}
                onConfirm={handleDeleteConfirm}
                propertyName={deletingProperty?.name}
            />
        </div>
    );
}

