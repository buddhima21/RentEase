import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toggleReviewHelpful } from "../../services/api";

export default function ReviewCard({ review, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [isHelpful, setIsHelpful] = useState(review.helpfulUserIds?.includes(user?.id) || false);
    const [isLiking, setIsLiking] = useState(false);

    // Support both full review objects and simple content-only reviews
    const reviewText = review.comment || review.text || review.content || "";
    // Display property name or user name depending on the context
    // We will assume "Green View Residency" or similar property names for the UI
    const propertyName = review.propertyName || review.boardingName || "Green View Residency";
    const userName = review.reviewerName || review.user || "VERIFIED RESIDENT";
    // Force "VERIFIED RESIDENT" display logic as per mockup
    const verifiedName = userName === "Verified Resident" || !review.reviewerName ? "VERIFIED RESIDENT" : "VERIFIED RESIDENT"; // Real app might use `userName` here, sticking to mockup style

    const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-CA") : (review.date || "2026-02-20");

    const maxLength = 160;
    const shouldTruncate = reviewText.length > maxLength;
    const displayText = expanded ? reviewText : reviewText.slice(0, maxLength) + (shouldTruncate ? "..." : "");

    // Mock tags for the 2026 design
    const mockTags = ["#GoodWi-Fi", "#Nearcampus", "#Safe"];
    const tags = review.tags && review.tags.length > 0 ? review.tags : mockTags;

    const isAuthor = user && user.id === review.reviewerId;

    const handleHelpfulClick = async () => {
        if (!user) {
            alert("Please login to vote");
            return;
        }
        if (isLiking) return;

        // Optimistic Update
        const newIsHelpful = !isHelpful;
        setIsHelpful(newIsHelpful);
        setHelpfulCount(prev => newIsHelpful ? prev + 1 : Math.max(0, prev - 1));
        setIsLiking(true);

        try {
            await toggleReviewHelpful(review.id);
        } catch (error) {
            console.error("Failed to toggle helpful:", error);
            // Rollback on error
            setIsHelpful(!newIsHelpful);
            setHelpfulCount(prev => !newIsHelpful ? prev + 1 : Math.max(0, prev - 1));
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 mb-6 flex flex-col relative"
        >
            {/* Header: Verified & Options */}
            <div className="flex justify-between items-center mb-1 relative">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.1em]">{verifiedName}</span>
                </div>
                
                {isAuthor && 
                    <div className="relative">
                        <button 
                            onClick={() => setShowOptions(!showOptions)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 dark:bg-slate-800/50 transition-colors text-slate-400"
                        >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-10 w-36 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700/50 z-50 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setShowOptions(false);
                                        onEdit(review);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowOptions(false);
                                        if (window.confirm("Are you sure you want to delete this review?")) {
                                            setIsDeleting(true);
                                            await onDelete(review.id);
                                        }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                                    disabled={isDeleting}
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                </button>
                            </div>
                        )}
                    </div>
                }
                
                {!isAuthor && (
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 dark:bg-slate-800/50 transition-colors text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                )}
            </div>

            {/* Stars & Date */}
            <div className="flex items-center gap-3 mb-5 mt-3">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`material-symbols-outlined text-[16px] md:text-[18px] ${star <= Math.round(review.rating) ? 'text-[#FBBF24]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                        </span>
                    ))}
                </div>
                <span className="text-sm text-slate-400 font-bold">{dateStr}</span>
            </div>

            {/* Review Body */}
            <div className="text-slate-800 dark:text-slate-100 leading-[1.8] text-[16px] md:text-[18px] font-medium mb-6 pr-4">
                <p>"{displayText}"</p>
                {shouldTruncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center gap-1 text-[#3B82F6] font-bold text-sm mt-3 hover:text-[#2563EB] transition-colors focus:outline-none not-italic"
                    >
                        {expanded ? "Show less" : "Read more"}
                        <span className="material-symbols-outlined text-[16px]">{expanded ? "expand_less" : "expand_more"}</span>
                    </button>
                )}
            </div>

            {/* Detailed Breakdown (if exists) */}
            {review.detailedRating && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                    {Object.entries(review.detailedRating).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-[12px] font-bold text-slate-500">{val}.0</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Photos */}
            {review.photo && (
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none items-center">
                    <img src={review.photo} alt="Review" className="w-[120px] h-[120px] object-cover rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 flex-shrink-0 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer" />
                    {/* Mock additional photo for design parity if only one is uploaded as in mockup */}
                    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80" alt="Review interior" className="w-[120px] h-[120px] object-cover rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 flex-shrink-0 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer" />
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2.5 mb-8 mt-auto">
                {tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100/80 text-[#94A3B8] text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wide">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Footer Status & Likes */}
            <div className="flex justify-between items-center mt-2">
                {review.status === "PENDING" ? (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 px-3.5 py-1.5 rounded-full border border-amber-100 dark:border-amber-500/20">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                        <span className="text-[11px] font-black tracking-widest leading-none">PENDING MODERATION</span>
                    </div>
                ) : (
                    <div></div>
                )}
                
                <button 
                    onClick={handleHelpfulClick}
                    disabled={isLiking}
                    className={`flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded-full border ${
                        isHelpful 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-300'
                    }`}
                >
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${isHelpful ? 'scale-110' : ''}`} style={{ fontVariationSettings: isHelpful ? "'FILL' 1" : "'FILL' 0" }}>
                        thumb_up
                    </span>
                    <span className="text-[13px] font-black">{helpfulCount}</span>
                </button>
            </div>
            
            {/* Admin Response */}
            {review.ownerReply && (
                <div className="mt-6 flex gap-4 pl-4 md:pl-6 border-l-[3px] border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>real_estate_agent</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{propertyName}</h4>
                        </div>
                        <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-[1.7]">
                            {review.ownerReply}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
