package com.rentease.modules.review.dto;

import com.rentease.common.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private String id;
    private String propertyId;
    private String reviewerId;
    private int rating;
    private String comment;
    private List<String> photos;
    private String ownerReply;
    private LocalDateTime repliedAt;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
