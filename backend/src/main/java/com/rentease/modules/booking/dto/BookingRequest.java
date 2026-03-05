package com.rentease.modules.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Owner ID is required")
    private String ownerId;

    private LocalDate startDate;
    private LocalDate endDate;

    @Positive(message = "Monthly rent must be positive")
    private double monthlyRent;
}
