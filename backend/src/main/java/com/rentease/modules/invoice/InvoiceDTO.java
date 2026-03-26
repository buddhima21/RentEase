package com.rentease.modules.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    private String id;
    private String invoiceNo;
    private String tenantName;
    private String tenantId;
    private String ownerId;
    private String tenantEmail;
    private String unit;
    private String dueDate;
    private List<InvoiceItemDTO> items;
    private Double total;
    private Double overdueFee;
    private String status;
    private boolean deletedByTenant;
    private boolean deletedByOwner;
}
