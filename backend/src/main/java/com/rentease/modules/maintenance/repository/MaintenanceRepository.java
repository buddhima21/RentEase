package com.rentease.modules.maintenance.repository;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceRepository extends MongoRepository<MaintenanceRequest, String> {

    List<MaintenanceRequest> findByPropertyId(String propertyId);

    List<MaintenanceRequest> findByTenantId(String tenantId);

    List<MaintenanceRequest> findByPropertyIdOrderByCreatedAtDesc(String propertyId);

    List<MaintenanceRequest> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<MaintenanceRequest> findByAssignedTechnicianIdOrderByCreatedAtDesc(String assignedTechnicianId);

    List<MaintenanceRequest> findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(String assignedTechnicianId, MaintenanceStatus status);

    List<MaintenanceRequest> findByAssignedTechnicianIdAndPriorityIgnoreCaseOrderByCreatedAtDesc(String assignedTechnicianId, String priority);

    List<MaintenanceRequest> findByAssignedTechnicianIdAndStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(String assignedTechnicianId, MaintenanceStatus status, String priority);

    long countByAssignedTechnicianIdAndStatusIn(String assignedTechnicianId, List<MaintenanceStatus> statuses);

    List<MaintenanceRequest> findByStatusOrderByCreatedAtDesc(MaintenanceStatus status);

    List<MaintenanceRequest> findByPriorityIgnoreCaseOrderByCreatedAtDesc(String priority);

    List<MaintenanceRequest> findByStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(MaintenanceStatus status, String priority);

    List<MaintenanceRequest> findByStatusAndClosureDueAtBefore(MaintenanceStatus status, LocalDateTime closureDueAt);

    List<MaintenanceRequest> findByPropertyIdInOrderByCreatedAtDesc(List<String> propertyIds);
}
