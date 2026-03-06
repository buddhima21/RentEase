package com.rentease.modules.property.service;

import com.rentease.common.enums.PropertyStatus;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.property.dto.PropertyRequest;
import com.rentease.modules.property.dto.PropertyResponse;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyResponse createProperty(PropertyRequest request) {
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .price(request.getPrice())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .area(request.getArea())
                .propertyType(request.getPropertyType())
                .amenities(request.getAmenities())
                .imageUrls(request.getImageUrls())
                .ownerId(request.getOwnerId())
                .status(PropertyStatus.AVAILABLE)
                .build();

        Property saved = propertyRepository.save(property);
        return mapToResponse(saved);
    }

    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse getPropertyById(String id) {
        Property property = findPropertyOrThrow(id);
        return mapToResponse(property);
    }

    public List<PropertyResponse> getPropertiesByOwner(String ownerId) {
        return propertyRepository.findByOwnerIdAndDeletedFalse(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getPropertiesByStatus(PropertyStatus status) {
        return propertyRepository.findByStatusAndDeletedFalse(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getPropertiesByCity(String city) {
        return propertyRepository.findByCityAndDeletedFalse(city)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse updateProperty(String id, PropertyRequest request) {
        Property property = findPropertyOrThrow(id);

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setPrice(request.getPrice());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());
        property.setPropertyType(request.getPropertyType());
        property.setAmenities(request.getAmenities());
        property.setImageUrls(request.getImageUrls());

        Property updated = propertyRepository.save(property);
        return mapToResponse(updated);
    }

    public PropertyResponse updatePropertyStatus(String id, PropertyStatus status) {
        Property property = findPropertyOrThrow(id);
        property.setStatus(status);
        Property updated = propertyRepository.save(property);
        return mapToResponse(updated);
    }

    public void deleteProperty(String id) {
        Property property = findPropertyOrThrow(id);
        property.setDeleted(true);
        property.setStatus(PropertyStatus.INACTIVE);
        propertyRepository.save(property);
    }

    // ── Helpers ──────────────────────────────────────────

    private Property findPropertyOrThrow(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        if (property.isDeleted()) {
            throw new ResourceNotFoundException("Property", "id", id);
        }
        return property;
    }

    private PropertyResponse mapToResponse(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .address(property.getAddress())
                .city(property.getCity())
                .price(property.getPrice())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .propertyType(property.getPropertyType())
                .amenities(property.getAmenities())
                .imageUrls(property.getImageUrls())
                .ownerId(property.getOwnerId())
                .status(property.getStatus())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
