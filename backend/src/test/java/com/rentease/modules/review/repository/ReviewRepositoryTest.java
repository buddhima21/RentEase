package com.rentease.modules.review.repository;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.modules.review.model.Review;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataMongoTest
class ReviewRepositoryTest {

    @Autowired
    private ReviewRepository reviewRepository;

    private Review review1;
    private Review review2;
    private Review review3;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();

        review1 = Review.builder()
                .propertyId("prop1")
                .reviewerId("user1")
                .rating(5)
                .status(ReviewStatus.APPROVED)
                .deleted(false)
                .build();

        review2 = Review.builder()
                .propertyId("prop1")
                .reviewerId("user2")
                .rating(4)
                .status(ReviewStatus.PENDING)
                .deleted(false)
                .build();

        review3 = Review.builder()
                .propertyId("prop2")
                .reviewerId("user1")
                .rating(3)
                .status(ReviewStatus.REJECTED)
                .deleted(true) // Should be excluded by "DeletedFalse" queries
                .build();

        reviewRepository.saveAll(List.of(review1, review2, review3));
    }

    @AfterEach
    void tearDown() {
        reviewRepository.deleteAll();
    }

    @Test
    void findByPropertyIdAndStatusAndDeletedFalse() {
        List<Review> results = reviewRepository.findByPropertyIdAndStatusAndDeletedFalse("prop1", ReviewStatus.APPROVED);
        assertEquals(1, results.size());
        assertEquals("user1", results.get(0).getReviewerId());
    }

    @Test
    void findByPropertyIdAndDeletedFalse() {
        List<Review> results = reviewRepository.findByPropertyIdAndDeletedFalse("prop1");
        assertEquals(2, results.size()); // Should return review1 and review2 for prop1
        
        List<Review> resultsProp2 = reviewRepository.findByPropertyIdAndDeletedFalse("prop2");
        assertTrue(resultsProp2.isEmpty()); // review3 is deleted, so it shouldn't return
    }

    @Test
    void findByReviewerIdAndDeletedFalse() {
        List<Review> results = reviewRepository.findByReviewerIdAndDeletedFalse("user1");
        assertEquals(1, results.size());
        assertEquals("prop1", results.get(0).getPropertyId()); // Only review1, review3 is deleted
    }

    @Test
    void findByStatusAndDeletedFalse() {
        List<Review> results = reviewRepository.findByStatusAndDeletedFalse(ReviewStatus.PENDING);
        assertEquals(1, results.size());
        assertEquals("user2", results.get(0).getReviewerId());
    }
}
