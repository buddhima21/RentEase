package com.rentease.modules.agreement.dto;

import com.rentease.common.enums.AgreementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for AgreementController.
 * Includes all agreement fields plus enriched property/tenant info for UI.
 */
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

    /** Security deposit amount */
    private double deposit;

    /** Day of month rent payment is due */
    private int paymentDueDate;

    private String rulesNotes;
    private String propertyTermsSnapshot;

    private AgreementStatus status;

    /** True when the owner has approved — always true for auto-created agreements */
    private boolean ownerApproved;

    /** True when the tenant has explicitly accepted the agreement */
    private boolean tenantApproved;

    private Double earlyTerminationPenalty;
    private LocalDateTime terminatedAt;
    private String terminationReason;

    private boolean reminderSevenDaySent;
    private boolean signedByTenant;
    private boolean signedByOwner;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enriched (optional) for UI display
    private String propertyTitle;
    private String propertyAddress;
    private String tenantName;
    private String tenantEmail;
}
