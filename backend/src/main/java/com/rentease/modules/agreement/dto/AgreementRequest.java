package com.rentease.modules.agreement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgreementRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Owner ID is required")
    private String ownerId;

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    private LocalDate startDate;
    private LocalDate endDate;
    private double monthlyRent;
    private String terms;
}
