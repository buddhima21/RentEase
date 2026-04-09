package com.rentease.modules.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for property search/filter query parameters.
 * All fields are optional — only non-null values will be used for filtering.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySearchCriteria {

    private String city;
    private String propertyType;
    private Double minPrice;
    private Double maxPrice;
    private Integer minBedrooms;
    private String keyword;
}
