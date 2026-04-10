package com.rentease.modules.invoice;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.io.font.constants.StandardFonts;
import com.rentease.modules.invoice.model.Invoice;
import com.rentease.modules.invoice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.rentease.modules.wallet.WalletService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final WalletService walletService;
    private final SimpMessagingTemplate messagingTemplate;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private JavaMailSender mailSender;

    public List<InvoiceDTO> getInvoicesByTenant(String tenantId) {
        return invoiceRepository.findByTenantId(tenantId).stream()
                .filter(inv -> !inv.isDeletedByTenant())
                .map(this::checkAndApplyOverdue)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .filter(inv -> !inv.isDeletedByOwner())
                .map(this::checkAndApplyOverdue)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void softDeleteByTenant(String identifier) {
        invoiceRepository.findById(identifier)
            .orElseGet(() -> invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(identifier).orElse(null))
            ;
        Invoice invoiceFound = invoiceRepository.findById(identifier)
            .orElseGet(() -> invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(identifier).orElse(null));
        
        if (invoiceFound != null) {
            invoiceFound.setDeletedByTenant(true);
            if (invoiceFound.isDeletedByOwner()) {
                invoiceRepository.delete(invoiceFound);
            } else {
                invoiceRepository.save(invoiceFound);
            }
        }
    }

    public void softDeleteByOwner(String identifier) {
        Invoice invoiceFound = invoiceRepository.findById(identifier)
            .orElseGet(() -> invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(identifier).orElse(null));

        if (invoiceFound != null) {
            invoiceFound.setDeletedByOwner(true);
            if (invoiceFound.isDeletedByTenant()) {
                invoiceRepository.delete(invoiceFound);
            } else {
                invoiceRepository.save(invoiceFound);
            }
        }
    }

    private Invoice checkAndApplyOverdue(Invoice invoice) {
        if ("PAID".equals(invoice.getStatus()) || invoice.getDueDate() == null) {
            return invoice;
        }

        try {
            // Updated date formats to be more flexible
            DateTimeFormatter formatter1 = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            LocalDate due;
            try {
                due = LocalDate.parse(invoice.getDueDate(), formatter1);
            } catch (Exception e) {
                due = LocalDate.parse(invoice.getDueDate(), formatter2);
            }

            if (LocalDate.now().isAfter(due) && (invoice.getOverdueFee() == null || invoice.getOverdueFee() == 0)) {
                Double penalty = invoice.getTotal() * 0.05;
                invoice.setOverdueFee(penalty);
                invoice.setTotal(invoice.getTotal() + penalty);
                invoice.setStatus("OVERDUE");
                return invoiceRepository.save(invoice);
            } else if (LocalDate.now().isAfter(due)) {
                invoice.setStatus("OVERDUE");
                return invoiceRepository.save(invoice);
            }
        } catch (Exception e) {
            System.err.println("Error parsing due date for invoice " + invoice.getInvoiceNumber() + ": " + e.getMessage());
        }
        return invoice;
    }

    public void updateInvoiceStatus(String identifier, String status) {
        Invoice invoiceFound = invoiceRepository.findById(identifier)
            .orElseGet(() -> invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(identifier).orElse(null));

        if (invoiceFound != null) {
            boolean wasPaid = "PAID".equals(invoiceFound.getStatus());
            boolean isPaying = "PAID".equals(status);
            
            invoiceFound.setStatus(status);
            invoiceRepository.save(invoiceFound);

            // Credit wallet if newly paid
            if (isPaying && !wasPaid && invoiceFound.getOwnerId() != null) {
                walletService.addBalance(invoiceFound.getOwnerId(), invoiceFound.getTotal(), "Rent payment for unit " + invoiceFound.getUnit());
            }

            // Broadcast real-time update
            messagingTemplate.convertAndSend("/topic/invoices", mapToDTO(invoiceFound));
        } else {
            throw new IllegalArgumentException("Invoice not found with identifier: " + identifier);
        }
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNo(invoice.getInvoiceNumber())
                .tenantName(invoice.getTenantName())
                .tenantId(invoice.getTenantId())
                .ownerId(invoice.getOwnerId())
                .tenantEmail(invoice.getTenantEmail())
                .unit(invoice.getUnit())
                .dueDate(invoice.getDueDate())
                .items(invoice.getItems())
                .total(invoice.getTotal())
                .overdueFee(invoice.getOverdueFee())
                .status(invoice.getStatus())
                .deletedByTenant(invoice.isDeletedByTenant())
                .deletedByOwner(invoice.isDeletedByOwner())
                .build();
    }

    public byte[] generateInvoicePDF(InvoiceDTO invoice) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);
        document.setMargins(20, 20, 20, 20);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Header - Company Name
        Paragraph header = new Paragraph("RentEase")
                .setFont(boldFont)
                .setFontSize(28)
                .setTextAlignment(TextAlignment.LEFT)
                .setBold();
        document.add(header);

        Paragraph subheader = new Paragraph("Property Management Portal")
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.LEFT);
        document.add(subheader);

        document.add(new Paragraph("\n"));

        // Title and Invoice Details
        Paragraph title = new Paragraph("INVOICE")
                .setFont(boldFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBold();
        document.add(title);

        Paragraph invoiceNo = new Paragraph("Invoice #: " + invoice.getInvoiceNo())
                .setFont(regularFont)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT);
        document.add(invoiceNo);

        document.add(new Paragraph("\n"));

        // Bill To Section
        Table billToTable = new Table(new float[]{1, 1});
        billToTable.setWidth(UnitValue.createPercentValue(100));

        Paragraph billToLabel = new Paragraph("Bill To")
                .setFont(boldFont)
                .setBold()
                .setFontSize(12);
        Cell billToLabelCell = new Cell().add(billToLabel).setBorder(null);
        billToTable.addCell(billToLabelCell);

        Paragraph invoiceDateLabel = new Paragraph("Invoice Date")
                .setFont(boldFont)
                .setBold()
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT);
        Cell invoiceDateLabelCell = new Cell().add(invoiceDateLabel).setBorder(null);
        billToTable.addCell(invoiceDateLabelCell);

        Paragraph tenantName = new Paragraph(invoice.getTenantName())
                .setFont(regularFont)
                .setFontSize(11);
        Cell tenantNameCell = new Cell().add(tenantName).setBorder(null);
        billToTable.addCell(tenantNameCell);

        Paragraph invoiceDate = new Paragraph(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")))
                .setFont(regularFont)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT);
        Cell invoiceDateCell = new Cell().add(invoiceDate).setBorder(null);
        billToTable.addCell(invoiceDateCell);

        Paragraph unit = new Paragraph(invoice.getUnit() != null ? invoice.getUnit() : "N/A")
                .setFont(regularFont)
                .setFontSize(11);
        Cell unitCell = new Cell().add(unit).setBorder(null);
        billToTable.addCell(unitCell);

        Paragraph dueDateLabel = new Paragraph("Due Date")
                .setFont(boldFont)
                .setBold()
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT);
        Paragraph dueDate = new Paragraph(invoice.getDueDate())
                .setFont(regularFont)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT);
        Cell dueDateCell = new Cell().add(dueDateLabel).add(dueDate).setBorder(null);
        billToTable.addCell(dueDateCell);

        document.add(billToTable);
        document.add(new Paragraph("\n"));

        // Invoice Items Table
        float[] columnWidths = {2, 1};
        Table itemsTable = new Table(columnWidths);
        itemsTable.setWidth(UnitValue.createPercentValue(100));

        // Header Row
        Cell descCell = new Cell().add(new Paragraph("Description").setFont(boldFont).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
        Cell amountCell = new Cell().add(new Paragraph("Amount").setFont(boldFont).setBold().setTextAlignment(TextAlignment.RIGHT))
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.RIGHT);
        itemsTable.addCell(descCell);
        itemsTable.addCell(amountCell);

        // Items
        if (invoice.getItems() != null) {
            for (InvoiceItemDTO item : invoice.getItems()) {
                Cell itemDescCell = new Cell().add(new Paragraph(item.getDescription()).setFont(regularFont));
                Cell itemAmountCell = new Cell().add(new Paragraph(formatCurrency(item.getAmount())).setFont(regularFont).setTextAlignment(TextAlignment.RIGHT))
                        .setTextAlignment(TextAlignment.RIGHT);
                itemsTable.addCell(itemDescCell);
                itemsTable.addCell(itemAmountCell);
            }
        }

        // Total Row
        Cell totalLabelCell = new Cell().add(new Paragraph("Total Due").setFont(boldFont).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
        Cell totalAmountCell = new Cell().add(new Paragraph(formatCurrency(invoice.getTotal())).setFont(boldFont).setBold().setTextAlignment(TextAlignment.RIGHT))
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.RIGHT);
        itemsTable.addCell(totalLabelCell);
        itemsTable.addCell(totalAmountCell);

        document.add(itemsTable);
        document.add(new Paragraph("\n"));

        // Payment Instructions
        Paragraph paymentInstructions = new Paragraph("Payment Instructions")
                .setFont(boldFont)
                .setBold()
                .setFontSize(12);
        document.add(paymentInstructions);

        Paragraph instructions = new Paragraph(
                "Please make payment by the due date via bank transfer or through the RentEase portal. Contact manager for queries.")
                .setFont(regularFont)
                .setFontSize(10);
        document.add(instructions);

        document.add(new Paragraph("\n"));

        // Footer
        Paragraph footer = new Paragraph("Generated by RentEase · " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")))
                .setFont(regularFont)
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public void saveInvoice(InvoiceDTO invoiceDTO) {
        String invoiceNo = invoiceDTO.getInvoiceNo();
        if (invoiceNo == null) {
             throw new IllegalArgumentException("Invoice missing invoice number");
        }

        Invoice invoice = invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(invoiceNo)
                .orElse(new Invoice());

        invoice.setInvoiceNumber(invoiceNo);
        invoice.setTenantName(invoiceDTO.getTenantName());
        invoice.setTenantId(invoiceDTO.getTenantId());
        invoice.setOwnerId(invoiceDTO.getOwnerId());
        invoice.setTenantEmail(invoiceDTO.getTenantEmail());
        invoice.setUnit(invoiceDTO.getUnit());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setItems(invoiceDTO.getItems());
        invoice.setTotal(invoiceDTO.getTotal());
        if (invoice.getStatus() == null) {
            invoice.setStatus(invoiceDTO.getStatus() != null ? invoiceDTO.getStatus() : "PENDING");
        }
        if (invoice.getCreatedAt() == null) {
            invoice.setCreatedAt(LocalDateTime.now());
        }
        invoiceRepository.save(invoice);
        
        // Broadcast new invoice
        messagingTemplate.convertAndSend("/topic/invoices", mapToDTO(invoice));
    }

    public void sendInvoice(InvoiceDTO invoiceDTO) {
        // Ensure invoice is saved/updated in DB before sending
        Invoice invoice = invoiceRepository.findFirstByInvoiceNumberOrderByCreatedAtDesc(invoiceDTO.getInvoiceNo())
                .orElse(new Invoice());

        invoice.setInvoiceNumber(invoiceDTO.getInvoiceNo());
        invoice.setTenantName(invoiceDTO.getTenantName());
        invoice.setTenantId(invoiceDTO.getTenantId());
        invoice.setOwnerId(invoiceDTO.getOwnerId());
        invoice.setTenantEmail(invoiceDTO.getTenantEmail());
        invoice.setUnit(invoiceDTO.getUnit());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setItems(invoiceDTO.getItems());
        invoice.setTotal(invoiceDTO.getTotal());
        invoice.setStatus("SENT");
        if (invoice.getCreatedAt() == null) {
            invoice.setCreatedAt(LocalDateTime.now());
        }
        invoiceRepository.save(invoice);

        // Broadcast status update
        messagingTemplate.convertAndSend("/topic/invoices", mapToDTO(invoice));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(invoiceDTO.getTenantEmail());
        message.setSubject("Invoice " + invoiceDTO.getInvoiceNo() + " from RentEase");
        
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(invoiceDTO.getTenantName()).append(",\n\n");
        body.append("An invoice has been generated for your unit: ").append(invoiceDTO.getUnit() != null ? invoiceDTO.getUnit() : "N/A").append(".\n");
        body.append("Invoice Number: ").append(invoiceDTO.getInvoiceNo()).append("\n");
        body.append("Due Date: ").append(invoiceDTO.getDueDate()).append("\n");
        body.append("Total Amount: LKR ").append(String.format("%.2f", invoiceDTO.getTotal())).append("\n\n");
        body.append("Please pay by the due date.\n\n");
        body.append("Best regards,\nRentEase Team");

        message.setText(body.toString());
        if (mailSender != null) {
            mailSender.send(message);
        } else {
            System.err.println("WARN: JavaMailSender not configured. Email not sent to: " + invoiceDTO.getTenantEmail());
        }
    }

    private String formatCurrency(Double amount) {
        if (amount == null) return "LKR 0.00";
        return String.format("LKR %,.2f", amount);
    }
}
