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

    // Sorting State
    const [sortBy, setSortBy] = useState('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const sortOptions = [
        { label: 'Newest First', value: 'newest', icon: 'schedule' },
        { label: 'Oldest First', value: 'oldest', icon: 'history' },
        { label: 'Highest Rating', value: 'highest', icon: 'star' },
        { label: 'Lowest Rating', value: 'lowest', icon: 'star_outline' }
    ];

    const getSortedReviews = () => {
        const sorted = [...allReviews];
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            default:
                return sorted;
        }
    };

    const sortedReviews = getSortedReviews();

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
                    propertyId: editingReview.propertyId,
                    reviewerId: editingReview.reviewerId,
                    rating: newReview.rating,
                    comment: newReview.review,
                    photos: newReview.photo ? [newReview.photo] : [],
                    detailedRating: newReview.detailedRating
                });

                // Optimistic UI update - remove from list as it's now PENDING re-approval
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
                    detailedRating: newReview.detailedRating
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
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight leading-none">
                        Verified Reviews
                    </h2>
                </div>
                {user && user.role === "TENANT" && (
                    <button
                        className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                        onClick={handleWriteReviewClick}
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span>Write a Review</span>
                    </button>
                )}
            </div>

            {/* Sorting Header */}
            <div className="flex justify-end items-center border-b border-slate-100 pb-4 mb-8">
                <div className="relative">
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                    >
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isSortOpen && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 py-2 z-[50] animate-in fade-in zoom-in-95 duration-200">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setIsSortOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                                        sortBy === option.value 
                                        ? 'text-emerald-600 bg-emerald-50' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
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
                    {sortedReviews.length > 0 ? (
                        sortedReviews.map((review) => (
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
