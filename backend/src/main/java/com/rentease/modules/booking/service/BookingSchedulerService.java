package com.rentease.modules.booking.service;

import com.rentease.common.enums.BookingStatus;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSchedulerService {

    private final BookingRepository bookingRepository;

    // Run every hour to check for old pending bookings
    @Scheduled(cron = "0 0 * * * *")
    public void autoExpirePendingBookings() {
        // Find all bookings that are PENDING and were created more than 7 days ago
        LocalDateTime expiryThreshold = LocalDateTime.now().minusDays(7);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING, expiryThreshold);

        if (expiredBookings.isEmpty()) {
            return;
        }

        log.info("Found {} pending bookings older than {} days. Auto-expiring them.", expiredBookings.size(), 7);

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setCancellationReason("Auto-expired by system after 7 days of inactivity.");
        }

        bookingRepository.saveAll(expiredBookings);
    }
}
