package com.rentease.modules.review.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.rentease.security.CustomUserDetails;
import com.rentease.exception.UnauthorizedException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        if (!request.getReviewerId().equals(userDetails.getId())) {
            throw new UnauthorizedException("Reviewer ID does not match the authenticated user");
        }

        ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Review submitted successfully and is pending approval"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProperty(
            @PathVariable String propertyId,
            @RequestParam(defaultValue = "true") boolean onlyApproved) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProperty(propertyId, onlyApproved);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByUser(
            @PathVariable String userId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getOwnerReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        List<ReviewResponse> reviews = reviewService.getReviewsByOwnerId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PutMapping("/{reviewId}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @PathVariable String reviewId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        boolean isAuthorized = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_OWNER"));
        if (!isAuthorized) {
            throw new UnauthorizedException("Only administrators or owners can reply to reviews");
        }

        String replyText = body.get("replyText");
        if(replyText == null || replyText.trim().isEmpty()) {
            throw new com.rentease.exception.BadRequestException("Reply text is required");
        }

        ReviewResponse response = reviewService.replyToReview(reviewId, replyText);
        return ResponseEntity.ok(ApiResponse.success(response, "Review reply posted successfully"));
    }

    @PutMapping("/{reviewId}/status")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable String reviewId,
            @RequestParam(name = "status") com.rentease.common.enums.ReviewStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        // Ensure only an admin or owner can perform this action
        boolean isAuthorized = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_OWNER"));
        if (!isAuthorized) {
            throw new UnauthorizedException("Only administrators or owners can update review statuses");
        }

        ReviewResponse response = reviewService.updateReviewStatus(reviewId, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Review status updated successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByStatus(
            @PathVariable(name = "status") com.rentease.common.enums.ReviewStatus status) {
        List<ReviewResponse> reviews = reviewService.getReviewsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        ReviewResponse response = reviewService.updateReview(reviewId, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Review updated successfully and is pending approval"));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        reviewService.deleteReview(reviewId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted successfully"));
    }
}
