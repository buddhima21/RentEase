package com.rentease.modules.property.repository;

import com.rentease.common.enums.PropertyStatus;
import com.rentease.modules.property.model.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String> {

    List<Property> findByDeletedFalse();

    List<Property> findByOwnerIdAndDeletedFalse(String ownerId);

    List<Property> findByStatusAndDeletedFalse(PropertyStatus status);

    List<Property> findByCityAndDeletedFalse(String city);
}
