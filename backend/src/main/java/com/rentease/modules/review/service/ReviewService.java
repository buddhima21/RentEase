package com.rentease.modules.review.service;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.model.Review;
import com.rentease.modules.review.repository.ReviewRepository;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.property.model.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final com.rentease.modules.user.repository.UserRepository userRepository;

    public ReviewResponse createReview(ReviewRequest request) {
        log.info("Creating review for property: {} by reviewer: {}", request.getPropertyId(), request.getReviewerId());
        String reviewerName = userRepository.findById(request.getReviewerId())
                .map(com.rentease.modules.user.model.User::getFullName)
                .orElse("Verified Resident");
        
        log.info("Resolved reviewer name: {}", reviewerName);

        Review review = Review.builder()
                .propertyId(request.getPropertyId())
                .reviewerId(request.getReviewerId())
                .reviewerName(reviewerName)
                .rating(request.getRating())
                .comment(request.getComment())
                .photos(request.getPhotos())
                .status(ReviewStatus.PENDING) // Default status for moderation
                .createdAt(java.time.LocalDateTime.now()) // Explicitly set to ensure it's not null
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
        
        // Batch fetch user names to avoid N+1 and fix missing names for legacy reviews
        Set<String> reviewerIds = reviews.stream()
                .filter(r -> r.getReviewerName() == null || r.getReviewerName().equals("Verified Resident"))
                .map(Review::getReviewerId)
                .collect(Collectors.toSet());
        
        Map<String, String> userNames = userRepository.findAllById(reviewerIds).stream()
                .collect(Collectors.toMap(com.rentease.modules.user.model.User::getId, com.rentease.modules.user.model.User::getFullName));

        return reviews.stream()
                .map(r -> {
                    ReviewResponse resp = mapToResponse(r);
                    if (resp.getReviewerName() == null || resp.getReviewerName().equals("Verified Resident")) {
                        resp.setReviewerName(userNames.getOrDefault(r.getReviewerId(), resp.getReviewerName()));
                    }
                    return resp;
                })
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

    public ReviewResponse updateReviewStatus(String reviewId, ReviewStatus status, String userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        if (!isAdmin) {
            if (!review.getPropertyId().startsWith("property_")) {
                Property property = propertyRepository.findById(review.getPropertyId())
                        .orElseThrow(() -> new ResourceNotFoundException("Property", "id", review.getPropertyId()));
                if (!property.getOwnerId().equals(userId)) {
                    throw new BadRequestException("You are not authorized to update this review's status");
                }
            }
        }
        
        review.setStatus(status);
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    public ReviewResponse replyToReview(String reviewId, String reply, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        if (!review.getPropertyId().startsWith("property_")) {
            Property property = propertyRepository.findById(review.getPropertyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Property", "id", review.getPropertyId()));
                    
            if (!property.getOwnerId().equals(userId)) {
                throw new BadRequestException("Only the property owner can reply to this review");
            }
        }
        
        review.setOwnerReply(reply);
        review.setRepliedAt(LocalDateTime.now());
        
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }
    
    public ReviewResponse updateReview(String reviewId, ReviewRequest request, String userId) {
        log.info("Updating review: {} by user: {}", reviewId, userId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getReviewerId().equals(userId)) {
            log.error("Authorization failed: ReviewerId {} != UserId {}", review.getReviewerId(), userId);
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
        log.info("Deleting review: {} by user: {}", reviewId, userId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getReviewerId().equals(userId)) {
            log.error("Authorization failed: ReviewerId {} != UserId {}", review.getReviewerId(), userId);
            throw new BadRequestException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    // --- Helper Method ---
    private ReviewResponse mapToResponse(Review review) {
        String reviewerName = review.getReviewerName();
        if (reviewerName == null || reviewerName.equals("Verified Resident")) {
            reviewerName = userRepository.findById(review.getReviewerId())
                    .map(com.rentease.modules.user.model.User::getFullName)
                    .orElse("Verified Resident");
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .propertyId(review.getPropertyId())
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewerName)
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
