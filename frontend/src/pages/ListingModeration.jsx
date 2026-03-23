import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import ListingModerationCard from "../components/admin/dashboard/ListingModerationCard";
import { moderationListings, moderationTabs } from "../data/listingModerationData";

/**
 * ListingModeration — Admin page for reviewing and moderating property listings.
 * Route: /admin/listings
 * Auth: Guards using adminToken/adminUser from localStorage.
 */
export default function ListingModeration() {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");

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

    // Filter listings by active tab
    const filteredListings = moderationListings.filter((listing) => {
        if (activeTab === "pending") return listing.status === "pending";
        if (activeTab === "flagged") return listing.status === "flagged";
        if (activeTab === "approved") return listing.status === "approved";
        if (activeTab === "rejected") return listing.status === "rejected";
        return true;
    });

    return (
        <div
            className="flex min-h-screen bg-[#f6f8f7]"
            style={{ "--color-primary": "#1DBC60" }}
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
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1DBC60] rounded-full" />
                        </button>

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
                        <div className="mb-8 border-b border-slate-200">
                            <div className="flex gap-8 overflow-x-auto pb-px">
                                {moderationTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-2 border-b-2 pb-3 font-semibold whitespace-nowrap transition-colors ${
                                            activeTab === tab.key
                                                ? "border-[#1DBC60] text-[#1DBC60]"
                                                : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                        {tab.label}
                                        {tab.count !== null && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs ${
                                                    activeTab === tab.key
                                                        ? "bg-[#1DBC60]/10 text-[#1DBC60]"
                                                        : "bg-slate-100"
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Page Header ──────────────────────────── */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Listing Moderation</h1>
                                <p className="text-slate-500">
                                    Review and manage property submissions for marketplace quality assurance.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                Sort by: Newest First
                            </div>
                        </div>

                        {/* ── Moderation Queue ─────────────────────── */}
                        <div className="space-y-6">
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing) => (
                                    <ListingModerationCard key={listing.id} listing={listing} />
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">inbox</span>
                                    <p className="text-slate-500 font-medium">No listings in this category.</p>
                                    <p className="text-slate-400 text-sm mt-1">All caught up! 🎉</p>
                                </div>
                            )}
                        </div>

                        {/* ── Pagination ────────────────────────────── */}
                        {filteredListings.length > 0 && (
                            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 pt-8">
                                <p className="text-sm text-slate-500">
                                    Showing 1 to {filteredListings.length} of 15 pending listings
                                </p>
                                <div className="flex gap-2">
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#1DBC60] text-white font-bold">
                                        1
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                        2
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                        3
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
