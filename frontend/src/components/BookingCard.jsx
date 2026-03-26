export default function BookingCard({ property }) {
    const formattedPrice = new Intl.NumberFormat("en-LK").format(property.price);
    const deposit = new Intl.NumberFormat("en-LK").format(property.price * 2);
    const serviceFee = new Intl.NumberFormat("en-LK").format(1500);
    const total = new Intl.NumberFormat("en-LK").format(property.price * 2 + property.price + 1500);

    return (
        <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-24 border border-slate-200 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-primary">LKR {formattedPrice}</span>
                            <span className="text-slate-500 text-sm">/ month</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <span
                                className="material-symbols-outlined text-primary text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                star
                            </span>
                            <span className="font-bold">{property.rating}</span>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl mb-4 overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-slate-200">
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase text-slate-500">Move-in Date</p>
                                <p className="text-sm font-medium">
                                    {new Date(property.availableFrom).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase text-slate-500">Min Stay</p>
                                <p className="text-sm font-medium">6 Months</p>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-200">
                            <p className="text-[10px] font-bold uppercase text-slate-500">Occupants</p>
                            <p className="text-sm font-medium">1 Person</p>
                        </div>
                    </div>

                    <button className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all mb-4 active:scale-[0.98]">
                        Request Booking
                    </button>
                    <p className="text-center text-xs text-slate-500 mb-6">You won't be charged yet</p>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Monthly Rent</span>
                            <span className="font-medium">LKR {formattedPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Security Deposit</span>
                            <span className="font-medium">LKR {deposit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">RentEase Service Fee</span>
                            <span className="font-medium">LKR {serviceFee}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-4 flex justify-between font-black text-lg">
                            <span>Total to pay now</span>
                            <span className="text-primary">LKR {total}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        <span className="text-xs font-bold">Secure Payment Protection</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                        info
                    </span>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button className="flex items-center gap-2 text-slate-400 text-sm hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-lg">flag</span>
                    Report this listing
                </button>
            </div>
        </div>
    );
}
