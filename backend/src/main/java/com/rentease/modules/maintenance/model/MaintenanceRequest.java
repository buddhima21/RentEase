package com.rentease.modules.maintenance.model;

import com.rentease.common.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "maintenance_requests")
public class MaintenanceRequest {

    @Id
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

    @Builder.Default
    private List<MaintenanceWorkflowEvent> workflowEvents = new ArrayList<>();

    @Version
    private Long version;

    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.REPORTED;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
