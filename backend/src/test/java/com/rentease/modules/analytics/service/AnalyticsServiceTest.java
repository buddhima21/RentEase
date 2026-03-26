package com.rentease.modules.analytics.service;

import com.rentease.common.enums.BookingStatus;
import com.rentease.common.enums.PaymentStatus;
import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.analytics.dto.OwnerAnalyticsResponse;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import com.rentease.modules.payment.model.Payment;
import com.rentease.modules.payment.repository.PaymentRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private PropertyRepository propertyRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private MaintenanceRepository maintenanceRepository;
    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private final String ownerId = "owner_123";
    private Property property;
    private Booking booking;
    private Payment payment;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setId("prop_1");
        property.setOwnerId(ownerId);
        property.setStatus(PropertyStatus.RENTED);

        booking = new Booking();
        booking.setId("book_1");
        booking.setPropertyId("prop_1");
        booking.setStatus(BookingStatus.CONFIRMED);

        payment = new Payment();
        payment.setBookingId("book_1");
        payment.setAmount(1500.0);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getOwnerAnalytics_ShouldCalculateCorrectMetrics() {
        // Arrange
        when(propertyRepository.findByOwnerIdAndDeletedFalse(ownerId)).thenReturn(Collections.singletonList(property));
        when(bookingRepository.findByPropertyIdIn(anyList())).thenReturn(Collections.singletonList(booking));
        when(paymentRepository.findByBookingIdInAndStatus(anyList(), eq(PaymentStatus.COMPLETED)))
                .thenReturn(Collections.singletonList(payment));
        when(reviewRepository.findByPropertyIdInAndDeletedFalse(anyList())).thenReturn(Collections.emptyList());
        when(maintenanceRepository.findByPropertyIdIn(anyList())).thenReturn(Collections.emptyList());

        // Act
        OwnerAnalyticsResponse response = analyticsService.getOwnerAnalytics(ownerId);

        // Assert
        assertEquals(1, response.getTotalProperties());
        assertEquals(1, response.getActiveBookings());
        assertEquals(1500.0, response.getTotalRevenue());
        assertEquals(100.0, response.getOccupancyRate());
        assertNotNull(response.getRevenueHistory());
        assertFalse(response.getRevenueHistory().isEmpty());
    }
}
