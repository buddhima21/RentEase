package com.rentease.modules.maintenance.controller;

import com.rentease.common.ApiResponse;
import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.exception.ForbiddenException;
import com.rentease.modules.maintenance.dto.MaintenanceAssignRequest;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResolveRequest;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.dto.MaintenanceScheduleRequest;
import com.rentease.modules.maintenance.dto.TechnicianSummaryResponse;
import com.rentease.modules.maintenance.service.MaintenanceService;
import com.rentease.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponse>> createRequest(
            @Valid @RequestBody MaintenanceRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MaintenanceResponse response = maintenanceService.createRequest(
                request,
                userDetails.getId(),
                hasRole(userDetails, "ADMIN")
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Maintenance request created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> getById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MaintenanceResponse response = maintenanceService.getById(id);
        enforceRequestVisibility(response, userDetails);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> updateStatus(
            @PathVariable String id,
            @RequestParam MaintenanceStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN")) {
            throw new ForbiddenException("Only admins can update maintenance status directly");
        }
        MaintenanceResponse response = maintenanceService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Status updated"));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByProperty(
            @PathVariable String propertyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN") && !hasRole(userDetails, "OWNER")) {
            throw new ForbiddenException("Only admins or owners can access property maintenance queues");
        }
        if (hasRole(userDetails, "OWNER") && !maintenanceService.userOwnsProperty(userDetails.getId(), propertyId)) {
            throw new ForbiddenException("Owners can only access maintenance requests for their own properties");
        }
        List<MaintenanceResponse> requests = maintenanceService.getByProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByTenant(
            @PathVariable String tenantId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN") && !userDetails.getId().equals(tenantId)) {
            throw new ForbiddenException("Tenants can only access their own maintenance requests");
        }
        List<MaintenanceResponse> requests = maintenanceService.getByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByTechnician(
            @PathVariable String technicianId,
            @RequestParam(required = false) MaintenanceStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN") && !userDetails.getId().equals(technicianId)) {
            throw new ForbiddenException("Technicians can only access their own assigned requests");
        }
        List<MaintenanceResponse> requests = maintenanceService.getByTechnician(technicianId, status);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByOwner(
            @PathVariable String ownerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN") && !userDetails.getId().equals(ownerId)) {
            throw new ForbiddenException("Owners can only view maintenance requests for their own properties");
        }
        List<MaintenanceResponse> requests = maintenanceService.getByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/admin/queue")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getAdminQueue(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String technicianId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireAdmin(userDetails);
        List<MaintenanceResponse> queue = maintenanceService.getAdminQueue(status, priority, technicianId);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody MaintenanceAssignRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireAdmin(userDetails);
        MaintenanceResponse response = maintenanceService.assignTechnician(id, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Technician assigned"));
    }

    @PatchMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> scheduleRequest(
            @PathVariable String id,
            @Valid @RequestBody MaintenanceScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireAdmin(userDetails);
        MaintenanceResponse response = maintenanceService.scheduleRequest(id, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Schedule updated"));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> acceptRequest(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireTechnician(userDetails);
        MaintenanceResponse response = maintenanceService.acceptRequest(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Request accepted"));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> startRequest(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireTechnician(userDetails);
        MaintenanceResponse response = maintenanceService.startRequest(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Work started"));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> resolveRequest(
            @PathVariable String id,
            @Valid @RequestBody MaintenanceResolveRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireTechnician(userDetails);
        MaintenanceResponse response = maintenanceService.resolveRequest(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Request resolved"));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> closeRequest(
            @PathVariable String id,
            @RequestParam(required = false) String adminNote,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireAdmin(userDetails);
        MaintenanceResponse response = maintenanceService.closeRequest(id, userDetails.getId(), adminNote);
        return ResponseEntity.ok(ApiResponse.success(response, "Request closed"));
    }

    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<TechnicianSummaryResponse>>> getTechnicians(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        requireAdmin(userDetails);
        List<TechnicianSummaryResponse> technicians = maintenanceService.getTechnicians();
        return ResponseEntity.ok(ApiResponse.success(technicians));
    }

    private void requireAdmin(CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "ADMIN")) {
            throw new ForbiddenException("Admin access required");
        }
    }

    private void requireTechnician(CustomUserDetails userDetails) {
        if (!hasRole(userDetails, "TECHNICIAN")) {
            throw new ForbiddenException("Technician access required");
        }
    }

    private boolean hasRole(CustomUserDetails userDetails, String role) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_" + role));
    }

    private void enforceRequestVisibility(MaintenanceResponse response, CustomUserDetails userDetails) {
        if (hasRole(userDetails, "ADMIN")) {
            return;
        }
        if (hasRole(userDetails, "TENANT") && userDetails.getId().equals(response.getTenantId())) {
            return;
        }
        if (hasRole(userDetails, "TECHNICIAN") && userDetails.getId().equals(response.getAssignedTechnicianId())) {
            return;
        }
        if (hasRole(userDetails, "OWNER") && maintenanceService.userOwnsProperty(userDetails.getId(), response.getPropertyId())) {
            return;
        }
        throw new ForbiddenException("You are not allowed to access this maintenance request");
    }
}
