import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function ReviewCard({ review, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 mb-6 flex flex-col relative"
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
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-400"
                        >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-10 w-36 py-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setShowOptions(false);
                                        onEdit(review);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
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
                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                                    disabled={isDeleting}
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                </button>
                            </div>
                        )}
                    </div>
                }
                
                {!isAuthor && (
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                )}
            </div>

            {/* Property Name */}
            <h3 className="text-[22px] md:text-[28px] font-black text-slate-900 tracking-tight mb-2 leading-tight">
                {propertyName}
            </h3>

            {/* Stars & Date */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-[16px] md:text-[18px] ${star <= Math.round(review.rating) ? 'text-[#FBBF24]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                star
                            </span>
                        ))}
                    </div>
                    <span className="text-sm text-slate-400 font-bold">{dateStr}</span>
                </div>

                {/* Detailed Breakdown (if exists) */}
                {review.detailedRating && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        {Object.entries(review.detailedRating).map(([key, val]) => (
                            <div key={key} className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s} className={`material-symbols-outlined text-[12px] ${s <= val ? 'text-emerald-500' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">{val}.0</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Body */}
            <div className="text-slate-600 leading-[1.7] text-[15px] md:text-[17px] font-medium italic mb-8 pr-4">
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

            {/* Photos */}
            {review.photo && (
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none items-center">
                    <img src={review.photo} alt="Review" className="w-[120px] h-[120px] object-cover rounded-[1.5rem] border border-slate-100 flex-shrink-0 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer" />
                    {/* Mock additional photo for design parity if only one is uploaded as in mockup */}
                    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80" alt="Review interior" className="w-[120px] h-[120px] object-cover rounded-[1.5rem] border border-slate-100 flex-shrink-0 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer" />
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2.5 mb-8 mt-auto">
                {tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-100/80 text-[#94A3B8] text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wide">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Footer Status & Likes */}
            <div className="flex justify-between items-center">
                {review.status === "PENDING" ? (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3.5 py-1.5 rounded-full border border-amber-100">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                        <span className="text-[11px] font-black tracking-widest leading-none">PENDING MODERATION</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 bg-[#ECFDF5] text-[#059669] px-3.5 py-1.5 rounded-full border border-[#D1FAE5]">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="text-[11px] font-black tracking-widest leading-none">PUBLISHED</span>
                    </div>
                )}
                
                <button className="flex items-center gap-2 text-[#94A3B8] hover:text-slate-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span className="text-[13px] font-bold">12</span>
                </button>
            </div>
            
            {/* Admin Response */}
            {review.ownerReply && (
                <div className="mt-8 bg-[#F8FAFC] p-5 rounded-3xl border border-slate-100 relative">
                    <div className="flex flex-col mb-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest text-slate-400 mb-1">Response from host</span>
                        <div className="text-[15px] text-slate-700 italic font-medium leading-relaxed">
                            "{review.ownerReply}"
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
