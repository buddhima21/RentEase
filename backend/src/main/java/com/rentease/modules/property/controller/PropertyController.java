package com.rentease.modules.property.controller;

import com.rentease.common.ApiResponse;
import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.property.dto.PropertyRequest;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Valid @RequestBody PropertyRequest request) {
        PropertyResponse response = propertyService.createProperty(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Property created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getAllProperties() {
        List<PropertyResponse> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(@PathVariable String id) {
        PropertyResponse response = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getPropertiesByOwner(
            @PathVariable String ownerId) {
        List<PropertyResponse> properties = propertyService.getPropertiesByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getPropertiesByStatus(
            @PathVariable PropertyStatus status) {
        List<PropertyResponse> properties = propertyService.getPropertiesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getPropertiesByCity(
            @PathVariable String city) {
        List<PropertyResponse> properties = propertyService.getPropertiesByCity(city);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable String id, @Valid @RequestBody PropertyRequest request) {
        PropertyResponse response = propertyService.updateProperty(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Property updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PropertyResponse>> updatePropertyStatus(
            @PathVariable String id, @RequestParam PropertyStatus status) {
        PropertyResponse response = propertyService.updatePropertyStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Property status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable String id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Property deleted successfully"));
    }
}
