package com.rentease.modules.property.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.property.dto.AdminModerationRequest;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-facing property moderation endpoints.
 * All endpoints require ADMIN role (enforced via SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/admin/properties")
@RequiredArgsConstructor
public class AdminPropertyController {

    private final PropertyService propertyService;

    /**
     * Get all properties pending moderation (PENDING_APPROVAL + PENDING_DELETE).
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getPendingProperties() {
        List<PropertyResponse> properties = propertyService.getPendingProperties();
        return ResponseEntity.ok(ApiResponse.success(properties, "Pending properties retrieved"));
    }

    /**
     * Get all properties (admin dashboard overview).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getAllProperties() {
        List<PropertyResponse> properties = propertyService.getAllPropertiesForAdmin();
        return ResponseEntity.ok(ApiResponse.success(properties, "All properties retrieved"));
    }

    /**
     * Get any single property by ID (admin view — no status restriction).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(@PathVariable("id") String id) {
        PropertyResponse response = propertyService.getPropertyByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Moderate a property listing.
     * For PENDING_APPROVAL: APPROVE → APPROVED, REJECT → REJECTED
     * For PENDING_DELETE:   APPROVE → DELETED,  REJECT → APPROVED (restored)
     */
    @PatchMapping("/{id}/moderate")
    public ResponseEntity<ApiResponse<PropertyResponse>> moderateProperty(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminModerationRequest request) {

        PropertyResponse response = propertyService.moderateProperty(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Property moderation applied successfully"));
    }

    /**
     * Compatibility endpoint for clients/environments where PATCH may be blocked.
     */
    @PutMapping("/{id}/moderate")
    public ResponseEntity<ApiResponse<PropertyResponse>> moderatePropertyPut(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminModerationRequest request) {

        PropertyResponse response = propertyService.moderateProperty(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Property moderation applied successfully"));
    }
}
