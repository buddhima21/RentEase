package com.rentease.modules.property.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @Positive(message = "Price must be positive")
    private double price;

    @Min(value = 0, message = "Security deposit cannot be negative")
    private double securityDeposit;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    private int bedrooms;

    @Min(value = 0, message = "Bathrooms cannot be negative")
    private int bathrooms;

    @Positive(message = "Area must be positive")
    private double area;

    @NotBlank(message = "Property type is required")
    private String propertyType;

    private List<String> amenities;
    private List<String> imageUrls;

    @Size(max = 10000, message = "Terms and conditions cannot exceed 10000 characters")
    private String termsAndConditions;
}
