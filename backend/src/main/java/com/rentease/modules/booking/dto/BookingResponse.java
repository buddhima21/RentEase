package com.rentease.modules.booking.dto;

import com.rentease.common.enums.BookingStatus;
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
public class BookingResponse {

    private String id;
    private String propertyId;
    private String tenantId;
    private String ownerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private double monthlyRent;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Cancellation Reason
    private String cancellationReason;

    // Enriched property details
    private String propertyTitle;
    private String propertyCity;
    private String propertyType;
    private int propertyBedrooms;
    private double propertyPrice;
    private String propertyAddress;
    private String propertyImageUrl;

    // Enriched tenant details (visible to owner)
    private String tenantName;
    private String tenantEmail;
    private String tenantPhone;
}

