import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function ReviewCard({ review, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    // Support both full review objects and simple content-only reviews
    const reviewText = review.comment || review.text || review.content || "";
    const userName = review.reviewerName || review.user || "Verified Resident";
    const avatarUrl = review.avatar || `https://ui-avatars.com/api/?name=${userName}&background=0d9488&color=fff`;
    const dateStr = review.createdAt 
        ? new Date(review.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) 
        : (review.date || "Recently");

    const maxLength = 160;
    const shouldTruncate = reviewText.length > maxLength;
    const displayText = expanded ? reviewText : reviewText.slice(0, maxLength) + (shouldTruncate ? "..." : "");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] mb-6 flex flex-col"
        >

            {/* Header: User Info & Rating */}
            <div className="flex flex-row justify-between items-start gap-4 mb-5 w-full">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full bg-[#16a085] text-white flex items-center justify-center text-xl md:text-2xl font-medium tracking-wide">
                            {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#2ecc71] w-4 h-4 md:w-5 md:h-5 rounded-full border-[3px] border-white"></div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="font-extrabold text-slate-900 text-[19px] tracking-tight">{userName}</h4>
                        <span className="text-[13px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{dateStr}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start mt-2">
                    {/* Action Buttons for Author */}
                    {user && user.id === review.reviewerId && !isDeleting && (
                        <div className="flex items-center gap-1.5 mr-2">
                            <button
                                onClick={() => onEdit(review)}
                                title="Edit Review"
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this review?")) {
                                        setIsDeleting(true);
                                        await onDelete(review.id);
                                    }
                                }}
                                title="Delete Review"
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    )}

                    <div className="hidden sm:flex self-start">
                        <div className="flex gap-1.5 bg-slate-50/80 px-4 py-2 rounded-full border border-slate-100">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`material-symbols-outlined text-[18px] md:text-[20px] ${star <= Math.round(review.rating) ? 'text-[#f39c12]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Rating Display */}
            <div className="sm:hidden mb-4 self-start">
                <div className="inline-flex gap-1.5 bg-slate-50/80 px-4 py-2 rounded-full border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`material-symbols-outlined text-[18px] ${star <= Math.round(review.rating) ? 'text-[#f39c12]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                        </span>
                    ))}
                </div>
            </div>
            {/* Review Body */}
            <div className="text-[#34495e] leading-[1.6] text-[15px] md:text-[16px] font-medium pr-4 mt-1">
                {review.photo && (
                    <div className="mb-4">
                        <img src={review.photo} alt="Review" className="w-full max-w-sm h-48 object-cover rounded-[1.25rem] border border-slate-100" />
                    </div>
                )}
                <p>
                    {displayText}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center gap-1 text-[#0d9488] font-bold text-sm mt-3 hover:text-[#0f766e] transition-colors focus:outline-none"
                    >
                        {expanded ? "Show less" : "Read more"}
                        <span className="material-symbols-outlined text-sm">{expanded ? "expand_less" : "expand_more"}</span>
                    </button>
                )}
            </div>

            {/* Admin/Owner Response */}
            {
                (review.ownerReply || review.reply) && (
                    <div className="mt-6 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100/80 relative z-10 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[#0d9488]/10 w-7 h-7 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#0d9488] text-[15px]">verified_user</span>
                            </div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest text-[#0d9488]">Property Owner</span>
                        </div>
                        <p className="text-sm text-slate-600 italic font-medium pl-9">
                            "{review.ownerReply || review.reply}"
                        </p>
                    </div>
                )
            }
        </motion.div >
    );
}
