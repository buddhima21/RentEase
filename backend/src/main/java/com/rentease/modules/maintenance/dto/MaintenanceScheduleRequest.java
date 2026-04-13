package com.rentease.modules.maintenance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleRequest {

    @NotNull(message = "Scheduled date and time is required")
    private LocalDateTime scheduledAt;

    private String adminNotes;
}
