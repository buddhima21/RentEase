package com.rentease.modules.maintenance.dto;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.modules.maintenance.model.MaintenanceWorkflowEvent;
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
    private LocalDateTime preferredAt;

    private String assignedTechnicianId;
    private String assignedByAdminId;
    private LocalDateTime assignedAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private MaintenanceStatus pausedFromStatus;
    private LocalDateTime resolvedAt;
    private LocalDateTime slaDueAt;
    private LocalDateTime closureDueAt;
    private LocalDateTime closedAt;

    private String adminNotes;
    private String technicianNotes;
    private List<String> partsUsed;
    private String completionSummary;
    private List<String> completionImageUrls;
    private LocalDateTime mediaArchivedAt;
    private List<MaintenanceWorkflowEvent> workflowEvents;

    private String tenantName;
    private String tenantEmail;
    private String tenantPhone;
    private String technicianName;
    private String technicianEmail;
    private String technicianPhone;

    private MaintenanceStatus status;
    private Boolean overdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
