package com.rentease.common.enums;

public enum PropertyStatus {
    PENDING_APPROVAL,
    APPROVED,
    RENTED,
    REJECTED,
    PENDING_DELETE,
    DELETED;

    public static PropertyStatus fromValue(String raw) {
        if (raw == null || raw.isBlank()) {
            return PENDING_APPROVAL;
        }

        String normalized = raw.trim().toUpperCase();

        // Legacy aliases from older data sets
        if ("OCCUPIED".equals(normalized)) {
            return RENTED;
        }
        if ("PUBLISHED".equals(normalized) || "ACTIVE".equals(normalized)) {
            return APPROVED;
        }
        if ("ARCHIVED".equals(normalized)) {
            return REJECTED;
        }

        try {
            return PropertyStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            // Keep app alive even with bad historic values.
            return PENDING_APPROVAL;
        }
    }
}
