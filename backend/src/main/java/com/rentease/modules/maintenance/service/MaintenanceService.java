package com.rentease.modules.maintenance.service;

import com.rentease.common.enums.AgreementStatus;
import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.common.enums.UserRole;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ForbiddenException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.agreement.repository.AgreementRepository;
import com.rentease.modules.maintenance.dto.MaintenanceAssignRequest;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResolveRequest;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.dto.MaintenanceScheduleRequest;
import com.rentease.modules.maintenance.dto.TechnicianSummaryResponse;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.maintenance.model.MaintenanceWorkflowEvent;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private static final Duration SLA_EMERGENCY = Duration.ofHours(4);
    private static final Duration SLA_HIGH = Duration.ofHours(24);
    private static final Duration SLA_MEDIUM = Duration.ofHours(72);
    private static final Duration SLA_LOW = Duration.ofHours(120);

    private final MaintenanceRepository maintenanceRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final AgreementRepository agreementRepository;
    private final MaintenanceNotificationService maintenanceNotificationService;

    @Value("${rentease.maintenance.closure.grace-days:7}")
    private long closureGraceDays;

    public MaintenanceResponse createRequest(MaintenanceRequestDTO dto, String actorId, boolean isAdmin) {
        if (!isAdmin && !Objects.equals(actorId, dto.getTenantId())) {
            throw new ForbiddenException("Tenant can only create maintenance requests for their own account");
        }

        User tenant = findUserOrThrow(dto.getTenantId());
        if (tenant.getRole() != UserRole.TENANT) {
            throw new BadRequestException("Maintenance requests can only be created for tenant users");
        }

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", dto.getPropertyId()));

        boolean hasActiveAgreement = agreementRepository
                .findByTenantIdOrderByCreatedAtDesc(dto.getTenantId())
                .stream()
                .anyMatch(a -> Objects.equals(a.getPropertyId(), dto.getPropertyId()) && a.getStatus() == AgreementStatus.ACTIVE);
        if (!hasActiveAgreement) {
            throw new BadRequestException("Tenant does not have an active agreement for the selected property");
        }

        validateImageCount(dto.getImageUrls(), "request");

        MaintenanceRequest request = MaintenanceRequest.builder()
                .propertyId(dto.getPropertyId())
                .tenantId(dto.getTenantId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .serviceType(dto.getServiceType())
                .priority(dto.getPriority())
                .imageUrls(dto.getImageUrls())
                .preferredAt(dto.getPreferredAt())
                .build();
        request.setSlaDueAt(calculateSlaDueAt(request.getPriority(), LocalDateTime.now()));

        appendWorkflowEvent(
            request,
            "REQUEST_CREATED",
            actorId,
            null,
            request.getStatus(),
            isAdmin ? "Created by admin on behalf of tenant" : "Created by tenant"
        );

        MaintenanceRequest saved = maintenanceRepository.save(request);

        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        maintenanceNotificationService.notifyAdminsOnCreated(admins, saved, tenant, property);

        return mapToResponse(saved);
    }

    public MaintenanceResponse updateStatus(String id, MaintenanceStatus status) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        MaintenanceStatus previousStatus = request.getStatus();
        validateStatusTransition(request.getStatus(), status);
        request.setStatus(status);
        if (status == MaintenanceStatus.RESOLVED) {
            request.setResolvedAt(LocalDateTime.now());
        }
        if (status == MaintenanceStatus.CLOSED) {
            request.setClosedAt(LocalDateTime.now());
        }

        appendWorkflowEvent(
            request,
            "STATUS_UPDATED",
            request.getAssignedByAdminId(),
            previousStatus,
            status,
            "Status updated directly"
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);

        userRepository.findById(updated.getTenantId())
                .ifPresent(tenant -> maintenanceNotificationService.notifyTenantStatusChanged(tenant, updated));
        return mapToResponse(updated);
    }

    public MaintenanceResponse updatePriority(String id, String priority) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        if (request.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BadRequestException("Cannot update priority for a closed request");
        }

        request.setPriority(priority);
        if (request.getStatus() != MaintenanceStatus.RESOLVED
                && request.getStatus() != MaintenanceStatus.CLOSED
                && request.getStatus() != MaintenanceStatus.CANCELLED) {
            request.setSlaDueAt(calculateSlaDueAt(priority, request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now()));
        }
        appendWorkflowEvent(
            request,
            "PRIORITY_UPDATED",
            request.getAssignedByAdminId(),
            request.getStatus(),
            request.getStatus(),
            "Priority changed to " + priority
        );
        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public List<MaintenanceResponse> getByProperty(String propertyId) {
        return maintenanceRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public MaintenanceResponse getById(String id) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));
        return mapToResponse(applyClosurePolicyIfDue(request));
    }

    public List<MaintenanceResponse> getByTenant(String tenantId) {
        return maintenanceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::applyClosurePolicyIfDue).map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getByTechnician(String technicianId, MaintenanceStatus status) {
        List<MaintenanceRequest> requests = status == null
                ? maintenanceRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(technicianId)
                : maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(technicianId, status);
        return requests.stream().map(this::applyClosurePolicyIfDue).map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getByOwner(String ownerId) {
        List<String> propertyIds = propertyRepository.findByOwnerId(ownerId).stream()
                .map(Property::getId)
                .collect(Collectors.toList());

        if (propertyIds.isEmpty()) {
            return Collections.emptyList();
        }

        return maintenanceRepository.findByPropertyIdInOrderByCreatedAtDesc(propertyIds)
            .stream().map(this::applyClosurePolicyIfDue).map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getAdminQueue(MaintenanceStatus status, String priority, String technicianId) {
        boolean hasStatus = status != null;
        boolean hasPriority = priority != null && !priority.isBlank();
        boolean hasTechnician = technicianId != null && !technicianId.isBlank();

        List<MaintenanceRequest> queue;
        if (hasTechnician && hasStatus && hasPriority) {
            queue = maintenanceRepository.findByAssignedTechnicianIdAndStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(
                    technicianId, status, priority
            );
        } else if (hasTechnician && hasStatus) {
            queue = maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(technicianId, status);
        } else if (hasTechnician && hasPriority) {
            queue = maintenanceRepository.findByAssignedTechnicianIdAndPriorityIgnoreCaseOrderByCreatedAtDesc(technicianId, priority);
        } else if (hasTechnician) {
            queue = maintenanceRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(technicianId);
        } else if (hasStatus && hasPriority) {
            queue = maintenanceRepository.findByStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(status, priority);
        } else if (hasStatus) {
            queue = maintenanceRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (hasPriority) {
            queue = maintenanceRepository.findByPriorityIgnoreCaseOrderByCreatedAtDesc(priority);
        } else {
            queue = maintenanceRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
        }

        return queue.stream().map(this::applyClosurePolicyIfDue).map(this::mapToResponse).collect(Collectors.toList());
    }

    public MaintenanceResponse assignTechnician(String requestId, MaintenanceAssignRequest request, String adminId) {
        MaintenanceRequest maintenanceRequest = getRequestOrThrow(requestId);
        User technician = findUserOrThrow(request.getTechnicianId());
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new BadRequestException("Assigned user must have TECHNICIAN role");
        }

        if (maintenanceRequest.getStatus() == MaintenanceStatus.RESOLVED
                || maintenanceRequest.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BadRequestException("Cannot assign a technician to a resolved or closed request");
        }

        String previousTechnicianId = maintenanceRequest.getAssignedTechnicianId();
        MaintenanceStatus previousStatus = maintenanceRequest.getStatus();
        boolean isReassignment = previousTechnicianId != null
            && !previousTechnicianId.isBlank()
            && !previousTechnicianId.equals(request.getTechnicianId());

        if (isReassignment) {
            if (maintenanceRequest.getStatus() == MaintenanceStatus.IN_PROGRESS
                    || maintenanceRequest.getStatus() == MaintenanceStatus.PAUSED) {
                throw new BadRequestException("Cannot reassign a request while work is in progress or paused");
            }

            String reassignmentAudit = "Reassigned from technician " + previousTechnicianId
                + " to " + request.getTechnicianId()
                + " by admin " + adminId
                + " at " + LocalDateTime.now();
            String existingNotes = maintenanceRequest.getAdminNotes();
            maintenanceRequest.setAdminNotes(
                existingNotes == null || existingNotes.isBlank()
                    ? reassignmentAudit
                    : existingNotes + "\n" + reassignmentAudit
            );
        }

        maintenanceRequest.setAssignedTechnicianId(request.getTechnicianId());
        maintenanceRequest.setAssignedByAdminId(adminId);
        maintenanceRequest.setAssignedAt(LocalDateTime.now());
        maintenanceRequest.setScheduledAt(request.getScheduledAt());
        if (maintenanceRequest.getStatus() == MaintenanceStatus.REPORTED) {
            maintenanceRequest.setStatus(
                    request.getScheduledAt() != null ? MaintenanceStatus.SCHEDULED : MaintenanceStatus.ASSIGNED
            );
        }
        if (request.getAdminNotes() != null && !request.getAdminNotes().isBlank()) {
            maintenanceRequest.setAdminNotes(request.getAdminNotes());
        }

        appendWorkflowEvent(
            maintenanceRequest,
            isReassignment ? "TECHNICIAN_REASSIGNED" : "TECHNICIAN_ASSIGNED",
            adminId,
            previousStatus,
            maintenanceRequest.getStatus(),
            "Technician " + request.getTechnicianId() + " assigned"
        );

        MaintenanceRequest updated = maintenanceRepository.save(maintenanceRequest);
        maintenanceNotificationService.notifyTechnicianAssigned(technician, updated);
        userRepository.findById(updated.getTenantId())
                .ifPresent(tenant -> maintenanceNotificationService.notifyTenantStatusChanged(tenant, updated));
        return mapToResponse(updated);
    }

    public MaintenanceResponse scheduleRequest(String requestId, MaintenanceScheduleRequest request, String adminId) {
        MaintenanceRequest maintenanceRequest = getRequestOrThrow(requestId);
        MaintenanceStatus previousStatus = maintenanceRequest.getStatus();

        if (maintenanceRequest.getStatus() == MaintenanceStatus.RESOLVED
                || maintenanceRequest.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BadRequestException("Cannot schedule a resolved or closed request");
        }
        if (request.getScheduledAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Scheduled time must be in the future");
        }

        maintenanceRequest.setScheduledAt(request.getScheduledAt());
        if (maintenanceRequest.getStatus() == MaintenanceStatus.REPORTED
                || maintenanceRequest.getStatus() == MaintenanceStatus.ASSIGNED) {
            maintenanceRequest.setStatus(MaintenanceStatus.SCHEDULED);
        }
        maintenanceRequest.setAssignedByAdminId(adminId);
        if (request.getTechnicianId() != null && !request.getTechnicianId().isBlank()) {
            User technician = findUserOrThrow(request.getTechnicianId());
            if (technician.getRole() != UserRole.TECHNICIAN) {
                throw new BadRequestException("Scheduled user must have TECHNICIAN role");
            }
            maintenanceRequest.setAssignedTechnicianId(request.getTechnicianId());
            maintenanceRequest.setAssignedAt(LocalDateTime.now());
            maintenanceNotificationService.notifyTechnicianAssigned(technician, maintenanceRequest);
        }
        if (request.getAdminNotes() != null && !request.getAdminNotes().isBlank()) {
            maintenanceRequest.setAdminNotes(request.getAdminNotes());
        }

        appendWorkflowEvent(
            maintenanceRequest,
            "REQUEST_SCHEDULED",
            adminId,
            previousStatus,
            maintenanceRequest.getStatus(),
            "Scheduled for " + request.getScheduledAt()
        );

        MaintenanceRequest updated = maintenanceRepository.save(maintenanceRequest);
        userRepository.findById(updated.getTenantId())
                .ifPresent(tenant -> maintenanceNotificationService.notifyTenantStatusChanged(tenant, updated));
        return mapToResponse(updated);
    }

    public MaintenanceResponse acceptRequest(String requestId, String technicianId) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        ensureAssignedToTechnician(request, technicianId);

        if (request.getStatus() == MaintenanceStatus.RESOLVED || request.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BadRequestException("Cannot accept a resolved or closed request");
        }

        if (request.getAcceptedAt() == null) {
            request.setAcceptedAt(LocalDateTime.now());
        }
        if (request.getStartedAt() == null) {
            request.setStartedAt(LocalDateTime.now());
        }
        validateStatusTransition(request.getStatus(), MaintenanceStatus.IN_PROGRESS);
        MaintenanceStatus previousStatus = request.getStatus();
        request.setStatus(MaintenanceStatus.IN_PROGRESS);
        appendWorkflowEvent(
            request,
            "REQUEST_ACCEPTED",
            technicianId,
            previousStatus,
            MaintenanceStatus.IN_PROGRESS,
            "Technician accepted and started work"
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public MaintenanceResponse startRequest(String requestId, String technicianId) {
        // Keep endpoint compatibility while using a single state transition path.
        return acceptRequest(requestId, technicianId);
    }

    public MaintenanceResponse cancelRequest(String requestId, String tenantId) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        if (!tenantId.equals(request.getTenantId())) {
            throw new ForbiddenException("Tenants can only cancel their own maintenance requests");
        }

        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS
                || request.getStatus() == MaintenanceStatus.PAUSED
                || request.getStatus() == MaintenanceStatus.RESOLVED
                || request.getStatus() == MaintenanceStatus.CLOSED
                || request.getStatus() == MaintenanceStatus.CANCELLED) {
            throw new BadRequestException("This maintenance request can no longer be cancelled");
        }

        MaintenanceStatus previousStatus = request.getStatus();
        validateStatusTransition(request.getStatus(), MaintenanceStatus.CANCELLED);
        request.setStatus(MaintenanceStatus.CANCELLED);
        request.setClosedAt(LocalDateTime.now());
        appendWorkflowEvent(
            request,
            "REQUEST_CANCELLED",
            tenantId,
            previousStatus,
            MaintenanceStatus.CANCELLED,
            "Cancelled by tenant"
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);
        return mapToResponse(updated);
    }

    public MaintenanceResponse declineRequest(String requestId, String technicianId, String reason) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        ensureAssignedToTechnician(request, technicianId);

        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS
                || request.getStatus() == MaintenanceStatus.PAUSED
                || request.getStatus() == MaintenanceStatus.RESOLVED
                || request.getStatus() == MaintenanceStatus.CLOSED
                || request.getStatus() == MaintenanceStatus.CANCELLED) {
            throw new BadRequestException("This maintenance request cannot be declined in its current state");
        }

        MaintenanceStatus previousStatus = request.getStatus();
        validateStatusTransition(request.getStatus(), MaintenanceStatus.DECLINED);
        request.setStatus(MaintenanceStatus.DECLINED);
        request.setAssignedTechnicianId(null);
        request.setAssignedAt(null);
        appendWorkflowEvent(
            request,
            "REQUEST_DECLINED",
            technicianId,
            previousStatus,
            MaintenanceStatus.DECLINED,
            (reason != null && !reason.isBlank()) ? reason : "Declined by technician"
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public MaintenanceResponse pauseRequest(String requestId, String technicianId) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        ensureAssignedToTechnician(request, technicianId);

        validateStatusTransition(request.getStatus(), MaintenanceStatus.PAUSED);
        MaintenanceStatus previousStatus = request.getStatus();
        request.setStatus(MaintenanceStatus.PAUSED);
        appendWorkflowEvent(
            request,
            "WORK_PAUSED",
            technicianId,
            previousStatus,
            MaintenanceStatus.PAUSED,
            "Work paused"
        );
        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public MaintenanceResponse resumeRequest(String requestId, String technicianId) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        ensureAssignedToTechnician(request, technicianId);

        validateStatusTransition(request.getStatus(), MaintenanceStatus.IN_PROGRESS);
        MaintenanceStatus previousStatus = request.getStatus();
        request.setStatus(MaintenanceStatus.IN_PROGRESS);
        appendWorkflowEvent(
            request,
            "WORK_RESUMED",
            technicianId,
            previousStatus,
            MaintenanceStatus.IN_PROGRESS,
            "Work resumed"
        );
        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public MaintenanceResponse resolveRequest(String requestId, String technicianId, MaintenanceResolveRequest resolveRequest) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        ensureAssignedToTechnician(request, technicianId);

        if (request.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BadRequestException("Cannot resolve a closed request");
        }

        validateImageCount(resolveRequest.getCompletionImageUrls(), "completion");
        validateStatusTransition(request.getStatus(), MaintenanceStatus.RESOLVED);
        MaintenanceStatus previousStatus = request.getStatus();
        request.setStatus(MaintenanceStatus.RESOLVED);
        request.setResolvedAt(LocalDateTime.now());
        request.setClosureDueAt(request.getResolvedAt().plusDays(closureGraceDays));
        request.setCompletionSummary(resolveRequest.getCompletionSummary());
        request.setTechnicianNotes(resolveRequest.getTechnicianNotes());
        request.setCompletionImageUrls(resolveRequest.getCompletionImageUrls());
        appendWorkflowEvent(
            request,
            "REQUEST_RESOLVED",
            technicianId,
            previousStatus,
            MaintenanceStatus.RESOLVED,
            "Resolution submitted"
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public MaintenanceResponse closeRequest(String requestId, String adminId, String adminNote) {
        MaintenanceRequest request = getRequestOrThrow(requestId);
        if (request.getStatus() != MaintenanceStatus.RESOLVED) {
            throw new BadRequestException("Only resolved requests can be closed");
        }

        MaintenanceStatus previousStatus = request.getStatus();
        request.setStatus(MaintenanceStatus.CLOSED);
        request.setClosedAt(LocalDateTime.now());
        request.setClosureDueAt(null);
        request.setAssignedByAdminId(adminId);
        if (adminNote != null && !adminNote.isBlank()) {
            request.setAdminNotes(adminNote);
        }
        appendWorkflowEvent(
            request,
            "REQUEST_CLOSED",
            adminId,
            previousStatus,
            MaintenanceStatus.CLOSED,
            adminNote
        );

        MaintenanceRequest updated = maintenanceRepository.save(request);
        notifyTenantForUpdatedRequest(updated);
        return mapToResponse(updated);
    }

    public List<TechnicianSummaryResponse> getTechnicians() {
        return userRepository.findByRole(UserRole.TECHNICIAN)
                .stream()
                .map(u -> TechnicianSummaryResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .build())
                .collect(Collectors.toList());
    }

    public boolean userOwnsProperty(String ownerId, String propertyId) {
        return propertyRepository.findById(propertyId)
                .map(property -> ownerId.equals(property.getOwnerId()))
                .orElse(false);
    }

    private void validateStatusTransition(MaintenanceStatus current, MaintenanceStatus next) {
        if (current == next) {
            return;
        }
        boolean valid = switch (current) {
            case REPORTED -> next == MaintenanceStatus.ASSIGNED
                    || next == MaintenanceStatus.SCHEDULED
                || next == MaintenanceStatus.IN_PROGRESS
                || next == MaintenanceStatus.CANCELLED;
            case ASSIGNED -> next == MaintenanceStatus.SCHEDULED
                || next == MaintenanceStatus.IN_PROGRESS
                || next == MaintenanceStatus.DECLINED
                || next == MaintenanceStatus.CANCELLED;
            case SCHEDULED -> next == MaintenanceStatus.IN_PROGRESS
                || next == MaintenanceStatus.DECLINED
                || next == MaintenanceStatus.CANCELLED;
            case DECLINED -> next == MaintenanceStatus.ASSIGNED
                || next == MaintenanceStatus.SCHEDULED
                || next == MaintenanceStatus.CANCELLED;
            case IN_PROGRESS -> next == MaintenanceStatus.PAUSED || next == MaintenanceStatus.RESOLVED;
            case PAUSED -> next == MaintenanceStatus.IN_PROGRESS;
            case RESOLVED -> next == MaintenanceStatus.CLOSED;
            case CANCELLED, CLOSED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private MaintenanceRequest getRequestOrThrow(String requestId) {
        return maintenanceRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", requestId));
    }

    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private void ensureAssignedToTechnician(MaintenanceRequest request, String technicianId) {
        if (request.getAssignedTechnicianId() == null || request.getAssignedTechnicianId().isBlank()) {
            throw new BadRequestException("This request is not assigned to any technician");
        }
        if (!technicianId.equals(request.getAssignedTechnicianId())) {
            throw new ForbiddenException("Technician is not assigned to this request");
        }
    }

    private void validateImageCount(List<String> imageUrls, String context) {
        if (imageUrls != null && imageUrls.size() > 5) {
            throw new BadRequestException("A maximum of 5 " + context + " images is allowed");
        }
    }

    private LocalDateTime calculateSlaDueAt(String priority, LocalDateTime baseTime) {
        Duration target = switch (String.valueOf(priority).toUpperCase(Locale.ROOT)) {
            case "EMERGENCY" -> SLA_EMERGENCY;
            case "HIGH" -> SLA_HIGH;
            case "LOW" -> SLA_LOW;
            case "MEDIUM" -> SLA_MEDIUM;
            default -> SLA_MEDIUM;
        };
        return baseTime.plus(target);
    }

    private MaintenanceRequest applyClosurePolicyIfDue(MaintenanceRequest request) {
        if (request.getStatus() != MaintenanceStatus.RESOLVED || request.getClosureDueAt() == null) {
            return request;
        }
        if (!LocalDateTime.now().isAfter(request.getClosureDueAt())) {
            return request;
        }

        request.setStatus(MaintenanceStatus.CLOSED);
        request.setClosedAt(LocalDateTime.now());
        appendWorkflowEvent(
                request,
                "REQUEST_AUTO_CLOSED",
                "SYSTEM",
                MaintenanceStatus.RESOLVED,
                MaintenanceStatus.CLOSED,
                "Auto-closed by closure policy"
        );
        return maintenanceRepository.save(request);
    }

    private void appendWorkflowEvent(
            MaintenanceRequest request,
            String action,
            String actorId,
            MaintenanceStatus fromStatus,
            MaintenanceStatus toStatus,
            String note
    ) {
        List<MaintenanceWorkflowEvent> events = request.getWorkflowEvents();
        if (events == null) {
            events = new ArrayList<>();
            request.setWorkflowEvents(events);
        }

        events.add(MaintenanceWorkflowEvent.builder()
                .action(action)
                .actorId(actorId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .note(note)
                .occurredAt(LocalDateTime.now())
                .build());
    }

    private void notifyTenantForUpdatedRequest(MaintenanceRequest request) {
        userRepository.findById(request.getTenantId())
                .ifPresent(tenant -> maintenanceNotificationService.notifyTenantStatusChanged(tenant, request));
    }

    private MaintenanceResponse mapToResponse(MaintenanceRequest req) {
        User tenant = userRepository.findById(req.getTenantId()).orElse(null);
        User technician = req.getAssignedTechnicianId() == null ? null : userRepository.findById(req.getAssignedTechnicianId()).orElse(null);

        return MaintenanceResponse.builder()
                .id(req.getId())
                .propertyId(req.getPropertyId())
                .tenantId(req.getTenantId())
                .title(req.getTitle())
                .description(req.getDescription())
                .serviceType(req.getServiceType())
                .priority(req.getPriority())
                .imageUrls(req.getImageUrls())
                .preferredAt(req.getPreferredAt())
                .assignedTechnicianId(req.getAssignedTechnicianId())
                .assignedByAdminId(req.getAssignedByAdminId())
                .assignedAt(req.getAssignedAt())
                .scheduledAt(req.getScheduledAt())
                .acceptedAt(req.getAcceptedAt())
                .startedAt(req.getStartedAt())
                .resolvedAt(req.getResolvedAt())
                .slaDueAt(req.getSlaDueAt())
                .closureDueAt(req.getClosureDueAt())
                .closedAt(req.getClosedAt())
                .adminNotes(req.getAdminNotes())
                .technicianNotes(req.getTechnicianNotes())
                .completionSummary(req.getCompletionSummary())
                .completionImageUrls(req.getCompletionImageUrls())
                .workflowEvents(req.getWorkflowEvents())
                .tenantName(tenant != null ? tenant.getFullName() : null)
                .tenantEmail(tenant != null ? tenant.getEmail() : null)
                .tenantPhone(tenant != null ? tenant.getPhone() : null)
                .technicianName(technician != null ? technician.getFullName() : null)
                .technicianEmail(technician != null ? technician.getEmail() : null)
                .technicianPhone(technician != null ? technician.getPhone() : null)
                .status(req.getStatus())
                .overdue(req.getSlaDueAt() != null
                    && req.getStatus() != MaintenanceStatus.RESOLVED
                    && req.getStatus() != MaintenanceStatus.CLOSED
                    && req.getStatus() != MaintenanceStatus.CANCELLED
                    && LocalDateTime.now().isAfter(req.getSlaDueAt()))
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
