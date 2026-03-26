package com.rentease.modules.payment.repository;

import com.rentease.common.enums.PaymentStatus;
import com.rentease.modules.payment.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByTenantIdAndStatus(String tenantId, PaymentStatus status);

    List<Payment> findByTenantId(String tenantId);

    List<Payment> findByBookingIdInAndStatus(List<String> bookingIds, PaymentStatus status);
}
