package com.rentease.modules.agreement.model;

import com.rentease.common.enums.AgreementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Digital rental agreement linked to an approved booking, tenant, owner, and property.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "agreements")
public class Agreement {

    @Id
    private String id;

    /** Human-readable unique id, e.g. AGR-2026-0001 */
    @Indexed(unique = true)
    private String agreementNumber;

    @Indexed
    private String bookingId;

    @Indexed
    private String tenantId;

    @Indexed
    private String ownerId;

    @Indexed
    private String propertyId;

    private LocalDate startDate;
    private LocalDate endDate;

    /** Whole months between start and end (minimum 1 when valid). */
    private int durationMonths;

    private double rentAmount;

    /** Additional rules / notes agreed for this contract (tenant-supplied). */
    private String rulesNotes;

    /** Copy of property terms at creation time (for PDF and audit). */
    private String propertyTermsSnapshot;

    @Builder.Default
    private AgreementStatus status = AgreementStatus.ACTIVE;

    /** Set when status becomes TERMINATED: remainingMonths * rentAmount * 0.5 */
    private Double earlyTerminationPenalty;

    private LocalDateTime terminatedAt;
    private String terminationReason;

    /** 7-day renewal / expiry reminder email sent */
    @Builder.Default
    private boolean reminderSevenDaySent = false;

    @Builder.Default
    private boolean signedByTenant = false;

    @Builder.Default
    private boolean signedByOwner = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
