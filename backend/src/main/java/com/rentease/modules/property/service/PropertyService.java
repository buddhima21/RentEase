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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
    @CacheEvict(value = "approvedProperties", allEntries = true)
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
    @CacheEvict(value = "approvedProperties", allEntries = true)
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
    @CacheEvict(value = "approvedProperties", allEntries = true)
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
        List<Property> props = propertyRepository.findByOwnerId(ownerId)
                .stream()
                .filter(p -> p.getStatus() != PropertyStatus.DELETED)
                .collect(Collectors.toList());
        return mapToResponseList(props);
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
    @CacheEvict(value = "approvedProperties", allEntries = true)
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
        List<Property> props = propertyRepository.findByStatusIn(pendingStatuses);
        return mapToResponseList(props);
    }

    /**
     * Admin gets all properties (for admin dashboard overview).
     */
    public List<PropertyResponse> getAllPropertiesForAdmin() {
        List<Property> props = propertyRepository.findAll();
        return mapToResponseList(props);
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
    @Cacheable("approvedProperties")
    public List<PropertyResponse> getApprovedProperties() {
        log.debug("Cache miss — fetching approved properties from MongoDB");
        List<Property> props = propertyRepository.findByStatus(PropertyStatus.APPROVED);
        return mapToResponseList(props);
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
        boolean hasCity = criteria.getCity() != null && !criteria.getCity().isBlank();
        boolean hasType = criteria.getPropertyType() != null && !criteria.getPropertyType().isBlank();
        boolean hasMinPrice = criteria.getMinPrice() != null;
        boolean hasMaxPrice = criteria.getMaxPrice() != null;

        // ── Push as much filtering as possible to MongoDB ──────────────────
        List<Property> results;

        if (hasCity && hasType) {
            results = propertyRepository
                    .findByStatusAndCityContainingIgnoreCaseAndPropertyTypeIgnoreCase(
                            PropertyStatus.APPROVED, criteria.getCity(), criteria.getPropertyType());
        } else if (hasCity) {
            results = propertyRepository
                    .findByStatusAndCityContainingIgnoreCase(PropertyStatus.APPROVED, criteria.getCity());
        } else if (hasType) {
            results = propertyRepository
                    .findByStatusAndPropertyTypeIgnoreCase(PropertyStatus.APPROVED, criteria.getPropertyType());
        } else if (hasMinPrice && hasMaxPrice) {
            results = propertyRepository
                    .findByStatusAndPriceBetween(PropertyStatus.APPROVED,
                            criteria.getMinPrice(), criteria.getMaxPrice());
        } else {
            results = propertyRepository.findByStatus(PropertyStatus.APPROVED);
        }

        // ── Apply remaining in-memory filters on the reduced result set ─────
        if (hasMinPrice && !(hasMinPrice && hasMaxPrice && !hasCity && !hasType)) {
            double min = criteria.getMinPrice();
            results = results.stream().filter(p -> p.getPrice() >= min).collect(Collectors.toList());
        }
        if (hasMaxPrice && !(hasMinPrice && hasMaxPrice && !hasCity && !hasType)) {
            double max = criteria.getMaxPrice();
            results = results.stream().filter(p -> p.getPrice() <= max).collect(Collectors.toList());
        }
        if (criteria.getMinBedrooms() != null) {
            int min = criteria.getMinBedrooms();
            results = results.stream().filter(p -> p.getBedrooms() >= min).collect(Collectors.toList());
        }
        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            String kw = criteria.getKeyword().toLowerCase();
            results = results.stream()
                    .filter(p -> (p.getTitle() != null && p.getTitle().toLowerCase().contains(kw))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(kw))
                            || (p.getAddress() != null && p.getAddress().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        return mapToResponseList(results);
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

    /**
     * Maps a list of properties to responses in bulk.
     * <p>
     * Fixes the N+1 query problem: instead of firing one userRepository.findById()
     * per property, we collect all unique ownerIds and fire a SINGLE
     * userRepository.findAllById() call, then build a lookup map.
     * </p>
     */
    private List<PropertyResponse> mapToResponseList(List<Property> properties) {
        if (properties == null || properties.isEmpty()) {
            return List.of();
        }

        // Collect distinct owner IDs
        List<String> ownerIds = properties.stream()
                .map(Property::getOwnerId)
                .distinct()
                .collect(Collectors.toList());

        // ONE database round-trip to fetch all needed users
        Map<String, User> ownerMap = StreamSupport
                .stream(userRepository.findAllById(ownerIds).spliterator(), false)
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return properties.stream()
                .map(p -> mapToResponseWithOwner(p, ownerMap.get(p.getOwnerId())))
                .collect(Collectors.toList());
    }

    /** Used by list operations — owner already resolved from the batch map. */
    private PropertyResponse mapToResponseWithOwner(Property property, User owner) {
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

    /** Used by single-property operations (get by ID, etc.) */
    private PropertyResponse mapToResponse(Property property) {
        User owner = userRepository.findById(property.getOwnerId()).orElse(null);
        return mapToResponseWithOwner(property, owner);
    }
}
