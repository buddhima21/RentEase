package com.rentease.modules.property.repository;

import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.property.model.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String> {

    // ── Admin queries ──────────────────────────────────────
    List<Property> findByStatus(PropertyStatus status);

    List<Property> findByStatusIn(List<PropertyStatus> statuses);

    long countByStatus(PropertyStatus status);

    // ── Owner queries ──────────────────────────────────────
    List<Property> findByOwnerId(String ownerId);

    List<Property> findByOwnerIdAndStatus(String ownerId, PropertyStatus status);

    // ── Public queries ─────────────────────────────────────
    List<Property> findByStatusAndCityContainingIgnoreCase(PropertyStatus status, String city);

    List<Property> findByStatusAndPropertyTypeIgnoreCase(PropertyStatus status, String propertyType);

    List<Property> findByStatusAndPriceBetween(PropertyStatus status, double minPrice, double maxPrice);

    List<Property> findByStatusAndCityContainingIgnoreCaseAndPropertyTypeIgnoreCase(
            PropertyStatus status, String city, String propertyType);
}
