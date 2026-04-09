package com.rentease.modules.property.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating an existing property. All fields are optional —
 * only non-null values will be applied to the existing property.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyUpdateRequest {

    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String address;
    private String city;

    @Positive(message = "Price must be positive")
    private Double price;

    @Min(value = 0, message = "Security deposit cannot be negative")
    private Double securityDeposit;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @Min(value = 0, message = "Bathrooms cannot be negative")
    private Integer bathrooms;

    @Positive(message = "Area must be positive")
    private Double area;

    private String propertyType;
    private List<String> amenities;
    private List<String> imageUrls;

    @Size(max = 10000, message = "Terms and conditions cannot exceed 10000 characters")
    private String termsAndConditions;
}
