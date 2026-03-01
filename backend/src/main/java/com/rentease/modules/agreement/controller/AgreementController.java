package com.rentease.modules.agreement.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.agreement.dto.AgreementRequest;
import com.rentease.modules.agreement.dto.AgreementResponse;
import com.rentease.modules.agreement.service.AgreementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;

    @PostMapping
    public ResponseEntity<ApiResponse<AgreementResponse>> createAgreement(
            @Valid @RequestBody AgreementRequest request) {
        AgreementResponse response = agreementService.createAgreement(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Agreement created"));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> getByBooking(
            @PathVariable String bookingId) {
        List<AgreementResponse> agreements = agreementService.getByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(agreements));
    }
}
