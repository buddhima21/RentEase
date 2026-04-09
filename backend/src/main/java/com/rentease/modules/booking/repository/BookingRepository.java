package com.rentease.modules.booking.repository;

import com.rentease.common.enums.BookingStatus;
import com.rentease.modules.booking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByTenantId(String tenantId);

    List<Booking> findByOwnerId(String ownerId);

    List<Booking> findByPropertyId(String propertyId);

    long countByPropertyIdAndStatusIn(String propertyId, List<BookingStatus> statuses);

    List<Booking> findByPropertyIdAndStatusIn(String propertyId, List<BookingStatus> statuses);

    List<Booking> findByTenantIdAndPropertyId(String tenantId, String propertyId);

    List<Booking> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    List<Booking> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime createdAt);
}

