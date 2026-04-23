import React, { useState, useEffect } from "react";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { getOwnerProperties, getAllProperties, getOwnerPropertyById, getOwnerReviews, updateReviewStatus, replyToReview } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ownerProfile } from "../data/ownerDashboardData";

export default function OwnerReviews() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("PENDING");
    const [reviews, setReviews] = useState([]);
    const [properties, setProperties] = useState({});
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filterTime, setFilterTime] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    
    // Reply Modal State
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) fetchReviews();
    }, [user]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Fetch from both owner list and public list to maximize mapping coverage
            const [ownerPropsRes, publicPropsRes] = await Promise.all([
                getOwnerProperties(user.id).catch(() => ({ data: { data: [] } })),
                getAllProperties().catch(() => ({ data: { data: [] } }))
            ]);
            
            const propsList = [
                ...(ownerPropsRes.data?.data || []),
                ...(publicPropsRes.data?.data || [])
            ];
            
            const propsMap = {};
            propsList.forEach(p => {
                // Handle both string IDs and MongoDB ObjectId objects
                const ids = [p.id, p._id, p.propertyId, p.listingId]
                    .filter(id => id !== undefined && id !== null)
                    .map(id => id.toString().toLowerCase());
                
                const title = p.title || p.propertyName || p.listingTitle || p.name || p.listingName;
                if (title) {
                    ids.forEach(id => {
                        if (id) propsMap[id] = title;
                    });
                }
            });
            // Fetch all reviews for this owner
            const reviewsRes = await getOwnerReviews();
            const allReviews = reviewsRes.data.data;
            
            // Intelligent Data Recovery: Fetch missing property names by ID if they aren't in our map
            const uniquePIds = [...new Set(allReviews.map(r => 
                (r.propertyId?._id || r.propertyId || r.property_id || r.listingId?._id || r.listingId || r.listing_id || "").toString().toLowerCase()
            ))].filter(id => id && !propsMap[id]);

            if (uniquePIds.length > 0) {
                await Promise.all(uniquePIds.map(async (id) => {
                    try {
                        // Try Owner endpoint first
                        let res = await getOwnerPropertyById(id).catch(() => null);
                        // If owner endpoint fails, try public endpoint
                        if (!res) res = await getAllProperties().catch(() => null);
                        
                        const found = res?.data?.data || res?.data;
                        if (found) {
                            // Brute-force title search
                            const title = found.title || found.propertyName || found.listingTitle || found.name || 
                                          found.listingName || found.property_name || found.property_title || 
                                          (found.property && typeof found.property === 'object' ? found.property.title : null);
                            if (title) propsMap[id] = title;
                        }
                    } catch (err) {
                        console.error(`Failed to recover property name for ID ${id}:`, err);
                    }
                }));
            }

            setProperties(propsMap);
            
            // Enrich reviews with property titles for immediate display
            const enrichedReviews = allReviews.map(r => {
                // Try every possible ID field and normalize to lowercase for matching
                const rawId = r.propertyId?._id || r.propertyId || r.property_id || r.listingId?._id || r.listingId || r.listing_id;
                const pId = typeof rawId === 'string' ? rawId.toLowerCase() : rawId;
                
                // Try every possible title field
                const title = r.property?.title || r.property?.name || r.propertyId?.title || r.propertyId?.name || 
                              r.listing?.title || r.listing?.name || r.listingId?.title || r.listingId?.name || 
                              propsMap[pId] || r.propertyTitle || r.property_title || r.propertyName || r.property_name || 
                              r.listingTitle || r.listing_title || r.listingName || r.listing_name || 
                              (typeof r.property === 'string' ? r.property : null) || (typeof rawId === 'string' ? rawId : null) || "Unknown Property";
                              
                return { ...r, propertyTitleDisplay: title };
            });
            
            setReviews(enrichedReviews);
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (reviewId) => {
        try {
            await updateReviewStatus(reviewId, "APPROVED");
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: "APPROVED" } : r));
        } catch (err) {
            console.error(err);
            alert("Failed to approve review. Error: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to permanently reject/delete this review?")) return;
        try {
            await updateReviewStatus(reviewId, "REJECTED");
            setReviews(prev => prev.filter(r => r.id !== reviewId)); // Remove from view
        } catch (err) {
            console.error(err);
            alert("Failed to delete review. Error: " + (err.response?.data?.message || err.message));
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            await replyToReview(replyingTo.id, replyText);
            setReviews(prev => prev.map(r => r.id === replyingTo.id ? { ...r, ownerReply: replyText } : r));
            setReplyingTo(null);
            setReplyText("");
        } catch (err) {
            alert("Failed to post reply.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSortedReviews = (list) => {
        let filtered = list;

        // Apply Time Filter
        if (filterTime !== "all") {
            const now = new Date();
            filtered = filtered.filter(r => {
                const reviewDate = new Date(r.createdAt);
                const diffTime = Math.abs(now - reviewDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= parseInt(filterTime);
            });
        }

        // Apply Sort
        filtered.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === "highest") return b.rating - a.rating;
            if (sortBy === "lowest") return a.rating - b.rating;
            if (sortBy === "az") return (properties[a.propertyId] || "").localeCompare(properties[b.propertyId] || "");
            if (sortBy === "za") return (properties[b.propertyId] || "").localeCompare(properties[a.propertyId] || "");
            return 0;
        });

        return filtered;
    };

    const allFilteredReviews = getSortedReviews(reviews.filter(r => r.status === activeTab));
    
    // Pagination logic
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const filteredReviews = allFilteredReviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(allFilteredReviews.length / reviewsPerPage);

    // Tab Counts logic (filtered by Property and Time)
    const getFilteredCount = (status) => {
        let list = reviews.filter(r => r.status === status);
        
        if (filterTime !== "all") {
            const now = new Date();
            list = list.filter(r => {
                const reviewDate = new Date(r.createdAt);
                const diffTime = Math.abs(now - reviewDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= parseInt(filterTime);
            });
        }
        
        return list.length;
    };

    const sortOptions = [
        { label: "Newest First", value: "newest", icon: "schedule" },
        { label: "Oldest First", value: "oldest", icon: "history" },
        { label: "Highest Rating", value: "highest", icon: "star" },
        { label: "Lowest Rating", value: "lowest", icon: "star_outline" },
        { label: "Property: A-Z", value: "az", icon: "sort_by_alpha" },
        { label: "Property: Z-A", value: "za", icon: "sort_by_alpha" }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20" style={{ "--color-primary": "#10b981" }}>
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 font-sans">
                {/* Header */}
                <header className="sticky top-0 z-30 h-[88px] border-b border-slate-100/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl px-8 lg:px-12 flex items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Property <span className="text-emerald-500">Reviews</span></h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                           <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                           <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Community Verified</span>
                        </div>
                        {user && <UserDropdown user={user} onLogout={logout} />}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    
                    {/* Modern Top Stats / Info header */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-emerald-50 via-transparent to-transparent pointer-events-none opacity-60"></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100/50">
                                <span className="material-symbols-outlined text-[24px]">gavel</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Review Management</h1>
                            </div>
                        </div>

                        {/* Animated pill-tabs */}
                        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-full relative z-10 w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('PENDING')}
                                className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                    activeTab === 'PENDING' 
                                    ? 'bg-[#0F172A] text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                                Pending ({getFilteredCount('PENDING')})
                            </button>
                            <button
                                onClick={() => setActiveTab('APPROVED')}
                                className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                    activeTab === 'APPROVED' 
                                    ? 'bg-[#0F172A] text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Published ({getFilteredCount('APPROVED')})
                            </button>
                        </div>

                        {/* Advanced Filters Group */}
                        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">

                            {/* Time Filter */}
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
                                <select 
                                    value={filterTime}
                                    onChange={(e) => setFilterTime(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer py-1"
                                >
                                    <option value="all">All Time</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                </select>
                            </div>

                            <div className="relative group">
                                <button 
                                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all group-hover:border-emerald-200 pointer-events-none"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">sort</span>
                                    <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                                
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

                    {/* Review List */}
                    {loading ? (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching your property reviews...</p>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <span className="material-symbols-outlined text-4xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {activeTab === 'PENDING' ? 'task_alt' : 'rate_review'}
                                </span>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                                {activeTab === 'PENDING' ? 'Queue is empty' : 'No published reviews yet'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px]">You are all caught up on your property feedback.</p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <AnimatePresence>
                                {filteredReviews.map((review) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, x: -10 }}
                                        key={review.id} 
                                        className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 lg:p-8 flex flex-col gap-5 transition-all hover:border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                                            {/* Content side */}
                                            <div className="flex-1 w-full">
                                                {/* Header tags */}
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-wide flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px]">home</span>
                                                        {review.propertyTitleDisplay || "Unknown Property"}
                                                    </span>
                                                    <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wide">
                                                        {review.reviewerName || "Verified Resident"}
                                                    </span>
                                                    <span className="text-slate-400 text-[12px] font-bold tracking-wider flex items-center gap-1.5 mt-1 sm:mt-0">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        {new Date(review.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo", month: "long", day: "numeric", year: "numeric" })}
                                                    </span>
                                                </div>
                                                
                                                {/* Stars */}
                                                <div className="flex gap-1 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="material-symbols-outlined text-[18px] text-amber-500 drop-shadow-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                                                    ))}
                                                </div>
                                                
                                                {/* Review Comment */}
                                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-[15px] max-w-3xl">
                                                    "{review.comment}"
                                                </p>

                                                {/* Owner Reply Box */}
                                                {review.ownerReply && (
                                                    <div className="mt-5 bg-emerald-50/60 border border-emerald-100/60 p-5 rounded-2xl relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 rounded-l-2xl"></div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="material-symbols-outlined text-[16px] text-emerald-600">forum</span>
                                                            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest pl-1">Your Context</p>
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-200 text-[14px] font-medium leading-relaxed pl-6 italic">"{review.ownerReply}"</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action side */}
                                            <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                                                {activeTab === "PENDING" && (
                                                    <button 
                                                        onClick={() => handleAccept(review.id)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">check</span> Accept
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    onClick={() => handleDelete(review.id)}
                                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 ${activeTab === 'PENDING' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span> {activeTab === "PENDING" ? "Reject" : "Delete"}
                                                </button>

                                                {activeTab === "APPROVED" && !review.ownerReply && (
                                                    <button 
                                                        onClick={() => setReplyingTo(review)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">reply</span> Reply
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Pagination UI */}
                            {allFilteredReviews.length > reviewsPerPage && (
                                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-700/50 pt-8">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        Showing <span className="text-slate-900 dark:text-white font-bold">{indexOfFirstReview + 1}</span> to <span className="text-slate-900 dark:text-white font-bold">{Math.min(indexOfLastReview, allFilteredReviews.length)}</span> of <span className="text-slate-900 dark:text-white font-bold">{allFilteredReviews.length}</span> reviews
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                                                    currentPage === i + 1
                                                    ? "bg-[#0F172A] text-white shadow-md scale-110"
                                                    : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Premium Reply Modal */}
            <AnimatePresence>
                {replyingTo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-lg w-full relative z-10 overflow-hidden border border-slate-100 dark:border-slate-700/50"
                        >
                            <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 flex justify-between items-center relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-10 -translate-y-10"></div>
                                <h3 className="font-black text-[22px] text-slate-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">forum</span> 
                                    Tenant Response
                                </h3>
                                <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full transition-colors border border-slate-100 dark:border-slate-700/50">
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>
                            
                            <div className="p-8">
                                <div className="mb-6">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">format_quote</span> Review content
                                    </p>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[14px] text-slate-600 dark:text-slate-300 font-medium italic">"{replyingTo.comment}"</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">edit</span> Your professional context
                                    </label>
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Add more specific details to let future tenants know how you manage properties..."
                                        className="w-full min-h-[140px] p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[15px] font-medium resize-none transition-all placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="mt-8">
                                    <button 
                                        onClick={handleSendReply}
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-[1.25rem] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">send</span> Publish Response</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
