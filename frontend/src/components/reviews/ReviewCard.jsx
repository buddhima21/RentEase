import { useState } from "react";

export default function ReviewCard({ review }) {
    const [expanded, setExpanded] = useState(false);

    // Support both full review objects and simple content-only reviews
    const reviewText = review.text || review.content || "";
    const maxLength = 160;
    const shouldTruncate = reviewText.length > maxLength;
    const displayText = expanded ? reviewText : reviewText.slice(0, maxLength) + (shouldTruncate ? "..." : "");

    return (
        <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden">

            {/* Background design element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Header: User Info & Rating */}
            {review.user ? (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={review.avatar}
                                alt={review.user}
                                className="w-14 h-14 rounded-full ring-4 ring-white shadow-sm object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#10b981] w-4 h-4 rounded-full border-2 border-white" title="Verified Resident"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg tracking-tight">{review.user}</h4>
                            <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{review.date}</span>
                        </div>
                    </div>

                    <div className="flex gap-0.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-[16px] ${star <= Math.round(review.rating) ? 'text-[#f59e0b]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                {star <= Math.round(review.rating) ? 'star' : 'star'}
                            </span>
                        ))}
                    </div>
                </div>
            ) : review.rating ? (
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-0.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-[16px] ${star <= Math.round(review.rating) ? 'text-[#f59e0b]' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                star
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Review Body */}
            <div className="text-slate-600 leading-relaxed text-base relative z-10">
                {review.photo && (
                    <div className="mb-3">
                        <img src={review.photo} alt="Review" className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow" />
                    </div>
                )}
                <p className="font-medium">
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

            {/* Admin Response (Mock display) */}
            {review.reply && (
                <div className="mt-6 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100/80 relative z-10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#0d9488]/10 w-7 h-7 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#0d9488] text-[15px]">verified_user</span>
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest text-[#0d9488]">Property Owner</span>
                    </div>
                    <p className="text-sm text-slate-600 italic font-medium pl-9">
                        "{review.reply}"
                    </p>
                </div>
            )}
        </div>
    );
}
