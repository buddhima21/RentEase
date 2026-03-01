package com.rentease.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequestDTO {

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String priority;
    private List<String> imageUrls;
}
