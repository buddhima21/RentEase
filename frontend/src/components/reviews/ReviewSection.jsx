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
    const [allReviews, setAllReviews] = useState(reviews || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Sync state with props when data is asynchronously loaded
    useEffect(() => {
        if (reviews) {
            setAllReviews(reviews);
        }
    }, [reviews]);

    // Mock Tabs for UI parity with 2026 design (My Boarding Reviews mockup style)
    const [activeTab, setActiveTab] = useState('total');

    function handleWriteReviewClick() {
        if (user) {
            setEditingReview(null);
            setShowModal(true);
        } else {
            navigate("/login");
        }
    }

    function handleEditClick(reviewData) {
        setEditingReview(reviewData);
        setShowModal(true);
    }

    function handleModalClose() {
        setShowModal(false);
        setEditingReview(null);
    }

    async function handleReviewSubmit(newReview) {
        setIsSubmitting(true);
        try {
            if (editingReview) {
                // UPDATE logic
                await updateReview(editingReview.id, {
                    rating: newReview.rating,
                    comment: newReview.review,
                    photos: newReview.photo ? [newReview.photo] : [],
                });

                // Optimistic UI update
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
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 5000); 
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
        try {
            await deleteReview(reviewId);
            setAllReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error("Failed to delete review:", error);
            alert("There was an issue deleting your review. Please try again.");
        }
    }

    return (
        <section className="bg-white rounded-[2.5rem] p-0 md:p-6 lg:p-8 relative overflow-hidden">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-[#EBF5FF] text-[#2563EB] px-3.5 py-1.5 rounded-full mb-4">
                        <span className="text-[10px] font-black tracking-widest uppercase">Your Voice Matters</span>
                    </div>
                    <h2 className="text-[28px] md:text-[36px] font-black text-slate-900 tracking-tight leading-tight">
                        Property Reviews
                    </h2>
                    <p className="text-slate-500 mt-2 text-[15px] max-w-lg font-medium">
                        Share your experience with the Malabe student community. Your feedback helps others find their perfect home.
                    </p>
                </div>
                {user && user.role === "TENANT" && (
                    <button
                        className="bg-[#0F172A] text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        onClick={handleWriteReviewClick}
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Write a Review</span>
                    </button>
                )}
            </div>

            {/* Sorting Header */}
            <div className="flex justify-end items-center border-b border-slate-100 pb-4 mb-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold cursor-pointer hover:text-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span> Sort: Newest
                </div>
            </div>

            {submitSuccess && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                        <span className="material-symbols-outlined shrink-0 text-xl">verified</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-800">Review Submitted!</h4>
                        <p className="text-emerald-600 text-[13px] font-medium mt-1">Thank you! Your verified review is currently pending moderation and will be published shortly.</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
                {/* Rating Overview (Left Col) */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
                    <RatingOverview rating={rating} totalReviews={allReviews.length > 0 ? allReviews.length : 2} />
                </div>

                {/* Review List (Right Col) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
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
                        <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">rate_review</span>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No reviews yet</h3>
                            <p className="text-slate-500 font-medium">Be the first to leave a review for this property!</p>
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
