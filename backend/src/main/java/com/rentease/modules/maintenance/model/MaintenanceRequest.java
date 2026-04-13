package com.rentease.modules.maintenance.model;

import com.rentease.common.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
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

    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.REPORTED;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
