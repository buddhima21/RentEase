package com.rentease.modules.maintenance.model;

import com.rentease.common.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceWorkflowEvent {

    private String action;
    private String actorId;
    private MaintenanceStatus fromStatus;
    private MaintenanceStatus toStatus;
    private String note;
    private LocalDateTime occurredAt;
}
