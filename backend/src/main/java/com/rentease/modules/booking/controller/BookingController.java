package com.rentease.modules.booking.controller;

import com.rentease.common.ApiResponse;
import com.rentease.common.enums.BookingStatus;
import com.rentease.modules.booking.dto.BookingRequest;
import com.rentease.modules.booking.dto.BookingResponse;
import com.rentease.modules.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** Tenant creates a booking request */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking request submitted successfully"));
    }

    /** Owner approves a pending booking → sets status to ALLOCATED */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(@PathVariable("id") String id) {
        BookingResponse response = bookingService.approveBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking approved and tenant allocated"));
    }

    /** Owner rejects a pending booking */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(@PathVariable("id") String id) {
        BookingResponse response = bookingService.rejectBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking rejected"));
    }

    /** Owner removes an allocated tenant → sets status to CANCELLED */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelAllocation(@PathVariable("id") String id) {
        BookingResponse response = bookingService.cancelAllocation(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Tenant removed from property"));
    }

    /** Owner permanently deletes a booking from history */
    @DeleteMapping("/{id}/hard-delete")
    public ResponseEntity<ApiResponse<Void>> hardDeleteBooking(@PathVariable("id") String id) {
        bookingService.hardDeleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Allocation history deleted completely"));
    }

    /** Generic status update (legacy/admin usage) */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable("id") String id, @RequestParam("status") BookingStatus status) {
        BookingResponse response = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking status updated"));
    }

    /** Tenant cancels their own active booking and provides an optional reason */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> tenantCancelBooking(
            @PathVariable("id") String id, 
            @Valid @RequestBody com.rentease.modules.booking.dto.TenantCancelRequest request) {
        BookingResponse response = bookingService.tenantCancelBooking(id, request.getTenantId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully"));
    }

    /** Get all bookings for a tenant (enriched) */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByTenant(
            @PathVariable("tenantId") String tenantId) {
        List<BookingResponse> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    /** Get all bookings for an owner (enriched) */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByOwner(
            @PathVariable("ownerId") String ownerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    /** Get available bedroom slots for a property */
    @GetMapping("/property/{propertyId}/available-slots")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getAvailableSlots(
            @PathVariable("propertyId") String propertyId) {
        int slots = bookingService.getAvailableSlots(propertyId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("availableSlots", slots)));
    }
}
