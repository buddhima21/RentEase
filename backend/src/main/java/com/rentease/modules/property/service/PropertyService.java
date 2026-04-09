package com.rentease.modules.property.service;

import com.rentease.common.enums.PropertyStatus;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ForbiddenException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.property.dto.*;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // ══════════════════════════════════════════════════════
    //  OWNER OPERATIONS
    // ══════════════════════════════════════════════════════

    /**
     * Owner creates a new property listing.
     * Status is automatically set to PENDING_APPROVAL.
     */
    public PropertyResponse createProperty(PropertyRequest request,
                                            String ownerId,
                                            String ownerName,
                                            String ownerEmail) {
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .price(request.getPrice())
                .securityDeposit(request.getSecurityDeposit())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .area(request.getArea())
                .propertyType(request.getPropertyType())
                .amenities(request.getAmenities())
                .imageUrls(request.getImageUrls())
                .termsAndConditions(request.getTermsAndConditions())
                .ownerId(ownerId)
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .status(PropertyStatus.PENDING_APPROVAL)
                .statusChangedAt(LocalDateTime.now())
                .build();

        Property saved = propertyRepository.save(property);
        log.info("Property created [id={}, owner={}] — awaiting admin approval", saved.getId(), ownerId);
        return mapToResponse(saved);
    }

    /**
     * Owner updates their property details.
     * Only allowed for APPROVED or REJECTED properties.
     */
    public PropertyResponse updateProperty(String propertyId,
                                            PropertyUpdateRequest request,
                                            String ownerId) {
        Property property = findPropertyOrThrow(propertyId);
        verifyOwnership(property, ownerId);

        if (property.getStatus() != PropertyStatus.APPROVED
                && property.getStatus() != PropertyStatus.REJECTED) {
            throw new BadRequestException(
                    "Property can only be updated when status is APPROVED or REJECTED. Current status: "
                            + property.getStatus());
        }

        // Apply only non-null fields (partial update)
        if (request.getTitle() != null) property.setTitle(request.getTitle());
        if (request.getDescription() != null) property.setDescription(request.getDescription());
        if (request.getAddress() != null) property.setAddress(request.getAddress());
        if (request.getCity() != null) property.setCity(request.getCity());
        if (request.getPrice() != null) property.setPrice(request.getPrice());
        if (request.getSecurityDeposit() != null) property.setSecurityDeposit(request.getSecurityDeposit());
        if (request.getBedrooms() != null) property.setBedrooms(request.getBedrooms());
        if (request.getBathrooms() != null) property.setBathrooms(request.getBathrooms());
        if (request.getArea() != null) property.setArea(request.getArea());
        if (request.getPropertyType() != null) property.setPropertyType(request.getPropertyType());
        if (request.getAmenities() != null) property.setAmenities(request.getAmenities());
        if (request.getImageUrls() != null) property.setImageUrls(request.getImageUrls());
        if (request.getTermsAndConditions() != null) property.setTermsAndConditions(request.getTermsAndConditions());

        Property updated = propertyRepository.save(property);
        log.info("Property updated [id={}, owner={}]", propertyId, ownerId);
        return mapToResponse(updated);
    }

    /**
     * Owner requests deletion of their property.
     * Only allowed for APPROVED properties — sets status to PENDING_DELETE.
     */
    public PropertyResponse requestDeleteProperty(String propertyId, String ownerId, String reason) {
        Property property = findPropertyOrThrow(propertyId);
        verifyOwnership(property, ownerId);

        if (property.getStatus() != PropertyStatus.APPROVED && property.getStatus() != PropertyStatus.REJECTED) {
            throw new BadRequestException(
                    "Only APPROVED or REJECTED properties can be requested for deletion. Current status: "
                            + property.getStatus());
        }

        property.setStatus(PropertyStatus.PENDING_DELETE);
        property.setDeleteReason(reason);
        property.setDeleteRequestedAt(LocalDateTime.now());
        property.setStatusChangedAt(LocalDateTime.now());
        property.setAdminRemarks(null);

        Property updated = propertyRepository.save(property);
        log.info("Delete request submitted [id={}, owner={}, reason={}] — awaiting admin approval", propertyId, ownerId, reason);
        return mapToResponse(updated);
    }

    /**
     * Owner fetches all their properties (regardless of status).
     */
    public List<PropertyResponse> getMyProperties(String ownerId) {
        return propertyRepository.findByOwnerId(ownerId)
                .stream()
                .filter(p -> p.getStatus() != PropertyStatus.DELETED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Owner fetches a single property by ID (with ownership check).
     */
    public PropertyResponse getMyPropertyById(String propertyId, String ownerId) {
        Property property = findPropertyOrThrow(propertyId);
        verifyOwnership(property, ownerId);
        return mapToResponse(property);
    }

    // ══════════════════════════════════════════════════════
    //  ADMIN OPERATIONS
    // ══════════════════════════════════════════════════════

    /**
     * Admin moderates a property listing.
     * For PENDING_APPROVAL: APPROVE → APPROVED, REJECT → REJECTED
     * For PENDING_DELETE: APPROVE → DELETED (soft-delete), REJECT → APPROVED (restored)
     */
    public PropertyResponse moderateProperty(String propertyId, AdminModerationRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        String action = request.getAction().toUpperCase().trim();

        if (!action.equals("APPROVE") && !action.equals("REJECT")) {
            throw new BadRequestException("Invalid action. Must be 'APPROVE' or 'REJECT'.");
        }

        PropertyStatus currentStatus = property.getStatus();

        if (currentStatus == PropertyStatus.PENDING_APPROVAL) {
            handleNewListingModeration(property, action, request.getRemarks());
        } else if (currentStatus == PropertyStatus.PENDING_DELETE) {
            handleDeleteModeration(property, action, request.getRemarks());
        } else {
            throw new BadRequestException(
                    "Property is not in a moderatable state. Current status: " + currentStatus);
        }

        Property updated = propertyRepository.save(property);
        log.info("Property moderated [id={}, action={}, newStatus={}]",
                propertyId, action, updated.getStatus());
        return mapToResponse(updated);
    }

    /**
     * Admin gets all properties with PENDING_APPROVAL or PENDING_DELETE status.
     */
    public List<PropertyResponse> getPendingProperties() {
        List<PropertyStatus> pendingStatuses = Arrays.asList(
                PropertyStatus.PENDING_APPROVAL, PropertyStatus.PENDING_DELETE);
        return propertyRepository.findByStatusIn(pendingStatuses)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin gets all properties (for admin dashboard overview).
     */
    public List<PropertyResponse> getAllPropertiesForAdmin() {
        return propertyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin views any single property by ID.
     */
    public PropertyResponse getPropertyByIdForAdmin(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));
        return mapToResponse(property);
    }

    // ══════════════════════════════════════════════════════
    //  PUBLIC OPERATIONS
    // ══════════════════════════════════════════════════════

    /**
     * Public: Get all approved properties.
     */
    public List<PropertyResponse> getApprovedProperties() {
        return propertyRepository.findByStatus(PropertyStatus.APPROVED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Public: Get a single approved property by ID.
     */
    public PropertyResponse getApprovedPropertyById(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new ResourceNotFoundException("Property", "id", propertyId);
        }
        return mapToResponse(property);
    }

    /**
     * Public: Search approved properties with optional filters.
     */
    public List<PropertyResponse> searchProperties(PropertySearchCriteria criteria) {
        // Start with all approved properties
        List<Property> results = propertyRepository.findByStatus(PropertyStatus.APPROVED);

        // Apply filters
        if (criteria.getCity() != null && !criteria.getCity().isBlank()) {
            String cityLower = criteria.getCity().toLowerCase();
            results = results.stream()
                    .filter(p -> p.getCity() != null && p.getCity().toLowerCase().contains(cityLower))
                    .collect(Collectors.toList());
        }

        if (criteria.getPropertyType() != null && !criteria.getPropertyType().isBlank()) {
            String typeLower = criteria.getPropertyType().toLowerCase();
            results = results.stream()
                    .filter(p -> p.getPropertyType() != null
                            && p.getPropertyType().toLowerCase().equals(typeLower))
                    .collect(Collectors.toList());
        }

        if (criteria.getMinPrice() != null) {
            results = results.stream()
                    .filter(p -> p.getPrice() >= criteria.getMinPrice())
                    .collect(Collectors.toList());
        }

        if (criteria.getMaxPrice() != null) {
            results = results.stream()
                    .filter(p -> p.getPrice() <= criteria.getMaxPrice())
                    .collect(Collectors.toList());
        }

        if (criteria.getMinBedrooms() != null) {
            results = results.stream()
                    .filter(p -> p.getBedrooms() >= criteria.getMinBedrooms())
                    .collect(Collectors.toList());
        }

        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            String kw = criteria.getKeyword().toLowerCase();
            results = results.stream()
                    .filter(p -> (p.getTitle() != null && p.getTitle().toLowerCase().contains(kw))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(kw))
                            || (p.getAddress() != null && p.getAddress().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        return results.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════

    private void handleNewListingModeration(Property property, String action, String remarks) {
        if ("APPROVE".equals(action)) {
            property.setStatus(PropertyStatus.APPROVED);
        } else {
            property.setStatus(PropertyStatus.REJECTED);
        }
        property.setAdminRemarks(remarks);
        property.setStatusChangedAt(LocalDateTime.now());
    }

    private void handleDeleteModeration(Property property, String action, String remarks) {
        if ("APPROVE".equals(action)) {
            property.setStatus(PropertyStatus.DELETED);
            property.setDeleted(true);
        } else {
            // Reject deletion — restore to APPROVED
            property.setStatus(PropertyStatus.APPROVED);
            property.setDeleteRequestedAt(null);
        }
        property.setAdminRemarks(remarks);
        property.setStatusChangedAt(LocalDateTime.now());
    }

    private Property findPropertyOrThrow(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        if (property.getStatus() == PropertyStatus.DELETED) {
            throw new ResourceNotFoundException("Property", "id", id);
        }
        return property;
    }

    private void verifyOwnership(Property property, String ownerId) {
        if (!property.getOwnerId().equals(ownerId)) {
            throw new ForbiddenException("You do not have permission to access this property");
        }
    }

    private PropertyResponse mapToResponse(Property property) {
        User owner = userRepository.findById(property.getOwnerId()).orElse(null);
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .address(property.getAddress())
                .city(property.getCity())
                .price(property.getPrice())
                .securityDeposit(property.getSecurityDeposit())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .propertyType(property.getPropertyType())
                .amenities(property.getAmenities())
                .imageUrls(property.getImageUrls())
                .termsAndConditions(property.getTermsAndConditions())
                .ownerId(property.getOwnerId())
                .ownerName(owner != null ? owner.getFullName() : property.getOwnerName())
                .ownerEmail(owner != null ? owner.getEmail() : property.getOwnerEmail())
                .ownerPhone(owner != null ? owner.getPhone() : null)
                .ownerProfileImageUrl(owner != null ? owner.getProfileImageUrl() : null)
                .status(property.getStatus())
                .adminRemarks(property.getAdminRemarks())
                .deleteReason(property.getDeleteReason())
                .statusChangedAt(property.getStatusChangedAt())
                .deleteRequestedAt(property.getDeleteRequestedAt())
                .deleted(property.isDeleted())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
