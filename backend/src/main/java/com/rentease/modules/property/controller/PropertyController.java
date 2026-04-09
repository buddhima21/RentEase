package com.rentease.modules.property.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.dto.PropertyUpdateRequest;
import com.rentease.modules.property.service.PropertyService;
import com.rentease.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Generic property endpoints kept for compatibility.
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable("id") String id,
            @Valid @RequestBody PropertyUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PropertyResponse response = propertyService.updateProperty(id, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Property updated successfully"));
    }
}
