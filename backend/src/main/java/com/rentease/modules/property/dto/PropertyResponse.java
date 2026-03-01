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
    private int bedrooms;
    private int bathrooms;
    private double area;
    private String propertyType;
    private List<String> amenities;
    private List<String> imageUrls;
    private String ownerId;
    private PropertyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
