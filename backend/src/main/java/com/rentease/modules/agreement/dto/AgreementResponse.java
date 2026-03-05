package com.rentease.modules.agreement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgreementResponse {

    private String id;
    private String bookingId;
    private String tenantId;
    private String ownerId;
    private String propertyId;
    private LocalDate startDate;
    private LocalDate endDate;
    private double monthlyRent;
    private String terms;
    private boolean signedByTenant;
    private boolean signedByOwner;
    private LocalDateTime createdAt;
}
