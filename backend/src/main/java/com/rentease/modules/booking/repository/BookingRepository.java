package com.rentease.modules.booking.repository;

import com.rentease.modules.booking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByTenantId(String tenantId);

    List<Booking> findByOwnerId(String ownerId);

    List<Booking> findByPropertyId(String propertyId);
}
