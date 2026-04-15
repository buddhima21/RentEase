package com.rentease.modules.maintenance.service;

import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${rentease.mail.from:}")
    private String fromAddress;

    public void notifyAdminsOnCreated(List<User> admins, MaintenanceRequest request, User tenant, Property property) {
        if (admins == null || admins.isEmpty()) {
            return;
        }

        String subject = "New maintenance request: " + request.getTitle();
        String body = "A new maintenance request was submitted.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Tenant: " + tenant.getFullName() + "\n"
                + "Property: " + property.getTitle() + "\n"
                + "Priority: " + request.getPriority() + "\n";

        admins.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .forEach(email -> sendEmail(email, subject, body));
    }

    public void notifyTechnicianAssigned(User technician, MaintenanceRequest request) {
        if (technician == null || technician.getEmail() == null || technician.getEmail().isBlank()) {
            return;
        }

        String subject = "Maintenance assignment: " + request.getTitle();
        String body = "You have been assigned a maintenance request.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Priority: " + request.getPriority() + "\n"
                + "Scheduled: " + request.getScheduledAt() + "\n";
        sendEmail(technician.getEmail(), subject, body);
    }

    public void notifyTenantStatusChanged(User tenant, MaintenanceRequest request) {
        if (tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            return;
        }

        String subject = "Maintenance status update: " + request.getStatus();
        String body = "Your maintenance request has been updated.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Title: " + request.getTitle() + "\n"
                + "Status: " + request.getStatus() + "\n";
        sendEmail(tenant.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || fromAddress == null || fromAddress.isBlank()) {
            log.warn("Mail not configured (JavaMailSender or rentease.mail.from), skipping mail to {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send maintenance notification to {}: {}", to, ex.getMessage());
        }
    }
}
