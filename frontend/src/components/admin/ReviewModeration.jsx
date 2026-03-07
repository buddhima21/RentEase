import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPendingReviews, updateReviewStatus } from "../../services/api";

export default function ReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setIsLoading(true);
        try {
            const res = await getPendingReviews();
            setReviews(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch pending reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (reviewId, status) => {
        try {
            await updateReviewStatus(reviewId, status);
            // Optimistically remove the review from the local state array
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (error) {
            console.error(`Failed to mark review as ${status}`, error);
            alert(`Error: Could not ${status.toLowerCase()} review.`);
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit' }).format(date);
    };

    if (isLoading) {
        return (
            <div className="bg-white/60 backdrop-blur-3xl rounded-[2rem] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center min-h-[400px] w-full max-w-5xl">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Fetching pending reviews for moderation...</p>
            </div>
        );
    }

    return (
        <section className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_12px_45px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden w-full max-w-5xl">
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-50 via-transparent to-transparent pointer-events-none opacity-50"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-xl">gavel</span>
                        Moderation Queue
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Review submitted feedback before it goes live.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                    <span className="text-sm font-bold text-slate-700">Total Pending:</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center justify-center text-sm font-black">
                        {reviews.length}
                    </span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <AnimatePresence>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                className="group relative bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_35px_rgb(0,0,0,0.06)] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                            >
                                {/* Content Section */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-tight">
                                            ID: {review.id.substring(0, 8)}...
                                        </span>
                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex gap-0.5 text-amber-500 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                                            ))}
                                        </div>
                                        <p className="text-slate-700 text-lg font-medium leading-relaxed">"{review.comment}"</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={() => handleAction(review.id, 'APPROVED')}
                                            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-500 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-emerald-500/20"
                                            title="Approve Review"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(review.id, 'REJECTED')}
                                            className="px-5 py-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-red-500/20"
                                            title="Reject Review"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                                            Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Photo column if exists */}
                                {review.photos && review.photos.length > 0 && review.photos[0] && (
                                    <div className="shrink-0">
                                        <img src={review.photos[0]} alt="Review content" className="w-32 h-32 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-24 h-24 bg-slate-50/80 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                                <span className="material-symbols-outlined text-5xl text-slate-300">task_alt</span>
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Queue is empty</h3>
                            <p className="text-slate-500 font-medium text-lg">All pending reviews have been processed.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
