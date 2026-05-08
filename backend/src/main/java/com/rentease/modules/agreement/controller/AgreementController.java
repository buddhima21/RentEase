package com.rentease.modules.agreement.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.agreement.dto.AgreementResponse;
import com.rentease.modules.agreement.dto.CreateAgreementRequest;
import com.rentease.modules.agreement.dto.EarlyTerminateRequest;
import com.rentease.exception.UnauthorizedException;
import com.rentease.modules.agreement.service.AgreementService;
import com.rentease.modules.booking.dto.BookingResponse;
import com.rentease.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Authenticated REST API for rental agreements.
 *
 * <p>New endpoints added for the auto-creation workflow:
 * <ul>
 *   <li>PATCH /{id}/accept — tenant accepts a PENDING agreement</li>
 *   <li>PATCH /{id}/reject — tenant rejects a PENDING agreement</li>
 *   <li>GET  /booking/{bookingId} — fetch the agreement linked to a specific booking</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;

    // ── Existing endpoints (unchanged) ──────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<AgreementResponse>> createAgreement(
            @Valid @RequestBody CreateAgreementRequest request) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.createAgreement(request, user.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Agreement created and emailed when mail is configured"));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> listForTenant(
            @PathVariable String tenantId) {
        CustomUserDetails user = requireUser();
        List<AgreementResponse> list = agreementService.listForTenant(tenantId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<AgreementResponse>>> listForOwner(
            @PathVariable String ownerId) {
        CustomUserDetails user = requireUser();
        List<AgreementResponse> list = agreementService.listForOwner(ownerId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Approved bookings for this tenant that do not yet have an active agreement */
    @GetMapping("/eligible-bookings/{tenantId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> eligibleBookings(
            @PathVariable String tenantId) {
        CustomUserDetails user = requireUser();
        List<BookingResponse> list = agreementService.listEligibleBookings(tenantId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AgreementResponse>> getById(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.getById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        byte[] pdf = agreementService.getPdfBytes(id, user.getId());
        String filename = "agreement-" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // ── Early Termination Two-Step Workflow ───────────────────────────────

    /**
     * Tenant requests early termination (or Owner terminates immediately).
     */
    @PatchMapping("/{id}/terminate")
    public ResponseEntity<ApiResponse<AgreementResponse>> terminateEarly(
            @PathVariable String id,
            @RequestBody(required = false) EarlyTerminateRequest body) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.terminateEarly(id, body, user.getId());
        String msg = user.getId().equals(response.getTenantId()) 
                ? "Early termination requested. Awaiting owner approval."
                : "Agreement terminated early.";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }

    /**
     * Owner accepts early termination request.
     */
    @PatchMapping("/{id}/terminate/accept")
    public ResponseEntity<ApiResponse<AgreementResponse>> acceptTermination(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.acceptEarlyTermination(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Early termination accepted. Status is now TERMINATED."));
    }

    /**
     * Owner rejects early termination request.
     */
    @PatchMapping("/{id}/terminate/reject")
    public ResponseEntity<ApiResponse<AgreementResponse>> rejectTermination(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.rejectEarlyTermination(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Early termination rejected. Agreement continues as ACTIVE."));
    }

    // ── New endpoints for auto-creation workflow ────────────────────────────

    /**
     * Tenant accepts a PENDING agreement.
     * If ownerApproved is already true, status transitions to ACTIVE.
     */
    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<AgreementResponse>> acceptAgreement(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.tenantAcceptAgreement(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Agreement accepted. Status is now ACTIVE."));
    }

    /**
     * Tenant rejects a PENDING agreement → status becomes CANCELLED.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AgreementResponse>> rejectAgreement(@PathVariable String id) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.tenantRejectAgreement(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Agreement rejected and cancelled."));
    }

    /**
     * Fetch the agreement linked to a specific booking.
     * Accessible by the tenant or owner of that booking.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<AgreementResponse>> getByBookingId(
            @PathVariable String bookingId) {
        CustomUserDetails user = requireUser();
        AgreementResponse response = agreementService.getByBookingId(bookingId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    private CustomUserDetails requireUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("Authentication required");
        }
        return (CustomUserDetails) auth.getPrincipal();
    }
}
