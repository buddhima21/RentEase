import { useState, useEffect } from "react";
// In a real app, this would use the real api.js endpoints to fetch owner reviews
// For now we will display a premium UI with mockup data representing the DB schema

const mockOwnerReviews = [
    {
        id: "rev_1",
        propertyName: "Modern Loft inside LA",
        reviewerName: "Alex Johnson",
        rating: 5,
        comment: "Excellent stay, very close to campus and well-maintained!",
        status: "PUBLISHED",
        createdAt: "2026-03-05T14:30:00Z"
    },
    {
        id: "rev_2",
        propertyName: "Cozy Studio near MIT",
        reviewerName: "Samantha Lee",
        rating: 4,
        comment: "Great location, but the wifi was a bit slow on weekends.",
        status: "PUBLISHED",
        createdAt: "2026-03-02T09:15:00Z"
    },
    {
        id: "rev_3",
        propertyName: "Sunny Apartment NY",
        reviewerName: "Michael Chen",
        rating: 5,
        comment: "The host was incredibly responsive. Loved the natural lighting.",
        status: "PENDING",
        createdAt: "2026-03-06T18:45:00Z"
    }
];

export default function ReviewManager() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate an API network request for the owner dashboard data
        setTimeout(() => {
            setReviews(mockOwnerReviews);
            setIsLoading(false);
        }, 800);
    }, []);

    // Helper to format date
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading your latest property reviews...</p>
            </div>
        );
    }

    return (
        <section className="bg-white rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden w-full max-w-7xl mx-auto mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-xl">hotel_class</span>
                        Recent Property Reviews
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">See what tenants are saying about your active listings.</p>
                </div>
                <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Property & Reviewer</th>
                            <th className="p-4 font-bold">Rating</th>
                            <th className="p-4 font-bold hidden md:table-cell">Comment</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 align-top">
                                    <div className="font-bold text-slate-900">{review.propertyName}</div>
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                            {review.reviewerName.charAt(0)}
                                        </div>
                                        {review.reviewerName}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex gap-0.5 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                                        ))}
                                    </div>
                                    {review.status === "PENDING" && (
                                        <span className="inline-block mt-2 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 align-top text-slate-600 font-medium md:max-w-md hidden md:table-cell">
                                    "{review.comment}"
                                </td>
                                <td className="p-4 align-top text-sm font-medium text-slate-500 whitespace-nowrap">
                                    {formatDate(review.createdAt)}
                                </td>
                                <td className="p-4 align-top text-center">
                                    <button className="text-primary hover:text-primary/80 font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors text-sm w-full">
                                        Reply
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && (
                    <div className="p-12 text-center text-slate-500 font-medium">
                        You don't have any reviews yet.
                    </div>
                )}
            </div>
        </section>
    );
}
