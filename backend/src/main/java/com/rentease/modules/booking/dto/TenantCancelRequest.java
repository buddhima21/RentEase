package com.rentease.modules.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantCancelRequest {
    @NotBlank(message = "Tenant ID is required")
    private String tenantId;
    
    private String reason;
}
