package com.rentease.modules.property.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.dto.PropertySearchCriteria;
import com.rentease.modules.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public property endpoints — no authentication required.
 * Only returns APPROVED properties.
 */
@RestController
@RequestMapping("/api/v1/public/properties")
@RequiredArgsConstructor
public class PublicPropertyController {

    private final PropertyService propertyService;

    /**
     * Get all approved (publicly visible) properties.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getApprovedProperties() {
        List<PropertyResponse> properties = propertyService.getApprovedProperties();
        return ResponseEntity.ok(ApiResponse.success(properties, "Approved properties retrieved"));
    }

    /**
     * Get a single approved property by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getApprovedPropertyById(
            @PathVariable("id") String id) {
        PropertyResponse response = propertyService.getApprovedPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Search approved properties with optional filters.
     * Query params: city, propertyType, minPrice, maxPrice, minBedrooms, keyword
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minBedrooms,
            @RequestParam(required = false) String keyword) {

        PropertySearchCriteria criteria = PropertySearchCriteria.builder()
                .city(city)
                .propertyType(propertyType)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minBedrooms(minBedrooms)
                .keyword(keyword)
                .build();

        List<PropertyResponse> properties = propertyService.searchProperties(criteria);
        return ResponseEntity.ok(ApiResponse.success(properties, "Search results retrieved"));
    }
}
