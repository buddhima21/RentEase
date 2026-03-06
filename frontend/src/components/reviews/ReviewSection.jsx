import RatingOverview from "./RatingOverview";
import ReviewCard from "./ReviewCard";
import { useState } from "react";
import WriteReviewModal from "./WriteReviewModal";

export default function ReviewSection({ reviews, rating }) {
    const [showModal, setShowModal] = useState(false);
    const [allReviews, setAllReviews] = useState(reviews);

    function handleWriteReviewClick() {
        setShowModal(true);
    }

    function handleModalClose() {
        setShowModal(false);
    }

    function handleReviewSubmit(newReview) {
        // newReview: { review, rating, photo }
        setAllReviews([
            ...allReviews,
            {
                id: Date.now(),
                content: newReview.review,
                rating: newReview.rating,
                photo: newReview.photo
            }
        ]);
        setShowModal(false);
    }

    return (
        <section className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#0d9488]/5 via-transparent to-transparent pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <span className="material-symbols-outlined text-[#0d9488] text-4xl p-2 bg-[#0d9488]/10 rounded-2xl">star_rate</span>
                        Real Student Reviews
                    </h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">Verified experiences from past and current residents</p>
                </div>
                <button
                    className="group relative overflow-hidden bg-[#0d9488] text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_12px_25px_rgba(13,148,136,0.4)] transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    onClick={handleWriteReviewClick}
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-150%] skew-x-[-45deg] transition-all duration-700 ease-out group-hover:translate-x-[150%]"></span>
                    <span className="material-symbols-outlined text-lg relative z-10">draw</span>
                    <span className="relative z-10">Write a Review</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
                {/* Rating Overview (Left Col) */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
                    <RatingOverview rating={rating} totalReviews={allReviews.length} />
                </div>

                {/* Review List (Right Col) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {allReviews.length > 0 ? (
                        allReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    ) : (
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-inner">
                                <span className="material-symbols-outlined text-4xl">reviews</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">No reviews yet</h3>
                            <p className="text-slate-500 font-medium">Be the first to share your experience staying here.</p>
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <WriteReviewModal onClose={handleModalClose} onSubmit={handleReviewSubmit} />
            )}
        </section>
    );
}
