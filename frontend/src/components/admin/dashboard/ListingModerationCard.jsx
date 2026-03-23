/**
 * ListingModerationCard — Reusable listing card for the moderation queue.
 * Displays listing image, info, submitter, and action buttons.
 * Props: listing object from listingModerationData.js
 */
export default function ListingModerationCard({ listing }) {
    const isFlagged = listing.status === "flagged";

    return (
        <div
            className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-md ${
                isFlagged
                    ? "border-red-200 ring-1 ring-red-500/10"
                    : "border-slate-200"
            }`}
        >
            {/* Image */}
            <div className="w-full lg:w-72 h-48 lg:h-auto flex-shrink-0 relative">
                <div
                    className={`absolute inset-0 bg-cover bg-center ${isFlagged ? "grayscale-[0.5]" : ""}`}
                    style={{ backgroundImage: `url('${listing.image}')` }}
                />
                <div className="absolute top-3 left-3">
                    {isFlagged ? (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-sm">flag</span> Flagged Content
                        </span>
                    ) : (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-sm">schedule</span> Pending Review
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left info */}
                    <div>
                        <h3 className="text-lg font-bold mb-1">{listing.title}</h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {listing.location}
                        </div>

                        {isFlagged && listing.flagReason ? (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-tighter mb-1">Reason for Flag</p>
                                <p className="text-xs text-red-600">{listing.flagReason}</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Submitted By</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#1DBC60]/10 text-[#1DBC60] flex items-center justify-center font-bold text-xs uppercase">
                                        {listing.submittedBy.initials}
                                    </div>
                                    <p className="text-sm font-medium">{listing.submittedBy.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right info */}
                    <div className="flex flex-col md:items-end justify-start space-y-4">
                        <div className="md:text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Submission Date</p>
                            <p className="text-sm font-medium">{listing.submittedDate}</p>
                        </div>
                        {isFlagged ? (
                            <div className="space-y-1.5 md:text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Submitted By</p>
                                <div className="flex items-center md:justify-end gap-2">
                                    <p className="text-sm font-medium">{listing.submittedBy.name}</p>
                                    <div className="w-8 h-8 rounded-full bg-[#1DBC60]/10 text-[#1DBC60] flex items-center justify-center font-bold text-xs uppercase">
                                        {listing.submittedBy.initials}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="md:text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Listing Type</p>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium">{listing.listingType}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
                    <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">visibility</span> View Details
                    </button>
                    <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">block</span>
                        {isFlagged ? "Reject" : "Reject with Reason"}
                    </button>
                    {isFlagged ? (
                        <button className="px-6 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">edit</span> Request Fix
                        </button>
                    ) : (
                        <button className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#1DBC60] text-white hover:bg-[#1DBC60]/90 shadow-sm shadow-[#1DBC60]/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check</span> Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
