package com.rentease.modules.property.dto;

import com.rentease.common.enums.PropertyStatus;
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
public class PropertyResponse {

    private String id;
    private String title;
    private String description;
    private String address;
    private String city;
    private double price;
    private double securityDeposit;
    private int bedrooms;
    private int bathrooms;
    private double area;
    private String propertyType;
    private List<String> amenities;
    private List<String> imageUrls;
    private String termsAndConditions;

    // Owner info
    private String ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String ownerProfileImageUrl;

    // Moderation info
    private PropertyStatus status;
    private String adminRemarks;
    private String deleteReason;
    private LocalDateTime statusChangedAt;
    private LocalDateTime deleteRequestedAt;
    private boolean deleted;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
