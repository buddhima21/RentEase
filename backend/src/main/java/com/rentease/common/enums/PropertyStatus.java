package com.rentease.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PropertyStatus {
    AVAILABLE,
    BOOKED,
    RENTED,
    UNDER_MAINTENANCE,
    INACTIVE;

    /** Gracefully fall back to AVAILABLE for any unknown stored value. */
    @JsonCreator
    public static PropertyStatus fromValue(String value) {
        if (value == null) return AVAILABLE;
        try {
            return PropertyStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return AVAILABLE;
        }
    }
}
