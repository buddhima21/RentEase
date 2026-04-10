package com.rentease.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantPropertyResponse {
    private String tenantId;
    private String tenantName;
    private String tenantEmail;
    private String propertyId;
    private String propertyTitle;
    private double rentalFee;
}
