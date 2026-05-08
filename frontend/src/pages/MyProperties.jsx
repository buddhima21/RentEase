import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/owner/dashboard/Sidebar";
import { ownerProfile } from "../data/ownerDashboardData";
import { useAuth } from "../context/AuthContext";
import { getOwnerProperties, deleteProperty } from "../services/api";
import UserDropdown from "../components/UserDropdown";
import OwnerNotificationsBell from "../components/owner/dashboard/OwnerNotificationsBell";
import ActionDropdown from "../components/owner/dashboard/ActionDropdown";
import DeletePropertyModal from "../components/owner/dashboard/DeletePropertyModal";

// Constants
const ITEMS_PER_PAGE = 8; // Increased for grid layout

const statusStyles = {
    Published: "bg-emerald-500/90 text-white backdrop-blur-md shadow-lg shadow-emerald-500/20",
    Pending: "bg-amber-500/90 text-white backdrop-blur-md shadow-lg shadow-amber-500/20",
    Booked: "bg-violet-500/90 text-white backdrop-blur-md shadow-lg shadow-violet-500/20",
    Occupied: "bg-blue-500/90 text-white backdrop-blur-md shadow-lg shadow-blue-500/20",
    Rejected: "bg-rose-500/90 text-white backdrop-blur-md shadow-lg shadow-rose-500/20",
    Archived: "bg-slate-600/90 text-white backdrop-blur-md shadow-lg shadow-slate-600/20",
    Draft: "bg-slate-400/90 text-white backdrop-blur-md shadow-lg shadow-slate-400/20",
};

/**
 * MyProperties — Airbnb-style grid layout for properties.
 */
