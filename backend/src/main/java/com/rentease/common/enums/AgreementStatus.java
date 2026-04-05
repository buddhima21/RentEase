package com.rentease.common.enums;

/**
 * Lifecycle of a digital rental agreement.
 */
public enum AgreementStatus {
    /** Currently in force (end date not passed, not terminated). */
    ACTIVE,
    /** End date has passed (updated by scheduler or on read). */
    EXPIRED,
    /** Ended before the scheduled end date (early termination). */
    TERMINATED
}
