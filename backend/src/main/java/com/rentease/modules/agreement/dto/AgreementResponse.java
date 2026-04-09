package com.rentease.modules.agreement.dto;

import com.rentease.common.enums.AgreementStatus;
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
    private String agreementNumber;
    private String bookingId;
    private String tenantId;
    private String ownerId;
    private String propertyId;

    private LocalDate startDate;
    private LocalDate endDate;
    private int durationMonths;
    private double rentAmount;
    private String rulesNotes;
    private String propertyTermsSnapshot;

    private AgreementStatus status;
    private Double earlyTerminationPenalty;
    private LocalDateTime terminatedAt;
    private String terminationReason;

    private boolean reminderSevenDaySent;
    private boolean signedByTenant;
    private boolean signedByOwner;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enriched (optional) for UI
    private String propertyTitle;
    private String propertyAddress;
    private String tenantName;
    private String tenantEmail;
}
