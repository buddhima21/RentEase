package com.rentease.modules.property.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.property.dto.PropertyRequest;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.dto.PropertyUpdateRequest;
import com.rentease.modules.property.service.PropertyService;
import com.rentease.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Owner-facing property endpoints.
 * All endpoints require OWNER role (enforced via SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/owner/properties")
@RequiredArgsConstructor
public class OwnerPropertyController {

    private final PropertyService propertyService;

    /**
     * Create a new property listing.
     * Status will be set to PENDING_APPROVAL automatically.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Valid @RequestBody PropertyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PropertyResponse response = propertyService.createProperty(
                request,
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getUsername()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Property submitted for admin approval"));
    }

    /**
     * Update an existing property (partial update).
     * Only allowed for APPROVED or REJECTED properties.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable("id") String id,
            @Valid @RequestBody PropertyUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PropertyResponse response = propertyService.updateProperty(id, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Property updated successfully"));
    }

    /**
     * Get all properties belonging to the authenticated owner.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getMyProperties(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<PropertyResponse> properties = propertyService.getMyProperties(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(properties, "Owner properties retrieved"));
    }

    /**
     * Get a single property by ID (ownership verified).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getMyPropertyById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PropertyResponse response = propertyService.getMyPropertyById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Request deletion of a property.
     * Sets status to PENDING_DELETE — admin must approve before actual deletion.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> requestDelete(
            @PathVariable("id") String id,
            @RequestParam(value = "reason", required = false) String reason,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PropertyResponse response = propertyService.requestDeleteProperty(id, userDetails.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Delete request submitted for admin approval"));
    }
}
