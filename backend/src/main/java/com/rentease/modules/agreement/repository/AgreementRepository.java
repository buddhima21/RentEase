package com.rentease.modules.agreement.repository;

import com.rentease.modules.agreement.model.Agreement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgreementRepository extends MongoRepository<Agreement, String> {

    List<Agreement> findByBookingId(String bookingId);

    List<Agreement> findByTenantId(String tenantId);
}
