package com.rentease.modules.agreement.repository;

import com.rentease.common.enums.AgreementStatus;
import com.rentease.modules.agreement.model.Agreement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgreementRepository extends MongoRepository<Agreement, String> {

    List<Agreement> findByBookingId(String bookingId);

    List<Agreement> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<Agreement> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    /** Check if ANY agreement (any status) exists for this booking — prevents duplicates on re-approval */
    boolean existsByBookingId(String bookingId);

    boolean existsByBookingIdAndStatus(String bookingId, AgreementStatus status);

    Optional<Agreement> findByIdAndTenantId(String id, String tenantId);

    Optional<Agreement> findByIdAndOwnerId(String id, String ownerId);

    List<Agreement> findByAgreementNumberStartingWith(String prefix);

    /** Active agreements whose end date is strictly before the given date (for marking EXPIRED). */
    List<Agreement> findByStatusAndEndDateBefore(AgreementStatus status, LocalDate date);

    /** Active agreements ending on a specific date (for renewal reminders). */
    List<Agreement> findByStatusAndEndDateAndReminderSevenDaySentIsFalse(
            AgreementStatus status, LocalDate endDate);
}
