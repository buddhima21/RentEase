package com.rentease.modules.maintenance.service;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceResponse createRequest(MaintenanceRequestDTO dto) {
        MaintenanceRequest request = MaintenanceRequest.builder()
                .propertyId(dto.getPropertyId())
                .tenantId(dto.getTenantId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .imageUrls(dto.getImageUrls())
                .build();

        MaintenanceRequest saved = maintenanceRepository.save(request);
        return mapToResponse(saved);
    }

    public MaintenanceResponse updateStatus(String id, MaintenanceStatus status) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));
        request.setStatus(status);
        MaintenanceRequest updated = maintenanceRepository.save(request);
        return mapToResponse(updated);
    }

    public List<MaintenanceResponse> getByProperty(String propertyId) {
        return maintenanceRepository.findByPropertyId(propertyId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private MaintenanceResponse mapToResponse(MaintenanceRequest req) {
        return MaintenanceResponse.builder()
                .id(req.getId())
                .propertyId(req.getPropertyId())
                .tenantId(req.getTenantId())
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority())
                .imageUrls(req.getImageUrls())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
