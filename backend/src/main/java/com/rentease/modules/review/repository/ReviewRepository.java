package com.rentease.modules.review.repository;

import com.rentease.common.enums.ReviewStatus;
import com.rentease.modules.review.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByPropertyIdAndStatusAndDeletedFalse(String propertyId, ReviewStatus status);
    List<Review> findByPropertyIdAndDeletedFalse(String propertyId);
    List<Review> findByReviewerIdAndDeletedFalse(String reviewerId);
    List<Review> findByStatusAndDeletedFalse(ReviewStatus status);
    List<Review> findByPropertyIdInAndDeletedFalse(List<String> propertyIds);
}
