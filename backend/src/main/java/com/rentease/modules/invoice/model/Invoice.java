package com.rentease.modules.invoice.model;

import com.rentease.modules.invoice.InvoiceItemDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id;

    private String invoiceNumber;
    private String tenantName;
    private String tenantId;
    private String ownerId;
    private String tenantEmail;
    private String unit;
    private String dueDate;
    private List<InvoiceItemDTO> items;
    private Double total;
    private Double overdueFee;
    private String status; // SENT, PAID, PENDING, OVERDUE

    @Builder.Default
    private boolean deletedByTenant = false;
    @Builder.Default
    private boolean deletedByOwner = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
