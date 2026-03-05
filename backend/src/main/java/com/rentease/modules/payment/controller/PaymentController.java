package com.rentease.modules.payment.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.payment.dto.PaymentResponse;
import com.rentease.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/due/{tenantId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getDuePayments(
            @PathVariable String tenantId) {
        List<PaymentResponse> payments = paymentService.getDuePayments(tenantId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/history/{tenantId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory(
            @PathVariable String tenantId) {
        List<PaymentResponse> payments = paymentService.getPaymentHistory(tenantId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}
