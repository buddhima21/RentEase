import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import ListingModerationCard from "../components/admin/dashboard/ListingModerationCard";
import ListingDetailsModal from "../components/admin/dashboard/ListingDetailsModal";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import { getAllPropertiesForAdmin, moderateProperty } from "../services/api";

/**
 * ListingModeration — Admin page for reviewing and moderating property listings.
 * Route: /admin/listings
 * Auth: Guards using adminToken/adminUser from localStorage.
 */
export default function ListingModeration() {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [listings, setListings] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [viewPropertyId, setViewPropertyId] = useState(null);
    const [sortBy, setSortBy] = useState("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filterTime, setFilterTime] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterOwner, setFilterOwner] = useState("all");
    const [allProperties, setAllProperties] = useState([]);

    const mapPropertyToListing = (prop) => {
        try {
            // Helper to parse dates (handles both ISO string and array formats)
            const parseDate = (d) => {
                if (!d) return new Date(0);
                if (Array.isArray(d)) {
                    // [yyyy, mm, dd, hh, mm, ss] -> JS Date (month is 0-indexed)
                    return new Date(d[0], (d[1] || 1) - 1, d[2] || 1, d[3] || 0, d[4] || 0, d[5] || 0);
                }
                return new Date(d);
            };

            const createdDate = parseDate(prop.createdAt);
            
            return {
                id: prop.id,
                title: prop.title || "Untitled Property",
                image: prop.imageUrls?.[0] || `https://source.unsplash.com/featured/?house&sig=${encodeURIComponent(prop.id)}`,
                status: prop.status === 'PENDING_DELETE' ? 'flagged' :
                    prop.status === 'PENDING_APPROVAL' ? 'pending' :
                        prop.status === 'APPROVED' ? 'approved' :
                            prop.status === 'RENTED' ? 'approved' :
                                prop.status === 'REJECTED' ? 'rejected' :
                                    prop.status === 'DELETED' ? 'deleted' : 'pending',
                location: `${prop.address || ""}, ${prop.city || ""}`,
                listingType: prop.propertyType || "Apartment",
                submittedBy: {
                    name: prop.ownerName || "Unknown Owner",
                    initials: (prop.ownerName || "UO").substring(0, 2).toUpperCase()
                },
                submittedDate: createdDate.toLocaleDateString(),
                createdAt: createdDate.toISOString(), 
                flagReason: prop.status === 'PENDING_DELETE' ? prop.deleteReason || 'Owner requested deletion.' : null
            };
        } catch (err) {
            console.error("Error mapping property:", prop, err);
            return null;
        }
    };

    const fetchPendingListings = async () => {
        try {
            setErrorMessage("");
            const response = await getAllPropertiesForAdmin();
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // filter(Boolean) removes any nulls from failed mappings
                const mapped = response.data.data.map(mapPropertyToListing).filter(Boolean);
                setListings(mapped);
                // Keep a separate list for the filter dropdown
                setAllProperties(mapped);
            } else {
                console.warn("Unexpected API response format:", response);
                setErrorMessage("Invalid data received from server.");
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
            // Detailed error message
            const msg = error.response?.data?.message || error.message || "Failed to load listings";
            setErrorMessage(msg);
        }
    };

    // Hydrate admin user from localStorage
    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                }
            }
        } catch {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (adminUser) {
            fetchPendingListings();
        }
    }, [adminUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#1DBC60]">progress_activity</span>
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    // Filter listings by active tab & search
    const filteredListings = listings
        .filter((listing) => {
            if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            // Time Filter
            if (filterTime !== "all") {
                const now = new Date();
                const reviewDate = new Date(listing.createdAt);
                const diffTime = Math.abs(now - reviewDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > parseInt(filterTime)) return false;
            }

            // Property Type Filter
            if (filterType !== "all" && listing.listingType !== filterType) {
                return false;
            }

            // Owner Filter
            if (filterOwner !== "all" && listing.submittedBy.name !== filterOwner) {
                return false;
            }

            if (activeTab === "all") return true; 
            if (activeTab === "pending") return listing.status === "pending";
            if (activeTab === "flagged") return listing.status === "flagged";
            if (activeTab === "approved") return listing.status === "approved";
            if (activeTab === "rejected") return listing.status === "rejected";
            if (activeTab === "deleted") return listing.status === "deleted";
            return true;
        })
        .sort((a, b) => {
            // Priority Sort: Pending always on top if on "all" tab
            if (activeTab === 'all') {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
            }
            
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "az":
                    return a.title.localeCompare(b.title);
                case "za":
                    return b.title.localeCompare(a.title);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    const sortOptions = [
        { label: "Newest First", value: "newest", icon: "schedule" },
        { label: "Oldest First", value: "oldest", icon: "history" },
        { label: "Property: A-Z", value: "az", icon: "sort_by_alpha" },
        { label: "Property: Z-A", value: "za", icon: "sort_by_alpha" }
    ];

    const handleModerate = async (id, action) => {
        try {
            const remarks = prompt(`Enter optional remarks for ${action}:`);
            const response = await moderateProperty(id, { action, remarks: remarks || "" });
            if (response.data.success) {
                // Refresh listings
                fetchPendingListings();
            }
        } catch (error) {
            const status = error.response?.status ? ` (HTTP ${error.response.status})` : "";
            const msg = error.response?.data?.message || `Failed to ${action} property`;
            alert(`${msg}${status}`);
        }
    };

    return (
        <div
            className="flex h-screen overflow-hidden bg-[#f6f8f7]"
            style={{ "--color-primary": "#26C289" }}
        >
            {/* ── Sidebar ─────────────────────────────────────── */}
            <AdminSidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Listing Moderation
                    </h2>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Search */}
                        <div className="relative hidden sm:block w-52 lg:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border border-emerald-100 rounded-lg focus:ring-2 focus:ring-[#1DBC60] text-sm placeholder-slate-400 transition-all"
                                placeholder="Search listings..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <AdminNotificationsBell />

                        {/* Admin Avatar */}
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.fullName || "Admin")}&background=1DBC60&color=fff&bold=true&size=40`}
                            alt="Admin"
                            className="w-10 h-10 rounded-full ring-2 ring-[#1DBC60]/30"
                        />
                    </div>
                </header>

                {/* ── Page Content ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="max-w-5xl mx-auto">

                        {/* ── Tabs ─────────────────────────────────── */}
                        <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex gap-8 overflow-x-auto pb-px">
                                {[
                                    { label: "All Listings", icon: "dashboard", key: "all" },
                                    { label: "Pending Review", icon: "pending_actions", key: "pending" },
                                    { label: "Flagged", icon: "flag", key: "flagged" },
                                    { label: "Approved", icon: "check_circle", key: "approved" },
                                    { label: "Rejected", icon: "cancel", key: "rejected" },
                                    { label: "Deleted", icon: "delete", key: "deleted" },
                                ].map((tab) => {
                                    const count = tab.key === "all" 
                                        ? listings.length 
                                        : listings.filter(l => l.status === tab.key).length;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-2 border-b-2 pb-3 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.key
                                                    ? "border-[#1DBC60] text-[#1DBC60]"
                                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                            {tab.label}
                                            {count > 0 && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                                            ? "bg-[#1DBC60]/10 text-[#1DBC60]"
                                                            : "bg-slate-100 dark:bg-slate-800"
                                                        }`}
                                                >
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* ── Page Header ──────────────────────────── */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Listing Moderation</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Review and manage property submissions for marketplace quality assurance.
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">

                                {/* Type Filter */}
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">category</span>
                                    <select 
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-0.5"
                                    >
                                        <option value="all">All Types</option>
                                        {[...new Set(listings.map(l => l.listingType))].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Time Filter */}
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-emerald-200">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
                                    <select 
                                        value={filterTime}
                                        onChange={(e) => setFilterTime(e.target.value)}
                                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-0.5"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="7">Last 7 Days</option>
                                        <option value="30">Last 30 Days</option>
                                        <option value="90">Last 90 Days</option>
                                    </select>
                                </div>

                                {/* Sorting Dropdown */}
                                    <div className="relative group">
                                        <button 
                                            className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-bold bg-white dark:bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all group-hover:border-emerald-200 pointer-events-none"
                                        >
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">sort</span>
                                            <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                        </button>
                                        
                                        {/* Invisible Native Select Overlay for absolute reliability */}
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                            </div>
                        </div>

                        {/* ── Moderation Queue ─────────────────────── */}
                        <div className="space-y-6">
                            {errorMessage && (
                                <div className="text-center py-6 bg-red-50 rounded-xl border border-red-200">
                                    <p className="text-red-600 font-medium">{errorMessage}</p>
                                    <button
                                        onClick={fetchPendingListings}
                                        className="mt-3 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing) => (
                                    <ListingModerationCard 
                                        key={listing.id} 
                                        listing={listing} 
                                        onModerate={handleModerate} 
                                        onViewDetails={(id) => setViewPropertyId(id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">inbox</span>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No listings in this category.</p>
                                    <p className="text-slate-400 text-sm mt-1">All caught up! 🎉</p>
                                </div>
                            )}
                        </div>

                        {/* ── Pagination ────────────────────────────── */}
                        {filteredListings.length > 0 && (
                            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-slate-700 pt-8">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Showing 1 to {filteredListings.length} of {listings.filter(l => l.status === activeTab).length} listings
                                </p>
                                <div className="flex gap-2">
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#1DBC60] text-white font-bold">
                                        1
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                                        2
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                                        3
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        <ListingDetailsModal 
                            isOpen={!!viewPropertyId} 
                            onClose={() => setViewPropertyId(null)} 
                            propertyId={viewPropertyId} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
