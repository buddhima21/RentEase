package com.rentease.modules.agreement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Tenant creates an agreement for an already approved (allocated) booking.
 * Tenant, owner, and property are resolved from the booking — do not trust client-supplied ids.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAgreementRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    /** Optional; defaults to the booking's monthly rent when omitted or zero. */
    private Double rentAmount;

    private String rulesNotes;
}
