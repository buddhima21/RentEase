package com.rentease.modules.review.service;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.model.Review;
import com.rentease.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewResponse createReview(ReviewRequest request) {
        Review review = Review.builder()
                .propertyId(request.getPropertyId())
                .reviewerId(request.getReviewerId())
                .rating(request.getRating())
                .comment(request.getComment())
                .photos(request.getPhotos())
                .status(ReviewStatus.PENDING) // Default status for moderation
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .filter(review -> !review.isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByProperty(String propertyId, boolean onlyApproved) {
        List<Review> reviews = onlyApproved 
                ? reviewRepository.findByPropertyIdAndStatusAndDeletedFalse(propertyId, ReviewStatus.APPROVED)
                : reviewRepository.findByPropertyIdAndDeletedFalse(propertyId);
        
        return reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUser(String reviewerId) {
        return reviewRepository.findByReviewerIdAndDeletedFalse(reviewerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByStatus(ReviewStatus status) {
        return reviewRepository.findByStatusAndDeletedFalse(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse updateReviewStatus(String reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        review.setStatus(status);
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }
    
    public ReviewResponse updateReview(String reviewId, ReviewRequest request, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getReviewerId().equals(userId)) {
            throw new BadRequestException("You are not authorized to update this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setPhotos(request.getPhotos());
        // Resetting status to PENDING for moderation upon edit
        review.setStatus(ReviewStatus.PENDING);

        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    public void deleteReview(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getReviewerId().equals(userId)) {
            throw new BadRequestException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    // --- Helper Method ---
    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .propertyId(review.getPropertyId())
                .reviewerId(review.getReviewerId())
                .rating(review.getRating())
                .comment(review.getComment())
                .photos(review.getPhotos())
                .ownerReply(review.getOwnerReply())
                .repliedAt(review.getRepliedAt())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
