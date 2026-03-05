package com.rentease.modules.payment.dto;

import com.rentease.common.enums.PaymentStatus;
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
public class PaymentResponse {

    private String id;
    private String bookingId;
    private String tenantId;
    private String ownerId;
    private double amount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private PaymentStatus status;
    private LocalDateTime createdAt;
}
