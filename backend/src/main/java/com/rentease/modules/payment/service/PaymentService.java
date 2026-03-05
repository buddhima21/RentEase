package com.rentease.modules.payment.service;

import com.rentease.common.enums.PaymentStatus;
import com.rentease.modules.payment.dto.PaymentResponse;
import com.rentease.modules.payment.model.Payment;
import com.rentease.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<PaymentResponse> getDuePayments(String tenantId) {
        return paymentRepository.findByTenantIdAndStatus(tenantId, PaymentStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentHistory(String tenantId) {
        return paymentRepository.findByTenantId(tenantId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .tenantId(payment.getTenantId())
                .ownerId(payment.getOwnerId())
                .amount(payment.getAmount())
                .dueDate(payment.getDueDate())
                .paidDate(payment.getPaidDate())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
