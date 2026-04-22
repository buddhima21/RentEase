package com.rentease.modules.booking.model;

import com.rentease.common.enums.BookingStatus;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String propertyId;
    @Indexed
    private String tenantId;
    @Indexed
    private String ownerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private double monthlyRent;

    private String cancellationReason;

    @Indexed
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

