package com.rentease.modules.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.rentease.modules.review.model.DetailedRating;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Reviewer ID is required")
    private String reviewerId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot be more than 5")
    private int rating;

    @NotBlank(message = "Review comment is required")
    private String comment;

    private DetailedRating detailedRating;
    private List<String> photos;
}
