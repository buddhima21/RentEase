import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { getOwnerProperties, getOwnerReviews, updateReviewStatus, replyToReview } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ownerProfile } from "../data/ownerDashboardData";
import { Star, CheckCircle, Trash2, MessageSquare, Clock, Send, X } from "lucide-react";

export default function OwnerReviews() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("PENDING");
    const [reviews, setReviews] = useState([]);
    const [properties, setProperties] = useState({});
    const [loading, setLoading] = useState(true);
    
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
            // Fetch owner's properties
            const propsRes = await getOwnerProperties(user.id);
            let propsList = propsRes.data.data;
            
            // IF the owner has no real properties, inject the mock ones 
            // used by the public PropertyDetails page so testing works!
            if (propsList.length === 0) {
                propsList = [
                    { id: "property_1", title: "Skyline Studio (Mock)" },
                    { id: "property_2", title: "Rosewood Annex (Mock)" },
                    { id: "property_3", title: "Havelock City (Mock)" },
                    { id: "property_4", title: "Palm Grove Villa (Mock)" }
                ];
            }

            const propsMap = {};
            propsList.forEach(p => propsMap[p.id] = p.title);
            setProperties(propsMap);

            // Fetch all reviews for this owner in one go!
            const reviewsRes = await getOwnerReviews();
            const allReviews = reviewsRes.data.data;
            
            setReviews(allReviews);
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

    const renderStars = (rating) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
            ))}
        </div>
    );

    const filteredReviews = reviews.filter(r => r.status === activeTab);

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#13ec6d" }}>
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Review Management
                    </h2>
                    <div className="flex items-center gap-3 ml-auto">
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                        </button>
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${ownerProfile.avatar}')` }} />
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-slate-200">
                        <button 
                            onClick={() => setActiveTab("PENDING")}
                            className={`pb-4 px-2 font-bold text-sm lg:text-base border-b-2 transition-all ${activeTab === 'PENDING' ? 'border-[#13ec6d] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <Clock size={18} /> Pending Reviews
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{reviews.filter(r => r.status === 'PENDING').length}</span>
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("APPROVED")}
                            className={`pb-4 px-2 font-bold text-sm lg:text-base border-b-2 transition-all ${activeTab === 'APPROVED' ? 'border-[#13ec6d] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <CheckCircle size={18} /> Published Reviews
                            </span>
                        </button>
                    </div>

                    {/* Review List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ec6d]"></div>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <Star size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No {activeTab.toLowerCase()} reviews</h3>
                            <p className="text-slate-400 text-sm mt-1">You are all caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredReviews.map((review) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={review.id} 
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                                                    {properties[review.propertyId] || "Property"}
                                                </span>
                                                <span className="text-slate-400 text-xs font-medium">
                                                    {new Date(review.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                                                </span>
                                            </div>
                                            
                                            <div className="mb-3">
                                                {renderStars(review.rating)}
                                            </div>
                                            
                                            <p className="text-slate-700 leading-relaxed text-[15px]">
                                                "{review.comment}"
                                            </p>

                                            {review.ownerReply && (
                                                <div className="mt-4 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                                    <p className="text-xs font-bold text-[#13ec6d] uppercase mb-1">Your Reply</p>
                                                    <p className="text-slate-600 text-sm italic">"{review.ownerReply}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                            {activeTab === "PENDING" && (
                                                <button 
                                                    onClick={() => handleAccept(review.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#13ec6d] hover:bg-[#11d863] text-emerald-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-[#13ec6d]/20"
                                                >
                                                    <CheckCircle size={18} /> Accept
                                                </button>
                                            )}
                                            
                                            {/* Allow deleting/rejecting from either state */}
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-5 py-2.5 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} /> {activeTab === "PENDING" ? "Reject" : "Delete"}
                                            </button>

                                            {/* Reply Button (if no reply exists yet) */}
                                            {activeTab === "APPROVED" && !review.ownerReply && (
                                                <button 
                                                    onClick={() => setReplyingTo(review)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold px-5 py-2.5 rounded-xl transition-all"
                                                >
                                                    <MessageSquare size={18} /> Reply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Reply Modal */}
            <AnimatePresence>
                {replyingTo && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-[#13ec6d]" /> 
                                    Reply to Tenant
                                </h3>
                                <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-sm text-slate-500 italic">"{replyingTo.comment}"</p>
                                </div>

                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your professional response here..."
                                    className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13ec6d] focus:border-[#13ec6d] outline-none text-sm resize-y"
                                />

                                <button 
                                    onClick={handleSendReply}
                                    disabled={isSubmitting || !replyText.trim()}
                                    className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Sending..." : <><Send size={18} /> Post Reply</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
