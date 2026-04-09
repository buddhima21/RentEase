package com.rentease.modules.agreement.service;

import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.user.model.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends agreement PDFs and reminder emails when SMTP is configured.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${rentease.mail.from:}")
    private String fromAddress;

    public void sendAgreementPdfAttachment(User tenant, Agreement agreement, byte[] pdfBytes) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || fromAddress == null || fromAddress.isBlank()) {
            log.warn("Mail not configured (JavaMailSender or rentease.mail.from); skipping agreement email for {}", agreement.getAgreementNumber());
            return;
        }
        if (tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            log.warn("Tenant has no email; cannot send agreement {}", agreement.getAgreementNumber());
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(tenant.getEmail());
            helper.setSubject("Your RentEase rental agreement " + agreement.getAgreementNumber());
            helper.setText("Hello " + tenant.getFullName() + ",\n\n"
                    + "Please find your digital rental agreement attached as a PDF.\n\n"
                    + "Agreement number: " + agreement.getAgreementNumber() + "\n"
                    + "Thank you for using RentEase.\n", false);
            helper.addAttachment(
                    "agreement-" + agreement.getAgreementNumber() + ".pdf",
                    new ByteArrayResource(pdfBytes));
            sender.send(message);
            log.info("Agreement email sent to {} for {}", tenant.getEmail(), agreement.getAgreementNumber());
        } catch (Exception e) {
            log.error("Failed to send agreement email for {}: {}", agreement.getAgreementNumber(), e.getMessage());
        }
    }

    public void sendRenewalReminder(User tenant, Agreement agreement) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || fromAddress == null || fromAddress.isBlank()) {
            log.warn("Mail not configured; skipping renewal reminder for {}", agreement.getAgreementNumber());
            return;
        }
        if (tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(tenant.getEmail());
            helper.setSubject("Reminder: your lease ends in 7 days (" + agreement.getAgreementNumber() + ")");
            helper.setText("Hello " + tenant.getFullName() + ",\n\n"
                    + "Your rental agreement " + agreement.getAgreementNumber() + " is scheduled to end on "
                    + agreement.getEndDate() + ".\n\n"
                    + "If you plan to renew, please contact your landlord early.\n\n"
                    + "— RentEase\n", false);
            sender.send(message);
            log.info("Renewal reminder sent to {} for {}", tenant.getEmail(), agreement.getAgreementNumber());
        } catch (Exception e) {
            log.error("Failed renewal reminder for {}: {}", agreement.getAgreementNumber(), e.getMessage());
        }
    }
}
