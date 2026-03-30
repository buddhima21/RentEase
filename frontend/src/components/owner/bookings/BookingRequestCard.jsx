import React from "react";

const BookingRequestCard = ({ booking }) => {
    const isApproved = booking.status === "Approved";

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 ${isApproved ? "opacity-90 grayscale-[0.3]" : ""}`}>
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left: Tenant & Status */}
                <div className="flex items-start gap-4 lg:w-1/4">
                    <img 
                        alt="Tenant profile" 
                        className="w-14 h-14 rounded-full border-2 border-slate-50 shadow-sm object-cover" 
                        src={booking.tenant.avatar}
                    />
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">{booking.tenant.name}</h4>
                        <div className="flex items-center gap-1 text-primary">
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold">{booking.tenant.rating.toFixed(1)}</span>
                            <span className="text-xs text-slate-400 font-normal ml-1">
                                ({booking.tenant.reviews} review{booking.tenant.reviews !== 1 && 's'})
                            </span>
                        </div>
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Center: Property & Dates */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:border-x lg:px-6 border-slate-100">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                                alt="Property thumbnail" 
                                className="w-full h-full object-cover" 
                                src={booking.property.thumbnail}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Property</p>
                            <h5 className="font-bold text-slate-800">{booking.property.name}</h5>
                            <p className="text-sm text-slate-500">{booking.property.location}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl flex items-center justify-center ${isApproved ? "bg-slate-50 text-slate-400" : "bg-slate-50 text-primary"}`}>
                            <span className="material-symbols-outlined">calendar_today</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Stay Dates</p>
                            <h5 className="font-bold text-slate-800">{booking.stay.dateRange}</h5>
                            <p className="text-sm text-slate-500">{booking.stay.durationStr}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-1/4 flex flex-col justify-center gap-3">
                    {!isApproved ? (
                        <>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-primary/30">
                                    Approve
                                </button>
                                <button className="flex-1 border border-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-2.5 rounded-xl transition-all">
                                    Reject
                                </button>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-primary transition-all border border-transparent hover:border-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                Message Tenant
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="w-full bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl cursor-not-allowed">
                                Already Approved
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-primary transition-all border border-transparent hover:border-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-lg">description</span>
                                View Agreement
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BookingRequestCard;
