package com.rentease.modules.review.model;

import com.rentease.common.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    // References to other collections
    private String propertyId;
    private String reviewerId; // Tenant who wrote the review
    private String reviewerName;

    // Core Review Data
    private int rating; // 1 to 5 scale
    private String comment;
    private List<String> photos; // URLs to uploaded review photos

    // Owner Interaction
    private String ownerReply;
    private LocalDateTime repliedAt;

    // Admin/System Controls
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING; // PENDING, APPROVED, REJECTED
    
    @Builder.Default
    private boolean deleted = false;

    // Audit Info
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
