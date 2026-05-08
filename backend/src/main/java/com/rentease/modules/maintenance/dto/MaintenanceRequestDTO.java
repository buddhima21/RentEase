package com.rentease.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class MaintenanceRequestDTO {

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private LocalDateTime preferredAt;

    @NotBlank(message = "Priority is required")
    private String priority;

    @Size(max = 5, message = "A maximum of 5 images is allowed")
    private List<String> imageUrls;
}
