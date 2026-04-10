package com.rentease.modules.invoice.repository;

import com.rentease.modules.invoice.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findFirstByInvoiceNumberOrderByCreatedAtDesc(String invoiceNumber);
    List<Invoice> findByTenantId(String tenantId);
}
