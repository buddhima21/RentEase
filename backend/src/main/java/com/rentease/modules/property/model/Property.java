package com.rentease.modules.property.model;

import com.rentease.common.enums.PropertyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "properties")
public class Property {

    @Id
    private String id;

    private String title;
    private String description;
    private String address;
    private String city;
    private double price;
    private double securityDeposit;
    private int bedrooms;
    private int bathrooms;
    private double area;
    private String propertyType;
    private List<String> amenities;
    private List<String> imageUrls;

    // ── Owner Info ──────────────────────────────────────
    @Indexed
    private String ownerId;
    private String ownerName;
    private String ownerEmail;

    // ── Moderation ──────────────────────────────────────
    @Builder.Default
    private PropertyStatus status = PropertyStatus.PENDING_APPROVAL;

    private String adminRemarks;
    private String deleteReason;
    private LocalDateTime statusChangedAt;
    private LocalDateTime deleteRequestedAt;

    @Builder.Default
    private boolean deleted = false;

    // ── Audit ───────────────────────────────────────────
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
