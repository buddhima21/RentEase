package com.rentease.modules.maintenance.controller;

import com.rentease.common.ApiResponse;
import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponse>> createRequest(
            @Valid @RequestBody MaintenanceRequestDTO request) {
        MaintenanceResponse response = maintenanceService.createRequest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Maintenance request created"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> updateStatus(
            @PathVariable String id, @RequestParam MaintenanceStatus status) {
        MaintenanceResponse response = maintenanceService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Status updated"));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByProperty(
            @PathVariable String propertyId) {
        List<MaintenanceResponse> requests = maintenanceService.getByProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}
