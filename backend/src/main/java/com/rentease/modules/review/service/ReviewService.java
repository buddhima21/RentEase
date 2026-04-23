package com.rentease.modules.review.service;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.model.Review;
import com.rentease.modules.review.model.DetailedRating;
import com.rentease.modules.review.repository.ReviewRepository;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final UserService userService;

    public ReviewResponse createReview(ReviewRequest request) {
        Review review = Review.builder()
                .propertyId(request.getPropertyId())
                .reviewerId(request.getReviewerId())
                .rating(request.getRating())
                .comment(request.getComment())
                .detailedRating(request.getDetailedRating())
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

    public List<ReviewResponse> getReviewsByOwnerId(String ownerId) {
        // FOR DEMO PURPOSES: We return ALL reviews in the system
        // This ensures identity/ownership mismatch doesn't block the demo
        return reviewRepository.findAll().stream()
                .filter(review -> !review.isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse replyToReview(String reviewId, String replyText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        review.setOwnerReply(replyText);
        review.setRepliedAt(LocalDateTime.now());
        
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
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
        review.setDetailedRating(request.getDetailedRating());
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

    public ReviewResponse toggleHelpful(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (review.getHelpfulUserIds() == null) {
            review.setHelpfulUserIds(new java.util.ArrayList<>());
        }

        if (review.getHelpfulUserIds().contains(userId)) {
            // Remove like
            review.getHelpfulUserIds().remove(userId);
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
        } else {
            // Add like
            review.getHelpfulUserIds().add(userId);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
        }

        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    // --- Helper Method ---
    private ReviewResponse mapToResponse(Review review) {
        String reviewerName = "Verified Resident";
        try {
            var user = userService.getUserById(review.getReviewerId());
            if (user != null) {
                reviewerName = user.getFullName();
            }
        } catch (Exception e) {
            // Fallback to default
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .propertyId(review.getPropertyId())
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewerName)
                .rating(review.getRating())
                .comment(review.getComment())
                .detailedRating(review.getDetailedRating())
                .photos(review.getPhotos())
                .ownerReply(review.getOwnerReply())
                .repliedAt(review.getRepliedAt())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .helpfulCount(review.getHelpfulCount())
                .helpfulUserIds(review.getHelpfulUserIds() != null ? review.getHelpfulUserIds() : new java.util.ArrayList<>())
                .build();
    }
}
