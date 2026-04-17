package com.rentease.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResolveRequest {

    @NotBlank(message = "Completion summary is required")
    @Size(max = 2000, message = "Completion summary cannot exceed 2000 characters")
    private String completionSummary;

    @Size(max = 2000, message = "Technician notes cannot exceed 2000 characters")
    private String technicianNotes;

    @Size(max = 5, message = "A maximum of 5 completion images is allowed")
    private List<String> completionImageUrls;
}
