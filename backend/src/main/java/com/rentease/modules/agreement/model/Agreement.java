package com.rentease.modules.agreement.model;

import com.rentease.agreements.domain.AgreementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "agreements")
public class Agreement {

    @Id
    private String id;

    private String agreementNumber;

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

    @Builder.Default
    private AgreementStatus status = AgreementStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt;
}
