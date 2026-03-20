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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.rentease.agreements.domain.AgreementStatus;
import com.rentease.agreements.dto.AgreementEmailRequest;
import com.rentease.agreements.dto.BookingAgreementDetailsResponse;
import com.rentease.agreements.email.AgreementEmailService;
import com.rentease.agreements.mapping.AgreementResponseMapper;
//import com.rentease.agreements.number.AgreementNumberGenerator;
import com.rentease.agreements.penalty.EarlyTerminationPenaltyCalculator;
import com.rentease.agreements.pdf.AgreementPdfGenerator;
import com.rentease.agreements.status.AgreementStatusService;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.agreement.repository.AgreementRepository;

@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;
    private final AgreementRepository agreementRepository;
    private final AgreementStatusService statusService;
    private final EarlyTerminationPenaltyCalculator penaltyCalculator;
    private final AgreementPdfGenerator pdfGenerator;
    private final AgreementEmailService emailService;
    private final AgreementResponseMapper responseMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<AgreementResponse>> createAgreement(
            @Valid @RequestBody AgreementRequest request) {
        AgreementResponse response = agreementService.createAgreement(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Agreement created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(agreementService.getAll()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> getByBooking(
            @PathVariable String bookingId) {
        List<AgreementResponse> agreements = agreementService.getByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(agreements));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AgreementResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(agreementService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AgreementResponse>> updateAgreement(
            @PathVariable String id,
            @Valid @RequestBody AgreementRequest request,
            @RequestParam(name = "status", required = false) AgreementStatus status
    ) {
        AgreementResponse response = agreementService.updateAgreement(id, request, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Agreement updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgreement(@PathVariable String id) {
        agreementService.deleteAgreement(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Agreement deleted"));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> getExpiring(
            @RequestParam(name = "days", defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(ApiResponse.success(agreementService.getExpiringWithinDays(days)));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<BookingAgreementDetailsResponse>> getDetails(
            @PathVariable String id,
            @RequestParam(name = "terminated", defaultValue = "false") boolean terminated,
            @RequestParam(name = "terminationDate", required = false) LocalDate terminationDate
    ) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found with id: " + id));

        String number = agreement.getAgreementNumber() != null ? agreement.getAgreementNumber() : agreement.getId();
        AgreementStatus status = statusService.determineStatus(agreement, LocalDate.now(), terminated);

        BigDecimal penalty = BigDecimal.ZERO;
        if (terminationDate != null) {
            penalty = penaltyCalculator.calculatePenalty(agreement, terminationDate);
        }

        AgreementResponse response = responseMapper.toResponse(agreement);

        BookingAgreementDetailsResponse details = BookingAgreementDetailsResponse.builder()
                .agreement(response)
                .agreementNumber(number)
                .status(status)
                .earlyTerminationPenalty(penalty)
                .build();

        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> getExpiredAgreements() {
        List<Agreement> expired = statusService.findExpiredAgreements(LocalDate.now());
        List<AgreementResponse> responses = expired.stream()
                .map(responseMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found with id: " + id));

        String number = agreement.getAgreementNumber() != null ? agreement.getAgreementNumber() : agreement.getId();
        byte[] pdfBytes = pdfGenerator.generatePdfBytes(agreement, number);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "agreement-" + number + ".pdf";
        headers.setContentDispositionFormData(filename, filename);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/{id}/email")
    public ResponseEntity<ApiResponse<Void>> emailAgreement(
            @PathVariable String id,
            @RequestBody AgreementEmailRequest request
    ) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found with id: " + id));

        String number = agreement.getAgreementNumber() != null ? agreement.getAgreementNumber() : agreement.getId();
        byte[] pdfBytes = pdfGenerator.generatePdfBytes(agreement, number);
        emailService.sendAgreementEmail(request.getToEmail(), agreement, number, pdfBytes);

        return ResponseEntity.ok(ApiResponse.success(null, "Agreement email triggered"));
    }
}
