export default function RatingOverview({ rating, totalReviews }) {
    // Generate star distribution logically for mock display
    const distribution = [
        { stars: 5, percentage: 70 },
        { stars: 4, percentage: 20 },
        { stars: 3, percentage: 5 },
        { stars: 2, percentage: 3 },
        { stars: 1, percentage: 2 },
    ];

    return (
        <div className="relative overflow-hidden p-8 sm:p-10 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col justify-center">
            {/* Glowing orb background effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f59e0b]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-8 relative z-10">
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-2 leading-none tracking-tighter">
                    {rating.toFixed(1)}
                </div>
                <div className="flex justify-center items-center gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-2xl text-[#f59e0b] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {star <= Math.round(rating) ? 'star' : star === Math.ceil(rating) && !Number.isInteger(rating) ? 'star_half' : 'star'}
                        </span>
                    ))}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10">
                    <span className="material-symbols-outlined text-sm text-slate-500">group</span>
                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {totalReviews} Verified Review{totalReviews !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="space-y-4 mt-auto relative z-10">
                {distribution.map((item, index) => (
                    <div key={item.stars} className="flex items-center gap-4 text-sm group">
                        <div className="flex items-center gap-1.5 w-12 text-slate-700 font-bold">
                            {item.stars} <span className="material-symbols-outlined text-[14px] text-[#f59e0b]">star</span>
                        </div>
                        <div className="flex-1 h-3 bg-slate-100/80 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                            <div
                                className="h-full rounded-full transition-all duration-[1.5s] ease-out bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] relative overflow-hidden group-hover:from-[#f59e0b] group-hover:to-[#ea580c]"
                                style={{ width: `${item.percentage}%`, animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Shine effect inside progress bar */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                            </div>
                        </div>
                        <div className="w-10 text-right text-slate-500 font-bold text-xs tracking-wide">
                            {item.percentage}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
