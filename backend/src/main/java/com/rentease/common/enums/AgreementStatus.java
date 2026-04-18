package com.rentease.common.enums;

/**
 * Lifecycle of a digital rental agreement.
 */
public enum AgreementStatus {
    /** Auto-created when owner approves a booking; awaiting tenant Accept/Reject. */
    PENDING,
    /** Currently in force — tenant accepted and end date not yet passed. */
    ACTIVE,
    /** Tenant rejected the agreement. */
    CANCELLED,
    /** End date has passed (updated by scheduler or on read). */
    EXPIRED,
    /** Ended before the scheduled end date (early termination). */
    TERMINATED
}
