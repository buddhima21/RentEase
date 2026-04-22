package com.rentease.modules.agreement.service;

import com.rentease.common.enums.AgreementStatus;
import com.rentease.common.enums.BookingStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ForbiddenException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.agreement.dto.AgreementResponse;
import com.rentease.modules.agreement.dto.CreateAgreementRequest;
import com.rentease.modules.agreement.dto.EarlyTerminateRequest;
import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.agreement.repository.AgreementRepository;
import com.rentease.modules.booking.dto.BookingResponse;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.booking.service.BookingService;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Rental agreement lifecycle service.
 *
 * <p>Key workflow:
 * <ol>
 *   <li>Owner approves a booking → {@link #createAgreementFromBooking} is called automatically</li>
 *   <li>Agreement created with status {@code PENDING} and {@code ownerApproved=true}</li>
 *   <li>Tenant accepts → {@link #tenantAcceptAgreement} → status becomes {@code ACTIVE}</li>
 *   <li>Tenant rejects → {@link #tenantRejectAgreement} → status becomes {@code CANCELLED}</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementService {

    private static final List<BookingStatus> APPROVED_FOR_AGREEMENT =
            Arrays.asList(BookingStatus.APPROVED, BookingStatus.ALLOCATED);

    private final AgreementRepository agreementRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final AgreementPdfService agreementPdfService;
    private final AgreementEmailService agreementEmailService;

    // ── Auto-creation (called by BookingService on owner approval) ──────────

    /**
     * Automatically creates a PENDING agreement when an owner approves a booking.
     * Called internally from BookingService — no authentication check needed here
     * because the booking approval endpoint already validates owner identity.
     *
     * @param booking the just-approved booking (status already set to ALLOCATED)
     */
    @Transactional
    public void createAgreementFromBooking(Booking booking) {
        // Guard: skip if an agreement already exists for this booking
        if (agreementRepository.existsByBookingId(booking.getId())) {
            log.info("Agreement already exists for booking {} — skipping auto-creation", booking.getId());
            return;
        }

        Property property = propertyRepository.findById(booking.getPropertyId())
                .orElse(null);

        String termsSnapshot = (property != null && property.getTermsAndConditions() != null)
                ? property.getTermsAndConditions() : "";

        LocalDate start = booking.getStartDate() != null ? booking.getStartDate() : LocalDate.now();
        LocalDate end = booking.getEndDate() != null ? booking.getEndDate() : start.plusMonths(12);
        int durationMonths = computeDurationMonths(start, end);

        Agreement agreement = Agreement.builder()
                .agreementNumber(nextAgreementNumber())
                .bookingId(booking.getId())
                .tenantId(booking.getTenantId())
                .ownerId(booking.getOwnerId())
                .propertyId(booking.getPropertyId())
                .startDate(start)
                .endDate(end)
                .durationMonths(durationMonths)
                .rentAmount(booking.getMonthlyRent())
                .deposit(0)                           // default deposit — tenant/owner can negotiate
                .paymentDueDate(1)                    // default: 1st of each month
                .propertyTermsSnapshot(termsSnapshot)
                .status(AgreementStatus.PENDING)      // awaiting tenant decision
                .ownerApproved(true)                  // owner approved by definition
                .tenantApproved(false)
                .build();

        Agreement saved = agreementRepository.save(agreement);
        log.info("Auto-created agreement {} (PENDING) for booking {}", saved.getAgreementNumber(), booking.getId());

        // Send the generated agreement PDF to the tenant with the owner as the sender
        try {
            User tenant = userRepository.findById(saved.getTenantId()).orElse(null);
            User owner = userRepository.findById(saved.getOwnerId()).orElse(null);
            
            if (tenant != null && owner != null && property != null) {
                byte[] pdfBytes = agreementPdfService.buildPdf(saved, property, tenant, owner);
                agreementEmailService.sendAgreementCreatedEmail(owner, tenant, saved, pdfBytes);
            } else {
                log.warn("Missing user/property details; skipping agreement email for {}", saved.getAgreementNumber());
            }
        } catch (Exception e) {
            log.warn("Could not send agreement notification email for {}: {}", saved.getAgreementNumber(), e.getMessage());
        }
    }

    // ── Tenant Accept / Reject ───────────────────────────────────────────────

    /**
     * Tenant accepts the PENDING agreement.
     * Sets {@code tenantApproved=true}; if {@code ownerApproved} is already true, status → ACTIVE.
     *
     * @param agreementId      the agreement to accept
     * @param authenticatedId  the authenticated user's ID (must be the tenant)
     * @return updated AgreementResponse
     */
    @Transactional
    public AgreementResponse tenantAcceptAgreement(String agreementId, String authenticatedId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));

        // Only the tenant of this agreement can accept it
        if (!agreement.getTenantId().equals(authenticatedId)) {
            throw new ForbiddenException("Only the tenant of this agreement can accept it");
        }
        if (agreement.getStatus() != AgreementStatus.PENDING) {
            throw new BadRequestException("Only PENDING agreements can be accepted (current status: "
                    + agreement.getStatus() + ")");
        }

        agreement.setTenantApproved(true);

        // If owner has also approved → activate the agreement
        if (agreement.isOwnerApproved()) {
            agreement.setStatus(AgreementStatus.ACTIVE);
            log.info("Agreement {} is now ACTIVE (both parties accepted)", agreement.getAgreementNumber());
        }

        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    /**
     * Tenant rejects the PENDING agreement → status becomes CANCELLED.
     *
     * @param agreementId     the agreement to reject
     * @param authenticatedId the authenticated user's ID (must be the tenant)
     * @return updated AgreementResponse
     */
    @Transactional
    public AgreementResponse tenantRejectAgreement(String agreementId, String authenticatedId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));

        if (!agreement.getTenantId().equals(authenticatedId)) {
            throw new ForbiddenException("Only the tenant of this agreement can reject it");
        }
        if (agreement.getStatus() != AgreementStatus.PENDING) {
            throw new BadRequestException("Only PENDING agreements can be rejected (current status: "
                    + agreement.getStatus() + ")");
        }

        agreement.setTenantApproved(false);
        agreement.setStatus(AgreementStatus.CANCELLED);
        log.info("Agreement {} CANCELLED by tenant", agreement.getAgreementNumber());

        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    // ── Fetch by booking ID (for owner "View Agreement" link) ────────────────

    /**
     * Returns the first agreement linked to a booking, visible to either party.
     *
     * @param bookingId       the booking whose agreement to retrieve
     * @param authenticatedId must be tenant or owner of that booking
     * @return AgreementResponse or throws if not found / not authorised
     */
    public AgreementResponse getByBookingId(String bookingId, String authenticatedId) {
        List<Agreement> agreements = agreementRepository.findByBookingId(bookingId);
        if (agreements.isEmpty()) {
            throw new ResourceNotFoundException("Agreement", "bookingId", bookingId);
        }
        Agreement agreement = agreements.get(0);
        assertParticipant(agreement, authenticatedId);
        return refreshAndMap(agreement);
    }

    // ── Existing methods (unchanged) ────────────────────────────────────────

    /**
     * Manual creation by tenant (kept for backward compatibility).
     * Only allowed after owner has approved the booking.
     */
    @Transactional
    public AgreementResponse createAgreement(CreateAgreementRequest request, String authenticatedTenantId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getTenantId().equals(authenticatedTenantId)) {
            throw new ForbiddenException("You can only create agreements for your own bookings");
        }

        if (!APPROVED_FOR_AGREEMENT.contains(booking.getStatus())) {
            throw new BadRequestException("An agreement can only be created after the owner has approved the booking");
        }

        if (agreementRepository.existsByBookingIdAndStatus(booking.getId(), AgreementStatus.ACTIVE)) {
            throw new BadRequestException("An active agreement already exists for this booking");
        }

        LocalDate today = LocalDate.now();
        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();

        if (start == null || end == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (start.isBefore(today)) {
            throw new BadRequestException("Start date cannot be in the past");
        }
        if (!end.isAfter(start)) {
            throw new BadRequestException("End date must be after start date");
        }
        if (end.isBefore(today)) {
            throw new BadRequestException("End date cannot be in the past");
        }

        double rent = request.getRentAmount() != null && request.getRentAmount() > 0
                ? request.getRentAmount()
                : booking.getMonthlyRent();
        if (rent <= 0) {
            throw new BadRequestException("Rent amount must be positive");
        }

        Property property = propertyRepository.findById(booking.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", booking.getPropertyId()));

        if (!property.getOwnerId().equals(booking.getOwnerId())) {
            throw new BadRequestException("Booking owner does not match property owner");
        }

        int durationMonths = computeDurationMonths(start, end);
        String termsSnapshot = property.getTermsAndConditions() != null ? property.getTermsAndConditions() : "";

        Agreement agreement = Agreement.builder()
                .agreementNumber(nextAgreementNumber())
                .bookingId(booking.getId())
                .tenantId(booking.getTenantId())
                .ownerId(booking.getOwnerId())
                .propertyId(booking.getPropertyId())
                .startDate(start)
                .endDate(end)
                .durationMonths(durationMonths)
                .rentAmount(rent)
                .rulesNotes(request.getRulesNotes())
                .propertyTermsSnapshot(termsSnapshot)
                .status(AgreementStatus.ACTIVE)       // manual creation → directly ACTIVE (legacy)
                .ownerApproved(true)
                .tenantApproved(true)
                .build();

        Agreement saved = agreementRepository.save(agreement);

        try {
            User tenant = userRepository.findById(saved.getTenantId()).orElse(null);
            User owner = userRepository.findById(saved.getOwnerId()).orElse(null);
            byte[] pdf = agreementPdfService.buildPdf(saved, property, tenant, owner);
            agreementEmailService.sendAgreementPdfAttachment(tenant, saved, pdf);
        } catch (Exception e) {
            log.warn("Post-create PDF/email step failed for {}: {}", saved.getAgreementNumber(), e.getMessage());
        }

        return mapToResponse(saved);
    }

    public List<AgreementResponse> listForTenant(String tenantId, String authenticatedUserId) {
        if (!tenantId.equals(authenticatedUserId)) {
            throw new ForbiddenException("You can only view your own agreements");
        }
        return agreementRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::refreshAndMap)
                .collect(Collectors.toList());
    }

    public List<AgreementResponse> listForOwner(String ownerId, String authenticatedUserId) {
        if (!ownerId.equals(authenticatedUserId)) {
            throw new ForbiddenException("You can only view agreements for your own properties");
        }
        return agreementRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(this::refreshAndMap)
                .collect(Collectors.toList());
    }

    public AgreementResponse getById(String agreementId, String authenticatedUserId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
        assertParticipant(agreement, authenticatedUserId);
        return refreshAndMap(agreement);
    }

    public byte[] getPdfBytes(String agreementId, String authenticatedUserId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
        assertParticipant(agreement, authenticatedUserId);
        agreement = refreshStatusIfNeeded(agreement);

        Property property = propertyRepository.findById(agreement.getPropertyId()).orElse(null);
        User tenant = userRepository.findById(agreement.getTenantId()).orElse(null);
        User owner = userRepository.findById(agreement.getOwnerId()).orElse(null);
        return agreementPdfService.buildPdf(agreement, property, tenant, owner);
    }

    @Transactional
    public AgreementResponse terminateEarly(String agreementId, EarlyTerminateRequest body, String authenticatedUserId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
        assertParticipant(agreement, authenticatedUserId);

        agreement = refreshStatusIfNeeded(agreement);
        if (agreement.getStatus() != AgreementStatus.ACTIVE) {
            throw new BadRequestException("Only active agreements can be terminated early");
        }
        LocalDate today = LocalDate.now();
        if (!agreement.getEndDate().isAfter(today)) {
            throw new BadRequestException("Agreement has already reached its end date");
        }

        String reason = body != null ? body.getReason() : null;

        // If the tenant is requesting, it must go to the owner for approval
        if (authenticatedUserId.equals(agreement.getTenantId())) {
            agreement.setStatus(AgreementStatus.TERMINATION_REQUESTED);
            agreement.setTerminationReason(reason);
            // DO NOT calculate penalty yet; wait for owner approval
            log.info("Tenant requested early termination for agreement {}", agreement.getAgreementNumber());
        } else {
            // Owner is terminating directly
            if (reason == null || reason.trim().isEmpty()) {
                throw new BadRequestException("Owners must provide a reason to terminate an agreement early.");
            }
            long remainingMonths = ChronoUnit.MONTHS.between(today, agreement.getEndDate());
            if (remainingMonths < 0) remainingMonths = 0;
            double penalty = remainingMonths * agreement.getRentAmount() * 0.5;

            agreement.setStatus(AgreementStatus.TERMINATED);
            agreement.setEarlyTerminationPenalty(penalty);
            agreement.setTerminatedAt(LocalDateTime.now());
            agreement.setTerminationReason(reason);
            log.info("Owner immediately terminated agreement {}", agreement.getAgreementNumber());
        }

        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    /**
     * Owner accepts a tenant's early termination request.
     */
    @Transactional
    public AgreementResponse acceptEarlyTermination(String agreementId, String authenticatedId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
        
        if (!agreement.getOwnerId().equals(authenticatedId)) {
            throw new ForbiddenException("Only the owner can accept an early termination request");
        }
        if (agreement.getStatus() != AgreementStatus.TERMINATION_REQUESTED) {
            throw new BadRequestException("Agreement does not have a pending termination request");
        }

        LocalDate today = LocalDate.now();
        long remainingMonths = ChronoUnit.MONTHS.between(today, agreement.getEndDate());
        if (remainingMonths < 0) remainingMonths = 0;
        double penalty = remainingMonths * agreement.getRentAmount() * 0.5;

        agreement.setStatus(AgreementStatus.TERMINATED);
        agreement.setEarlyTerminationPenalty(penalty);
        agreement.setTerminatedAt(LocalDateTime.now());

        log.info("Owner accepted early termination for agreement {}", agreement.getAgreementNumber());
        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    /**
     * Owner rejects a tenant's early termination request.
     */
    @Transactional
    public AgreementResponse rejectEarlyTermination(String agreementId, String authenticatedId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
        
        if (!agreement.getOwnerId().equals(authenticatedId)) {
            throw new ForbiddenException("Only the owner can reject an early termination request");
        }
        if (agreement.getStatus() != AgreementStatus.TERMINATION_REQUESTED) {
            throw new BadRequestException("Agreement does not have a pending termination request");
        }

        agreement.setStatus(AgreementStatus.ACTIVE);
        agreement.setTerminationReason(null); // Clear the reason

        log.info("Owner rejected early termination for agreement {}", agreement.getAgreementNumber());
        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    /**
     * Bookings that are owner-approved and do not already have an {@link AgreementStatus#ACTIVE} agreement.
     */
    public List<BookingResponse> listEligibleBookings(String tenantId, String authenticatedUserId) {
        if (!tenantId.equals(authenticatedUserId)) {
            throw new ForbiddenException("You can only view your own eligible bookings");
        }
        return bookingService.getBookingsByTenant(tenantId).stream()
                .filter(b -> APPROVED_FOR_AGREEMENT.contains(b.getStatus()))
                .filter(b -> !agreementRepository.existsByBookingIdAndStatus(b.getId(), AgreementStatus.ACTIVE))
                .collect(Collectors.toList());
    }

    /** Daily job: mark overdue active agreements as EXPIRED. */
    @Transactional
    public int markExpiredAgreements() {
        LocalDate today = LocalDate.now();
        List<Agreement> due = agreementRepository.findByStatusAndEndDateBefore(AgreementStatus.ACTIVE, today);
        for (Agreement a : due) {
            a.setStatus(AgreementStatus.EXPIRED);
            agreementRepository.save(a);
        }
        if (!due.isEmpty()) {
            log.info("Marked {} agreement(s) as EXPIRED", due.size());
        }
        return due.size();
    }

    /** Daily job: email tenants 7 days before agreement end. */
    @Transactional
    public int sendSevenDayRenewalReminders() {
        LocalDate targetEnd = LocalDate.now().plusDays(7);
        List<Agreement> list = agreementRepository.findByStatusAndEndDateAndReminderSevenDaySentIsFalse(
                AgreementStatus.ACTIVE, targetEnd);
        int sent = 0;
        for (Agreement a : list) {
            User tenant = userRepository.findById(a.getTenantId()).orElse(null);
            agreementEmailService.sendRenewalReminder(tenant, a);
            a.setReminderSevenDaySent(true);
            agreementRepository.save(a);
            sent++;
        }
        if (sent > 0) {
            log.info("Sent {} renewal reminder email(s)", sent);
        }
        return sent;
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private AgreementResponse refreshAndMap(Agreement agreement) {
        return mapToResponse(refreshStatusIfNeeded(agreement));
    }

    private Agreement refreshStatusIfNeeded(Agreement agreement) {
        if (agreement.getStatus() == AgreementStatus.ACTIVE
                && agreement.getEndDate() != null
                && agreement.getEndDate().isBefore(LocalDate.now())) {
            agreement.setStatus(AgreementStatus.EXPIRED);
            return agreementRepository.save(agreement);
        }
        return agreement;
    }

    private void assertParticipant(Agreement agreement, String userId) {
        if (!agreement.getTenantId().equals(userId) && !agreement.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You do not have access to this agreement");
        }
    }

    private String nextAgreementNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "AGR-" + year + "-";
        int maxSeq = agreementRepository.findByAgreementNumberStartingWith(prefix).stream()
                .map(Agreement::getAgreementNumber)
                .filter(n -> n != null && n.length() > prefix.length())
                .mapToInt(n -> {
                    try {
                        return Integer.parseInt(n.substring(prefix.length()));
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .max()
                .orElse(0);
        return prefix + String.format("%04d", maxSeq + 1);
    }

    private static int computeDurationMonths(LocalDate start, LocalDate end) {
        long m = ChronoUnit.MONTHS.between(start, end);
        if (m < 1) {
            return 1;
        }
        return (int) m;
    }

    private AgreementResponse mapToResponse(Agreement a) {
        AgreementResponse.AgreementResponseBuilder b = AgreementResponse.builder()
                .id(a.getId())
                .agreementNumber(a.getAgreementNumber())
                .bookingId(a.getBookingId())
                .tenantId(a.getTenantId())
                .ownerId(a.getOwnerId())
                .propertyId(a.getPropertyId())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .durationMonths(a.getDurationMonths())
                .rentAmount(a.getRentAmount())
                .deposit(a.getDeposit())
                .paymentDueDate(a.getPaymentDueDate())
                .rulesNotes(a.getRulesNotes())
                .propertyTermsSnapshot(a.getPropertyTermsSnapshot())
                .status(a.getStatus())
                .ownerApproved(a.isOwnerApproved())
                .tenantApproved(a.isTenantApproved())
                .earlyTerminationPenalty(a.getEarlyTerminationPenalty())
                .terminatedAt(a.getTerminatedAt())
                .terminationReason(a.getTerminationReason())
                .reminderSevenDaySent(a.isReminderSevenDaySent())
                .signedByTenant(a.isSignedByTenant())
                .signedByOwner(a.isSignedByOwner())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt());

        Optional<Property> prop = propertyRepository.findById(a.getPropertyId());
        prop.ifPresent(p -> b.propertyTitle(p.getTitle()).propertyAddress(p.getAddress()));

        Optional<User> tenant = userRepository.findById(a.getTenantId());
        tenant.ifPresent(t -> b.tenantName(t.getFullName()).tenantEmail(t.getEmail()));

        return b.build();
    }
}
