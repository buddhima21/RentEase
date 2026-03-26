package com.rentease.modules.review.service;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.model.Review;
import com.rentease.modules.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private com.rentease.modules.user.repository.UserRepository userRepository;

    @Mock
    private com.rentease.modules.property.repository.PropertyRepository propertyRepository;

    @InjectMocks
    private ReviewService reviewService;

    private Review testReview;
    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        testReview = Review.builder()
                .id("1")
                .propertyId("prop1")
                .reviewerId("user1")
                .rating(5)
                .comment("Great place!")
                .status(ReviewStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .deleted(false)
                .build();

        reviewRequest = new ReviewRequest();
        reviewRequest.setPropertyId("prop1");
        reviewRequest.setReviewerId("user1");
        reviewRequest.setRating(5);
        reviewRequest.setComment("Great place!");
    }

    @Test
    void createReview_ShouldSaveWithPendingStatus() {
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        ReviewResponse response = reviewService.createReview(reviewRequest, "user1");

        assertNotNull(response);
        assertEquals("prop1", response.getPropertyId());
        assertEquals(ReviewStatus.PENDING, response.getStatus()); // Should default to PENDING
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void getReviewsByProperty_WhenOnlyApproved_ShouldReturnOnlyApproved() {
        testReview.setStatus(ReviewStatus.APPROVED);
        when(reviewRepository.findByPropertyIdAndStatusAndDeletedFalse("prop1", ReviewStatus.APPROVED))
                .thenReturn(List.of(testReview));

        List<ReviewResponse> responses = reviewService.getReviewsByProperty("prop1", true, null);

        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
        assertEquals(ReviewStatus.APPROVED, responses.get(0).getStatus());
        verify(reviewRepository).findByPropertyIdAndStatusAndDeletedFalse("prop1", ReviewStatus.APPROVED);
    }

    @Test
    void getReviewsByProperty_WhenNotOnlyApproved_ShouldReturnAllNonDeletedForProperty() {
        when(reviewRepository.findByPropertyIdAndDeletedFalse("prop1"))
                .thenReturn(List.of(testReview));

        List<ReviewResponse> responses = reviewService.getReviewsByProperty("prop1", false, null);

        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
        verify(reviewRepository).findByPropertyIdAndDeletedFalse("prop1");
    }

    @Test
    void getReviewsByUser_ShouldReturnMappedResponses() {
        when(reviewRepository.findByReviewerIdAndDeletedFalse("user1"))
                .thenReturn(List.of(testReview));

        List<ReviewResponse> responses = reviewService.getReviewsByUser("user1");

        assertFalse(responses.isEmpty());
        assertEquals("user1", responses.get(0).getReviewerId());
        verify(reviewRepository).findByReviewerIdAndDeletedFalse("user1");
    }

    @Test
    void getReviewsByStatus_ShouldReturnMappedResponses() {
        when(reviewRepository.findByStatusAndDeletedFalse(ReviewStatus.PENDING))
                .thenReturn(List.of(testReview));

        List<ReviewResponse> responses = reviewService.getReviewsByStatus(ReviewStatus.PENDING);

        assertFalse(responses.isEmpty());
        assertEquals(ReviewStatus.PENDING, responses.get(0).getStatus());
        verify(reviewRepository).findByStatusAndDeletedFalse(ReviewStatus.PENDING);
    }
    @Test
    void getReviewsForOwner_ShouldReturnAllReviewsForOwnerAndMocks() {
        when(propertyRepository.findByOwnerIdAndDeletedFalse("user1"))
                .thenReturn(List.of(com.rentease.modules.property.model.Property.builder().id("prop1").build()));
        when(reviewRepository.findByPropertyIdInAndDeletedFalse(anyList()))
                .thenReturn(List.of(testReview));

        List<ReviewResponse> responses = reviewService.getReviewsForOwner("user1");

        assertFalse(responses.isEmpty());
        // Verify that it includes both real and mock property IDs (28 total expected)
        verify(propertyRepository).findByOwnerIdAndDeletedFalse("user1");
        verify(reviewRepository).findByPropertyIdInAndDeletedFalse(argThat(list -> 
                list.contains("prop1") && list.contains("property_1") && list.contains("property_27")));
    }
}
