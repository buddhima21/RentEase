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
}
