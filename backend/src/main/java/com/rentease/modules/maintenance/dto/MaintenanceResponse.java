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
    private String priority;
    private List<String> imageUrls;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
