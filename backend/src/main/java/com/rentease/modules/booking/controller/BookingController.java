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

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable String id, @RequestParam BookingStatus status) {
        BookingResponse response = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking status updated"));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByTenant(
            @PathVariable String tenantId) {
        List<BookingResponse> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByOwner(
            @PathVariable String ownerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
}
