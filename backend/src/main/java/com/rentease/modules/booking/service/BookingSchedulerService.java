package com.rentease.modules.booking.service;

import com.rentease.common.enums.BookingStatus;
import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSchedulerService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;

    // ─── Job 1: Auto-expire PENDING bookings older than 7 days ──────────────
    // Runs every hour
    @Scheduled(cron = "0 0 * * * *")
    public void autoExpirePendingBookings() {
        LocalDateTime expiryThreshold = LocalDateTime.now().minusDays(7);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING, expiryThreshold);

        if (expiredBookings.isEmpty()) return;

        log.info("Auto-expiring {} pending bookings older than 7 days.", expiredBookings.size());

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setCancellationReason("Auto-expired by system after 7 days of inactivity.");
        }

        bookingRepository.saveAll(expiredBookings);
    }

    // ─── Job 2: Complete ALLOCATED bookings past their end date ─────────────
    // Runs daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void autoCompleteExpiredAllocations() {
        List<Booking> overdueBookings = bookingRepository
                .findByStatusAndEndDateBefore(BookingStatus.ALLOCATED, LocalDate.now());

        if (overdueBookings.isEmpty()) return;

        log.info("Auto-completing {} allocated bookings whose rental period has ended.", overdueBookings.size());

        for (Booking booking : overdueBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);

            // Restore property to APPROVED so it reappears in public listings
            propertyRepository.findById(booking.getPropertyId()).ifPresent(property -> {
                if (property.getStatus() == PropertyStatus.BOOKED
                        || property.getStatus() == PropertyStatus.RENTED) {
                    property.setStatus(PropertyStatus.APPROVED);
                    propertyRepository.save(property);
                    log.info("Property [id={}] restored to APPROVED — booking period ended (bookingId={})",
                            property.getId(), booking.getId());
                }
            });
        }
    }
}
