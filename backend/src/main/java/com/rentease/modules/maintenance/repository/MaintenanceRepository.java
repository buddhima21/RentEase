package com.rentease.modules.maintenance.repository;

import com.rentease.modules.maintenance.model.MaintenanceRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends MongoRepository<MaintenanceRequest, String> {

    List<MaintenanceRequest> findByPropertyId(String propertyId);

    List<MaintenanceRequest> findByTenantId(String tenantId);
}