export default function MyProperties() {
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingProperty, setDeletingProperty] = useState(null);
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const fetchProperties = async () => {
        setIsLoading(true);
        setFetchError("");
        try {
            const res = await getOwnerProperties();
            if (res.data.success) {
                const formatter = new Intl.NumberFormat("en-LK");
                const mapped = res.data.data.map(p => ({
                    id: p.id,
                    name: p.title,
                    type: p.propertyType,
                    status: mapStatusMapping(p.status),
                    rent: `LKR ${formatter.format(Number(p.price) || 0)}/mo`,
                    location: `${p.city}`,
                    thumbnail: p.imageUrls?.[0] || `https://source.unsplash.com/featured/?home,interior&sig=${encodeURIComponent(p.id)}`,
                    updatedAt: p.updatedAt || p.createdAt || new Date(0).toISOString(),
                }));
                mapped.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setProperties(mapped);
            } else {
                setProperties([]);
            }
        } catch (error) {
            console.error("Failed to fetch owner properties:", error);
            setProperties([]);
            setFetchError(error.response?.data?.message || "Failed to load properties. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const mapStatusMapping = (backendStatus) => {
        switch (backendStatus) {
            case 'PENDING_APPROVAL': return 'Pending';
            case 'APPROVED':         return 'Published';
            case 'BOOKED':           return 'Booked';
            case 'RENTED':           return 'Occupied';
            case 'REJECTED':         return 'Rejected';
            case 'PENDING_DELETE':   return 'Archived';
            case 'DELETED':          return 'Archived';
            default:                 return 'Draft';
        }
    };

    useEffect(() => {
        if (user) fetchProperties();
    }, [user]);

    useEffect(() => {
        if (location.state?.successMessage) {
            alert(location.state.successMessage);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleDeleteConfirm = async (reason) => {
        try {
            await deleteProperty(deletingProperty.id, reason);
            setDeletingProperty(null);
            fetchProperties();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to request deletion');
        }
    };

    const tabCounts = useMemo(() => {
        const counts = { All: properties.length };
        properties.forEach(p => {
            counts[p.status] = (counts[p.status] || 0) + 1;
        });
        return counts;
    }, [properties]);

    const filteredProperties = useMemo(() => {
        let result = properties;
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
    }, [activeTab, searchQuery, properties]);

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

    const tabs = ["All", "Published", "Booked", "Pending", "Occupied", "Rejected", "Archived"];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 15 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
        exit: { opacity: 0, scale: 0.95, duration: 0.2 },
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden min-w-0 font-sans">
                {/* ── Header ────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[72px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100/80 dark:border-slate-700/80 px-6 lg:px-8 flex items-center justify-between shrink-0 gap-4 z-30 sticky top-0"
                >
                    <div className="flex items-center gap-6 flex-1 max-w-2xl">
                        <h2 className="text-xl font-extrabold tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            Properties
                        </h2>

                        {/* Search Bar */}
                        <div className="relative w-full hidden sm:block group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[18px] group-focus-within:text-emerald-500 transition-colors">
                                    search
                                </span>
                            </div>
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 rounded-full text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:border-slate-600"
                                placeholder="Search your properties..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <OwnerNotificationsBell />
                        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />

                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-cover bg-center shrink-0 shadow-md ring-2 ring-emerald-100"
                                style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                            />
                        )}
                    </div>
                </motion.header>

                <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {/* ── Filter Tabs (Pills style) ─────────────────────── */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none snap-x">
                        {tabs.map((tab) => {
                            const count = tabCounts[tab] ?? 0;
                            if (count === 0 && tab !== "All") return null;
                            const isActive = activeTab === tab;
                            return (
                                <motion.button
                                    key={tab}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 py-2 text-sm whitespace-nowrap transition-all duration-300 rounded-full flex items-center gap-2 snap-center shrink-0 border
                                        ${isActive
                                            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                        }`}
                                >
                                    <span className="font-semibold">{tab === "All" ? "All Properties" : tab}</span>
                                    {count > 0 && (
                                        <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold
                                            ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700'}
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ── Property Grid (Airbnb Style) ──────────────────────────── */}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-slate-400"
                            >
                                <span className="material-symbols-outlined text-4xl mb-3 animate-spin text-emerald-500/50">progress_activity</span>
                                <p className="font-medium">Loading properties...</p>
                            </motion.div>
                        ) : fetchError ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50/50 rounded-3xl border border-red-100"
                            >
                                <span className="material-symbols-outlined text-5xl mb-3 text-red-400">error_outline</span>
                                <p className="font-semibold text-lg">{fetchError}</p>
                                <button
                                    onClick={fetchProperties}
                                    className="mt-5 px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : paginatedProperties.length > 0 ? (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                            >
                                {paginatedProperties.map((prop) => (
                                    <motion.div
                                        key={prop.id}
                                        variants={cardVariants}
                                        layoutId={`card-${prop.id}`}
                                        className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500"
                                    >
                                        {/* Image Header */}
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[24px] bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => navigate(`/owner/properties/${prop.id}`)}>
                                            <img
                                                src={prop.thumbnail}
                                                alt={prop.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Top Overlay Gradients */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyles[prop.status] || statusStyles.Draft}`}>
                                                    {prop.status}
                                                </span>
                                            </div>

                                            {/* Verified Badge */}
                                            <div className="absolute bottom-4 right-4 flex items-center text-white drop-shadow-md z-10">
                                                <div className="flex items-center gap-1 text-emerald-400 opacity-90 transition-opacity group-hover:opacity-100">
                                                    <span className="material-symbols-outlined text-[20px]">verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Dropdown positioned OVER the image, rendered outside overflow-hidden */}
                                        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100/50">
                                                <ActionDropdown
                                                    onUpdate={() => navigate(`/owner/properties/${prop.id}/edit`)}
                                                    onView={() => navigate(`/owner/properties/${prop.id}`)}
                                                    onDelete={() => setDeletingProperty(prop)}
                                                />
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div
                                            className="p-5 flex-1 flex flex-col cursor-pointer"
                                            onClick={() => navigate(`/owner/properties/${prop.id}`)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-[16px] leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                                    {prop.name}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="truncate">{prop.location}</span>
                                            </p>

                                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Property Type</p>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{prop.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                        {prop.rent}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-dashed"
                            >
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <span className="material-symbols-outlined text-5xl">holiday_village</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No properties found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                                    {searchQuery ? "We couldn't find any properties matching your search criteria." : "You haven't listed any properties yet. Start earning by adding your first listing!"}
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/owner/add-property')}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_home</span>
                                    List Your Space
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Pagination ────────────────────────────── */}
                    {filteredProperties.length > ITEMS_PER_PAGE && (
                        <div className="mt-10 mb-6 flex justify-center">
                            <div className="bg-white/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full p-1.5 flex items-center gap-1 shadow-sm">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                                </button>

                                <div className="flex gap-1 px-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300 ${safeCurrentPage === i + 1
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-110"
                                                : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <DeletePropertyModal
                isOpen={!!deletingProperty}
                onClose={() => setDeletingProperty(null)}
                onConfirm={handleDeleteConfirm}
                propertyName={deletingProperty?.name}
            />
        </div>
    );
}
