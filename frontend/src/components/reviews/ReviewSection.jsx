import RatingOverview from "./RatingOverview";
import ReviewCard from "./ReviewCard";
import { useState, useEffect } from "react";
import WriteReviewModal from "./WriteReviewModal";
import { submitReview, updateReview, deleteReview } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ReviewSection({ propertyId, reviews, rating }) {
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [allReviews, setAllReviews] = useState(reviews);
    
    // Sync internal state with prop updates
    useEffect(() => {
        setAllReviews(reviews);
    }, [reviews]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    function handleWriteReviewClick() {
        if (user) {
            setEditingReview(null);
            setShowModal(true);
        } else {
            navigate("/login");
        }
    }

    function handleEditClick(reviewData) {
        console.log("Editing review data:", reviewData);
        setEditingReview(reviewData);
        setShowModal(true);
    }

    function handleModalClose() {
        setShowModal(false);
        setEditingReview(null);
    }

    async function handleReviewSubmit(newReview) {
        setIsSubmitting(true);
        console.log("Submitting review. editingReview:", editingReview);
        try {
            if (editingReview) {
                // UPDATE logic
                await updateReview(editingReview.id, {
                    propertyId: propertyId,
                    reviewerId: user.id,
                    rating: newReview.rating,
                    comment: newReview.review,
                    photos: newReview.photo ? [newReview.photo] : [],
                });

                // Optimistic UI update - mark as pending locally or remove from approved view depending on preference
                setAllReviews(prev => prev.filter(r => r.id !== editingReview.id));
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 5000);
            } else {
                // CREATE logic
                await submitReview({
                    propertyId: propertyId,
                    reviewerId: user.id,
                    rating: newReview.rating,
                    comment: newReview.review,
                    photos: newReview.photo ? [newReview.photo] : [],
                });
                // Show a beautiful temporary success message because the review is now PENDING
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 5000); // Hide after 5 seconds
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("There was an issue submitting your review. Please try again.");
        } finally {
            setIsSubmitting(false);
            setShowModal(false);
            setEditingReview(null);
        }
    }

    async function handleReviewDelete(reviewId) {
        console.log("Deleting review. ID:", reviewId);
        try {
            await deleteReview(reviewId);
            setAllReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error("Failed to delete review:", error);
            alert("There was an issue deleting your review. Please try again.");
        }
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
                {user && user.role === "TENANT" && (
                    <button
                        className="group relative overflow-hidden bg-[#0d9488] text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_12px_25px_rgba(13,148,136,0.4)] transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                        onClick={handleWriteReviewClick}
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-150%] skew-x-[-45deg] transition-all duration-700 ease-out group-hover:translate-x-[150%]"></span>
                        <span className="material-symbols-outlined text-lg relative z-10">draw</span>
                        <span className="relative z-10">Write a Review</span>
                    </button>
                )}
            </div>

            {submitSuccess && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                        <span className="material-symbols-outlined shrink-0 text-xl">verified</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-800">Review Submitted!</h4>
                        <p className="text-emerald-600 text-sm font-medium">Thank you! Your verified review is currently pending moderation and will be published shortly.</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
                {/* Rating Overview (Left Col) */}
                <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit">
                    <RatingOverview rating={rating} totalReviews={allReviews.length > 0 ? allReviews.length : 2} />
                </div>

                {/* Review List (Right Col) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {allReviews.length > 0 ? (
                        allReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onEdit={handleEditClick}
                                onDelete={handleReviewDelete}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col flex-1 items-center justify-center p-12 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden h-full min-h-[400px]">
                            {/* Decorative background circle */}
                            <div className="absolute w-40 h-40 bg-[#0d9488]/5 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-6 relative z-10 border border-slate-100 shadow-sm">
                                <span className="material-symbols-outlined text-4xl text-slate-300">rate_review</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">No Reviews Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed relative z-10">
                                This property doesn't have any reviews right now. Be the first to share your experience and help future students!
                            </p>
                            
                            {user && user.role === "TENANT" && (
                                <button 
                                    onClick={handleWriteReviewClick}
                                    className="mt-6 font-bold text-[#0d9488] hover:text-[#0f766e] flex items-center gap-1.5 px-4 py-2 bg-[#0d9488]/5 hover:bg-[#0d9488]/10 rounded-xl transition-colors relative z-10"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Write the first review
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <WriteReviewModal
                    onClose={handleModalClose}
                    onSubmit={handleReviewSubmit}
                    initialData={editingReview}
                />
            )}
        </section>
    );
}
