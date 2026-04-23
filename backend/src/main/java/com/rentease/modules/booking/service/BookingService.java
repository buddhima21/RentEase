package com.rentease.modules.booking.service;

import com.rentease.common.enums.BookingStatus;
import com.rentease.common.enums.PropertyStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.agreement.service.AgreementService;
import com.rentease.modules.booking.dto.BookingRequest;
import com.rentease.modules.booking.dto.BookingResponse;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /**
     * Injected lazily to break the circular dependency:
     * BookingService → AgreementService → BookingService.
     * Spring resolves it at runtime via a proxy.
     */
    @Lazy
    @Autowired
    private AgreementService agreementService;

    // Statuses that count as "occupying a bedroom"
    private static final List<BookingStatus> OCCUPYING_STATUSES =
            Arrays.asList(BookingStatus.APPROVED, BookingStatus.ALLOCATED);

    // Statuses that are considered "active" (prevent duplicate requests)
    private static final List<BookingStatus> ACTIVE_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.ALLOCATED);

    public BookingResponse createBooking(BookingRequest request) {
        // ── Date validation: start date must not be in the past ──
        if (request.getStartDate() == null) {
            throw new BadRequestException("Move-in date is required");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Move-in date cannot be in the past. Please choose today or a future date.");
        }

        // Validate property exists
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", request.getPropertyId()));

        if (property.isDeleted()) {
            throw new BadRequestException("Property is not available");
        }

        // ── Owner identity check: submitted ownerId must match the property's actual owner ──
        if (!property.getOwnerId().equals(request.getOwnerId())) {
            throw new BadRequestException("Invalid owner information. Please try again.");
        }

        // Check if tenant already has an active booking for this property
        List<Booking> existingBookings = bookingRepository
                .findByTenantIdAndPropertyId(request.getTenantId(), request.getPropertyId());

        boolean hasActiveBooking = existingBookings.stream()
                .anyMatch(b -> ACTIVE_STATUSES.contains(b.getStatus()));

        if (hasActiveBooking) {
            throw new BadRequestException("You already have an active booking request for this property");
        }

        // Check bedroom capacity
        long occupiedCount = bookingRepository.countByPropertyIdAndStatusIn(
                request.getPropertyId(), OCCUPYING_STATUSES);

        if (occupiedCount >= property.getBedrooms()) {
            throw new BadRequestException("All bedrooms for this property are fully booked");
        }

        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())
                .tenantId(request.getTenantId())
                .ownerId(property.getOwnerId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyRent(request.getMonthlyRent())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponse approveBooking(String id, String requestingOwnerId) {
        Booking booking = findBookingOrThrow(id);

        // ── Owner-only guard: only this property's owner can approve ──
        if (!booking.getOwnerId().equals(requestingOwnerId)) {
            throw new BadRequestException("You are not authorized to approve this booking. Only the property owner can do this.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        // Re-check capacity before approving
        long occupiedCount = bookingRepository.countByPropertyIdAndStatusIn(
                booking.getPropertyId(), OCCUPYING_STATUSES);
        Property property = propertyRepository.findById(booking.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", booking.getPropertyId()));

        if (occupiedCount >= property.getBedrooms()) {
            throw new BadRequestException("All bedrooms are already allocated. Cannot approve this booking.");
        }

        booking.setStatus(BookingStatus.ALLOCATED);
        Booking saved = bookingRepository.save(booking);

        // Mark the property as BOOKED — hides it from public listings immediately
        property.setStatus(PropertyStatus.BOOKED);
        propertyRepository.save(property);
        log.info("Property [id={}] marked BOOKED after booking [id={}] approved",
                property.getId(), saved.getId());

        // Auto-create a PENDING rental agreement for this booking
        try {
            agreementService.createAgreementFromBooking(saved);
        } catch (Exception e) {
            // Log but do not fail the booking approval if agreement creation has an issue
            log.warn("Could not auto-create agreement for booking {}: {}", saved.getId(), e.getMessage());
        }

        return mapToResponse(saved);
    }

    public BookingResponse rejectBooking(String id, String requestingOwnerId) {
        Booking booking = findBookingOrThrow(id);

        // ── Owner-only guard: only this property's owner can reject ──
        if (!booking.getOwnerId().equals(requestingOwnerId)) {
            throw new BadRequestException("You are not authorized to reject this booking. Only the property owner can do this.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        return mapToResponse(bookingRepository.save(booking));
    }

    public BookingResponse cancelAllocation(String id, String requestingOwnerId) {
        Booking booking = findBookingOrThrow(id);

        // ── Owner-only guard: only this property's owner can remove a tenant ──
        if (!booking.getOwnerId().equals(requestingOwnerId)) {
            throw new BadRequestException("You are not authorized to remove this tenant. Only the property owner can do this.");
        }

        if (booking.getStatus() != BookingStatus.ALLOCATED) {
            throw new BadRequestException("Only ALLOCATED bookings can have the tenant removed");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelled = bookingRepository.save(booking);

        // Restore property to APPROVED so it reappears in public listings
        restorePropertyToApproved(booking.getPropertyId(), "allocation cancelled by owner");

        return mapToResponse(cancelled);
    }

    public void hardDeleteBooking(String id) {
        Booking booking = findBookingOrThrow(id);
        bookingRepository.delete(booking);
    }

    public BookingResponse tenantCancelBooking(String id, String tenantId, String reason) {
        Booking booking = findBookingOrThrow(id);
        
        if (!booking.getTenantId().equals(tenantId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        
        if (!ACTIVE_STATUSES.contains(booking.getStatus())) {
            throw new BadRequestException("Only active bookings can be cancelled");
        }

        boolean wasAllocated = booking.getStatus() == BookingStatus.ALLOCATED;
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        Booking cancelled = bookingRepository.save(booking);

        // Only restore the property if the cancelled booking was actually occupying it
        if (wasAllocated) {
            restorePropertyToApproved(booking.getPropertyId(), "tenant cancelled allocation");
        }

        return mapToResponse(cancelled);
    }

    public BookingResponse updateBookingStatus(String id, BookingStatus status) {
        Booking booking = findBookingOrThrow(id);
        booking.setStatus(status);
        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getBookingsByTenant(String tenantId) {
        List<Booking> bookings = bookingRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return mapToResponseList(bookings);
    }

    public List<BookingResponse> getBookingsByOwner(String ownerId) {
        List<Booking> bookings = bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
        return mapToResponseList(bookings);
    }

    public List<BookingResponse> getCompletedBookings() {
        List<Booking> bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.COMPLETED);
        return mapToResponseList(bookings);
    }

    public List<BookingResponse> getAdminBookings(List<BookingStatus> statuses) {
        List<Booking> bookings;
        if (statuses == null || statuses.isEmpty()) {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        } else {
            bookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(statuses);
        }
        return mapToResponseList(bookings);
    }

    public int getAvailableSlots(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        long occupiedCount = bookingRepository.countByPropertyIdAndStatusIn(
                propertyId, OCCUPYING_STATUSES);

        return Math.max(0, property.getBedrooms() - (int) occupiedCount);
    }

    // ── Helpers ──────────────────────────────────────────

    /**
     * Restores a property back to APPROVED status so it reappears in public listings.
     * Called whenever an allocated booking is cancelled or completed.
     */
    private void restorePropertyToApproved(String propertyId, String reason) {
        propertyRepository.findById(propertyId).ifPresent(p -> {
            if (p.getStatus() == PropertyStatus.BOOKED || p.getStatus() == PropertyStatus.RENTED) {
                p.setStatus(PropertyStatus.APPROVED);
                propertyRepository.save(p);
                log.info("Property [id={}] restored to APPROVED — reason: {}", propertyId, reason);
            }
        });
    }

    private Booking findBookingOrThrow(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    /**
     * Batch maps a list of bookings to responses.
     * <p>
     * Eliminates N+1: instead of querying property + tenant per booking,
     * we collect all unique propertyIds and tenantIds and fire exactly
     * 2 batch queries for the entire list.
     * </p>
     */
    private List<BookingResponse> mapToResponseList(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) {
            return List.of();
        }

        // Collect distinct IDs
        List<String> propertyIds = bookings.stream()
                .map(Booking::getPropertyId).filter(id -> id != null).distinct()
                .collect(Collectors.toList());
        List<String> tenantIds = bookings.stream()
                .map(Booking::getTenantId).filter(id -> id != null).distinct()
                .collect(Collectors.toList());

        // 2 total DB queries regardless of list size
        Map<String, Property> propertyMap = StreamSupport
                .stream(propertyRepository.findAllById(propertyIds).spliterator(), false)
                .collect(Collectors.toMap(Property::getId, Function.identity()));
        Map<String, User> userMap = StreamSupport
                .stream(userRepository.findAllById(tenantIds).spliterator(), false)
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return bookings.stream()
                .map(b -> mapToResponseWithData(b,
                        propertyMap.get(b.getPropertyId()),
                        userMap.get(b.getTenantId())))
                .collect(Collectors.toList());
    }

    /** Used by list operations — property and tenant already resolved from batch maps. */
    private BookingResponse mapToResponseWithData(Booking booking, Property property, User tenant) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .ownerId(booking.getOwnerId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .monthlyRent(booking.getMonthlyRent())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .cancellationReason(booking.getCancellationReason());

        if (property != null) {
            builder.propertyTitle(property.getTitle())
                    .propertyCity(property.getCity())
                    .propertyType(property.getPropertyType())
                    .propertyBedrooms(property.getBedrooms())
                    .propertyPrice(property.getPrice())
                    .propertyAddress(property.getAddress())
                    .propertyImageUrl(property.getImageUrls() != null && !property.getImageUrls().isEmpty()
                            ? property.getImageUrls().get(0) : null);
        }

        if (tenant != null) {
            builder.tenantName(tenant.getFullName())
                    .tenantEmail(tenant.getEmail())
                    .tenantPhone(tenant.getPhone());
        }

        return builder.build();
    }

    /** Used by single-booking operations (approve, reject, etc.) */
    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .ownerId(booking.getOwnerId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .monthlyRent(booking.getMonthlyRent())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .cancellationReason(booking.getCancellationReason());

        if (booking.getPropertyId() != null) {
            Optional<Property> propOpt = propertyRepository.findById(booking.getPropertyId());
            propOpt.ifPresent(p -> builder
                    .propertyTitle(p.getTitle())
                    .propertyCity(p.getCity())
                    .propertyType(p.getPropertyType())
                    .propertyBedrooms(p.getBedrooms())
                    .propertyPrice(p.getPrice())
                    .propertyAddress(p.getAddress())
                    .propertyImageUrl(p.getImageUrls() != null && !p.getImageUrls().isEmpty()
                            ? p.getImageUrls().get(0) : null));
        }

        if (booking.getTenantId() != null) {
            Optional<User> userOpt = userRepository.findById(booking.getTenantId());
            userOpt.ifPresent(u -> builder
                    .tenantName(u.getFullName())
                    .tenantEmail(u.getEmail())
                    .tenantPhone(u.getPhone()));
        }

        return builder.build();
    }
}