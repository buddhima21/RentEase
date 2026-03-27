package com.rentease.modules.analytics.service;

import com.rentease.common.enums.BookingStatus;
import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.common.enums.PaymentStatus;
import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.analytics.dto.AnalyticsOverview;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import com.rentease.modules.payment.repository.PaymentRepository;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PaymentRepository paymentRepository;

    public AnalyticsOverview getOverview() {
        long totalProperties = propertyRepository.count();
        long availableProperties = propertyRepository.countByStatus(PropertyStatus.APPROVED);
        long rentedProperties = propertyRepository.countByStatus(PropertyStatus.PENDING_APPROVAL);
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long pendingMaintenance = maintenanceRepository.findAll().stream()
                .filter(m -> m.getStatus() == MaintenanceStatus.REPORTED).count();
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount())
                .sum();

        return AnalyticsOverview.builder()
                .totalProperties(totalProperties)
                .availableProperties(availableProperties)
                .rentedProperties(rentedProperties)
                .totalUsers(totalUsers)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .pendingMaintenanceRequests(pendingMaintenance)
                .totalRevenue(totalRevenue)
                .build();
    }
}
