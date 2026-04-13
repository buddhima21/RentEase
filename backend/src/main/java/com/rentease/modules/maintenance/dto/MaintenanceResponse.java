package com.rentease.modules.maintenance.dto;

import com.rentease.common.enums.MaintenanceStatus;
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
public class MaintenanceResponse {

    private String id;
    private String propertyId;
    private String tenantId;
    private String title;
    private String description;
    private String serviceType;
    private String priority;
    private List<String> imageUrls;

    private String assignedTechnicianId;
    private String assignedByAdminId;
    private LocalDateTime assignedAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    private String adminNotes;
    private String technicianNotes;
    private String completionSummary;
    private List<String> completionImageUrls;

    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
