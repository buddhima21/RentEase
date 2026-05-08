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
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center min-h-[400px] w-full">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching moderation queue...</p>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden w-full">
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-slate-50 via-transparent to-transparent pointer-events-none opacity-50"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100/50">
                        <span className="material-symbols-outlined text-[24px]">gavel</span>
                    </div>
                    <div>
                        <h2 className="text-[24px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Moderation Queue
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[14px] font-medium mt-0.5">Review submitted feedback before it goes live.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-4 py-2 rounded-xl">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Pending Actions:</span>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center justify-center text-sm font-black">
                        {reviews.length}
                    </span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-5">
                <AnimatePresence>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 p-6 rounded-[1.5rem] transition-all hover:border-slate-200 dark:border-slate-700 hover:shadow-md flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                            >
                                {/* Content Section */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-[11px] font-bold font-mono tracking-tight">
                                            ID: {review.id.substring(0, 8)}...
                                        </span>
                                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex gap-0.5 text-amber-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                                            ))}
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-200 text-[15px] font-medium leading-relaxed max-w-3xl">"{review.comment}"</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={() => handleAction(review.id, 'APPROVED')}
                                            className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
                                            title="Approve Review"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(review.id, 'REJECTED')}
                                            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                                            title="Reject Review"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                            Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Photo column if exists */}
                                {review.photos && review.photos.length > 0 && review.photos[0] && (
                                    <div className="shrink-0 group-hover:scale-[1.02] transition-transform duration-300">
                                        <img src={review.photos[0]} alt="Review evidence" className="w-28 h-28 object-cover rounded-2xl border border-slate-200 dark:border-slate-700" />
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <span className="material-symbols-outlined text-4xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">Queue is empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px]">All pending reviews have been processed.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
