package com.rentease.modules.invoice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/generate-pdf")
    public ResponseEntity<?> generateInvoicePDF(@RequestBody InvoiceDTO invoice) {
        try {
            if (invoice.getStatus() == null) {
                invoice.setStatus("PENDING");
            }
            invoiceService.saveInvoice(invoice);
            byte[] pdfBytes = invoiceService.generateInvoicePDF(invoice);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Invoice-" + invoice.getInvoiceNo() + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating PDF: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<?> getInvoicesByTenantId(@PathVariable String tenantId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByTenant(tenantId));
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendInvoice(@RequestBody InvoiceDTO invoice) {
        try {
            invoiceService.sendInvoice(invoice);
            return ResponseEntity.ok("Invoice sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending email: " + e.getMessage());
        }
    }

    @PutMapping("/{invoiceNo}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String invoiceNo, @RequestParam String status) {
        try {
            invoiceService.updateInvoiceStatus(invoiceNo, status);
            return ResponseEntity.ok("Status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/tenant")
    public ResponseEntity<?> deleteByTenant(@PathVariable String id) {
        try {
            invoiceService.softDeleteByTenant(id);
            return ResponseEntity.ok("Invoice hidden from your dashboard");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting invoice: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/owner")
    public ResponseEntity<?> deleteByOwner(@PathVariable String id) {
        try {
            invoiceService.softDeleteByOwner(id);
            return ResponseEntity.ok("Invoice hidden from your dashboard");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting invoice: " + e.getMessage());
        }
    }
}
