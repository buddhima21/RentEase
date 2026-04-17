package com.rentease.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceAssignRequest {

    @NotBlank(message = "Technician ID is required")
    private String technicianId;

    private LocalDateTime scheduledAt;
    private String adminNotes;
}
